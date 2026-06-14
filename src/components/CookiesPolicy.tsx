"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { OPEN_CONSENT_EVENT } from "./CookieConsent";

export default function CookiesPolicy() {
  const { lang } = useLang();
  const c = t[lang].cookies;

  return (
    <main className="mx-auto w-full max-w-[760px] px-7 pt-28 pb-20 max-[720px]:px-[18px]">
      <p className="mb-3 font-mono text-[12px] font-semibold uppercase tracking-wider text-[var(--orange)]">
        {c.updated}: 2026-06-14
      </p>
      <h1 className="mb-10 text-4xl font-bold text-[var(--ink)]">{c.title}</h1>

      <div className="flex flex-col gap-8">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">{s.h}</h2>
            <p className="leading-relaxed text-[var(--body)]">{s.p}</p>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
        className="mt-10 rounded-[11px] border border-[var(--hairline)] px-4 py-2.5 font-mono text-[13px] font-semibold text-[var(--ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-18)]">
        {c.manage}
      </button>
    </main>
  );
}
