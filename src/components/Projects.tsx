"use client";

import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

const AKADEMIA_SCREENSHOTS = [
  "/screenshots/akademia/1.png",
  "/screenshots/akademia/2.png",
  "/screenshots/akademia/3.png",
  "/screenshots/akademia/4.png",
  "/screenshots/akademia/5.png",
  "/screenshots/akademia/6.png",
];

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

        {/* Featured project */}
        <div className="mb-8 p-8 rounded-2xl border border-[rgba(112,0,255,0.15)] bg-[var(--c-surface)] hover:border-[rgba(112,0,255,0.35)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(112,0,255,0.06)]">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Info */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="tag">{tx.featured.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#7000ff]">
                  <span className="w-2 h-2 rounded-full bg-[#7000ff]" style={{ boxShadow: "0 0 6px #7000ff" }} />
                  {tx.featured.status}
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-[var(--c-text)] mb-2">Akademia</h3>
              <p className="text-[var(--c-muted)] font-mono text-sm mb-4">{tx.featured.tagline}</p>
              <p className="text-[var(--c-muted)] leading-relaxed mb-6">{tx.featured.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["AI", "Spring Boot", "Java", "Backend", "Education"].map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs font-mono text-[var(--c-muted)] bg-[var(--c-chip-bg)] border border-[var(--c-chip-border)] rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                {tx.featured.metrics.map((m) => (
                  <div key={m.label} className="px-3 py-2 rounded-lg bg-[rgba(112,0,255,0.04)] border border-[rgba(112,0,255,0.08)]">
                    <div className="text-xs text-[var(--c-muted)] font-mono uppercase tracking-wider">{m.label}</div>
                    <div className="text-sm font-semibold text-[var(--c-text)]">{m.value}</div>
                  </div>
                ))}
              </div>
              <a
                href="https://akademia.diegobarrioh.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-2 text-sm font-mono font-semibold text-[#7000ff] hover:gap-3 transition-all"
              >
                {tx.featured.openApp}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
              </a>
            </div>

            {/* Screenshot carousel */}
            <div className="lg:w-[54%] shrink-0">
              <ScreenshotCarousel screenshots={AKADEMIA_SCREENSHOTS} />
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="grid sm:grid-cols-2 gap-4">
          {tx.upcoming.map((p) => (
            <div key={p.name} className="p-6 rounded-xl border border-dashed border-[rgba(112,0,255,0.1)] bg-[rgba(112,0,255,0.02)] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--c-text)] font-semibold">{p.name}</span>
                <span className="text-xs font-mono text-[var(--c-muted)] border border-[var(--c-chip-border)] px-2 py-0.5 rounded">{p.eta}</span>
              </div>
              <p className="text-sm text-[var(--c-muted)] font-mono">{p.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScreenshotCarousel({ screenshots }: { screenshots: string[] }) {
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
            akademia.diegobarrioh.dev
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
              alt={`Akademia screenshot ${current + 1}`}
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
