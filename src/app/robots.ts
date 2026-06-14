import type { MetadataRoute } from "next";

// Required for `output: export` — emit a static robots.txt at build time.
export const dynamic = "force-static";

const BASE = "https://backendtothefuture.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal design reference — kept out of the index.
      disallow: "/design-system/",
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
