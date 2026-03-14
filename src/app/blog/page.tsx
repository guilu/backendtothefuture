import { getAllPosts } from "@/lib/blog";
import BlogLayout from "@/components/BlogLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Backend to the Future",
  description: "Articles on backend engineering, architecture, and the projects I build.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogLayout posts={posts} />;
}
