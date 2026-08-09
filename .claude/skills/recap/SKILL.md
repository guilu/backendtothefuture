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
   It prints, per project, the user's own prompts from sessions touched that
   week — the highest-signal, cheapest trace of what was worked on.

   **Caveat**: it selects sessions by the `.jsonl` file's mtime, so a long
   session that started earlier drags in prompts from previous weeks. Filter by
   each message's own `timestamp` field before trusting the boundaries.

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

Build them the same way as the screenshots: an HTML file rendered with
Playwright at `deviceScaleFactor: 2`, then `cwebp`. Keep the series visually
consistent — dark ground, faint grid, `Plus Jakarta Sans` from
`public/fonts/`, the brand orange gradient (`--grad-word`) on the second half of
the headline, a row of stat chips, and one schematic of the thing the week
built. Read the previous posts' images in `public/blog/` before designing a new
one; they are the reference.

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
- `title` — thematic, not "Weekly recap N". Find the week's real throughline.
- `date` — the **publish date** (the Sunday, `YYYY-MM-DD`), so it sorts to the
  top of the feed above the source week.
- `description` — one honest sentence on what the week was about.
- `tags` — e.g. `["weekly", ...]` plus the week's actual topics.
- `thumb` / `cover` / `ogImage` — always set, pointing at the three assets from
  step 5.

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
- Claude Code usage: 5-hour windows and weekly windows consumed
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
