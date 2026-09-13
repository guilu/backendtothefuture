/**
 * UTM tagging for the links the social scripts publish.
 *
 * GA4 already lists LinkedIn and X as referrers, but a referrer only says where
 * a visit came from — not which post, which article or which language carried
 * it. Tagging every shared link lets the `article_read` event be broken down by
 * the exact publication that produced the read.
 *
 * The convention is shared with Hermes, who reads the reports:
 *
 *   utm_source    the channel: linkedin | x | mastodon
 *   utm_medium    always organic_social
 *   utm_campaign  blog_<year of the post>, stable for a whole year of posts
 *   utm_content   <slug>-<lang>[-<variant>], one value per publication
 *
 * The tagged URLs are safe for SEO: every post declares its canonical without
 * query string (src/lib/metadata.ts), so the parameters never become a second
 * indexable page.
 */

export const SITE_URL = "https://backendtothefuture.com";

export const MEDIUM = "organic_social";

export const SOURCES = ["linkedin", "x", "mastodon"];

/** `/blog/<slug>/` in Spanish, `/en/blog/<slug>/` in English. See src/lib/i18n.ts. */
export function postUrl(slug, lang) {
  return lang === "es" ? `${SITE_URL}/blog/${slug}/` : `${SITE_URL}/en/blog/${slug}/`;
}

/**
 * The campaign is the post's year, not the year the script runs: re-sharing a
 * 2025 article in 2026 still belongs to the 2025 batch of posts.
 */
function campaign(date) {
  // Quoted dates arrive as strings; an unquoted `date: 2026-09-13` is parsed
  // by gray-matter into a Date, whose String() starts with the weekday.
  const year = date instanceof Date ? String(date.getUTCFullYear()) : String(date ?? "").slice(0, 4);
  if (!/^\d{4}$/.test(year)) throw new Error(`utm: the post has no usable date (${date})`);
  return `blog_${year}`;
}

export function withUtm(url, { slug, date, lang, source, variant }) {
  // A typo here does not fail anywhere else: GA4 just grows a new source row.
  if (!SOURCES.includes(source)) {
    throw new Error(`utm: unknown source "${source}", expected one of ${SOURCES.join(", ")}`);
  }

  const tagged = new URL(url);
  tagged.searchParams.set("utm_source", source);
  tagged.searchParams.set("utm_medium", MEDIUM);
  tagged.searchParams.set("utm_campaign", campaign(date));
  tagged.searchParams.set("utm_content", [slug, lang, variant].filter(Boolean).join("-"));
  return tagged.toString();
}

/**
 * Every link a post is shared with, ready to paste. LinkedIn and X are Spanish
 * only (neither has a per-language feed filter); Mastodon gets one per locale.
 */
export function socialLinks({ slug, date }) {
  const tag = (source, lang) => withUtm(postUrl(slug, lang), { slug, date, lang, source });
  return {
    linkedin: tag("linkedin", "es"),
    x: tag("x", "es"),
    mastodon_es: tag("mastodon", "es"),
    mastodon_en: tag("mastodon", "en"),
  };
}
