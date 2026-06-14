import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Lang } from "@/lib/translations";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

export interface PostContent {
  title: string;
  date: string;
  description: string;
  tags: string[];
  contentHtml: string;
  /** Optional square thumbnail (~800×800) shown in the blog index card. */
  thumb?: string;
  /** Optional wide header image (~1200×630) shown atop the post. */
  cover?: string;
}

export interface LocalizedPost {
  slug: string;
  /** Canonical date used for ordering — taken from the default locale, falling back to any available. */
  date: string;
  translations: Partial<Record<Lang, PostContent>>;
}

function parseFile(filename: string): { slug: string; lang: Lang; content: PostContent } | null {
  const match = filename.match(/^(.+)\.(es|en)\.md$/);
  if (!match) return null;
  const [, slug, lang] = match;
  const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, filename), "utf8"));
  return {
    slug,
    lang: lang as Lang,
    content: {
      title: data.title ?? slug,
      date: data.date ? String(data.date) : "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      contentHtml: marked(content) as string,
      thumb: data.thumb ?? undefined,
      cover: data.cover ?? undefined,
    },
  };
}

export function getAllPosts(): LocalizedPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const map = new Map<string, LocalizedPost>();

  for (const filename of fs.readdirSync(POSTS_DIR)) {
    const parsed = parseFile(filename);
    if (!parsed) continue;

    const post = map.get(parsed.slug) ?? { slug: parsed.slug, date: "", translations: {} };
    post.translations[parsed.lang] = parsed.content;
    map.set(parsed.slug, post);
  }

  return [...map.values()]
    .map((post) => ({
      ...post,
      date: (post.translations.es ?? post.translations.en)?.date ?? "",
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): LocalizedPost | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}
