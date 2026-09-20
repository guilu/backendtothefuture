import assert from "node:assert/strict";
import test from "node:test";
import { blogOgShotModel } from "../src/lib/og.ts";
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

test("the shot model carries every post, in order, in the requested language", () => {
  const model = blogOgShotModel("en", posts);

  assert.equal(model.posts.length, 3);
  assert.deepEqual(
    model.posts.map((p) => p.slug),
    ["newest", "older", "oldest"],
  );
  assert.equal(model.posts[0].title, "newest en");
  assert.equal(model.posts[0].thumb, "/blog/newest-thumb.webp");
});

// The inverse of this test used to hold, and its reversal is the whole point of
// going back to a page shot: the index prints every card, so every card is part
// of the picture the URL is supposed to name.
test("editing an older post changes the shot model", () => {
  const before = blogOgShotModel("es", posts);
  const edited = [posts[0], post("older", "2026-08-30", { title: "rewritten" }), posts[2]];

  assert.notDeepEqual(blogOgShotModel("es", edited), before);
});

test("editing the newest post changes the shot model", () => {
  const before = blogOgShotModel("es", posts);
  const edited = [post("newest", "2026-09-06", { title: "rewritten" }), posts[1], posts[2]];

  assert.notDeepEqual(blogOgShotModel("es", edited), before);
});

// The cards print both, unlike the poster that replaced them for three weeks,
// so neither may be silently dropped from the model again.
test("description and tags are part of the shot model", () => {
  const before = blogOgShotModel("es", posts);

  assert.notDeepEqual(
    blogOgShotModel("es", [post("newest", "2026-09-06", { description: "rewritten" }), posts[1], posts[2]]),
    before,
  );
  assert.notDeepEqual(
    blogOgShotModel("es", [post("newest", "2026-09-06", { tags: ["x"] }), posts[1], posts[2]]),
    before,
  );
});

test("a post count change alone changes the shot model", () => {
  assert.notDeepEqual(blogOgShotModel("es", posts.slice(0, 2)), blogOgShotModel("es", posts));
});

test("the shot model falls back to the other locale when a translation is missing", () => {
  const esOnly: LocalizedPost = {
    slug: "solo-es",
    date: "2026-09-06",
    translations: { es: posts[0].translations.es },
  } as LocalizedPost;

  assert.equal(blogOgShotModel("en", [esOnly]).posts[0].title, "newest es");
});

test("an empty blog yields a model with no posts", () => {
  const model = blogOgShotModel("es", []);

  assert.deepEqual(model.posts, []);
});
