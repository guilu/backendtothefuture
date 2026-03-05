"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

export default function Hero() {
  const { lang } = useLang();
  const tx = t[lang].hero;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY <= 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-bg grid-fade" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[rgba(112,0,255,0.04)] blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-8">
          <span className="tag">
            <span className="w-2 h-2 rounded-full bg-[#7000ff] mr-2 inline-block" style={{ boxShadow: "0 0 6px #7000ff" }} />
            {tx.badge}
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[var(--c-text)] leading-none mb-6">
          <span className="block">{tx.h1[0]}</span>
          <span className="block text-[#7000ff] relative">
            {tx.h1[1]}
            <span className="absolute -right-4 top-0 text-[#7000ff] opacity-30 font-mono text-2xl">_</span>
          </span>
          <span className="block">{tx.h1[2]}</span>
        </h1>

        <div className="flex justify-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-sm text-[#7000ff] bg-[rgba(112,0,255,0.06)] border border-[rgba(112,0,255,0.15)]"
            style={{ boxShadow: "0 0 20px rgba(112,0,255,0.05)" }}
          >
            <span className="text-[var(--c-muted)]">~$</span>
            <span className="cursor-blink">java · spring · microservices · kafka · k8s</span>
          </div>
        </div>

        <p className="max-w-2xl mx-auto text-lg text-[var(--c-muted)] leading-relaxed mb-12">
          {tx.description.pre}{" "}
          <span className="text-[var(--c-text)]">{tx.description.highlight1}</span>{" "}
          {tx.description.mid}{" "}
          <span className="text-[var(--c-text)]">{tx.description.highlight2}</span>{" "}
          {tx.description.to}{" "}
          <span className="text-[var(--c-text)]">{tx.description.highlight3}</span>
          {tx.description.end}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#projects" className="group px-8 py-3 font-mono font-semibold text-white bg-[#7000ff] rounded hover:bg-[#5c00d6] transition-all duration-200 shadow-lg hover:shadow-[0_0_30px_rgba(112,0,255,0.35)]">
            {tx.cta1}
            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
          </a>
          <a href="https://diegobarrioh.dev" target="_blank" rel="noopener noreferrer" className="px-8 py-3 font-mono font-semibold text-[#7000ff] border border-[rgba(112,0,255,0.3)] rounded hover:border-[rgba(112,0,255,0.6)] hover:bg-[rgba(112,0,255,0.05)] transition-all duration-200">
            {tx.cta2}
          </a>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-[rgba(112,0,255,0.1)] pt-10">
          {tx.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black text-[#7000ff] font-mono">{stat.value}</div>
              <div className="text-xs text-[var(--c-muted)] mt-1 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <svg width="26" height="40" viewBox="0 0 26 40" fill="none" className="opacity-40">
          <rect x="1" y="1" width="24" height="38" rx="12" stroke="#7000ff" strokeWidth="1.5" />
          <rect x="11.5" y="8" width="3" height="7" rx="1.5" fill="#7000ff" className="scroll-wheel" />
        </svg>
      </div>

      <style>{`
        @keyframes scrollWheel {
          0%   { transform: translateY(0);   opacity: 1; }
          60%  { transform: translateY(8px); opacity: 0.2; }
          61%  { transform: translateY(0);   opacity: 0; }
          80%  { opacity: 0; }
          100% { opacity: 1; }
        }
        .scroll-wheel {
          animation: scrollWheel 2s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: top center;
        }
      `}</style>
    </section>
  );
}
