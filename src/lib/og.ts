import crypto from "crypto";
import fs from "fs";
import path from "path";
// Relative, with extensions, where the rest of src/lib/ uses the `@/lib/...`
// alias: tests/og.test.ts runs under `node --experimental-strip-types`, which
// resolves neither the alias nor an extensionless specifier. The alternative
// was leaving `blogOgCardModel` — the function that decides whether a card
// LinkedIn already cached is stale — with no test at all.
import { getAllPosts, type LocalizedPost } from "./blog.ts";
import type { Lang } from "./translations.ts";

/**
 * Content-addressed Open Graph images for the blog index.
 *
 * <p>The blog index thumbnail used to be a hand-made `/blog-og.jpg` that never
 * moved, so every post published after it was announced with a picture of a
 * blog that no longer existed. The fix is to render the card on each deploy —
 * but the filename has to be inside the HTML that advertises it, which is
 * circular.
 *
 * <p>Breaking the circle: the name is derived from the *inputs* that render the
 * card, not from the resulting pixels. Metadata calls {@link blogOgPath} during
 * `next build`; afterwards `scripts/og-shot.mjs` reads the emitted `og:image`
 * back out of the HTML and writes the screenshot under exactly that name. One
 * build, one deterministic name, and the URL only moves when something visible
 * on the card actually changed — which is what makes LinkedIn and Twitter
 * refetch instead of serving their cached copy.
 *
 * <p>What gets photographed is the blog index itself. A dedicated poster at
 * `/og-card/<lang>/` replaced it for three weeks, because a picture of a page
 * laid out for 1200 px arrives in a ~550 px feed card with its 18 px titles
 * shrunk to 8 px. That argument is sound and the owner overruled it anyway: the
 * point of this thumbnail is to show the blog, with the new post on it, and a
 * poster showing one headline is a different promise. The legibility cost is
 * accepted knowingly — see the PR that restored this.
 *
 * <p>Consequence for the digest below: the shot now holds every card on the
 * page, so the model has to hold every post, and every field those cards
 * print. Re-cutting the art of a six-month-old post does move the URL again.
 * That is the price of photographing a page that shows six-month-old posts.
 */

const ROOT = process.cwd();

/**
 * Sources that decide how the card *looks*, as opposed to what it says.
 *
 * <p>Without these a redesign of the card would keep the old image alive
 * forever, because the posts themselves never changed.
 *
 * <p>These are the files `/og-card/<lang>/` actually renders — markup, styles,
 * and the two images the card paints itself. The blog index's own components
 * are deliberately absent: since the picture stopped being a screenshot of that
 * page, restyling a post card there changes nothing about what LinkedIn shows,
 * and listing it would burn the cache for nothing.
 */
const PRESENTATION_SOURCES = [
  "src/components/BlogLayout.tsx",
  "src/components/Header.tsx",
  "src/components/Footer.tsx",
  "src/app/(es)/blog/page.tsx",
  "src/app/(en)/en/blog/page.tsx",
  "src/app/globals.css",
  // On the page, so redrawing either has to move the URL. They are read as
  // bytes like every other entry, which is why an image can sit in this list
  // at all.
  "public/img/logo.png",
  "public/blog/placeholder-thumb.png",
];

/**
 * Published at 2× the 1200×627 minimum LinkedIn documents, because that is a
 * floor and not a target: the feed card is painted on retina displays at two
 * device pixels per CSS pixel, so a 1200px source is upscaled and reads soft.
 * 2400×1260 holds the required 1.91:1 ratio and lands around 280 KB, well
 * inside LinkedIn's 5 MB ceiling.
 *
 * <p>The capture viewport is derived from these by `scripts/og-shot.mjs`
 * (viewport = size ÷ {@link OG_SCALE}), so they are the single place the
 * output size is decided.
 */
export const OG_WIDTH = 2400;
export const OG_HEIGHT = 1260;
export const OG_SCALE = 2;

/**
 * The thumbnail as the card actually shows it: its path AND its bytes.
 *
 * <p>Hashing the path alone was a hole. Redrawing the art of a published post
 * without renaming the file left the hash — and therefore the URL — untouched,
 * so LinkedIn and Twitter kept serving the card they had already cached while
 * the server held a different picture. That is exactly the failure this module
 * exists to prevent, and it is not hypothetical: it happened to
 * `green-already-meant-weight` on 2026-08-30.
 *
 * <p>The path stays in the digest so a rename still moves the URL even when the
 * two files are byte-identical.
 */
