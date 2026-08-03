import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostArticle from "@/components/PostArticle";
import JsonLd from "@/components/JsonLd";
import { LangProvider } from "@/context/LangContext";
import { getAllPosts, getPostBySlug, type PostContent } from "@/lib/blog";
import { alternatesFor } from "@/lib/metadata";
import { AUTHOR } from "@/lib/site";

const BASE = "https://backendtothefuture.com";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/** SEO metadata uses the Spanish copy as the primary locale, falling back to EN. */
function primary(slug: string): PostContent | null {
  const post = getPostBySlug(slug);
  if (!post) return null;
  return post.translations.es ?? post.translations.en ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = primary(slug);
  if (!p) return {};
  const url = `${BASE}/blog/${slug}/`;
  // og:image must be a raster (JPG/PNG) — social scrapers don't render WebP.
  // Falls back to the site-wide og.png when a post has no dedicated ogImage.
  const ogImage = p.ogImage ?? "/og.png";
  return {
    title: `${p.title} — Backend to the Future`,
    description: p.description,
    keywords: p.tags,
    alternates: alternatesFor(`/blog/${slug}/`, "es"),
    openGraph: {
      type: "article",
      title: p.title,
      description: p.description,
      url,
      siteName: "Backend to the Future",
      publishedTime: p.date,
      tags: p.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: p.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const p = post.translations.es ?? post.translations.en!;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.date,
    keywords: p.tags.join(", "),
    url: `${BASE}/blog/${slug}/`,
    inLanguage: ["es", "en"],
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
      sameAs: AUTHOR.sameAs,
    },
    publisher: { "@type": "Person", name: AUTHOR.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/blog/${slug}/` },
  };

  return (
    <LangProvider lang="es">
      <JsonLd data={jsonLd} />
      <Header />
      <PostArticle post={post} />
      <Footer />
    </LangProvider>
  );
}
