---
name: recap
description: >
  Generate the weekly bilingual blog recap for backendtothefuture.com from the
  week's AI-assisted work. Use this whenever the user wants to write their
  weekly blog post, recap the week, summarize what they built/learned/tried over
  the weekend, or fuse the chatgpt/gemini/claude weekly source notes into a
  published post — even if they don't say the word "recap". Triggers on Sunday
  blog-writing intent, "resumen de la semana", "entrada semanal del blog",
  "post de la semana", or mentions of the blog/chatgpt-*.md / gemini-*.md /
  claude-*.md source files.
---

# Weekly blog recap

The user ships side projects on weekends and wants one blog post per week
summarizing what was learned, tried, and shipped. The post is synthesized from
up to three AI perspectives, each dropped into `blog/` as a raw source note:

- `blog/chatgpt-YYYYMMDD.md` — ChatGPT's view (user provides)
- `blog/gemini-YYYYMMDD.md` — Gemini's view (user provides)
- `blog/claude-YYYYMMDD.md` — **you generate this one**

`YYYYMMDD` is the **Monday that starts the week**. The final post is a
bilingual pair under `content/blog/`, which the site renders.

Why three sources: each model sees a different slice. Claude knows what actually
shipped (it did the building), ChatGPT tends to hold the exploratory/infra
thread, Gemini tends to hold the wider portfolio/planning view. Fusing them
gives a post no single one could write.

## Step 1 — Fix the week

Determine the Monday of the target week as `YYYYMMDD`. Default to the current
week's Monday unless the user names another week. Use the same date for all
three source files and the final post's slug.

## Step 2 — Mine Claude's week

Claude **cannot** read ChatGPT or Gemini conversations (they live on their
servers). Claude **can** read its own transcripts and Engram. Gather both:

1. Run the miner for the week's prompts across every project:
   ```bash
   python3 .claude/skills/recap/scripts/mine_week.py YYYYMMDD
   ```
   It prints, per project and in chronological order, the user's own prompts
   from that week — the highest-signal, cheapest trace of what was worked on.
   Each message is filtered by its own timestamp, so a session left open across
   weeks does not leak the previous week's prompts into this digest.

   Its `## Summary` block gives prompts, sessions and 5-hour windows, which is
   most of what the post's closing stats section needs.

2. Pull Engram for distilled decisions/bugs/summaries. Engram is scoped per
   project and the project keys use dots, not dashes. Search each project that
   showed activity in step 1:
   - `backendtothefuture`, `diegobarrioh.dev`, `akadem.ia`, `tokenmeter`
   - `mem_search(query: "...", project: "<key>")` then
     `mem_get_observation(id)` for full content of anything relevant.

## Step 3 — Write `blog/claude-YYYYMMDD.md`

Write Claude's source note: **raw prose, no frontmatter**, parallel in form to
the chatgpt source. Voice = first-person builder's log: what actually shipped
this week, across all active projects, grounded in the mined prompts and Engram
(real branches, PRs, releases, bugs — not vague claims). Include a short
"lowlights" beat if something genuinely broke or got stuck; honesty is the
point of the series. End with key takeaways and what's next.

This source note **is allowed to be exhaustive** — it is raw material, not the
post. Every PR number, migration and stat lives here so the post can pick from
it. The published post is the opposite: a story, not a log.

## Step 4 — Detect available sources

List `blog/*-YYYYMMDD.md`. Fuse **whatever exists** — don't block on a missing
Gemini or ChatGPT file. Read each present source in full before fusing.

## Step 5 — Capture screenshots of what shipped

Whenever the week shipped something **visible**, the post gets screenshots of it
in its final state. If the post says "we built a plan-generation funnel on the
landing page", the reader should see how that funnel ended up looking.

- Pick the 2–5 features that carry the story. Not every screen — the ones the
  narrative names.
- Drive the real app (Playwright against the running deploy, or the local dev
  server). Ask the user for credentials if a screen is behind login.
