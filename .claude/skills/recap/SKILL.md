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
A compact table or list, no prose:

- PRs merged (and cumulative project total)
- Lines added / removed
- Deploys to production
- Flyway migrations (range, e.g. `V42 → V58`)
- Number of 5-hour working sessions
- Claude Code usage: 5-hour windows, and whether the **weekly** window ran out.
  The user's weekly quota resets **Saturdays around 22:00**. If it was exhausted
  before then, say so and say when — it explains the shape of the week better
  than any other single number, and the miner's window list shows it plainly:
  full days early on, fragments once the quota bites, silence after.
- Skills used during the week (`branch-pr`, `chained-pr`, `work-unit-commits`, …)
- Anything else countable and genuinely interesting

This section is where stats are welcome and expected. Keeping them here is what
lets the story above stay a story.

Do **not** count the post's own screenshots as a stat — the reader can see them.
Anything about how the screenshots were produced (sample data, no real backend,
which commit) goes underneath as a footnote, in a `<blockquote><small>…` so it
renders smaller and set apart from the table.

## Step 7 — Stop

Report the files written, the screenshots captured, and the sources used. Do
**not** commit, push, or run the build unless the user asks — they review first.
