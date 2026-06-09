"use client";

import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "./design-system/Icons";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export default function Footer() {
  const { lang } = useLang();
  const year = new Date().getFullYear();
  const tx = t[lang].header;

  const links = [
    { label: "Home", href: "/" },
    { label: tx.nav[0], href: "/#projects" },
    { label: tx.nav[1], href: "/blog" },
    { label: tx.nav[2], href: "/#stack" },
    { label: tx.nav[4], href: "/#contact" },
  ];

  return (
    <footer className="mx-auto w-full max-w-[1216px] px-7 pt-12 pb-20 max-[720px]:px-[18px]">
      <div className="flex flex-col items-center gap-7 md:flex-row">
        <Link href="/" className="flex items-center gap-3">
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
