"use client";

import { useState } from "react";
import type { Post } from "@/lib/blog";

export default function BlogLayout({ posts }: { posts: Post[] }) {
  const [selected, setSelected] = useState<Post | null>(posts[0] ?? null);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Split layout — pt accounts for the fixed Header (≈73px) */}
      <div className="flex pt-[73px] min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-[rgba(112,0,255,0.1)] overflow-y-auto sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#7000ff] mb-4 px-3">
              {posts.length} post{posts.length !== 1 ? "s" : ""}
            </p>
            <ul className="flex flex-col gap-0.5">
              {posts.map((post) => (
                <li key={post.slug}>
                  <button
                    onClick={() => setSelected(post)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 ${
                      selected?.slug === post.slug
                        ? "bg-[rgba(112,0,255,0.08)] border border-[rgba(112,0,255,0.15)]"
                        : "border border-transparent hover:bg-[rgba(112,0,255,0.04)]"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium leading-snug ${
                        selected?.slug === post.slug ? "text-[var(--c-text)]" : "text-[var(--c-muted)]"
                      }`}
                    >
                      {post.title}
                    </div>
                    <div className="font-mono text-[10px] mt-1 text-[var(--c-muted)] opacity-50">
                      {post.date}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(112,0,255,0.08)] text-[#7000ff] border border-[rgba(112,0,255,0.15)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {selected ? (
            <article className="max-w-2xl mx-auto px-8 py-12">
              <header className="mb-10">
                <h1 className="text-2xl font-bold text-[var(--c-text)] leading-tight mb-2">
                  {selected.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-[#7000ff]">{selected.date}</span>
                  {selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[rgba(112,0,255,0.08)] text-[#7000ff] border border-[rgba(112,0,255,0.15)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {selected.description && (
                  <p className="mt-4 text-sm text-[var(--c-muted)] leading-relaxed border-l-2 border-[rgba(112,0,255,0.3)] pl-4">
                    {selected.description}
                  </p>
                )}
              </header>

              <div
                className="blog-prose"
                dangerouslySetInnerHTML={{ __html: selected.contentHtml }}
              />
            </article>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--c-muted)] font-mono text-sm">
              Select a post
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
