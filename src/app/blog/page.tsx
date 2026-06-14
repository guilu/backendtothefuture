import { getAllPosts } from "@/lib/blog";
import BlogLayout from "@/components/BlogLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LangProvider } from "@/context/LangContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Backend to the Future",
  description: "Articles on backend engineering, architecture, and the projects I build.",
  alternates: { canonical: "/blog/" },
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <LangProvider>
      <Header />
      <BlogLayout posts={posts} />
      <Footer />
    </LangProvider>
  );
}
