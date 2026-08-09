"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowIcon } from "./design-system/Icons";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

const SCREENSHOTS: Record<string, string[]> = {
  forma: [
    "/screenshots/forma/forma-1.png",
    "/screenshots/forma/forma-2.png",
    "/screenshots/forma/forma-3.png",
    "/screenshots/forma/forma-4.png",
    "/screenshots/forma/forma-5.png",
  ],
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

function ProjectIcon({ id }: { id: string }) {
  if (id === "tokenmeter") {
    return (
      <>
        <img src="/img/tokenmeter-light.png" alt="" className="h-9 w-9 shrink-0 object-contain dark:hidden" />
        <img src="/img/tokenmeter-dark.png" alt="" className="hidden h-9 w-9 shrink-0 object-contain dark:block" />
      </>
    );
  }
  if (id === "akademia") {
    return <img src="/img/akademia.png" alt="" className="h-9 w-9 shrink-0 object-contain" />;
  }
  if (id === "forma") {
    return <img src="/img/forma.svg" alt="" className="h-9 w-9 shrink-0 object-contain" />;
  }
  return null;
}

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

      <ProjectRail count={tx.featured.length}>
        {tx.featured.map((project) => (
          <article key={project.id} className="flex w-[86vw] shrink-0 snap-start flex-col rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-glow)] hover:shadow-[var(--shadow-glow)] sm:w-[62vw] md:w-[min(38vw,29rem)]">
            <ScreenshotCarousel
              screenshots={SCREENSHOTS[project.id] ?? []}
              browserUrl={project.browserUrl}
              projectName={project.name}
            />

            <div className="mt-6 mb-5 flex items-center gap-3">
              <span className="rounded-full border border-[var(--hairline)] bg-[var(--brand-12)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--orange)]">{project.label}</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--orange)]"><span className="h-2 w-2 rounded-full bg-[var(--orange)] shadow-[0_0_0_3px_var(--brand-12)]" />{project.status}</span>
            </div>
            <h3 className="flex items-center gap-3 text-3xl font-extrabold text-[var(--ink)]">
              <ProjectIcon id={project.id} />
              {project.name}
            </h3>
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
      </ProjectRail>
    </section>
  );
}

/**
 * The projects rail: cards scroll horizontally instead of wrapping into a grid.
 *
 * <p>Cards are sized so the next one is always cut off at the right edge. That
 * crop is the affordance — it says "there is more" without a label, which
 * matters because the arrows only appear from `md` up and the count of projects
 * keeps growing.
 *
 * <p>Native scrolling with snap points does the work: trackpad, shift-wheel,
 * touch drag and keyboard all behave the way the platform already does them.
 * The buttons page by one card for anyone using a mouse with no horizontal
 * axis.
 */
function ProjectRail({ count, children }: { count: number; children: React.ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Derived from scroll position rather than tracked on click, so dragging and
  // wheel-scrolling keep the dots honest.
  const sync = useCallback(() => {
    const node = rail.current;
    if (!node) return;
    const card = node.firstElementChild as HTMLElement | null;
    if (!card) return;
    const stride = card.offsetWidth + 20; // card + gap-5
    setIndex(Math.min(count - 1, Math.max(0, Math.round(node.scrollLeft / stride))));
  }, [count]);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    node.addEventListener("scroll", sync, { passive: true });
    return () => node.removeEventListener("scroll", sync);
  }, [sync]);

  const goTo = (target: number) => {
    const node = rail.current;
    const card = node?.firstElementChild as HTMLElement | null;
    if (!node || !card) return;
    node.scrollTo({ left: target * (card.offsetWidth + 20), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={rail}
        className="hide-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[var(--gutter)] pb-2"
      >
        {children}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="cursor-pointer p-1.5 text-[var(--muted)] transition-colors hover:text-[var(--orange)] disabled:cursor-default disabled:opacity-25"
          aria-label="Previous project"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-[var(--orange)]" : "w-1.5 bg-[var(--muted)] opacity-30 hover:opacity-60"
              }`}
              aria-label={`Project ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(Math.min(count - 1, index + 1))}
          disabled={index === count - 1}
          className="cursor-pointer p-1.5 text-[var(--muted)] transition-colors hover:text-[var(--orange)] disabled:cursor-default disabled:opacity-25"
          aria-label="Next project"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
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
