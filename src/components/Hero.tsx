"use client";

import { ArrowIcon } from "./design-system/Icons";
import { useLang } from "@/context/LangContext";

const copy = {
  en: {
    eyebrow: "Backend Engineering for the AI era",
    title: <>Building reliable systems that power <span className="grad-word">the future.</span></>,
    lede: "I design and build scalable backend systems, cloud-native applications and AI-powered tools with a focus on clean architecture, observability and developer experience.",
    projects: "View Projects",
    blog: "Read the Blog",
    placeholder: "Hero illustration",
  },
  es: {
    eyebrow: "Backend Engineering para la era de la IA",
    title: <>Construyendo sistemas fiables que impulsan <span className="grad-word">el futuro.</span></>,
    lede: "Diseño y construyo sistemas backend escalables, aplicaciones cloud-native y herramientas con IA con foco en arquitectura limpia, observabilidad y experiencia de desarrollo.",
    projects: "Ver proyectos",
    blog: "Leer el blog",
    placeholder: "Ilustración hero",
  },
} as const;

export default function Hero() {
  const { lang } = useLang();
  const tx = copy[lang];

  return (
    <section className="bttf-container grid items-center gap-4 py-6 lg:grid-cols-[1.35fr_0.85fr] lg:gap-4 lg:py-7">
      <div>
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          {tx.eyebrow}
        </span>
        <h1 className="mt-5 max-w-[16ch] text-[length:var(--t-hero)] leading-[1.03] tracking-[-0.03em] text-[var(--ink)]">
          {tx.title}
        </h1>
        <p className="mt-6 max-w-[440px] text-[length:var(--t-lg)] font-medium leading-[1.7] text-[var(--body)]">
          {tx.lede}
        </p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <a href="#projects" className="btn btn-primary btn-lg">
            {tx.projects}
            <ArrowIcon />
          </a>
          <a href="/blog" className="btn btn-outline btn-lg">
            {tx.blog}
            <ArrowIcon />
          </a>
        </div>
      </div>

      <div className="relative hidden min-h-[380px] place-items-center lg:grid lg:min-h-[460px]">
        <div className="absolute inset-[6%_2%_12%_4%] -z-10 bg-[radial-gradient(40%_38%_at_64%_36%,rgba(251,138,46,0.16),transparent_70%),radial-gradient(42%_40%_at_30%_62%,rgba(80,140,210,0.12),transparent_70%)] blur-[18px]" />
        <img
          src="/img/hero-light.png"
          alt={tx.placeholder}
          className="h-auto w-full max-w-[560px] object-contain drop-shadow-[0_18px_40px_rgba(244,96,42,0.18)]"
        />
      </div>
    </section>
  );
}
