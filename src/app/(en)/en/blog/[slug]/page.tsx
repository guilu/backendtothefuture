import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostArticle from "@/components/PostArticle";
import JsonLd from "@/components/JsonLd";
import { LangProvider } from "@/context/LangContext";
import { getAllPosts, getPostBySlug, type PostContent } from "@/lib/blog";
import { languageAlternates } from "@/lib/i18n";
import { AUTHOR } from "@/lib/site";

const BASE = "https://backendtothefuture.com";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/**
 * The English copy drives this route's metadata, falling back to Spanish.
 *
 * <p>The fallback is the honest option for a post that has no translation yet:
 * the page still exists and still says something, and an empty `<title>` would
 * be worse than one in the other language.
 */
function primary(slug: string): PostContent | null {
  const post = getPostBySlug(slug);
  if (!post) return null;
  return post.translations.en ?? post.translations.es ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = primary(slug);
  if (!p) return {};
  const url = `${BASE}/en/blog/${slug}/`;
  // og:image must be a raster (JPG/PNG) — social scrapers don't render WebP.
  const ogImage = p.ogImage ?? "/og.png";
  return {
    title: `${p.title} — Backend to the Future`,
    description: p.description,
    keywords: p.tags,
    alternates: {
      canonical: `/en/blog/${slug}/`,
      languages: languageAlternates(`/blog/${slug}/`),
    },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.description,
      url,
      siteName: "Backend to the Future",
      locale: "en_US",
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

export default async function EnBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const p = post.translations.en ?? post.translations.es!;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.date,
    keywords: p.tags.join(", "),
    url: `${BASE}/en/blog/${slug}/`,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
      sameAs: AUTHOR.sameAs,
    },
    publisher: { "@type": "Person", name: AUTHOR.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/en/blog/${slug}/` },
  };

  return (
    <LangProvider lang="en">
      <JsonLd data={jsonLd} />
      <Header />
      <PostArticle post={post} />
      <Footer />
    </LangProvider>
  );
}
