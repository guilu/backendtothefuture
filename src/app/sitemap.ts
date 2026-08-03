import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { localizePath } from "@/lib/i18n";

// Required for `output: export` — emit a static sitemap.xml at build time.
export const dynamic = "force-static";

const BASE = "https://backendtothefuture.com";

/**
 * One entry per URL per language, each declaring the other as its alternate.
 *
 * <p>Listing only the Spanish URLs would leave the English ones discoverable
 * solely through the language toggle — crawlable in principle, but with nothing
 * telling Google they are translations rather than thin duplicates.
 */
function bothLocales(
  barePath: string,
  rest: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  const es = `${BASE}${localizePath(barePath, "es")}`;
  const en = `${BASE}${localizePath(barePath, "en")}`;
  const languages = { es, en, "x-default": es };
  return [
    { url: es, alternates: { languages }, ...rest },
    { url: en, alternates: { languages }, ...rest },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const posts = getAllPosts().flatMap((post) =>
    bothLocales(`/blog/${post.slug}/`, {
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "yearly",
      priority: 0.6,
    }),
  );

  return [
    ...bothLocales("/", { lastModified: now, changeFrequency: "monthly", priority: 1 }),
    ...bothLocales("/blog/", { lastModified: now, changeFrequency: "weekly", priority: 0.8 }),
    ...posts,
    ...bothLocales("/cookies/", { lastModified: now, changeFrequency: "yearly", priority: 0.2 }),
  ];
}
