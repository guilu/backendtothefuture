"use client";

import { ArrowIcon } from "./design-system/Icons";
import HeroArt from "./HeroArt";
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
    <section className="bttf-container py-6 lg:py-7">
      {/* El arte solo entra desde `lg`: por debajo no hay hueco a la derecha
          que llenar — hay una columna, y el hero es el texto. */}
      {/* 608px es lo que ocupa el texto de verdad: el h1 está capado a 15ch
          (~605px al tamaño máximo). Con `1fr` la columna se llevaba 715px y
          los ~110px sobrantes salían como hueco muerto contra el arte, que
          ahora se queda con todo el resto. El suelo de 430px evita que el
          arte se estruje en portátiles pequeños. */}
      <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,608px)_minmax(430px,1fr)] lg:gap-10">
        <div className="max-w-2xl">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {tx.eyebrow}
          </span>
          <h1 className="mt-5 max-w-[15ch] text-[length:var(--t-hero)] leading-[1.03] tracking-[-0.03em] text-[var(--ink)]">
            {tx.title}
          </h1>
          <p className="mt-6 max-w-[608px] text-[length:var(--t-lg)] font-medium leading-[1.7] text-[var(--body)]">
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

        <div className="hidden justify-self-center lg:flex lg:w-full lg:justify-center">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}
