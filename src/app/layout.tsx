import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BrandDefs } from "@/components/design-system/BrandMark";
import CookieConsent from "@/components/CookieConsent";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, AUTHOR } from "@/lib/site";

// Self-hosted at build time (no runtime request to Google) — loading fonts from
// Google's CDN would leak the visitor's IP to Google before any consent, which
// is exactly what the cookie banner is meant to prevent.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://backendtothefuture.com"),
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  title: "Backend to the Future — Diego Barrio",
  description:
    "Senior Backend Engineer crafting scalable platforms with Java & Spring. Microservices, clean architecture, and battle-tested engineering from Alicante, Spain.",
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
    title: "Backend to the Future — Diego Barrio",
    description:
      "Senior Backend Engineer crafting scalable platforms with Java & Spring.",
    url: "https://backendtothefuture.com",
    siteName: "Backend to the Future",
    locale: "en_US",
    type: "website",
    images: [{ url: "/home-og.jpg", width: 1200, height: 630, alt: "Backend to the Future" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Backend to the Future — Diego Barrio",
    description:
      "Senior Backend Engineer crafting scalable platforms with Java & Spring.",
    images: ["/home-og.jpg"],
  },
  robots: { index: true, follow: true },
};

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply theme class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={siteJsonLd} />
      </head>
      <body className="relative min-h-screen"><BrandDefs />{children}<CookieConsent /></body>
    </html>
  );
}
