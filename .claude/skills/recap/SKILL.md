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

## Step 4 — Detect available sources

List `blog/*-YYYYMMDD.md`. Fuse **whatever exists** — don't block on a missing
Gemini or ChatGPT file. Read each present source in full before fusing.

## Step 5 — Fuse into the bilingual post

Write the pair the site loader expects (`src/lib/blog.ts` matches
`<slug>.es.md` + `<slug>.en.md`, frontmatter `title` / `date` / `description` /
`tags`, ordered by `date` descending):

- `content/blog/recap-YYYYMMDD.es.md`
- `content/blog/recap-YYYYMMDD.en.md`

Frontmatter:
- `title` — thematic, not "Weekly recap N". Find the week's real throughline.
- `date` — the **publish date** (the Sunday, `YYYY-MM-DD`), so it sorts to the
  top of the feed above the source week.
- `description` — one honest sentence on what the week was about.
- `tags` — e.g. `["weekly", ...]` plus the week's actual topics.

Body structure (adapt, don't pad): intro framing the week → **Highlights** (what
shipped) → what was explored / the one technical detail worth teaching →
**Lowlights** (what broke or stuck) → the thread connecting the projects →
takeaways → what's next. Generalized across everything, surfacing the most
interesting parts rather than logging every commit. Keep both languages as true
mirrors, matching the warm, direct, technical voice of the existing posts in
`content/blog/`.

## Step 6 — Stop

Report the files written and the sources used. Do **not** commit, push, or run
the build unless the user asks — they review first.
