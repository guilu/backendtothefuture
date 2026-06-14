"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { t, type Lang } from "@/lib/translations";

const STORAGE_KEY = "ga-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-XXXXXXXX";

/** Custom event other components (e.g. the footer link) dispatch to reopen the
 *  banner so the visitor can review or withdraw consent at any time. */
export const OPEN_CONSENT_EVENT = "open-cookie-banner";

type Consent = "granted" | "denied";

// Only load GA once we have a real-looking Measurement ID. The placeholder
// must never fire a script request, so analytics stays inert until the real
// ID is wired through NEXT_PUBLIC_GA_ID.
const hasValidGaId = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== "G-XXXXXXXX";

/** Expire the GA cookies so withdrawing consent actually stops tracking, not
 *  just future page loads. GA can scope cookies to any suffix of the hostname,
 *  so sweep every suffix (with and without the leading dot) plus the host-only
 *  form to guarantee deletion regardless of how they were set. */
function clearGaCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n.startsWith("_ga"));

  const parts = location.hostname.split(".");
  const domains: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const suffix = parts.slice(i).join(".");
    domains.push(suffix, "." + suffix);
  }

  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  for (const name of names) {
    document.cookie = `${name}=; path=/; ${expired}`; // host-only
    for (const domain of domains) {
      document.cookie = `${name}=; path=/; domain=${domain}; ${expired}`;
    }
  }
}

/**
 * GDPR-friendly analytics gate. Google Analytics is mounted only after the
 * visitor explicitly accepts — rendering <GoogleAnalytics> is what injects
 * gtag, so not rendering it means zero tracking until consent is given. The
 * choice can be withdrawn at any time, and withdrawing clears the cookies.
 */
export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [forced, setForced] = useState(false);
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

    const reopen = () => setForced(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  const decide = (value: Consent) => {
    const previous = localStorage.getItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, value);
    setForced(false);

    // Withdrawing after analytics was active: tear it down for real. gtag is
    // already in the page and keeps rewriting its cookies on each hit, so flip
    // its documented kill switch first (stops all activity, including cookie
    // writes), then clear the cookies and reload to unload the script.
    if (value === "denied" && previous === "granted") {
      (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
      clearGaCookies();
      location.reload();
      return;
    }
    setConsent(value);
  };

  if (!mounted) return null;

  const copy = t[lang].consent;
  const showBanner = consent === null || forced;

  return (
    <>
      {consent === "granted" && hasValidGaId && <GoogleAnalytics gaId={GA_ID} />}

      {showBanner && (
        <div
          role="dialog"
          aria-label={copy.ariaLabel}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <p className="font-mono text-[12px] leading-relaxed text-[var(--body)] sm:text-[13px]">
            {copy.message}{" "}
            <a
              href="/cookies"
              className="font-semibold text-[var(--orange)] underline underline-offset-2 hover:opacity-80">
              {copy.learnMore}
            </a>
          </p>
          {/* Equal-weight buttons: rejecting must be exactly as prominent and as
              easy as accepting (no nudging). */}
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => decide("denied")}
              className="flex-1 rounded-[11px] border border-[var(--hairline)] px-3.5 py-2 font-mono text-[12px] font-semibold text-[var(--ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-18)] sm:flex-none">
              {copy.reject}
            </button>
            <button
              onClick={() => decide("granted")}
              className="flex-1 rounded-[11px] border border-[var(--hairline)] px-3.5 py-2 font-mono text-[12px] font-semibold text-[var(--ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-18)] sm:flex-none">
              {copy.accept}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
