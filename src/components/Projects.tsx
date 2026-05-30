"use client";

import { useState } from "react";
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
    <section id="projects" className="py-28 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(112,0,255,0.15)] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="tag mb-4 inline-block">{tx.tag}</span>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--c-text)] leading-tight">
              {tx.h2[0]}<br />
              <span className="text-[#7000ff]">{tx.h2[1]}</span>
            </h2>
          </div>
          <p className="text-[var(--c-muted)] max-w-xs text-sm leading-relaxed md:text-right">{tx.subtitle}</p>
        </div>

        {/* Featured projects */}
        <div className="flex flex-col gap-8">
          {tx.featured.map((project) => (
            <div
              key={project.id}
              className="p-8 rounded-2xl border border-[rgba(112,0,255,0.15)] bg-[var(--c-surface)] hover:border-[rgba(112,0,255,0.35)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(112,0,255,0.06)]"
            >
              <div className="flex flex-col lg:flex-row gap-10">

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="tag">{project.label}</span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-[#7000ff]">
                      <span className="w-2 h-2 rounded-full bg-[#7000ff]" style={{ boxShadow: "0 0 6px #7000ff" }} />
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-[var(--c-text)] mb-2">{project.name}</h3>
                  <p className="text-[var(--c-muted)] font-mono text-sm mb-4">{project.tagline}</p>
                  <p className="text-[var(--c-muted)] leading-relaxed mb-6">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-mono text-[var(--c-muted)] bg-[var(--c-chip-bg)] border border-[var(--c-chip-border)] rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {project.metrics.map((m) => (
                      <div key={m.label} className="px-3 py-2 rounded-lg bg-[rgba(112,0,255,0.04)] border border-[rgba(112,0,255,0.08)]">
                        <div className="text-xs text-[var(--c-muted)] font-mono uppercase tracking-wider">{m.label}</div>
                        <div className="text-sm font-semibold text-[var(--c-text)]">{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 text-sm font-mono font-semibold text-[#7000ff] hover:gap-3 transition-all"
                  >
                    {project.openApp}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                  </a>
                </div>

                {/* Screenshot carousel */}
                <div className="lg:w-[54%] shrink-0">
                  <ScreenshotCarousel
                    screenshots={SCREENSHOTS[project.id] ?? []}
                    browserUrl={project.browserUrl}
                    projectName={project.name}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

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

  const prev = () => setCurrent((c) => (c - 1 + screenshots.length) % screenshots.length);
  const next = () => setCurrent((c) => (c + 1) % screenshots.length);

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Browser mockup frame */}
      <div className="rounded-xl overflow-hidden border border-[rgba(112,0,255,0.15)] shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--c-surface)] border-b border-[rgba(112,0,255,0.1)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shrink-0" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] shrink-0" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] shrink-0" />
          <span className="flex-1 mx-2 px-3 py-1 text-xs font-mono text-[var(--c-muted)] bg-[rgba(112,0,255,0.04)] border border-[rgba(112,0,255,0.08)] rounded text-center truncate">
            {browserUrl}
          </span>
        </div>

        {/* Screenshot */}
        <div className="relative aspect-[16/10] bg-[rgba(112,0,255,0.03)] overflow-hidden">
          {errored[current] ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--c-muted)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-xs font-mono opacity-40">screenshot {current + 1}</span>
            </div>
          ) : (
            <img
              key={current}
              src={screenshots[current]}
              alt={`${projectName} screenshot ${current + 1}`}
              className="w-full h-full object-cover object-top"
              onError={() => setErrored((e) => ({ ...e, [current]: true }))}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={prev}
          className="p-1.5 text-[var(--c-muted)] hover:text-[#7000ff] transition-colors cursor-pointer"
          aria-label="Previous screenshot"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="flex items-center gap-2">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-5 bg-[#7000ff]"
                  : "w-1.5 bg-[var(--c-muted)] opacity-30 hover:opacity-60"
              }`}
              aria-label={`Screenshot ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="p-1.5 text-[var(--c-muted)] hover:text-[#7000ff] transition-colors cursor-pointer"
          aria-label="Next screenshot"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
}
