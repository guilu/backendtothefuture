"use client";

import { createContext, useContext } from "react";
import { type Lang } from "@/lib/translations";
import { DEFAULT_LANG } from "@/lib/i18n";

type LangContextType = { lang: Lang };

const LangContext = createContext<LangContextType>({ lang: DEFAULT_LANG });

/**
 * Publishes the language of the current route.
 *
 * <p>The value comes from the route and nowhere else. It used to come from
 * `localStorage`, which meant the language was a client-side state change on a
 * single URL: `/blog/` rendered Spanish into the HTML and swapped to English
 * only after a click no crawler performs. English was shipped in the payload
 * of every page and present in the DOM of none.
 *
 * <p>Since each language now has its own URL, a stored preference could only
 * ever contradict the address bar — so there is no longer one to read.
 */
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={{ lang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
