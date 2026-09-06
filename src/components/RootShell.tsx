import { JetBrains_Mono } from "next/font/google";
import { BrandDefs } from "@/components/design-system/BrandMark";
import CookieConsent from "@/components/CookieConsent";
import IntentAnalytics from "@/components/IntentAnalytics";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, AUTHOR } from "@/lib/site";
import type { Lang } from "@/lib/translations";

// Self-hosted at build time (no runtime request to Google) — loading fonts from
// Google's CDN would leak the visitor's IP to Google before any consent, which
// is exactly what the cookie banner is meant to prevent.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Inline script executed before paint to prevent flash of wrong theme
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&d))document.documentElement.classList.add('dark');}catch(e){}})();`;

// Site-wide structured data: ties the author entity (with sameAs profiles) to
// the site so search engines and LLMs attribute content to one identity.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${AUTHOR.url}#person`,
      name: AUTHOR.name,
      url: AUTHOR.url,
      sameAs: AUTHOR.sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: ["es", "en"],
      author: { "@id": `${AUTHOR.url}#person` },
    },
  ],
};

/**
 * The `<html>` document, shared by both locales' root layouts.
 *
 * <p>It takes `lang` rather than hardcoding one because the attribute has to
 * match the words actually on the page: the document used to declare `en` while
 * rendering Spanish, which is a claim about the content that was simply false —
 * and the thing a screen reader picks its voice from.
 */
export default function RootShell({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply theme class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={siteJsonLd} />
      </head>
      <body className="relative min-h-screen">
        <BrandDefs />
        {children}
        <IntentAnalytics />
        <CookieConsent lang={lang} />
      </body>
    </html>
  );
}
