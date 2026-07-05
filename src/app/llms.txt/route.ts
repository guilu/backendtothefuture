import { getAllPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR } from "@/lib/site";

// Required for `output: export` — emit a static llms.txt at build time.
// Spec: https://llmstxt.org — a curated, LLM-friendly index of site content.
export const dynamic = "force-static";

export function GET(): Response {
  const posts = getAllPosts()
    .map((post) => {
      const p = post.translations.es ?? post.translations.en!;
      const url = `${SITE_URL}/blog/${post.slug}/`;
      return `- [${p.title}](${url}): ${p.description}`;
    })
    .join("\n");

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Author: ${AUTHOR.name} (${AUTHOR.url})

## Blog

${posts}

## Feeds

- [RSS feed](${SITE_URL}/feed.xml)
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
