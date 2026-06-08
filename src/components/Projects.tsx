"use client";

import { useState } from "react";
import { ArrowIcon } from "./design-system/Icons";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

const SCREENSHOTS: Record<string, string[]> = {
  akademia: [
    "/screenshots/akademia/1.png",
    "/screenshots/akademia/2.png",
    "/screenshots/akademia/3.png",
    "/screenshots/akademia/4.png",
    "/screenshots/akademia/5.png",
    "/screenshots/akademia/6.png",
  ],
  tokenmeter: [
    "/screenshots/tokenmeter/tokenmeter-1.png?v=2",
    "/screenshots/tokenmeter/tokenmeter-2.png?v=2",
    "/screenshots/tokenmeter/tokenmeter-3.png?v=2",
    "/screenshots/tokenmeter/tokenmeter-4.png?v=2",
    "/screenshots/tokenmeter/tokenmeter-5.png?v=2",
  ],
};

export default function Projects() {
  const { lang } = useLang();
  const tx = t[lang].projects;

  return (
    <section id="projects" className="bttf-container py-5">
      <div className="mb-10">
        <span className="eyebrow"><span className="eyebrow-dot" />{tx.tag}</span>
        <h2 className="mt-4 text-[length:var(--t-h2)] leading-[1.08] text-[var(--ink)]">
          {tx.h2[0]} <span className="grad-word">{tx.h2[1]}</span>
        </h2>
        <p className="mt-4 max-w-xl text-[var(--body)]">{tx.subtitle}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {tx.featured.map((project) => (
          <article key={project.id} className="flex min-w-0 flex-col rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-glow)] hover:shadow-[var(--shadow-glow)]">
            <ScreenshotCarousel
              screenshots={SCREENSHOTS[project.id] ?? []}
              browserUrl={project.browserUrl}
              projectName={project.name}
            />

            <div className="mt-6 mb-5 flex items-center gap-3">
              <span className="rounded-full border border-[var(--hairline)] bg-[var(--brand-12)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--orange)]">{project.label}</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--orange)]"><span className="h-2 w-2 rounded-full bg-[var(--orange)] shadow-[0_0_0_3px_var(--brand-12)]" />{project.status}</span>
            </div>
            <h3 className="text-3xl font-extrabold text-[var(--ink)]">{project.name}</h3>
            <p className="mt-2 font-mono text-sm text-[var(--muted)]">{project.tagline}</p>
            <p className="mt-4 leading-7 text-[var(--body)]">{project.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[var(--hairline)] bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--body)]">{tag}</span>
              ))}
            </div>
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-2 self-end pt-6 font-bold text-[var(--orange)]">
              {project.openApp}
              <ArrowIcon className="h-4 w-4" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScreenshotCarousel({
  screenshots,
  browserUrl,
  projectName,
}: {
  screenshots: string[];
  browserUrl: string;
  projectName: string;
}) {
  const [current, setCurrent] = useState(0);
  const [errored, setErrored] = useState<Record<number, boolean>>({});

  if (screenshots.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + screenshots.length) % screenshots.length);
  const next = () => setCurrent((c) => (c + 1) % screenshots.length);

  return (
    <div className="flex select-none flex-col gap-3">
      {/* Browser mockup frame */}
      <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--hairline)] shadow-[var(--shadow-md)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#28c840]" />
          <span className="mx-2 min-w-0 flex-1 truncate rounded border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1 text-center font-mono text-xs text-[var(--muted)]">
            {browserUrl}
          </span>
        </div>

        {/* Screenshot */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
          {errored[current] ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--muted)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="font-mono text-xs opacity-40">screenshot {current + 1}</span>
            </div>
          ) : (
            <img
              key={current}
              src={screenshots[current]}
              alt={`${projectName} screenshot ${current + 1}`}
              className="h-full w-full object-cover object-top"
              onError={() => setErrored((e) => ({ ...e, [current]: true }))}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={prev}
          className="cursor-pointer p-1.5 text-[var(--muted)] transition-colors hover:text-[var(--orange)]"
          aria-label="Previous screenshot"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="flex items-center gap-2">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                i === current ? "w-5 bg-[var(--orange)]" : "w-1.5 bg-[var(--muted)] opacity-30 hover:opacity-60"
              }`}
              aria-label={`Screenshot ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="cursor-pointer p-1.5 text-[var(--muted)] transition-colors hover:text-[var(--orange)]"
          aria-label="Next screenshot"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
}
