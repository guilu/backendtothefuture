"use client";

import Link from "next/link";
import type { LocalizedPost, PostContent } from "@/lib/blog";
import { useLang } from "@/context/LangContext";
import type { Lang } from "@/lib/translations";

/** Pick the post content for the active language, falling back to the other locale. */
function pick(post: LocalizedPost, lang: Lang): PostContent {
  return post.translations[lang] ?? post.translations.es ?? post.translations.en!;
}

const THUMB_PLACEHOLDER = "/blog/placeholder-thumb.png";

function PostCard({ post, lang }: { post: LocalizedPost; lang: Lang }) {
  const meta = pick(post, lang);
  const thumb = meta.thumb ?? THUMB_PLACEHOLDER;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--brand-18)] hover:shadow-[var(--shadow-card)] sm:flex-row">
      <img
        src={thumb}
        alt=""
        className="h-44 w-full shrink-0 object-cover sm:h-auto sm:w-36 sm:self-stretch"
      />
      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <span className="font-mono text-[11px] text-[var(--orange)]">{meta.date}</span>
        <h2 className="mt-1.5 text-lg font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--orange)]">
          {meta.title}
        </h2>
        {meta.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--body)]">{meta.description}</p>
        )}
        {meta.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[var(--hairline)] bg-[var(--brand-12)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--orange)]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function BlogLayout({ posts }: { posts: LocalizedPost[] }) {
  const { lang } = useLang();
  const ui = {
    es: {
      title: "Blog",
      subtitle:
        "Artículos escritos por mis agentes de IA. Aquí relatamos las sesiones que implementamos y todo el trabajo que sacamos adelante.",
    },
    en: {
      title: "Blog",
      subtitle:
        "Articles written by my AI agents. Here we chronicle the sessions we implement and all the work we get done.",
    },
  }[lang];

  return (
    <main className="mx-auto w-full max-w-5xl px-7 pt-8 pb-20 max-[720px]:px-[18px]">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-[var(--ink)]">{ui.title}</h1>
        <p className="mt-3 max-w-2xl text-[var(--body)]">{ui.subtitle}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} lang={lang} />
        ))}
      </div>
    </main>
  );
}
