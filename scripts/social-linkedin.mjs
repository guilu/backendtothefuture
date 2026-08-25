#!/usr/bin/env node
/**
 * Publishes a blog post to LinkedIn as an article post with a thumbnail.
 *
 *   npm run social:linkedin -- <slug> --dry-run   # uploads nothing, prints the post
 *   npm run social:linkedin -- <slug>             # publishes
 *
 * Spanish only, deliberately. LinkedIn has no per-language feed filter the way
 * Mastodon does, so every contact would see both copies; two posts of the same
 * content back to back reads as spam and splits the engagement. The English
 * post still exists on the site for whoever arrives from search.
 *
 * The thumbnail is not optional work. The Posts API explicitly does NOT scrape
 * the URL to build a preview card ("API partners must set article fields such
 * as thumbnail, title, and description within the post"), so pasting the link
 * in the text would publish a bare string. The card is assembled by hand: the
 * post's own `ogImage` is uploaded through the Images API and its URN goes in
 * `content.article.thumbnail`.
 *
 * Requires in .env.local, all produced by scripts/linkedin-auth.mjs:
 *   LINKEDIN_ACCESS_TOKEN   expires every ~60 days — re-run the auth script
 *   LINKEDIN_PERSON_URN     urn:li:person:{sub}
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "blog");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE_URL = "https://backendtothefuture.com";

const API = "https://api.linkedin.com";

/**
 * LinkedIn pins every request to a dated API version and sunsets old ones on a
 * schedule (202508 died on 2026-08-17). When a call starts failing for no
 * apparent reason, check this first — it is the likeliest cause.
 */
const LINKEDIN_VERSION = "202608";

/** Documented ceiling for `commentary`. */
const MAX_COMMENTARY = 3000;

/** LinkedIn buries posts that look tag-stuffed; three is the usual advice. */
const MAX_HASHTAGS = 3;

/**
 * The card's subtitle. Deliberately NOT the post's `description`: that already
 * runs as the commentary above the card, and LinkedIn renders both on some
 * surfaces, so reusing it makes the same sentence stutter twice in one post.
 * Mirrors the tagline on the LinkedIn Page itself, so the card and the profile
 * behind it describe the blog with the same sentence — update both together.
 */
const CARD_SUBTITLE =
  "Notas semanales sobre ingeniería backend, clean code, arquitectura de software y trabajo con IA.";

const ACRONYMS = new Set([
  "ai", "api", "cd", "ci", "cli", "css", "db", "html", "http", "jvm", "llm",
  "orm", "pr", "rag", "seo", "sql", "ssr", "tdd", "ui", "ux",
]);

function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

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

function headers(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": LINKEDIN_VERSION,
    ...extra,
  };
}

/** LinkedIn returns its errors as JSON when it can and as HTML when it cannot. */
async function readError(res) {
  const text = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(text);
    return parsed.message ?? JSON.stringify(parsed);
  } catch {
    return text.slice(0, 300) || res.statusText;
  }
}

/**
 * Registers the upload, PUTs the bytes, and hands back the image URN.
 *
 * <p>There is no verification step: a `w_member_social` token is write-only on
 * `/rest/images`, so GET returns 403 and the upload's PROCESSING → AVAILABLE
 * transition cannot be polled. The post is created straight afterwards and
 * LinkedIn resolves the asset on its side.
 */
async function uploadThumbnail(token, owner, filePath) {
  const init = await fetch(`${API}/rest/images?action=initializeUpload`, {
    method: "POST",
    headers: headers(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ initializeUploadRequest: { owner } }),
  });
  if (!init.ok) throw new Error(`initializeUpload: ${init.status} — ${await readError(init)}`);

  const { value } = await init.json();

  const bytes = fs.readFileSync(filePath);
  const put = await fetch(value.uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/jpeg" },
    body: bytes,
  });
  if (!put.ok) throw new Error(`image upload: ${put.status} — ${await readError(put)}`);

  return value.image;
}

async function createPost(token, body) {
  const res = await fetch(`${API}/rest/posts`, {
    method: "POST",
    headers: headers(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`create post: ${res.status} — ${await readError(res)}`);

  // The new post's URN comes back in a header, not in the body.
  return res.headers.get("x-restli-id");
}

async function main() {
  loadEnvLocal();

  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const slug = args.find((a) => !a.startsWith("--"));

  if (!slug) {
    console.error("usage: npm run social:linkedin -- <slug> [--dry-run]");
    process.exit(1);
  }

  const file = path.join(POSTS_DIR, `${slug}.es.md`);
  if (!fs.existsSync(file)) {
    console.error(`✗ no existe el post — ${path.relative(ROOT, file)}`);
    process.exit(1);
  }

  const { data } = matter(fs.readFileSync(file, "utf8"));
  if (!data.ogImage) {
    console.error(`✗ el post no declara ogImage en el frontmatter; sin él no hay tarjeta`);
    process.exit(1);
  }

  const thumbPath = path.join(PUBLIC_DIR, data.ogImage.replace(/^\//, ""));
  if (!fs.existsSync(thumbPath)) {
    console.error(`✗ ogImage declarado pero ausente — ${path.relative(ROOT, thumbPath)}`);
    process.exit(1);
  }

  const url = `${SITE_URL}/blog/${slug}/`;
  const hashtags = (data.tags ?? []).slice(0, MAX_HASHTAGS).map(toHashtag).join(" ");
  const commentary = [data.description, hashtags].filter(Boolean).join("\n\n");

  if (commentary.length > MAX_COMMENTARY) {
    console.error(`✗ el texto ocupa ${commentary.length} caracteres, el máximo es ${MAX_COMMENTARY}`);
    process.exit(1);
  }

  console.log(`\n─── Texto — ${commentary.length}/${MAX_COMMENTARY} caracteres ───`);
  console.log(commentary);
  console.log(`\n─── Tarjeta ───`);
  console.log(`  título      ${data.title}`);
  console.log(`  subtítulo   ${CARD_SUBTITLE}`);
  console.log(`  enlace      ${url}`);
  console.log(`  miniatura   ${path.relative(ROOT, thumbPath)}`);

  if (dryRun) {
    console.log("\n(dry run — no se ha subido ni publicado nada)");
    return;
  }

  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const author = process.env.LINKEDIN_PERSON_URN;
  if (!token || !author) {
    console.error("\n✗ Faltan LINKEDIN_ACCESS_TOKEN / LINKEDIN_PERSON_URN en .env.local.");
    console.error("  Ejecuta: node scripts/linkedin-auth.mjs");
    process.exit(1);
  }

  console.log("\n▶ Subiendo la miniatura...");
  const thumbnail = await uploadThumbnail(token, author, thumbPath);

  console.log("▶ Publicando...");
  const id = await createPost(token, {
    author,
    commentary,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    content: {
      article: { source: url, thumbnail, title: data.title, description: CARD_SUBTITLE },
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  });

  console.log(`\n✓ publicado → https://www.linkedin.com/feed/update/${id}/`);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
