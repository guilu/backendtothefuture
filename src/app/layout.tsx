import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Backend to the Future — Diego Barrio",
    description:
      "Senior Backend Engineer crafting scalable platforms with Java & Spring.",
  },
  robots: { index: true, follow: true },
};

// Inline script executed before paint to prevent flash of wrong theme
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&d))document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply theme class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/img/dbh-light.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/img/dbh-dark.svg" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative min-h-screen">{children}</body>
    </html>
  );
}
