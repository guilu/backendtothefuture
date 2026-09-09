import assert from "node:assert/strict";
import test from "node:test";
import { blogOgCardModel } from "../src/lib/og.ts";
import type { LocalizedPost } from "../src/lib/blog.ts";

function post(slug: string, date: string, over: Record<string, unknown> = {}): LocalizedPost {
  const content = {
    title: `${slug} es`,
    date,
    description: "d",
    tags: ["weekly"],
    contentHtml: "<p>body</p>",
    thumb: `/blog/${slug}-thumb.webp`,
    ...over,
  };
  return {
    slug,
    date,
    translations: { es: content, en: { ...content, title: `${slug} en` } },
  } as LocalizedPost;
}

const posts = [post("newest", "2026-09-06"), post("older", "2026-08-30"), post("oldest", "2026-08-23")];

test("the card model carries only the newest post, in the requested language", () => {
  const model = blogOgCardModel("en", posts);

  assert.equal(model.postCount, 3);
  assert.equal(model.latest?.slug, "newest");
  assert.equal(model.latest?.title, "newest en");
  assert.equal(model.latest?.thumb, "/blog/newest-thumb.webp");
});

test("editing an older post leaves the card model untouched", () => {
  const before = blogOgCardModel("es", posts);
  const edited = [posts[0], post("older", "2026-08-30", { title: "rewritten", tags: ["x"] }), posts[2]];

  assert.deepEqual(blogOgCardModel("es", edited), before);
});

test("editing the newest post changes the card model", () => {
  const before = blogOgCardModel("es", posts);
  const edited = [post("newest", "2026-09-06", { title: "rewritten" }), posts[1], posts[2]];

  assert.notDeepEqual(blogOgCardModel("es", edited), before);
});

test("a post count change alone changes the card model", () => {
  assert.notDeepEqual(blogOgCardModel("es", posts.slice(0, 2)), blogOgCardModel("es", posts));
});

test("the card model falls back to the other locale when a translation is missing", () => {
  const esOnly: LocalizedPost = {
    slug: "solo-es",
    date: "2026-09-06",
    translations: { es: posts[0].translations.es },
  } as LocalizedPost;

  assert.equal(blogOgCardModel("en", [esOnly]).latest?.title, "newest es");
});

test("an empty blog yields a model with no latest post", () => {
  const model = blogOgCardModel("es", []);

  assert.equal(model.latest, null);
  assert.equal(model.postCount, 0);
});
