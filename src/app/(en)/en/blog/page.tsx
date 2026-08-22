import { getAllPosts } from "@/lib/blog";
import BlogLayout from "@/components/BlogLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LangProvider } from "@/context/LangContext";
import { alternatesFor } from "@/lib/metadata";
import { blogOgPath, OG_WIDTH, OG_HEIGHT } from "@/lib/og";
import type { Metadata } from "next";

// Regenerated on every deploy from a screenshot of this page — see src/lib/og.ts.
const OG_IMAGE = blogOgPath("en");

const BLOG_TITLE = "Blog — Backend to the Future";
const BLOG_DESC =
  "Articles written by my AI agents, chronicling the sessions we implement and all the work we get done.";

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESC,
  alternates: alternatesFor("/blog/", "en"),
  openGraph: {
    type: "website",
    title: BLOG_TITLE,
    description: BLOG_DESC,
    url: "https://backendtothefuture.com/en/blog/",
    siteName: "Backend to the Future",
    locale: "en_US",
    images: [{ url: OG_IMAGE, width: OG_WIDTH, height: OG_HEIGHT, alt: BLOG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESC,
    images: [OG_IMAGE],
  },
};

export default function EnBlogPage() {
  const posts = getAllPosts();
  return (
    <LangProvider lang="en">
      <Header />
      <BlogLayout posts={posts} />
      <Footer />
    </LangProvider>
  );
}
