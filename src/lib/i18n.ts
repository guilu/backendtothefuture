import type { Lang } from "./translations";

/**
 * URL shape for the two locales.
 *
 * <p>Spanish keeps the bare paths it has always had and English is prefixed
 * with `/en`. That asymmetry is deliberate: every Spanish URL currently in
 * Google's index stays exactly where it is, so adding English costs no
 * redirects and no re-indexing. The alternative — moving Spanish to `/es` —
 * would have retired every indexed URL on the site to gain nothing.
 *
 * <p>The path is the single source of truth for the language. There is no
 * stored preference that could disagree with it, because a `/en` page that
 * renders Spanish because of something in `localStorage` is exactly the bug
 * that makes a translated site unindexable.
 */
export const DEFAULT_LANG: Lang = "es";
export const PREFIXED_LANGS: readonly Lang[] = ["en"];

/** `/en/blog/x/` → `/blog/x/`. Leaves an unprefixed path untouched. */
export function stripLangPrefix(pathname: string): string {
  for (const lang of PREFIXED_LANGS) {
    if (pathname === `/${lang}` || pathname === `/${lang}/`) return "/";
    if (pathname.startsWith(`/${lang}/`)) return pathname.slice(lang.length + 1);
  }
  return pathname;
}

/** The language a path serves, read from the path itself. */
export function langFromPath(pathname: string): Lang {
  for (const lang of PREFIXED_LANGS) {
    if (pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)) return lang;
  }
  return DEFAULT_LANG;
}

/**
 * The same page in `lang`. Accepts hrefs carrying a hash (`/#projects`) because
 * the nav is built from those, and a prefix appended after the fragment would
 * silently produce a link to nowhere.
 */
export function localizePath(href: string, lang: Lang): string {
  const hashAt = href.indexOf("#");
  const path = hashAt === -1 ? href : href.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : href.slice(hashAt);

  const bare = stripLangPrefix(path || "/");
  if (lang === DEFAULT_LANG) return `${bare}${hash}`;

  // `/` must become `/en/`, not `/en`, so the static host resolves the
  // directory index without a redirect (`trailingSlash: true`).
  const prefixed = bare === "/" ? `/${lang}/` : `/${lang}${bare}`;
  return `${prefixed}${hash}`;
}

/** Both locales' URLs for one page, for `alternates.languages`. */
export function languageAlternates(barePath: string): Record<string, string> {
  return {
    es: localizePath(barePath, "es"),
    en: localizePath(barePath, "en"),
    // Spanish is what an unmatched locale gets — it is the language the site
    // is actually written in first.
    "x-default": localizePath(barePath, "es"),
  };
}
