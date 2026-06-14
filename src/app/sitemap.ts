import type { MetadataRoute } from "next";

// Required for `output: export` — emit a static sitemap.xml at build time.
export const dynamic = "force-static";

const BASE = "https://backendtothefuture.com";

// Public, indexable routes. The blog renders every post on a single /blog page
// (no per-post URLs), so its lastModified tracks the newest post. /design-system
// is an internal reference and is intentionally excluded (and noindexed).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/blog/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/cookies/`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
