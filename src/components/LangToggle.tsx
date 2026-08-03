"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { localizePath } from "@/lib/i18n";
import type { Lang } from "@/lib/translations";

/**
 * Two links, not a button.
 *
 * <p>A button that flipped a state variable made the other language reachable
 * only by a click, so it had no URL — and a language with no URL cannot be
 * indexed, linked or shared. Each side now points at the same page in the
 * other locale, which is also what tells a crawler the translation exists.
 */
export default function LangToggle() {
  const { lang } = useLang();
  const pathname = usePathname() ?? "/";

  const item = (target: Lang, label: string) => {
    const active = lang === target;
    return (
      <Link
        href={localizePath(pathname, target)}
        hrefLang={target}
        aria-current={active ? "true" : undefined}
        className={active ? "text-[var(--orange)]" : "text-[var(--muted)] hover:text-[var(--body)]"}
      >
        {label}
      </Link>
    );
  };

  return (
    <div
      aria-label="Change language"
      className="inline-flex items-center gap-1 rounded-[11px] border border-transparent px-2.5 py-2 font-mono text-[12px]! font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-18)] hover:bg-[var(--brand-12)]"
    >
      {item("es", "ES")}
      <span className="opacity-30">/</span>
      {item("en", "EN")}
    </div>
  );
}
