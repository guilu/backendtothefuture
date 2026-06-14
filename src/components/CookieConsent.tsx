"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { t, type Lang } from "@/lib/translations";

const STORAGE_KEY = "ga-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-XXXXXXXX";

type Consent = "granted" | "denied";

// Only load GA once we have a real-looking Measurement ID. The placeholder
// must never fire a script request, so analytics stays inert until the real
// ID is wired through NEXT_PUBLIC_GA_ID.
const hasValidGaId = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== "G-XXXXXXXX";

/**
 * GDPR-friendly analytics gate. Google Analytics is mounted only after the
 * visitor explicitly accepts — rendering <GoogleAnalytics> is what injects
 * gtag, so not rendering it means zero tracking until consent is given.
 */
export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    setMounted(true);
    const storedConsent = localStorage.getItem(STORAGE_KEY);
    if (storedConsent === "granted" || storedConsent === "denied") {
      setConsent(storedConsent);
    }
    const storedLang = localStorage.getItem("lang");
    if (storedLang === "en" || storedLang === "es") setLang(storedLang);
  }, []);

  const decide = (value: Consent) => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  if (!mounted) return null;

  const copy = t[lang].consent;
  const showBanner = consent === null;

  return (
    <>
      {consent === "granted" && hasValidGaId && <GoogleAnalytics gaId={GA_ID} />}

      {showBanner && (
        <div
          role="dialog"
          aria-label={copy.ariaLabel}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] sm:flex-row sm:items-center sm:gap-4 sm:p-5"
        >
          <p className="font-mono text-[12px] leading-relaxed text-[var(--body)] sm:text-[13px]">
            {copy.message}
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => decide("denied")}
              className="rounded-[11px] border border-[var(--hairline)] px-3.5 py-2 font-mono text-[12px] font-semibold text-[var(--muted)] transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--ink)]"
            >
              {copy.reject}
            </button>
            <button
              onClick={() => decide("granted")}
              className="rounded-[11px] bg-[var(--orange)] px-3.5 py-2 font-mono text-[12px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-brand)]"
            >
              {copy.accept}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
