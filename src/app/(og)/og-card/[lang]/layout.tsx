import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "../../../globals.css";

// Same self-hosted face the site uses; the card sets the mono runs in it.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  // A render target, not a page anybody should land on from a search result.
  robots: { index: false, follow: false },
};

/**
 * Root layout for the Open Graph render targets under `/og-card/`.
 *
 * <p>A third root layout exists because these documents must NOT be the site.
 * The site's shell paints a cookie banner across the bottom of the viewport and
 * decides its theme from `localStorage` before first paint — one puts a consent
 * dialog in every social preview, the other makes the picture depend on what
 * the deploying laptop happens to prefer. Here `dark` is written into the
 * markup, so the same commit produces the same image on any machine.
 *
 * <p><b>This file has to sit inside the `[lang]` segment, not above it.</b> A
 * layout is only handed the params of its own segment and its ancestors, so at
 * `(og)/layout.tsx` the `lang` below it is simply `undefined` — and the failure
 * is silent: the build passes and every card ships an `<html>` with no `lang`
 * at all. It was written there first and did exactly that.
 */
export default async function OgRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} className={`dark ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
