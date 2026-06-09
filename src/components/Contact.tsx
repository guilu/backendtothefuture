"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { ArrowIcon, GitHubIcon, LinkedInIcon } from "./design-system/Icons";

export default function Contact() {
  const { lang } = useLang();
  const tx = t[lang].contact;

  return (
    <section id="contact" className="bttf-container py-6">
      <div className="relative overflow-hidden rounded-[var(--r-xl)] border border-[var(--hairline)] bg-[var(--surface)] px-7 py-10 shadow-[var(--shadow-card)] md:px-14 md:py-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(251,138,46,0.12),transparent_68%)]" />
        <div className="relative z-10 md:max-w-[56%]">
          <p className="text-xs font-extrabold uppercase tracking-[var(--tracking-wide)] text-[var(--orange)]">{tx.tag}</p>
          <h2 className="mt-4 max-w-[14ch] text-[length:var(--t-h2)] leading-[1.08] text-[var(--ink)]">
            {tx.h2[0]} <span className="grad-word">{tx.h2[1]}</span>
          </h2>
          <p className="max-w-xl text-[length:var(--t-lg)] leading-8 text-[var(--body)]">{tx.subtitle}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="https://diegobarrioh.dev" target="_blank" rel="noopener noreferrer" className="btn btn-lg bg-[#7000ff] text-white! shadow-[var(--shadow-md)] transition-colors hover:bg-[#5e00d6]">
              <img src="/img/dbh-white.svg" alt="" className="h-5 w-5" />
              diegobarrioh.dev
              <ArrowIcon />
            </a>
            <a href="https://www.linkedin.com/in/diegobarrioh" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
              <LinkedInIcon className="h-4 w-4" />
              LinkedIn
              <ArrowIcon />
            </a>
            <a href="https://github.com/guilu" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
              <GitHubIcon className="h-4 w-4" />
              GitHub
              <ArrowIcon />
            </a>
          </div>
        </div>

        <img
          src="/img/contact-light.png"
          alt=""
          className="pointer-events-none absolute right-0 top-1/2 hidden w-[680px] max-w-[56%] -translate-y-1/2 object-contain md:block lg:right-4 dark:md:hidden"
        />
      </div>
    </section>
  );
}
