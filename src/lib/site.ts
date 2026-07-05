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
