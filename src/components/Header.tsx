"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export default function Header() {
  const { lang } = useLang();
  const tx = t[lang].header;
  const navHrefs = ["#projects", "#stack", "#contact"];

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--c-bg)]/90 backdrop-blur-md border-b border-[rgba(112,0,255,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group" aria-label="Backend to the Future">
          <img src="/img/dbh-light.svg" alt="" className="h-7 w-auto block dark:hidden" aria-hidden />
          <img src="/img/dbh-dark.svg" alt="" className="h-7 w-auto hidden dark:block" aria-hidden />
          <span className="font-bold text-[var(--c-text)] text-sm tracking-wide">
            backend<span className="text-[#7000ff]">to</span>the<span className="text-[#7000ff]">future</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {tx.nav.map((label, i) => (
            <a key={navHrefs[i]} href={navHrefs[i]} className="text-sm text-[var(--c-muted)] hover:text-[#7000ff] transition-colors duration-200 font-mono">
              {label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <LangToggle />
          <ThemeToggle />
          <a href="https://diegobarrioh.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors duration-200">
            {tx.portfolio}
          </a>
          <a href="#contact" className="px-4 py-2 text-sm font-mono font-semibold text-white bg-[#7000ff] rounded hover:bg-[#5c00d6] transition-colors duration-200">
            {tx.cta}
          </a>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <button className="text-[var(--c-muted)] hover:text-[#7000ff] transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[var(--c-surface)]/95 backdrop-blur-md border-b border-[rgba(112,0,255,0.1)] px-6 py-4">
          <nav className="flex flex-col gap-4">
            {tx.nav.map((label, i) => (
              <a key={navHrefs[i]} href={navHrefs[i]} onClick={() => setMenuOpen(false)} className="text-sm text-[var(--c-muted)] hover:text-[#7000ff] transition-colors font-mono">
                {label}
              </a>
            ))}
            <a href="#contact" onClick={() => setMenuOpen(false)} className="mt-2 px-4 py-2 text-sm font-mono font-semibold text-white bg-[#7000ff] rounded text-center hover:bg-[#5c00d6] transition-colors">
              {tx.cta}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
