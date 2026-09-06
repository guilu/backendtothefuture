import assert from "node:assert/strict";
import test from "node:test";
import { ArticleIntent, dispatchIntent, outboundDomain } from "../src/lib/intentAnalytics.ts";

test("article_read becomes eligible only after 60 active seconds and 75% scroll", () => {
  const intent = new ArticleIntent();

  intent.addActiveTime(59_999);
  intent.observeScroll(1);
  assert.equal(intent.isEligible(), false);

  intent.addActiveTime(1);
  assert.equal(intent.isEligible(), true);
});

test("article_read remains ineligible below 75% scroll after enough active time", () => {
  const intent = new ArticleIntent();
  intent.addActiveTime(60_000);
  intent.observeScroll(0.7499);

  assert.equal(intent.isEligible(), false);
  intent.observeScroll(0.75);
  assert.equal(intent.isEligible(), true);
});

test("outboundDomain returns only external HTTP(S) domains", () => {
  const current = "https://backendtothefuture.com/blog/post/";

  assert.equal(outboundDomain("https://github.com/guilu", current), "github.com");
  assert.equal(outboundDomain("/cookies/", current), null);
  assert.equal(outboundDomain("https://backendtothefuture.com/en/", current), null);
  assert.equal(outboundDomain("mailto:hello@example.com", current), null);
});

test("dispatchIntent sends safe parameters only with granted consent and gtag available", () => {
  const calls: unknown[][] = [];
  const gtag = (...args: unknown[]) => calls.push(args);

  assert.equal(dispatchIntent("outbound_click", { link_domain: "github.com", link_context: "article" }, "denied", gtag), false);
  assert.equal(dispatchIntent("outbound_click", { link_domain: "github.com", link_context: "article" }, "granted", undefined), false);
  assert.equal(dispatchIntent("outbound_click", { link_domain: "github.com", link_context: "article" }, "granted", gtag), true);
  assert.deepEqual(calls, [["event", "outbound_click", { link_domain: "github.com", link_context: "article" }]]);
});
