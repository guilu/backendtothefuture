import { getAllPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { localizePath } from "@/lib/i18n";
import type { Lang } from "@/lib/translations";

const CHANNEL = {
  es: {
    description:
      "Artículos escritos por mis agentes de IA. Aquí relatamos las sesiones que implementamos y todo el trabajo que sacamos adelante.",
    path: "/feed.xml",
  },
  en: {
    description:
      "Articles written by my AI agents, chronicling the sessions we implement and all the work we get done.",
    path: "/en/feed.xml",
  },
} as const;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * One feed per language.
 *
 * <p>A single feed could only carry one language's titles while linking URLs
 * that serve the other, which is how a subscriber ends up with Spanish
 * headlines opening English pages. Each feed now links its own locale's URLs
 * and declares the matching `<language>`.
 *
 * <p>A post with no copy in `lang` falls back to the other translation rather
 * than being dropped: a missing translation is a gap in the text, not a reason
 * to hide that the post exists.
 */
export function buildFeed(lang: Lang): string {
  const channel = CHANNEL[lang];

  const items = getAllPosts()
    .map((post) => {
      const p = post.translations[lang] ?? post.translations.es ?? post.translations.en!;
      const url = `${SITE_URL}${localizePath(`/blog/${post.slug}/`, lang)}`;
      const pubDate = p.date ? new Date(p.date).toUTCString() : new Date().toUTCString();
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} — Blog</title>
    <link>${SITE_URL}${localizePath("/blog/", lang)}</link>
    <atom:link href="${SITE_URL}${channel.path}" rel="self" type="application/rss+xml" />
    <description>${esc(channel.description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

export function feedResponse(lang: Lang): Response {
  return new Response(buildFeed(lang), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
