import type { Lang } from "@/lib/translations";

/**
 * Links back to the project pages on diegobarrioh.dev.
 *
 * Careful with the prefixes: the two sites are mirror images of each other.
 * This site serves Spanish unprefixed and English under `/en/`; diegobarrioh.dev
 * serves English unprefixed and Spanish under `/es/`.
 */
const PORTFOLIO = "https://diegobarrioh.dev";

export interface ProjectLink {
  slug: string;
  name: string;
  href: string;
  blurb: string;
}

const PROJECTS: Record<string, { name: string; blurb: Record<Lang, string> }> = {
  akademia: {
    name: "Akademia",
    blurb: {
      en: "Exams generated from your own material, through a RAG pipeline.",
      es: "Exámenes generados a partir de tu propio material, con un pipeline RAG.",
    },
  },
  tokenmeter: {
    name: "TokenMeter",
    blurb: {
      en: "What a repository would have cost to generate with an LLM.",
      es: "Lo que habría costado generar un repositorio con un LLM.",
    },
  },
  forma: {
    name: "Forma",
    blurb: {
      en: "Training and nutrition plans an LLM writes but cannot invent.",
      es: "Planes de entrenamiento y alimentación que un LLM escribe pero no puede inventarse.",
    },
  },
  "local-ai-lab": {
    name: "Local AI Lab",
    blurb: {
      en: "Local models on 12 GB of VRAM, measured against real work.",
      es: "Modelos locales en 12 GB de VRAM, medidos contra trabajo real.",
    },
  },
};

export function projectLinks(slugs: string[] | undefined, lang: Lang): ProjectLink[] {
  if (!slugs?.length) return [];
  return slugs.flatMap((slug) => {
    const project = PROJECTS[slug];
    if (!project) return [];
    const prefix = lang === "es" ? "/es" : "";
    return [{
      slug,
      name: project.name,
      href: `${PORTFOLIO}${prefix}/projects/${slug}/`,
      blurb: project.blurb[lang],
    }];
  });
}
