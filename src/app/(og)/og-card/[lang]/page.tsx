import { notFound } from "next/navigation";
import BlogOgCard from "@/components/BlogOgCard";
import { getAllPosts } from "@/lib/blog";
import { blogOgCardModel } from "@/lib/og";
import type { Lang } from "@/lib/translations";

const LANGS: Lang[] = ["es", "en"];

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/**
 * The blog-index Open Graph card, one static page per locale.
 *
 * <p>Nothing links here. `scripts/og-shot.mjs` loads it from the built `out/`
 * directory, photographs it, and the JPG is what the world sees; the route
 * exists so the card can be opened in a browser and edited like any other
 * component instead of being drawn blind.
 */
export default async function OgCardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!LANGS.includes(lang as Lang)) notFound();

  return <BlogOgCard model={blogOgCardModel(lang as Lang, getAllPosts())} />;
}