function thumbDigest(thumb: string | undefined): string | undefined {
  // A post with no thumbnail still renders a card; it just has nothing to hash.
  if (!thumb) return thumb;
  const file = path.join(ROOT, "public", thumb.replace(/^\//, ""));
  if (!fs.existsSync(file)) return thumb;
  const bytes = crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
  return `${thumb}#${bytes.slice(0, 12)}`;
}

/** One card on the blog index, reduced to what that card prints. */
export interface OgShotPost {
  slug: string;
  date: string;
  title: string;
  /** Printed under the title, clamped to two lines. */
  description: string;
  /** Printed as chips under the description. */
  tags: string[];
  /** Site-absolute path of the post thumbnail, or `undefined` when it has none. */
  thumb?: string;
}

/**
 * Everything about the *posts* that the blog index paints.
 *
 * <p>The page also paints things no post decides — its own copy, the header,
 * the logo, the placeholder art. Those reach the digest through
 * {@link PRESENTATION_SOURCES}, not through here.
 */
export interface OgShotModel {
  lang: Lang;
  /** Every card on the page, newest first — the order the page renders them. */
  posts: OgShotPost[];
}

/**
 * What the page shows, derived from the posts alone.
 *
 * <p>One model feeds the digest that names the screenshot. It is pure so the
 * property that matters — the URL moves when and only when the picture changes
 * — is testable without a build; {@link blogOgHash} adds the parts that need
 * the disk.
 *
 * <p>Every post is here, and every field its card prints, because the shot is
 * of the whole page. `description` and `tags` are in the model for exactly that
 * reason: the cards print both, so editing either changes the picture and must
 * move the URL. Anything the page does not print stays out.
 */
export function blogOgShotModel(lang: Lang, posts: LocalizedPost[]): OgShotModel {
  return {
    lang,
    posts: posts.map((post) => {
      // A post published in one language only still appears on the other
      // locale's index; a missing card is worse than one in the wrong language.
      const meta = post.translations[lang] ?? post.translations.es ?? post.translations.en!;
      return {
        slug: post.slug,
        date: meta.date,
        title: meta.title,
        description: meta.description,
        tags: meta.tags,
        thumb: meta.thumb,
      };
    }),
  };
}

/**
 * One digest over every file in {@link PRESENTATION_SOURCES}, read as bytes.
 *
 * <p>Bytes rather than text so an image can sit in the list beside a component:
 * the card paints the logo and the placeholder thumbnail, and redrawing those
 * has to move the URL exactly as much as editing the CSS does.
 *
 * <p>A missing path throws instead of contributing an empty string. Skipping it
 * quietly is the worst outcome available here — the build succeeds, the digest
 * stays stable, and a file simply stops protecting the cache with nothing
 * anywhere saying so.
 */
function presentationDigest(): string {
  const hash = crypto.createHash("sha256");
  for (const rel of PRESENTATION_SOURCES) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) {
      throw new Error(`PRESENTATION_SOURCES points at a file that does not exist: ${rel}`);
    }
    // The path is hashed too, so moving a file moves the URL even when its
    // bytes are unchanged.
    hash.update(rel).update(fs.readFileSync(file));
  }
  return hash.digest("hex");
}

/** Short, git-style digest of the OG card for one locale. */
export function blogOgHash(lang: Lang): string {
  const model = blogOgShotModel(lang, getAllPosts());

  // The output size is part of the input on purpose: changing it produces a
  // different image, and re-cutting the same URL would leave LinkedIn serving
  // the copy it already cached. Folding it into the hash moves the URL once,
  // which is the only thing that makes them refetch.
  const input = JSON.stringify({
    ...model,
    // Swapped in only for the digest — the page wants the path, the hash wants
    // the bytes behind it, for every thumbnail the page paints. See
    // {@link thumbDigest}.
    posts: model.posts.map((post) => ({ ...post, thumb: thumbDigest(post.thumb) })),
    ui: presentationDigest(),
    render: { w: OG_WIDTH, h: OG_HEIGHT, scale: OG_SCALE },
  });
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 7);
}

/** Site-absolute URL of the current blog-index OG image, e.g. `/og/blog-og-es-a82f91c.jpg`. */
export function blogOgPath(lang: Lang): string {
  return `/og/blog-og-${lang}-${blogOgHash(lang)}.jpg`;
}
