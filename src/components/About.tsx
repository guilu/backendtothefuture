"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export default function About() {
  const { lang } = useLang();
  const tx = t[lang].about;

  return (
    <section id="about" className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="tag mb-6 inline-block">{tx.tag}</span>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--c-text)] leading-tight mb-6">
              {tx.h2[0]}<br />
              <span className="text-[#7000ff]">{tx.h2[1]}</span><br />
              {tx.h2[2]}
            </h2>
            <p className="text-[var(--c-muted)] text-lg leading-relaxed mb-6">
              {tx.p1.pre}{" "}
              <span className="text-[var(--c-text)] font-semibold">{tx.p1.name}</span>{" "}
              {tx.p1.mid}{" "}
              <span className="text-[var(--c-text)]">{tx.p1.industries}</span>
              {tx.p1.end}
            </p>
            <p className="text-[var(--c-muted)] text-lg leading-relaxed mb-8">{tx.p2}</p>

            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/diegobarrioh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 font-mono text-sm font-semibold text-[#7000ff] border border-[rgba(112,0,255,0.3)] rounded hover:border-[rgba(112,0,255,0.6)] hover:bg-[rgba(112,0,255,0.05)] transition-all duration-200"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
              <a href="mailto:diegobarrioh@gmail.com" className="text-sm text-[var(--c-muted)] hover:text-[#7000ff] transition-colors font-mono">
                diegobarrioh@gmail.com →
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {tx.highlights.map((item) => (
              <div
                key={item.title}
                className="group p-6 rounded-xl border border-[rgba(112,0,255,0.08)] bg-[var(--c-surface)] hover:border-[rgba(112,0,255,0.2)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(112,0,255,0.05)]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5" aria-hidden>{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[var(--c-text)] mb-1 group-hover:text-[#7000ff] transition-colors">{item.title}</h3>
                    <p className="text-[var(--c-muted)] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
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
