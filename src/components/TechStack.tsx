"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { LayersIcon } from "./design-system/Icons";

export default function TechStack() {
  const { lang } = useLang();
  const tx = t[lang].stack;

  return (
    <section id="stack" className="bttf-container py-7">
      <div className="mb-10">
        <span className="eyebrow"><span className="eyebrow-dot" />{tx.tag}</span>
        <h2 className="mt-4 text-[length:var(--t-h2)] leading-[1.08] text-[var(--ink)]">
          {tx.h2[0]} <span className="grad-word">{tx.h2[1]}</span>
        </h2>
        <p className="mt-4 max-w-md text-[var(--body)]">{tx.subtitle}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tx.categories.map((cat) => (
          <div key={cat.label} className="rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-glow)] hover:shadow-[var(--shadow-glow)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[var(--r-md)] bg-[var(--brand-12)] text-[var(--orange)]"><LayersIcon className="h-5 w-5" /></span>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--orange)]">{cat.label}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <span key={item} className="cursor-default rounded-[var(--r-sm)] border border-[var(--hairline)] bg-[var(--surface-2)] px-3 py-1.5 text-sm font-semibold text-[var(--ink)] transition-all duration-200 hover:border-[var(--brand-glow)] hover:text-[var(--orange)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--r-lg)] border border-dashed border-[var(--brand-18)] bg-[var(--brand-08)] p-6 text-center">
          <span className="ph-badge"><LayersIcon /></span>
          <p className="text-sm leading-6 text-[var(--body)]">{tx.cta}</p>
          <a href="https://diegobarrioh.dev" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--orange)] hover:underline">
            {tx.ctaLink}
          </a>
        </div>
      </div>
    </section>
  );
}
