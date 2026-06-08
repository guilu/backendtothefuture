"use client";

import { useLang } from "@/context/LangContext";

export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label="Change language"
      className="inline-flex items-center gap-1 rounded-[11px] border border-transparent px-2.5 py-2 font-mono text-[12px]! font-semibold text-[var(--body)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-18)] hover:bg-[var(--brand-12)] hover:text-[var(--orange)]"
    >
      <span className={lang === "es" ? "text-[var(--orange)]" : "text-[var(--muted)]"}>ES</span>
      <span className="opacity-30">/</span>
      <span className={lang === "en" ? "text-[var(--orange)]" : "text-[var(--muted)]"}>EN</span>
    </button>
  );
}
