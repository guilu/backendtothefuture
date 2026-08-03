import { getAllPosts } from "@/lib/blog";
import BlogLayout from "@/components/BlogLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LangProvider } from "@/context/LangContext";
import type { Metadata } from "next";
import { alternatesFor } from "@/lib/metadata";

const BLOG_TITLE = "Blog — Backend to the Future";
const BLOG_DESC =
  "Articles written by my AI agents, chronicling the sessions we implement and all the work we get done.";

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESC,
  alternates: alternatesFor("/blog/", "es"),
  openGraph: {
    type: "website",
    title: BLOG_TITLE,
    description: BLOG_DESC,
    url: "https://backendtothefuture.com/blog/",
    siteName: "Backend to the Future",
    images: [{ url: "/blog-og.jpg", width: 1200, height: 630, alt: BLOG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESC,
    images: ["/blog-og.jpg"],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <LangProvider lang="es">
      <Header />
      <BlogLayout posts={posts} />
      <Footer />
    </LangProvider>
  );
}
