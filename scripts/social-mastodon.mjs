#!/usr/bin/env node
/**
 * Publishes a blog post to Mastodon, one toot per locale.
 *
 * Run AFTER the post is live (deploy.sh), because the toot links to the
 * published URL and a link to a 404 cannot be edited away — a toot is
 * immutable once federated:
 *
 *   npm run social:mastodon -- <slug> --dry-run   # writes nothing, prints both toots
 *   npm run social:mastodon -- <slug>             # publishes
 *
 * Spanish and English go out as two separate toots rather than a thread, each
 * tagged with its own `language`. Mastodon lets people filter their timeline by
 * language, so a Spanish reader never sees the English copy and vice versa —
 * a bilingual thread would show both to everyone and read as noise to half the
 * audience.
 *
 * Requires MASTODON_ACCESS_TOKEN in .env.local (scope: write:statuses).
 * See docs at the bottom of this file for how to mint one.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "blog");
const SITE_URL = "https://backendtothefuture.com";

/**
 * Fallbacks for instances that do not advertise their limits. mastodon.social
 * uses 500 characters, and every URL counts as a fixed 23 regardless of its
 * real length, so a long slug costs the same as a short one.
 */
const DEFAULT_MAX_CHARS = 500;
const DEFAULT_URL_WEIGHT = 23;

/** Beyond four, hashtags stop being discovery and start being spam. */
const MAX_HASHTAGS = 4;

const LOCALES = ["es", "en"];

/**
 * `.env.local` is gitignored and holds the token. Parsed here rather than with
 * a dependency: it is a handful of KEY=value lines and the script otherwise
 * needs nothing that is not already in package.json.
 */
function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue; // a real env var wins
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

/** `/blog/<slug>/` in Spanish, `/en/blog/<slug>/` in English. See src/lib/i18n.ts. */
function postUrl(slug, lang) {
  return lang === "es"
    ? `${SITE_URL}/blog/${slug}/`
    : `${SITE_URL}/en/blog/${slug}/`;
}

/**
 * Words that are acronyms, not names. Title-casing turns `ai-agents` into
 * `#AiAgents`, which reads as a typo to exactly the audience the tag is meant
 * to reach.
 */
const ACRONYMS = new Set([
  "ai", "api", "cd", "ci", "cli", "css", "db", "html", "http", "jvm", "llm",
  "orm", "pr", "rag", "seo", "sql", "ssr", "tdd", "ui", "ux",
]);

/** `clean architecture` → `#CleanArchitecture`. Mastodon tags cannot hold spaces or dashes. */
function toHashtag(tag) {
  const words = String(tag).split(/[\s\-_]+/).filter(Boolean);
  return (
    "#" +
    words
      .map((w) =>
        ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1),
      )
      .join("")
  );
}

/**
 * Ask the instance for its real limits. Hardcoding 500 would silently truncate
 * on an instance configured for more, and overflow on one configured for less.
 */
async function fetchLimits(instance) {
  try {
    const res = await fetch(`${instance}/api/v1/instance`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const info = await res.json();
    return {
      maxChars: info?.configuration?.statuses?.max_characters ?? DEFAULT_MAX_CHARS,
      urlWeight:
        info?.configuration?.statuses?.characters_reserved_per_url ?? DEFAULT_URL_WEIGHT,
    };
  } catch (err) {
    console.warn(`  ! could not read instance limits (${err.message}); assuming ${DEFAULT_MAX_CHARS}`);
    return { maxChars: DEFAULT_MAX_CHARS, urlWeight: DEFAULT_URL_WEIGHT };
  }
}

/** What the instance will count this toot as, with every URL charged at its flat rate. */
function weighedLength(text, urlWeight) {
  const urls = text.match(/https?:\/\/\S+/g) ?? [];
  const urlCost = urls.reduce((total, url) => total + urlWeight - url.length, 0);
  return [...text].length + urlCost;
}

/**
 * Builds the toot. Title, description, link and hashtags are all fixed except
 * the description, so that is what gets trimmed when the post does not fit —
 * losing half a sentence beats losing the link.
 */
function buildToot({ title, description, tags }, url, { maxChars, urlWeight }) {
  const hashtags = (tags ?? []).slice(0, MAX_HASHTAGS).map(toHashtag).join(" ");
  const assemble = (desc) =>
    [title, desc, url, hashtags].filter(Boolean).join("\n\n");

  let text = assemble(description);
  let overflow = weighedLength(text, urlWeight) - maxChars;
  if (overflow <= 0) return text;

  // +1 for the ellipsis that replaces the trimmed tail.
  const chars = [...(description ?? "")];
  const trimmed = chars.slice(0, Math.max(0, chars.length - overflow - 1)).join("").trimEnd();
  text = assemble(trimmed ? `${trimmed}…` : "");

  overflow = weighedLength(text, urlWeight) - maxChars;
  if (overflow > 0) throw new Error(`toot still ${overflow} chars over the limit after trimming`);
  return text;
}

async function publish({ instance, token, text, lang, slug }) {
  const res = await fetch(`${instance}/api/v1/statuses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // Re-running the script for the same post is a retry, not a second toot.
      // Mastodon drops the duplicate and returns the original status.
      "Idempotency-Key": `btf-${slug}-${lang}`,
    },
    body: JSON.stringify({ status: text, language: lang, visibility: "public" }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${body.error ?? "unknown error"}`);
  }
  return body.url;
}

async function main() {
  loadEnvLocal();

  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const slug = args.find((a) => !a.startsWith("--"));

  if (!slug) {
    console.error("usage: npm run social:mastodon -- <slug> [--lang es|en] [--dry-run]");
    process.exit(1);
  }

  const langFlag = args[args.indexOf("--lang") + 1];
  const langs = args.includes("--lang") ? [langFlag] : LOCALES;
  if (langs.some((l) => !LOCALES.includes(l))) {
    console.error(`--lang must be one of: ${LOCALES.join(", ")}`);
    process.exit(1);
  }

  const instance = (process.env.MASTODON_INSTANCE ?? "https://mastodon.social").replace(/\/$/, "");
  const token = process.env.MASTODON_ACCESS_TOKEN;
  if (!token && !dryRun) {
    console.error("MASTODON_ACCESS_TOKEN is not set. Add it to .env.local (scope: write:statuses).");
    process.exit(1);
  }

  const limits = await fetchLimits(instance);

  for (const lang of langs) {
    const file = path.join(POSTS_DIR, `${slug}.${lang}.md`);
    if (!fs.existsSync(file)) {
      console.error(`✗ ${lang}: no such post — ${path.relative(ROOT, file)}`);
      process.exitCode = 1;
      continue;
    }

    const { data } = matter(fs.readFileSync(file, "utf8"));
    const text = buildToot(data, postUrl(slug, lang), limits);

    console.log(`\n─── ${lang.toUpperCase()} — ${weighedLength(text, limits.urlWeight)}/${limits.maxChars} chars ───`);
    console.log(text);

    if (dryRun) continue;

    const url = await publish({ instance, token, text, lang, slug });
    console.log(`\n✓ published → ${url}`);
  }

  if (dryRun) console.log("\n(dry run — nothing was published)");
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
