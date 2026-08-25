#!/usr/bin/env node
/**
 * One-time OAuth dance to mint a LinkedIn access token.
 *
 *   node scripts/linkedin-auth.mjs
 *
 * You have to run this again roughly every 60 days. LinkedIn only issues
 * refresh tokens to approved Marketing Developer Platform partners, so a
 * self-serve app like this one cannot renew itself — the token simply expires
 * and the next publish fails with 401. That is a property of LinkedIn, not a
 * shortcut taken here.
 *
 * Prerequisites, in the LinkedIn Developer Portal:
 *   1. Create an app, associated with a company page you administer (LinkedIn
 *      requires one even for posting to a personal profile).
 *   2. Products tab → add "Share on LinkedIn" (self-serve, no review) and
 *      "Sign In with LinkedIn using OpenID Connect".
 *   3. Auth tab → add the redirect URL below, exactly.
 *   4. Put LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env.local.
 *
 * On success it writes LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN and
 * LINKEDIN_TOKEN_EXPIRES into .env.local itself. Nothing secret is printed.
 */

import { createServer } from "http";
import { randomBytes } from "crypto";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

/** Must match the redirect URL registered in the app, character for character. */
const PORT = 8730;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

/**
 * `openid` + `profile` are only there to read the member id from /v2/userinfo —
 * the post author URN cannot be derived any other way. `w_member_social` is the
 * one that actually publishes.
 */
const SCOPES = ["openid", "profile", "w_member_social"];

const ENV_LOCAL = path.join(ROOT, ".env.local");

function loadEnvLocal() {
  if (!fs.existsSync(ENV_LOCAL)) return;
  for (const line of fs.readFileSync(ENV_LOCAL, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

/**
 * Writes the freshly minted credentials straight into `.env.local`.
 *
 * <p>The token is deliberately never printed. Echoing it to the terminal drops a
 * live credential into the scrollback — and into any transcript, screen capture
 * or pasted log that follows — for no gain, since nothing but this file ever
 * needs to read it.
 *
 * <p>Existing keys are replaced in place and everything else in the file is left
 * untouched, because `.env.local` also holds unrelated settings.
 */
function upsertEnvLocal(entries) {
  const existing = fs.existsSync(ENV_LOCAL) ? fs.readFileSync(ENV_LOCAL, "utf8") : "";
  const lines = existing ? existing.replace(/\n+$/, "").split("\n") : [];

  for (const [key, value] of Object.entries(entries)) {
    const at = lines.findIndex((line) => new RegExp(`^\\s*${key}\\s*=`).test(line));
    if (at === -1) lines.push(`${key}=${value}`);
    else lines[at] = `${key}=${value}`;
  }

  // 0600: the file holds live credentials, so keep it readable only by its owner.
  fs.writeFileSync(ENV_LOCAL, lines.join("\n") + "\n", { mode: 0o600 });
  fs.chmodSync(ENV_LOCAL, 0o600);
}

/**
 * Waits for LinkedIn to redirect the browser back here with the code.
 *
 * <p>Bound to 127.0.0.1 so nothing outside this machine can reach it, and the
 * `state` is compared before the code is accepted — without that check any page
 * you happen to visit could drive this callback and swap in its own code.
 */
function awaitCallback(expectedState) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      if (url.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
      }

      const finish = (status, message) => {
        res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<html><body style="font-family:system-ui;padding:3rem"><h1>${message}</h1>
          <p>Puedes cerrar esta pestaña y volver a la terminal.</p></body></html>`);
        server.close();
      };

      const error = url.searchParams.get("error");
      if (error) {
        finish(400, "Autorización denegada");
        reject(new Error(`${error}: ${url.searchParams.get("error_description") ?? ""}`));
        return;
      }

      if (url.searchParams.get("state") !== expectedState) {
        finish(400, "state no coincide");
        reject(new Error("state mismatch — request rejected"));
        return;
      }

      finish(200, "Autorizado ✓");
      resolve(url.searchParams.get("code"));
    });

    server.listen(PORT, "127.0.0.1");
    server.on("error", reject);
  });
}

async function exchangeCode(code, clientId, clientSecret) {
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} — ${JSON.stringify(body)}`);
  return body;
}

/** The `sub` claim is the member id; the post author URN is built from it. */
async function fetchPersonUrn(accessToken) {
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`userinfo failed: ${res.status} — ${JSON.stringify(body)}`);
  return { urn: `urn:li:person:${body.sub}`, name: body.name };
}

async function main() {
  loadEnvLocal();

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("Faltan LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET en .env.local");
    process.exit(1);
  }

  const state = randomBytes(16).toString("hex");
  const authUrl =
    "https://www.linkedin.com/oauth/v2/authorization?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      state,
      scope: SCOPES.join(" "),
    });

  console.log(`\nRedirect URL que debe estar registrada en la app:\n  ${REDIRECT_URI}\n`);
  console.log("Abriendo el navegador. Si no se abre, pega esta URL a mano:\n");
  console.log(`  ${authUrl}\n`);

  const pending = awaitCallback(state);
  spawn("open", [authUrl], { stdio: "ignore", detached: true }).unref();

  const code = await pending;
  console.log("✓ Código recibido, canjeando por token...");

  const token = await exchangeCode(code, clientId, clientSecret);
  const person = await fetchPersonUrn(token.access_token);

  const expiresAt = new Date(Date.now() + token.expires_in * 1000);

  upsertEnvLocal({
    LINKEDIN_ACCESS_TOKEN: token.access_token,
    LINKEDIN_PERSON_URN: person.urn,
    LINKEDIN_TOKEN_EXPIRES: expiresAt.toISOString().slice(0, 10),
  });

  console.log(`\n✓ Autorizado como ${person.name}`);
  console.log(`  ${person.urn}`);
  console.log(`  Token guardado en .env.local (…${token.access_token.slice(-4)}), caduca el ${expiresAt.toISOString().slice(0, 10)}.`);
  console.log(`\nYa puedes publicar:  npm run social:linkedin -- <slug> --dry-run\n`);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