- Save to `public/img/<project>-YYYY-MM-DD-<shot>.webp` (`public/blog/` is for
  the post's cover/thumb/og) and reference them in the body with a caption
  saying what is being shown.
- For Forma specifically, read `references/forma-screenshots.md` first — it has
  the worktree/stub/CSRF recipe that makes the run work on the first try.
- If a screen cannot be captured (env down, no credentials, feature is
  backend-only), say so and continue — never fake or mock up a screenshot.

### Every post also gets its own two key images

These are not optional and they are not the app screenshots — they are the
post's own artwork, and both ship with every post:

| Asset | Ratio | Rendered size | File |
|---|---|---|---|
| **Thumbnail** — the blog index card | portrait, ~180×300 displayed | **800×1200** | `public/blog/<slug>-thumb.webp` |
| **Cover** — the post header | 16:9 | **1200×630** | `public/blog/<slug>-cover.webp` |

Plus `public/blog/<slug>-og.jpg` — the same cover art exported as **JPG**,
because LinkedIn, Facebook and X do not render WebP for `og:image`.

Wire all three into the frontmatter (`thumb` / `cover` / `ogImage`).

#### Art direction — editorial illustration, not a banner

The brief is: **a hero illustration for the week's story**. Think of the opening
artwork of a Wired, Stripe, Linear or Apple engineering article — the image that
sets the tone before a single word is read.

**Do not make:**

- a marketing banner
- a product mockup or dashboard schematic
- a poster with the headline set in type
- a stat sheet with chips and numbers

**Do make:** an image that carries the week's central idea through **symbolism,
metaphor and composition**. The concept, not the interface.

Hard constraints:

- **No text of any kind.** No title, no labels, no stat chips, no URL. The
  article already carries all of that, and an image that needs a caption to work
  hasn't done its job. It also means one piece of art serves both languages.
- **If the app appears at all, it is a supporting element under 20% of the
  frame** — a suggested surface at the edge, out of focus, a fragment. Never the
  subject.
- **Atmosphere and impact beat interface accuracy.** Nobody is going to check
  whether the rendered card matches the real one; they are going to decide in
  half a second whether the article looks worth reading.
- The thumbnail is not a crop of the cover. Compose it for portrait — the
  metaphor restaged vertically, not squeezed.

Finding the image: take the week's throughline and ask what it *looks* like. A
week about filler numbers being replaced by real ones is a field of identical
hollow shapes with one solid form emerging among them; a week about catalogues
is order forming out of scattered mass; a week about a funnel is convergence.
Reach for the metaphor, then build the simplest composition that carries it.

#### What stays fixed, and what the subject decides

Consistency across the series comes from **ground and composition, not colour
and not layout**. Fixed every week:

- deep near-black ground
- one clear focal point, generous negative space
- a warm mass and a cool mass holding opposite sides of the frame
- a strong vignette; light is the subject, the form is scenery

**The accent palette follows the post's subject.** A week about Forma is lit in
Forma's green; a week about the blog or the toolchain falls back to the house
amber-to-ember. This is what stops ten covers in a row from being the same
orange, while the ground and the composition language keep the index reading as
one series.

| Subject | Accent source | Values |
|---|---|---|
| Forma | `forma/frontend/src/styles/theme.css` | `--color-accent #63e662`, ramp `#0b755f → #85f55c` |
| akadem.ia / TokenMeter | that project's own accent tokens | read them from the repo, never guess |
| This blog, tooling, process, cross-project | house brand | `--grad-word` `#f9b22b → #fb7a1e → #ee4136` |

Whichever accent leads, keep **a trace of the other temperature** at the edge —
a low-opacity haze in a corner — so the frame has two masses and the series
still rhymes. Read the tokens from the source file; do not copy the values in
this table if the repo disagrees with them.

Producing it:

- If an image-generation tool is available, use it, and write the prompt from
  the constraints above — concept first, then medium and palette, and an
  explicit "no text, no UI, no logos".
- Otherwise compose it as **abstract SVG/CSS** rendered with Playwright at
  `deviceScaleFactor: 2` — gradient meshes, depth-of-field blur, repeated
  geometry with one break in the pattern, light falling across a form. This
  route produces genuinely good editorial abstraction; what it cannot draw from
  nothing is a figure, so a purely generated metaphor has to be geometric.
- **Better than either, when the week produced illustration assets of its own:
  build the art out of them.** If the week shipped silhouettes, icons, plates or
  masks, the cover made with those assets is both on-topic and made with the
  technique the post explains. Load them as `mask-image` over colour blocks —
  the asset supplies the shape, the theme token supplies the colour — so the
  same source file gives you the dark form and the lit accent. See
  `references/subject-art.md` for the recipe.
- Whatever the source, the figure is **scenery and the light is the subject**:
  hold it small in a large dark field, let it fall out of frame rather than
  centring it like a diagram, and keep the lit area to the few shapes that
  carry the idea. An asset scaled up until it fills the frame stops being
  editorial art and becomes a product splash screen.
- Either way, **look at the result before shipping it** and ask the honest
  question: would this make me stop scrolling? If the answer is no, redo it —
  do not ship art that is merely inoffensive.

## Step 6 — Fuse into the bilingual post

Write the pair the site loader expects (`src/lib/blog.ts` matches
`<slug>.es.md` + `<slug>.en.md`, frontmatter `title` / `date` / `description` /
`tags`, ordered by `date` descending):

- `content/blog/<thematic-slug>.es.md`
- `content/blog/<thematic-slug>.en.md`

The slug is a **thematic English slug**, not `recap-YYYYMMDD` — it is what the
URL will say forever, and it should describe the week's story
(`building-the-catalogs-an-ai-nutrition-plan-needs`, not `recap-20260803`).

Frontmatter:
- `title` — see **Writing the title** below. It carries more weight than any
  other single decision in the post.
- `date` — the **publish date** (the Sunday, `YYYY-MM-DD`), so it sorts to the
  top of the feed above the source week.
- `description` — one honest sentence on what the week was about.
- `tags` — e.g. `["weekly", ...]` plus the week's actual topics.
- `thumb` / `cover` / `ogImage` — always set, pointing at the three assets from
  step 5.

### Writing the title

Write it as if the post were going out on Stripe Engineering, Vercel, Linear,
Cloudflare or the Netflix TechBlog. **The title is one of the most important
parts of the article** — it decides whether anything else gets read.

Requirements:

- **Create curiosity without being clickbait.**
- Communicate the **key technical lesson**, not a description of what happened.
- Favour what other engineers, AI builders and developers can learn from.
- **Active voice.**
- **Under 60 characters** whenever possible.
- No generic shells: *Weekly recap*, *What I worked on*, *The week when…*.
- No implementation details. Name the engineering insight, the architectural
  decision, or the unexpected problem that got solved.

Good:

- *My app stopped making up data*
- *The biggest bug wasn't in the code*
- *Why our AI finally started using real data*
- *The day placeholders disappeared*
- *The architecture behind reliable AI*
- *When fake data becomes technical debt*
- *How we stopped lying to our own UI*

Bad:

- *Weekly recap #32*
- *Nutrition improvements*
- *The week we connected the backend*
- *New features in Forma*
- *Building the nutrition generator*

**The procedure — do not skip it and do not shortcut it to one candidate:**

1. Identify the single most interesting engineering insight of the week.
2. Generate **10** different titles for it.
3. Score each from 1–10 on **curiosity**, **clarity** and **technical
   relevance**.
4. Ship the highest scorer.

Ten candidates exist so the obvious first phrasing has to beat nine
alternatives. Show the user the shortlist and the scores — the title is theirs
to overrule.

The **slug** follows the chosen title, in English, and inherits the same rules:
`my-app-stopped-inventing-numbers`, never `the-week-…` or `recap-YYYYMMDD`. Pick
it before publishing; once a post is live the URL is load-bearing and renaming
it costs a redirect.

### The post is a story, not a changelog

This is the rule that matters most, and the easiest one to lose. **Do not walk
the PRs one by one.** Do not walk the sessions one by one. A reader who doesn't
know the codebase should finish the post understanding what got built and why,
without ever having read a PR number.

Structure the body as **planteamiento → nudo → desenlace**:

1. **Planteamiento** — where the week started and what we set out to do. The
   two or three things that actually mattered, named in plain language ("this
   week was about the plan generator, the funnel on the landing page, and making
   the app's screens read real data instead of fake numbers").
2. **Nudo** — the problems we hit while building it. This is the heart of the
   post. What broke, what turned out to be wrong, what we had assumed and
   wasn't true, what didn't work the first time.
3. **Desenlace** — how we solved each one and what we shipped in the end.
   Screenshots go here, showing the result.

Then close with what we learned and what's next.

Constraints on the prose:

- **Narrate, don't enumerate.** Prefer "the nutrition screen was contradicting
  itself: the top said 2350 kcal and the bottom said there was no plan" over a
  table of endpoints and flags.
- **Numbers only when they carry meaning.** One striking figure inside a
  paragraph is good; three tables of statistics in the body are not. Everything
  countable belongs in the closing stats section (below), not in the story.
- **At most one technical deep-dive**, and only if it teaches something a reader
  can reuse. Everything else stays at the level of the problem and its solution.
- Keep both languages as true mirrors, matching the warm, direct voice of the
  existing posts in `content/blog/`.

### Closing section — the week in numbers

Every post ends with a short technical-summary section (`## La semana en cifras`
/ `## The week in numbers`) holding everything the story deliberately left out.
This section is where stats are welcome and expected. Keeping them here is what
lets the story above stay a story.

Since 2026-09-20 it is **not a markdown table** — it is a `.week-stats` block:
a weekday sparkline on top, then one row per stat with an icon, a label, the
value and an optional meter. The CSS already lives in `src/app/globals.css`
(`.week-stats`, `.ws-*`); the post only emits the markup, and `marked` passes
raw HTML through untouched.

#### The sparkline

The 5-hour windows, broken down by day of the week. It leads the block because
it is the one genuinely graphic thing the miner gives us, and the shape of the
week is visible in half a second. `--v` is that day's window count, `--max` the
week's highest; a day with `--v:0` renders as a flat grey dash, and `data-on`
brightens the labels of the days that had activity.

```html
<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>M</b></div>
    <!-- … seven days, L M X J V S D in Spanish, M T W T F S S in English -->
  </div>
  <span class="ws-pulse-foot">9 ventanas en 5 sesiones · martes 08:12 → domingo 18:17 · el lunes no hubo actividad · la cuota semanal no se agotó</span>
</div>
```

The foot line carries the session count, the first and last timestamp, any dead
days, and **whether the weekly quota ran out**. That quota resets **Saturdays
around 22:00**; if it was exhausted before then, say so and say when — it
explains the shape of the week better than any other single number, and the
miner's window list shows it plainly: full days early on, fragments once the
quota bites, silence after.

#### The rows

```html
<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">23</span>
  <span class="ws-meter"><i class="ws-fill" style="width:78%"></i></span>
  <span class="ws-note">78 % en Forma (18) · Akademia 1 · este blog 2 — acumulado ≈273 PRs</span>
</div>
```

`ws-meter` is **optional and it is the rule that matters**: a row gets one only
when there is a real proportion to encode — the share of PRs in the main repo,
the additions-vs-deletions split. A bar at 100 %, or a bar whose width was
picked to look good, is decoration, and decoration is what this block exists to
avoid. When there is no proportion, the row is icon + label + value + note.

Two fills exist: `ws-fill` (brand gradient, for a share of a whole) and the
pair `ws-add` / `ws-del` (green/red, for a diff split — put both `<i>` inside
one `ws-meter`).

#### What goes in it

- PRs merged, split by repo, with the main project's cumulative total
- Lines added / removed, as an `ws-add`/`ws-del` meter
- Flyway migrations (range, e.g. `V62 → V65`) and anything newly verified
- Deploys to production
- Prompts, and prompts per 5-hour window
- Skills used during the week (`branch-pr`, `chained-pr`, `work-unit-commits`, …)
- Anything else countable and genuinely interesting — infrastructure counts
  (domains migrated, certificates renewed) belong here too when Hermes's note
  carried the week

Aim for six to eight rows. Beyond that the block stops being scannable and
becomes the log the story was trying not to be.

Pick icons that are legible at 16px and mean something: 🔀 PRs · 📊 lines ·
🐘 Postgres migrations · 🌐 domains · 🔒 certificates · 💬 prompts · 🧰 skills ·
🚀 deploys. Reuse the same icon for the same metric week to week.

Do **not** count the post's own screenshots as a stat — the reader can see them.
Anything about how the screenshots were produced (sample data, no real backend,
which commit) goes underneath the closing `</div>` as a footnote, in a
`<blockquote><small>…` so it renders smaller and set apart from the block.

## Step 7 — Stop

Report the files written, the screenshots captured, and the sources used. Do
**not** commit, push, or run the build unless the user asks — they review first.

## Step 8 — Share on Mastodon (only when the user asks)

Not part of the default run. Step 7 still stops. Do this only when the user
asks to publish the post to their social accounts, and only **after the post is
live** — the toot links to the published URL, and a toot cannot be edited once
it has federated, so a link to a 404 stays broken forever.

Order matters: `./deploy.sh` first, then confirm the URL loads, then toot.

1. Dry run, always first — it writes nothing and prints both toots with their
   character counts:
   ```bash
   npm run social:mastodon -- <slug> --dry-run
   ```
2. **Read the hashtag line before anything else** — see **Check the hashtags**
   below. It is the one part of the toot nobody proofreads.
3. **Show the user both toots and wait for approval.** Publishing is
   irreversible and it goes out under their name. Never skip this.
4. On approval, publish:
   ```bash
   npm run social:mastodon -- <slug>
   ```

The script sends one toot per locale, each tagged with its own `language` so
Mastodon's per-language timeline filter shows each reader only their version.
Text comes from the post's own frontmatter — `title`, `description` and the
leading `tags` as hashtags — so a bad toot usually means bad frontmatter.
Re-running for the same slug is a retry, not a second toot: the request carries
an `Idempotency-Key`.

The link in each toot carries UTMs (see **Tagging shared links** below). Mastodon
charges every URL a flat 23 characters, so the tail costs nothing.

### Check the hashtags

Both scripts build the hashtags by title-casing the leading `tags` of the post's
frontmatter — the first **four** on Mastodon (`MAX_HASHTAGS` in
`scripts/social-mastodon.mjs`), the first **three** on LinkedIn. Everything else
in the message comes from `title` and `description`, which get proofread
naturally because they are prose. The hashtags are generated, they sit at the
bottom, and they are the easiest thing in the dry run to skim past.

So read that line on purpose, every time, before showing anything to the user.

Each script carries an `ACRONYMS` set (`ai`, `api`, `ci`, `cli`, `seo`, `sql`,
`tdd`, `ui`, …) that upper-cases those words instead of title-casing them, which
is why `ci` publishes as `#CI` and not `#Ci`. **Nothing handles proper nouns with
internal capitals.** A tag like `postgresql`, `javascript`, `typescript`,
`github`, `nginx`, `oauth` or `macos` will publish as `#Postgresql`,
`#Javascript`, `#Github` — which reads as a typo to exactly the audience the tag
is meant to reach. This shipped once, on 2026-09-20, and was caught in the dry
run with minutes to spare.

Two fixes, in order of preference:

1. **Reorder the tags in the post** so the leading four title-case cleanly, and
   push the awkward one further down. It costs one line, it cannot break
   anything, and the tag still works for blog navigation, which does not
   title-case. This is the right call when you are minutes from publishing.
2. **Teach the scripts the name**, when the same tag will keep coming back. That
   means a `NAMES` map (`postgresql` → `PostgreSQL`) next to `ACRONYMS`, and it
   has to go in **both** scripts, which hold duplicate copies of that set —
   `scripts/lib/utm.mjs` is the precedent for extracting the shared bit instead.
   This is a code change with its own PR, not something to slip in on a Sunday
   between the deploy and the toot.

Either way the fix ships and the dry run gets re-run before publishing. Never
publish a hashtag you noticed was wrong on the promise of fixing it afterwards:
a toot cannot be edited once it has federated.

Requires `MASTODON_ACCESS_TOKEN` in `.env.local` (scope `write:statuses`);
`MASTODON_INSTANCE` defaults to `https://mastodon.social`. See
`scripts/social-mastodon.mjs`.

## Step 9 — Share on LinkedIn (only when the user asks)

Same rules as Step 8: not part of the default run, only after the post is live,
and only with explicit approval of the text.

**Spanish only.** LinkedIn has no per-language feed filter, so every contact
would see both copies; posting the same content twice in a row reads as spam
and splits the engagement. The English post still exists for search traffic.

1. Dry run — uploads nothing:
   ```bash
   npm run social:linkedin -- <slug> --dry-run
   ```
2. **Read the hashtag line first** — same trap as Mastodon, three tags instead
   of four. See **Check the hashtags** under Step 8.
3. **Show the user the text and the card, and wait for approval.**
4. On approval:
   ```bash
   npm run social:linkedin -- <slug>
   ```

The post is an *article* post: commentary, then a card built from the post's
`title`, a fixed site subtitle and the `ogImage` uploaded through the Images
API. This is not gold-plating — the Posts API does not scrape URLs, so without
the upload the link would publish as a bare string with no preview.

The card links the UTM-tagged URL (`utm_source=linkedin`), and the dry run also
prints the **X post**.

### Refresh LinkedIn's cache of the blog index

The post's own link is scraped fresh the first time it is shared, so it needs
nothing. The **blog index** is different: `https://backendtothefuture.com/blog/`
has been shared before, LinkedIn holds a cached preview of it, and the featured
tile on the user's profile points at exactly that URL. Its `og:image` is a
screenshot of the index regenerated on every deploy, so the moment a new post
ships, LinkedIn's copy is a picture of last week's blog.

There is no API to purge it. The Post Inspector is a logged-in web page, and the
undocumented `GET /post-inspector/inspect/<url>` returns a JavaScript shell that
gives no way to tell whether a crawl happened — automating against it would be a
step that can silently do nothing, which is the failure this repo keeps writing
guards against. So the skill hands over the link and the user clicks it.

After publishing, close with this, URL-encoded and ready to click:

```
https://www.linkedin.com/post-inspector/inspect/https%3A%2F%2Fbackendtothefuture.com%2Fblog%2F
```

Two things to say alongside it:

- Inspecting refreshes LinkedIn's cache of the URL. The **featured tile does not
  follow that cache** — it stores a snapshot from when the link was added. If
  the tile still shows the old image, remove the link from Featured and add it
  again, in that order: re-adding before inspecting just re-saves the stale one.
- The Spanish index is the one to inspect. `/en/blog/` has its own card and its
  own cache, but nothing links to it from the profile.

### The X post

X is posted by hand, and the user always posts the link **with the series
intro**, never the bare link. Whenever the post is shared (and whenever the user
asks for the X post), hand over this block, ready to copy as is — the text first,
then the link tagged `utm_source=x` on the next line:

```
Cada domingo Claude escribe el recap de la semana a partir de nuestras sesiones y lo publica en mi blog. El de esta semana:
https://backendtothefuture.com/blog/<slug>/?utm_source=x&utm_medium=organic_social&utm_campaign=blog_<year>&utm_content=<slug>-es
```

- Take it from the dry run's «Para X» section, which builds it from the same
  `INTRO` as LinkedIn and the helper's tagged link — do not retype either.
- Spanish only, same reason as LinkedIn.
- Never hand over the untagged URL as the one to post, or X traffic lands back
  in the untagged referrer bucket.
- Change the wording in `INTRO` (`scripts/social-linkedin.mjs`), not in the
  message: LinkedIn and X share it on purpose.

### When it fails

- **401** — the access token expired. They last ~60 days and LinkedIn does not
  issue refresh tokens to self-serve apps, so this is routine, not a bug. Run
  `npm run linkedin:auth` and paste the two new lines into `.env.local`.
- **426 / version errors** — `LINKEDIN_VERSION` in the script has been sunset.
  LinkedIn retires dated versions on a schedule. Bump it to a live one.
- **403 on the image** — `w_member_social` is write-only on `/rest/images`, so a
  GET will always fail. Only the upload itself needs to succeed.

## Tagging shared links

Every link published by Steps 8 and 9, and the one handed over for X, carries
UTMs. GA4 already shows LinkedIn and X as referrers of backendtothefuture, but a
referrer cannot say which post, which article or which language produced a
visit. The tags let `article_read` be broken down by the publication that
brought the reader — the only way to know whether sharing is working.

Convention, agreed with Hermes (who reads the GA4 reports) and implemented once
in `scripts/lib/utm.mjs`, covered by `tests/utm.test.ts`:

| Parameter | Value |
|---|---|
| `utm_source` | `linkedin` · `x` · `mastodon` — anything else throws |
| `utm_medium` | `organic_social` |
| `utm_campaign` | `blog_<year of the post's date>` |
| `utm_content` | `<slug>-<lang>`, plus `-<variant>` for a second post of the same article |

Rules:

- **Never hand-build a tagged URL.** Use the helper; a typo in `utm_source`
  fails nowhere, it just grows a new row in GA4 that splits the data.
- Tagged URLs are safe for SEO: every post declares a canonical without query
  string, so the parameters never become a second indexable page.
- A new channel (Bluesky, a newsletter) goes into `SOURCES` in the helper
  first, with its test, and only then gets shared.
- When reporting a publication back to the user, give the tagged URL that went
  out, so Hermes can match it against the reports — and close with the X post
  block from Step 9 (text, then tagged link).
