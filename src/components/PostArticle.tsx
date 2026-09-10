"use client";

import Link from "next/link";
import type { LocalizedPost, PostContent } from "@/lib/blog";
import { useLang } from "@/context/LangContext";
import { localizePath } from "@/lib/i18n";
import { projectLinks } from "@/lib/projectLinks";
import type { Lang } from "@/lib/translations";

function pick(post: LocalizedPost, lang: Lang): PostContent {
  return post.translations[lang] ?? post.translations.es ?? post.translations.en!;
}

const COVER_PLACEHOLDER = "/blog/placeholder-cover.png";

export default function PostArticle({ post }: { post: LocalizedPost }) {
  const { lang } = useLang();
  const view = pick(post, lang);
  const back = lang === "es" ? "← Blog" : "← Blog";
  const cover = view.cover ?? COVER_PLACEHOLDER;
  const projects = projectLinks(view.projects, lang);
  const projectsHeading = lang === "es" ? "El proyecto del que habla" : "The project behind this";

  return (
    <article
      data-article-slug={post.slug}
      data-article-language={lang}
      className="mx-auto max-w-3xl px-5 pt-8 pb-20 lg:px-8">
      <Link
        href={localizePath("/blog/", lang)}
        className="mb-8 inline-block font-mono text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--orange)]">
        {back}
      </Link>

      <img
        src={cover}
        alt=""
        className="mb-8 aspect-[1200/630] w-full rounded-2xl object-cover"
      />

      <header className="mb-10">
        <h1 className="mb-3 text-3xl font-bold leading-tight text-[var(--ink)]">{view.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-[var(--orange)]">{view.date}</span>
          {view.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[var(--hairline)] bg-[var(--brand-12)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--orange)]">
              {tag}
            </span>
          ))}
        </div>
        {view.description && (
          <p className="mt-7 border-l-2 border-[var(--brand-glow)] py-1 pl-5 text-sm leading-relaxed text-[var(--body)]">
            {view.description}
          </p>
        )}
      </header>

      <div className="blog-prose" dangerouslySetInnerHTML={{ __html: view.contentHtml }} />

      {projects.length > 0 && (
        <aside className="mt-14 border-t border-[var(--hairline)] pt-8">
          <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {projectsHeading}
          </h2>
          <ul className="grid gap-3">
            {projects.map((project) => (
              <li key={project.slug}>
                <a
                  href={project.href}
                  className="group block rounded-xl border border-[var(--hairline)] px-4 py-3 transition-colors hover:border-[var(--orange)]">
                  <span className="font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--orange)]">
                    {project.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-[var(--body)]">{project.blurb}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
