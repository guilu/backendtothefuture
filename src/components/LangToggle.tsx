"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { localizePath } from "@/lib/i18n";
import type { Lang } from "@/lib/translations";

const SWITCH_LABEL: Record<Lang, string> = {
  es: "Switch to Spanish",
  en: "Cambiar a inglés",
};

/**
 * One control, one target: the whole pill links to the current page in the
 * other language.
 *
 * <p>It was briefly two side-by-side links, which read as a single toggle —
 * the hover state lit the whole pill — while only the two words were
 * clickable, and the half naming the current language went nowhere. Clicking
 * the control and having nothing happen is the worst version of this widget.
 *
 * <p>Still a link rather than a button, because each language has to have a
 * URL a crawler can follow. The highlight marks the language currently being
 * read, so after a click the language you switched to is the lit one.
 */
export default function LangToggle() {
  const { lang } = useLang();
  const pathname = usePathname() ?? "/";
  const other: Lang = lang === "es" ? "en" : "es";
  const label = SWITCH_LABEL[other];

  const word = (target: Lang, text: string) => (
    <span
      className={
        lang === target
          ? "text-[var(--orange)]"
          : "text-[var(--muted)] transition-colors group-hover:text-[var(--body)]"
      }
    >
      {text}
    </span>
  );

  return (
    <Link
      href={localizePath(pathname, other)}
      hrefLang={other}
      aria-label={label}
      title={label}
      className="group inline-flex items-center gap-1 rounded-[11px] border border-transparent px-2.5 py-2 font-mono text-[12px]! font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-18)] hover:bg-[var(--brand-12)]"
    >
      {word("es", "ES")}
      <span className="opacity-30">/</span>
      {word("en", "EN")}
    </Link>
  );
}
