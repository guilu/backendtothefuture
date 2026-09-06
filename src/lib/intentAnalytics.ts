const MIN_ACTIVE_MS = 60_000;
const MIN_SCROLL_RATIO = 0.75;

export type IntentEvent = "article_read" | "outbound_click" | "newsletter_click" | "sign_up";
export type IntentParameters = Partial<Record<"article_slug" | "language" | "link_domain" | "link_context", string>>;
type Gtag = (command: "event", event: IntentEvent, parameters: IntentParameters) => void;

export function dispatchIntent(
  event: IntentEvent,
  parameters: IntentParameters,
  consent: string | null,
  gtag?: Gtag,
): boolean {
  if (consent !== "granted" || !gtag) return false;
  gtag("event", event, parameters);
  return true;
}

export function outboundDomain(href: string, currentUrl: string): string | null {
  const target = new URL(href, currentUrl);
  const current = new URL(currentUrl);
  if ((target.protocol !== "http:" && target.protocol !== "https:") || target.hostname === current.hostname) {
    return null;
  }
  return target.hostname;
}

/** Pure intent threshold state; browser wiring supplies active time and scroll. */
export class ArticleIntent {
  private activeMs = 0;
  private maxScrollRatio = 0;

  addActiveTime(milliseconds: number) {
    this.activeMs += Math.max(0, milliseconds);
  }

  observeScroll(ratio: number) {
    this.maxScrollRatio = Math.max(this.maxScrollRatio, Math.min(1, Math.max(0, ratio)));
  }

  isEligible() {
    return this.activeMs >= MIN_ACTIVE_MS && this.maxScrollRatio >= MIN_SCROLL_RATIO;
  }
}
