"use client";

import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "./design-system/Icons";
import { useLang } from "@/context/LangContext";
import { localizePath } from "@/lib/i18n";
import { t } from "@/lib/translations";
import { OPEN_CONSENT_EVENT } from "./CookieConsent";

export default function Footer() {
  const { lang } = useLang();
  const year = new Date().getFullYear();
  const tx = t[lang].header;

  const links = [
    { label: "Home", href: localizePath("/", lang) },
    { label: tx.nav[0], href: localizePath("/#projects", lang) },
    { label: tx.nav[1], href: localizePath("/blog/", lang) },
    { label: tx.nav[2], href: localizePath("/#stack", lang) },
    { label: tx.nav[4], href: localizePath("/#contact", lang) },
  ];

  return (
    <footer className="mx-auto w-full max-w-[1216px] px-7 pt-12 pb-20 max-[720px]:px-[18px]">
      <div className="flex flex-col items-center gap-7 md:flex-row">
        <Link href={localizePath("/", lang)} className="flex items-center gap-3">
          <img src="/img/logo.png" alt="Backend to the Future" className="h-[52px] w-auto" />
          <span className="brand-word">
            <span className="brand-word-primary">BACKEND</span>
            <span className="brand-word-secondary">TO THE FUTURE</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-wrap justify-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-[var(--body)] transition-colors hover:text-[var(--orange)]">
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
            className="text-sm font-semibold text-[var(--body)] transition-colors hover:text-[var(--orange)]">
            {t[lang].footer.cookies}
          </button>
        </nav>

        <div className="flex gap-2">
          <a href="https://github.com/guilu" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="GitHub"><GitHubIcon /></a>
          <a href="https://www.linkedin.com/in/diegobarrioh" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="LinkedIn"><LinkedInIcon /></a>
        </div>
      </div>
      <div className="my-6 h-px bg-[var(--hairline)]" />
      <p className="text-center text-sm text-[var(--muted)]">© {year} Backend to the Future — {t[lang].footer.copyright}</p>
    </footer>
  );
}
