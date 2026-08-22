#!/usr/bin/env node
/**
 * Regenerates the blog-index Open Graph images from the freshly built site.
 *
 * Run AFTER `next build` and BEFORE the rsync in deploy.sh:
 *
 *   npm run build && npm run og:shot && rsync ... out/
 *
 * For each locale it reads the `og:image` URL that the build already baked into
 * the page (see src/lib/og.ts for how that name is derived), screenshots the
 * page, and writes the JPG under exactly that name. The built HTML is the
 * single source of truth for the filename, so the hash logic lives in one place
 * and the image can never end up named something the metadata does not point at.
 *
 * Old images are kept — LinkedIn keeps requesting the URL it cached when a post
 * was first shared, and deleting it turns every past share into a broken
 * preview. Only the oldest beyond OG_RETENTION are dropped.
 */

import { createServer } from "http";
import { chromium } from "playwright";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const PUBLIC_OG = path.join(ROOT, "public", "og");
const OUT_OG = path.join(OUT_DIR, "og");

const JPEG_QUALITY = 90;

/** How many past images survive per locale. Five deploys of LinkedIn cache. */
const OG_RETENTION = 5;

/**
 * The thumbnail is a brand asset, so it is pinned to one theme rather than
 * following whatever `prefers-color-scheme` the deploying machine happens to
 * report — otherwise the same commit produces a different image on a laptop in
 * light mode.
 */
const COLOR_SCHEME = "dark";

const ROUTES = [
  { lang: "es", route: "/blog/" },
  { lang: "en", route: "/en/blog/" },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/**
 * Serves `out/` the way the Pi's nginx does: a bare directory resolves to its
 * `index.html`. Loading the files over `file://` instead would 404 every
 * `/_next/...` asset, because the export addresses them from the site root.
 */
function serveStatic(dir) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      let target = path.join(dir, decodeURIComponent(url.pathname));
      if (!target.startsWith(dir)) {
        res.writeHead(403).end();
        return;
      }
      if (existsSync(target) && (await fs.stat(target)).isDirectory()) {
        target = path.join(target, "index.html");
      }
      const body = await fs.readFile(target);
      res.writeHead(200, { "Content-Type": MIME[path.extname(target)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

/**
 * Pixels per CSS pixel, read out of src/lib/og.ts rather than restated here.
 *
 * <p>Keeping a copy in this file looked harmless and was not: the published
 * size is divisible by more than one scale, so a stale copy would quietly
 * capture a different viewport — a narrower page, a different layout — and
 * still emit an image of exactly the declared dimensions. One definition is
 * the only way that cannot happen.
 */
async function deviceScale() {
  const src = await fs.readFile(path.join(ROOT, "src", "lib", "og.ts"), "utf8");
  const match = src.match(/export const OG_SCALE = (\d+);/);
  if (!match) throw new Error("Could not read OG_SCALE from src/lib/og.ts.");
  return Number(match[1]);
}

function metaContent(html, property) {
  const match = html.match(new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]+)"`));
  return match?.[1];
}

/**
 * Reads back what the build already promised about this page's OG image: the
 * filename and the dimensions it advertises. Both come from the HTML rather
 * than being restated here, so the metadata can never disagree with the file.
 */
async function ogTargetFor(route, scale) {
  const file = path.join(OUT_DIR, route, "index.html");
  const html = await fs.readFile(file, "utf8");

  const image = metaContent(html, "og:image");
  if (!image) throw new Error(`No og:image meta tag in out${route}index.html — did the build run?`);

  const width = Number(metaContent(html, "og:image:width"));
  const height = Number(metaContent(html, "og:image:height"));
  if (!width || !height) throw new Error(`out${route}index.html declares no og:image dimensions.`);

  const viewport = { width: width / scale, height: height / scale };
  if (!Number.isInteger(viewport.width) || !Number.isInteger(viewport.height)) {
    throw new Error(
      `Declared ${width}×${height} is not divisible by OG_SCALE ${scale} — ` +
        `check OG_WIDTH/OG_HEIGHT/OG_SCALE in src/lib/og.ts.`
    );
  }

  return { filename: path.basename(image), viewport };
}

async function capture(page, url, dest) {
  await page.goto(url, { waitUntil: "networkidle" });
  // The self-hosted JetBrains Mono swaps in after first paint; shooting before
  // it lands produces a thumbnail in the fallback font.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: dest, type: "jpeg", quality: JPEG_QUALITY });
}

/** Drops the oldest images for a locale, keeping the newest OG_RETENTION. */
async function prune(lang) {
  const pattern = new RegExp(`^blog-og-${lang}-[0-9a-f]{7}\\.jpg$`);
  const files = (await fs.readdir(PUBLIC_OG)).filter((f) => pattern.test(f));

  const withTime = await Promise.all(
    files.map(async (f) => ({ f, mtime: (await fs.stat(path.join(PUBLIC_OG, f))).mtimeMs }))
  );
  withTime.sort((a, b) => b.mtime - a.mtime);

  for (const { f } of withTime.slice(OG_RETENTION)) {
    await fs.rm(path.join(PUBLIC_OG, f));
    console.log(`  ✗ pruned ${f}`);
  }
}

async function main() {
  if (!existsSync(OUT_DIR)) throw new Error("out/ not found — run `npm run build` first.");
  await fs.mkdir(PUBLIC_OG, { recursive: true });

  const scale = await deviceScale();

  const { server, port } = await serveStatic(OUT_DIR);
  const browser = await chromium.launch();
  // The viewport is set per route from what that page declares; only the pixel
  // density is fixed here, and it is a context-level setting in Playwright.
  const context = await browser.newContext({
    deviceScaleFactor: scale,
    colorScheme: COLOR_SCHEME,
  });

  // Seeded before any page script runs: the cookie banner and the theme are
  // both decided from localStorage on load, and a consent banner across the
  // bottom third of every social preview is not the picture we want to ship.
  await context.addInitScript(`
    try {
      localStorage.setItem("ga-consent", "denied");
      localStorage.setItem("theme", "${COLOR_SCHEME}");
    } catch (e) {}
  `);

  const page = await context.newPage();

  try {
    for (const { lang, route } of ROUTES) {
      const { filename, viewport } = await ogTargetFor(route, scale);
      await page.setViewportSize(viewport);
      const dest = path.join(PUBLIC_OG, filename);
      await capture(page, `http://127.0.0.1:${port}${route}`, dest);
      const size = `${viewport.width * scale}×${viewport.height * scale}`;
      console.log(`  ✓ ${route} → public/og/${filename} (${size})`);
      await prune(lang);
    }
  } finally {
    await browser.close();
    server.close();
  }

  // `next build` copied public/ into out/ before these images existed, so the
  // export is mirrored by hand. Replacing the directory rather than adding to
  // it keeps rsync --delete from resurrecting pruned files on the server.
  await fs.rm(OUT_OG, { recursive: true, force: true });
  await fs.cp(PUBLIC_OG, OUT_OG, { recursive: true });

  const kept = await fs.readdir(PUBLIC_OG);
  console.log(`  ✓ ${kept.length} OG image(s) staged in out/og/`);
}

main().catch((err) => {
  console.error(`✗ og:shot failed — ${err.message}`);
  process.exit(1);
});
