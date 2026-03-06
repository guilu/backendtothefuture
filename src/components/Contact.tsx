"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export default function Contact() {
  const { lang } = useLang();
  const tx = t[lang].contact;

  return (
    <section id="contact" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(112,0,255,0.15)] to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[rgba(112,0,255,0.04)] blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <span className="tag mb-6 inline-block">{tx.tag}</span>
        <h2 className="text-4xl md:text-5xl font-black text-[var(--c-text)] mb-6 leading-tight">
          {tx.h2[0]}{" "}<span className="text-[#7000ff]">{tx.h2[1]}</span>
        </h2>
        <p className="text-[var(--c-muted)] text-lg leading-relaxed mb-10 max-w-xl mx-auto">{tx.subtitle}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a href="https://diegobarrioh.dev" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-8 py-4 font-mono font-semibold text-white bg-[#7000ff] rounded-lg hover:bg-[#5c00d6] transition-all duration-200 shadow-lg hover:shadow-[0_0_40px_rgba(112,0,255,0.35)]">
            diegobarrioh.dev
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a href="https://www.linkedin.com/in/diegobarrioh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 font-mono font-semibold text-[#7000ff] border border-[rgba(112,0,255,0.3)] rounded-lg hover:border-[rgba(112,0,255,0.6)] hover:bg-[rgba(112,0,255,0.05)] transition-all duration-200">
            <LinkedInIcon />
            LinkedIn
          </a>
        </div>

        <div className="inline-block text-left">
          <div className="px-6 py-5 rounded-xl border border-[rgba(112,0,255,0.1)] bg-[var(--c-surface)] font-mono text-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="text-[var(--c-muted)] space-y-1">
              <div><span className="text-[#7000ff]">~$</span> <span className="text-[var(--c-text)]">whoami</span></div>
              <div className="pl-4">{tx.terminal.whoami}</div>
              <div><span className="text-[#7000ff]">~$</span> <span className="text-[var(--c-text)]">location</span></div>
              <div className="pl-4">{tx.terminal.location}</div>
              <div><span className="text-[#7000ff]">~$</span> <span className="text-[var(--c-text)]">languages</span></div>
              <div className="pl-4">{tx.terminal.languages}</div>
              <div><span className="text-[#7000ff]">~$</span> <span className="text-[var(--c-text)]">status</span></div>
              <div className="pl-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7000ff] inline-block" style={{ boxShadow: "0 0 6px #7000ff" }} />
                <span className="text-[#7000ff]">{tx.terminal.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
