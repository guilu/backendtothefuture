"use client";

import { useRef, useState } from "react";
import type { LocalizedPost, PostContent } from "@/lib/blog";
import { useLang } from "@/context/LangContext";
import type { Lang } from "@/lib/translations";

/** Pick the post content for the active language, falling back to the other locale. */
function pick(post: LocalizedPost, lang: Lang): PostContent {
  return post.translations[lang] ?? post.translations.es ?? post.translations.en!;
}

function PostCard({
  post,
  lang,
  selected,
  onClick,
}: {
  post: LocalizedPost;
  lang: Lang;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = pick(post, lang);
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-[var(--r-sm)] px-3 py-3 text-left transition-all duration-150 ${
        selected
          ? "border border-[var(--brand-18)] bg-[var(--brand-08)]"
          : "border border-transparent hover:bg-[var(--brand-08)]"
      }`}
    >
      <div className={`text-sm font-medium leading-snug ${selected ? "text-[var(--ink)]" : "text-[var(--body)]"}`}>
        {meta.title}
      </div>
      <div className="mt-1 font-mono text-[10px] text-[var(--muted)]">{meta.date}</div>
      {meta.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[var(--hairline)] bg-[var(--brand-12)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--orange)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export default function BlogLayout({ posts }: { posts: LocalizedPost[] }) {
  const { lang } = useLang();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(posts[0]?.slug ?? null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const selected = posts.find((p) => p.slug === selectedSlug) ?? null;
  const view = selected ? pick(selected, lang) : null;

  const ui = {
    es: { count: (n: number) => `${n} ${n === 1 ? "entrada" : "entradas"}`, empty: "Selecciona una entrada" },
    en: { count: (n: number) => `${n} ${n === 1 ? "post" : "posts"}`, empty: "Select a post" },
  }[lang];

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== carouselIndex) {
      setCarouselIndex(i);
      const slug = posts[i]?.slug;
      if (slug) setSelectedSlug(slug);
    }
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen text-[var(--ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col pt-4 lg:flex-row lg:pt-[73px]">
        {/* Sidebar */}
        <aside className="w-full shrink-0 border-b border-[var(--hairline)] lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:w-60 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <p className="mb-4 px-8 pb-5 font-mono text-[10px] uppercase tracking-widest text-[var(--orange)] lg:px-8">
            {ui.count(posts.length)}
          </p>

          {/* Desktop: vertical list */}
          <ul className="hidden flex-col gap-2.5 px-5 pb-5 lg:flex">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard
                  post={post}
                  lang={lang}
                  selected={selectedSlug === post.slug}
                  onClick={() => setSelectedSlug(post.slug)}
                />
              </li>
            ))}
          </ul>

          {/* Mobile: swipe carousel */}
          <div className="pb-4 lg:hidden">
            <div
              ref={trackRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {posts.map((post) => (
                <div key={post.slug} className="w-full shrink-0 snap-center px-5">
                  <PostCard
                    post={post}
                    lang={lang}
                    selected={selectedSlug === post.slug}
                    onClick={() => setSelectedSlug(post.slug)}
                  />
                </div>
              ))}
            </div>

            {posts.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {posts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Post ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === carouselIndex ? "w-5 bg-[var(--orange)]" : "w-1.5 bg-[var(--muted)] opacity-30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {view ? (
            <article className="mx-auto max-w-3xl px-5 py-8 lg:px-10 lg:py-12">
              <header className="mb-10">
                <h1 className="mb-2 text-2xl font-bold leading-tight text-[var(--ink)]">{view.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-[var(--orange)]">{view.date}</span>
                  {view.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-[var(--hairline)] bg-[var(--brand-12)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--orange)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {view.description && (
                  <p className="mt-4 border-l-2 border-[var(--brand-glow)] pl-4 text-sm leading-relaxed text-[var(--body)]">
                    {view.description}
                  </p>
                )}
              </header>

              <div className="blog-prose" dangerouslySetInnerHTML={{ __html: view.contentHtml }} />
            </article>
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-sm text-[var(--muted)]">
              {ui.empty}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
