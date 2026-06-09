"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import { GitHubIcon, LinkedInIcon } from "./design-system/Icons";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export default function Header() {
  const { lang } = useLang();
  const tx = t[lang].header;
  const [open, setOpen] = useState(false);

  const nav = [
    { label: tx.nav[0], href: "/#projects" },
    { label: tx.nav[1], href: "/blog" },
    { label: tx.nav[2], href: "/#stack" },
    { label: tx.nav[4], href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 py-[22px] pb-1.5">
      <div className="bttf-container">
        <nav className="flex items-center gap-5 rounded-[18px] border border-[var(--hairline)] bg-[var(--nav-bg)] py-[11px] pl-5 pr-3.5 shadow-[var(--shadow-md)] backdrop-blur-[14px]">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Backend to the Future home" onClick={() => setOpen(false)}>
            <img src="/img/logo.png" alt="Backend to the Future" className="h-10 w-auto sm:h-[52px]" />
            <span className="brand-word">
              <span className="brand-word-primary">BACKEND</span>
              <span className="brand-word-secondary">TO THE FUTURE</span>
            </span>
          </Link>

          <div className="hidden flex-1 justify-center gap-7 lg:flex">
            {nav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative px-0.5 py-1.5 text-[17px] font-semibold transition-colors duration-200 hover:text-[var(--ink)] ${index === 0 ? "text-[var(--orange)]" : "text-[var(--body)]"}`}
              >
                {item.label}
                <span className={`absolute -bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-[var(--grad-brand)] transition-all duration-200 group-hover:w-4 ${index === 0 ? "w-4" : "w-0"}`} />
              </Link>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <a href="https://github.com/guilu" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="GitHub">
                <GitHubIcon />
              </a>
              <a href="https://www.linkedin.com/in/diegobarrioh" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
              <LangToggle />
              <ThemeToggle />
              <a href="#contact" className="btn btn-primary">{tx.cta}</a>
            </div>
            <button
              onClick={() => setOpen((o) => !o)}
              className="icon-btn lg:hidden!"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              )}
            </button>
          </div>
        </nav>

        {open && (
          <div className="mt-2 flex flex-col gap-1 rounded-[18px] border border-[var(--hairline)] bg-[var(--nav-bg)] p-3 shadow-[var(--shadow-md)] backdrop-blur-[14px] lg:hidden">
            {nav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-[12px] px-4 py-3 text-[16px] font-semibold transition-colors hover:bg-[var(--brand-08)] hover:text-[var(--orange)] ${index === 0 ? "text-[var(--orange)]" : "text-[var(--body)]"}`}
              >
                {item.label}
              </Link>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="btn btn-primary mt-2 w-full justify-center">{tx.cta}</a>
            <div className="mt-2 flex items-center gap-2 px-1">
              <a href="https://github.com/guilu" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="GitHub"><GitHubIcon /></a>
              <a href="https://www.linkedin.com/in/diegobarrioh" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="LinkedIn"><LinkedInIcon /></a>
              <LangToggle />
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
