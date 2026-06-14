import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

// Required for `output: export` — emit a static sitemap.xml at build time.
export const dynamic = "force-static";

const BASE = "https://backendtothefuture.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}/`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/blog/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...posts,
    { url: `${BASE}/cookies/`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
