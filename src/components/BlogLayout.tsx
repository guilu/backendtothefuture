"use client";

import { useState } from "react";
import type { LocalizedPost, PostContent } from "@/lib/blog";
import { useLang } from "@/context/LangContext";
import type { Lang } from "@/lib/translations";

/** Pick the post content for the active language, falling back to the other locale. */
function pick(post: LocalizedPost, lang: Lang): PostContent {
  return post.translations[lang] ?? post.translations.es ?? post.translations.en!;
}

export default function BlogLayout({ posts }: { posts: LocalizedPost[] }) {
  const { lang } = useLang();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(posts[0]?.slug ?? null);

  const selected = posts.find((p) => p.slug === selectedSlug) ?? null;
  const view = selected ? pick(selected, lang) : null;

  const ui = {
    es: { count: (n: number) => `${n} ${n === 1 ? "entrada" : "entradas"}`, empty: "Selecciona una entrada" },
    en: { count: (n: number) => `${n} ${n === 1 ? "post" : "posts"}`, empty: "Select a post" },
  }[lang];

  return (
    <div className="min-h-screen text-[var(--ink)]">
      {/* Split layout — pt accounts for the sticky Header (≈73px) */}
      <div className="flex pt-[73px] min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-[var(--hairline)] overflow-y-auto sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--orange)] mb-4 px-3">
              {ui.count(posts.length)}
            </p>
            <ul className="flex flex-col gap-2.5">
              {posts.map((post) => {
                const meta = pick(post, lang);
                return (
                  <li key={post.slug}>
                    <button
                      onClick={() => setSelectedSlug(post.slug)}
                      className={`w-full text-left px-3 py-3 rounded-[var(--r-sm)] transition-all duration-150 ${
                        selectedSlug === post.slug
                          ? "bg-[var(--brand-08)] border border-[var(--brand-18)]"
                          : "border border-transparent hover:bg-[var(--brand-08)]"
                      }`}
                    >
                      <div
                        className={`text-sm font-medium leading-snug ${
                          selectedSlug === post.slug ? "text-[var(--ink)]" : "text-[var(--body)]"
                        }`}
                      >
                        {meta.title}
                      </div>
                      <div className="font-mono text-[10px] mt-1 text-[var(--muted)]">
                        {meta.date}
                      </div>
                      {meta.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {meta.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--brand-12)] text-[var(--orange)] border border-[var(--hairline)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {view ? (
            <article className="max-w-3xl px-10 py-12">
              <header className="mb-10">
                <h1 className="text-2xl font-bold text-[var(--ink)] leading-tight mb-2">
                  {view.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-[var(--orange)]">{view.date}</span>
                  {view.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--brand-12)] text-[var(--orange)] border border-[var(--hairline)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {view.description && (
                  <p className="mt-4 text-sm text-[var(--body)] leading-relaxed border-l-2 border-[var(--brand-glow)] pl-4">
                    {view.description}
                  </p>
                )}
              </header>

              <div
                className="blog-prose"
                dangerouslySetInnerHTML={{ __html: view.contentHtml }}
              />
            </article>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--muted)] font-mono text-sm">
              {ui.empty}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
