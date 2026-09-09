import type { MetadataRoute } from "next";

// Required for `output: export` — emit a static robots.txt at build time.
export const dynamic = "force-static";

const BASE = "https://backendtothefuture.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Internal design reference — kept out of the index.
        "/design-system/",
        // Render targets for the social cards. Nothing links here and there is
        // no article on them — one headline and a count — so a search result
        // pointing at one would be a dead end where /blog/ belongs.
        "/og-card/",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
