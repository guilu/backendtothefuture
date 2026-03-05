"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export default function TechStack() {
  const { lang } = useLang();
  const tx = t[lang].stack;

  return (
    <section id="stack" className="py-28 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(112,0,255,0.15)] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="tag mb-4 inline-block">{tx.tag}</span>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--c-text)]">
            {tx.h2[0]}{" "}<span className="text-[#7000ff]">{tx.h2[1]}</span>
          </h2>
          <p className="mt-4 text-[var(--c-muted)] max-w-md mx-auto">{tx.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tx.categories.map((cat) => (
            <div key={cat.label} className="p-6 rounded-xl border border-[rgba(112,0,255,0.08)] bg-[var(--c-surface)] hover:border-[rgba(112,0,255,0.18)] transition-all duration-300">
              <h3 className="text-xs font-mono font-semibold text-[#7000ff] uppercase tracking-widest mb-4">{cat.label}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span key={item} className="px-3 py-1.5 text-sm text-[var(--c-text)] bg-[var(--c-chip-bg)] border border-[var(--c-chip-border)] rounded-lg hover:border-[rgba(112,0,255,0.2)] hover:text-[#7000ff] transition-all duration-200 cursor-default">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="p-6 rounded-xl border border-dashed border-[rgba(112,0,255,0.15)] bg-[rgba(112,0,255,0.02)] flex flex-col items-center justify-center text-center gap-3">
            <span className="text-3xl" aria-hidden>🛰</span>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed">{tx.cta}</p>
            <a href="https://diegobarrioh.dev" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#7000ff] hover:underline">
              {tx.ctaLink}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
