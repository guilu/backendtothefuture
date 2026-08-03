import type { Metadata } from "next";
import type { Lang } from "./translations";
import { languageAlternates, localizePath } from "./i18n";

const BASE = "https://backendtothefuture.com";

const COPY = {
  es: {
    title: "Backend to the Future — Diego Barrio",
    description:
      "Ingeniero backend senior construyendo plataformas escalables con Java y Spring. Microservicios, arquitectura limpia e ingeniería probada en producción desde Alicante.",
    short: "Ingeniero backend senior construyendo plataformas escalables con Java y Spring.",
    locale: "es_ES",
  },
  en: {
    title: "Backend to the Future — Diego Barrio",
    description:
      "Senior Backend Engineer crafting scalable platforms with Java & Spring. Microservices, clean architecture, and battle-tested engineering from Alicante, Spain.",
    short: "Senior Backend Engineer crafting scalable platforms with Java & Spring.",
    locale: "en_US",
  },
} as const;

/**
 * The document-level metadata for one locale's root layout.
 *
 * <p>`alternates.languages` is the part that matters: without it the two
 * locales look like two pages saying the same thing in a search index, which
 * is duplicate content. With it they are one page in two languages.
 */
export function rootMetadata(lang: Lang): Metadata {
  const copy = COPY[lang];
  const home = localizePath("/", lang);

  return {
    metadataBase: new URL(BASE),
    alternates: {
      canonical: home,
      languages: languageAlternates("/"),
      // Each locale advertises its own feed; pointing both at /feed.xml gave
      // English readers a Spanish one.
      types: { "application/rss+xml": lang === "es" ? "/feed.xml" : "/en/feed.xml" },
    },
    title: copy.title,
    description: copy.description,
    keywords: [
      "backend engineer",
      "Java",
      "Spring Boot",
      "microservices",
      "clean architecture",
      "fullstack",
      "Diego Barrio",
    ],
    authors: [{ name: "Diego Barrio", url: "https://diegobarrioh.dev" }],
    openGraph: {
      title: copy.title,
      description: copy.short,
      url: `${BASE}${home}`,
      siteName: "Backend to the Future",
      locale: copy.locale,
      type: "website",
      images: [{ url: "/home-og.jpg", width: 1200, height: 630, alt: "Backend to the Future" }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.short,
      images: ["/home-og.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

/**
 * The `alternates` block for one page, in one locale.
 *
 * <p>Centralised because page-level `alternates` **replaces** the layout's
 * rather than merging into it: every page that declared its own canonical
 * silently dropped the feed-discovery link inherited from the root layout.
 *
 * @param barePath the Spanish (unprefixed) path, e.g. `/blog/some-slug/`
 */
export function alternatesFor(barePath: string, lang: Lang) {
  return {
    canonical: localizePath(barePath, lang),
    languages: languageAlternates(barePath),
    types: { "application/rss+xml": lang === "es" ? "/feed.xml" : "/en/feed.xml" },
  };
}
