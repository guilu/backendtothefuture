"use client";

import { useLang } from "@/context/LangContext";

export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label="Change language"
      className="flex items-center gap-1 px-2 py-1 rounded font-mono text-xs font-semibold text-[var(--c-muted)] hover:text-[#7000ff] hover:bg-[rgba(112,0,255,0.08)] transition-all duration-200 border border-transparent hover:border-[rgba(112,0,255,0.2)]"
    >
      <span className={lang === "es" ? "text-[#7000ff]" : "text-[var(--c-muted)]"}>ES</span>
      <span className="opacity-30">/</span>
      <span className={lang === "en" ? "text-[#7000ff]" : "text-[var(--c-muted)]"}>EN</span>
    </button>
  );
}
