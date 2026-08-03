/** Canonical site + author identity, shared across metadata, JSON-LD, feed and llms.txt. */

export const SITE_URL = "https://backendtothefuture.com";

export const SITE_NAME = "Backend to the Future";

export const SITE_DESCRIPTION =
  "Weekly notes on backend engineering, AI-assisted workflows, and clean architecture by Diego Barrio.";

/**
 * Author identity with `sameAs` links. Search engines use `sameAs` to tie these
 * profiles to one entity (knowledge graph); LLMs use it to attribute authorship.
 */
export const AUTHOR = {
  name: "Diego Barrio",
  url: "https://diegobarrioh.dev",
  sameAs: [
    "https://github.com/guilu",
    "https://www.linkedin.com/in/diegobarrioh",
    "https://diegobarrioh.dev",
  ],
} as const;

/**
 * Home-page structured data, shared by both locales' home pages.
 *
 * <p>`inLanguage` names both because the site publishes the same content in
 * two languages; the `url` differs per locale, so it is passed in rather than
 * baked in.
 */
export function homeJsonLd(homeUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: AUTHOR.name,
        url: AUTHOR.url,
        jobTitle: "Senior Backend Engineer",
        description: "Senior Backend Engineer crafting scalable platforms with Java & Spring.",
        address: { "@type": "PostalAddress", addressLocality: "Alicante", addressCountry: "ES" },
        sameAs: AUTHOR.sameAs,
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: homeUrl,
        author: { "@type": "Person", name: AUTHOR.name },
        inLanguage: ["es", "en"],
      },
    ],
  };
}
