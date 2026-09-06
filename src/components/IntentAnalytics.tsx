"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArticleIntent, dispatchIntent, outboundDomain, type IntentParameters } from "@/lib/intentAnalytics";

const CONSENT_KEY = "ga-consent";
const ARTICLE_SENT_PREFIX = "ga-article-read:";
const sentArticles = new Set<string>();

declare global {
  interface Window {
    gtag?: (command: "event", event: "article_read" | "outbound_click" | "newsletter_click" | "sign_up", parameters: IntentParameters) => void;
  }
}

function consent(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function send(event: "article_read" | "outbound_click", parameters: IntentParameters): boolean {
  return dispatchIntent(event, parameters, consent(), window.gtag);
}

function linkContext(anchor: HTMLAnchorElement): string {
  if (anchor.closest("article[data-article-slug]")) return "article";
  if (anchor.closest("header")) return "header";
  if (anchor.closest("footer")) return "footer";
  return "page";
}

/** Consent-gated, delegated GA4 intent tracking for the static site. */
export default function IntentAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const domain = outboundDomain(anchor.href, location.href);
      if (!domain) return;
      send("outbound_click", { link_domain: domain, link_context: linkContext(anchor) });
    };

    document.addEventListener("click", onClick);

    const article = document.querySelector<HTMLElement>("article[data-article-slug]");
    if (!article) return () => document.removeEventListener("click", onClick);

    const slug = article.dataset.articleSlug;
    const language = article.dataset.articleLanguage;
    if (!slug || !language) return () => document.removeEventListener("click", onClick);

    const sentKey = `${ARTICLE_SENT_PREFIX}${slug}`;
    const intent = new ArticleIntent();
    let lastTick = performance.now();
    let wasVisible = document.visibilityState === "visible";

    const sample = () => {
      const now = performance.now();
      if (wasVisible) intent.addActiveTime(now - lastTick);
      lastTick = now;
      wasVisible = document.visibilityState === "visible";

      const rect = article.getBoundingClientRect();
      intent.observeScroll((window.innerHeight - rect.top) / Math.max(rect.height, 1));

      let alreadySent = sentArticles.has(sentKey);
      try {
        alreadySent ||= sessionStorage.getItem(sentKey) === "1";
      } catch {
        // Storage can be unavailable in privacy modes; sending remains consent-gated.
      }

      if (!alreadySent && intent.isEligible() && send("article_read", { article_slug: slug, language })) {
        sentArticles.add(sentKey);
        try {
          sessionStorage.setItem(sentKey, "1");
        } catch {
          // The hit was sent; unavailable storage only prevents deduplication.
        }
      }
    };

    sample();
    const interval = window.setInterval(sample, 1_000);
    window.addEventListener("scroll", sample, { passive: true });
    document.addEventListener("visibilitychange", sample);

    return () => {
      document.removeEventListener("click", onClick);
      window.clearInterval(interval);
      window.removeEventListener("scroll", sample);
      document.removeEventListener("visibilitychange", sample);
    };
  }, [pathname]);

  return null;
}
