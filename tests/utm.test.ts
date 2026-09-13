import assert from "node:assert/strict";
import test from "node:test";
import { socialLinks, withUtm } from "../scripts/lib/utm.mjs";

const post = { slug: "my-post", date: "2026-09-13" };

test("tags a post URL with source, medium, campaign and content", () => {
  const url = new URL(withUtm("https://backendtothefuture.com/blog/my-post/", { ...post, source: "linkedin", lang: "es" }));

  assert.equal(url.origin + url.pathname, "https://backendtothefuture.com/blog/my-post/");
  assert.equal(url.searchParams.get("utm_source"), "linkedin");
  assert.equal(url.searchParams.get("utm_medium"), "organic_social");
  assert.equal(url.searchParams.get("utm_campaign"), "blog_2026");
  assert.equal(url.searchParams.get("utm_content"), "my-post-es");
});

test("the campaign follows the post's own year, not the day the script runs", () => {
  const url = new URL(withUtm("https://backendtothefuture.com/blog/old/", { slug: "old", date: "2024-03-01", source: "x", lang: "es" }));

  assert.equal(url.searchParams.get("utm_campaign"), "blog_2024");
});

test("a variant is appended to the content so two posts of the same article stay apart", () => {
  const url = new URL(withUtm("https://backendtothefuture.com/blog/my-post/", { ...post, source: "x", lang: "es", variant: "thread" }));

  assert.equal(url.searchParams.get("utm_content"), "my-post-es-thread");
});

test("rejects a source that is not a known channel", () => {
  assert.throws(() => withUtm("https://backendtothefuture.com/blog/my-post/", { ...post, source: "Linked In", lang: "es" }), /source/);
});

test("social links cover every channel, each pointing at its locale's URL", () => {
  const links = socialLinks(post);

  assert.deepEqual(Object.keys(links).sort(), ["linkedin", "mastodon_en", "mastodon_es", "x"]);
  assert.match(links.linkedin, /^https:\/\/backendtothefuture\.com\/blog\/my-post\/\?utm_source=linkedin&/);
  assert.match(links.x, /^https:\/\/backendtothefuture\.com\/blog\/my-post\/\?utm_source=x&/);
  assert.match(links.mastodon_en, /^https:\/\/backendtothefuture\.com\/en\/blog\/my-post\/\?utm_source=mastodon&.*utm_content=my-post-en$/);
});
