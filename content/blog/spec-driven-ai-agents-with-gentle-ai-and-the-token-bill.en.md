---
title: "Spec-Driven Development with Gentle AI: Flawless Process, Brutal Token Bill"
date: "2026-07-26"
description: "Week of July 20–26: I swapped my home-grown Jira skills for Gentle AI's SDD cycle on Forma — 20 PRs, real multi-user auth and a public landing. The process is excellent. Every single story ate a 5-hour window, and I burned through the weekly quota on Friday."
tags: ["weekly", "spec-driven-development", "ai-agents", "gentle-ai", "claude-code", "nginx", "seo"]
thumb: "/blog/spec-driven-ai-agents-with-gentle-ai-and-the-token-bill-thumb.webp"
cover: "/blog/spec-driven-ai-agents-with-gentle-ai-and-the-token-bill-cover.webp"
ogImage: "/blog/spec-driven-ai-agents-with-gentle-ai-and-the-token-bill-og.jpg"
---

## The week in one sentence

Everything that broke this week was a **badly calibrated limit**. Not one of them was a logic bug.

The Nginx rate limit that was kicking out my own users. A pull request's 400-line review budget. A static analyzer's scope. The weekly token quota I ran out of on Friday afternoon.

That last one deserves to go first, because it's the most important decision I've made in weeks.

## I swapped my own skills for someone else's

[Last week was 62 pull requests](/blog/shipping-62-prs-in-a-week-with-spec-driven-ai-agents), driven by two skills I'd written myself: `/jira-sdd-specs` generated the specs for a Jira epic, `/jira-sdd-ai` implemented one story from those specs. Short cycle, two steps, one agent. It worked beautifully.

This week, halfway through, I switched to **SDD with [Gentle AI](https://github.com/Gentleman-Programming/gentle-ai)** — an open-source suite of skills and agents I'd already used on other projects. And the number changed: **20 pull requests merged** (#151 through #170), 519 files touched, +26,258 / −3,070 lines.

Under a third of last week's PRs. And yet it felt like **more** engineering, not less.

The difference is the shape of the cycle. My skills had two steps. Gentle AI lays out the full chain, with explicit dependencies, and each phase runs in a **separate sub-agent with a clean context**:

```
explore → propose → spec → design → tasks → apply → verify → archive
                      ↑
                   (design branches off proposal)
```

Clean context means the agent writing the task list doesn't drag along the rambling of the agent that explored the repo. It's the same idea as separating responsibilities in code, applied to the conversation itself.

But the thing that actually won me over was a guardrail.

### The 400-line guard

When the `tasks` phase estimates the change will blow past the **400-line** review budget, the flow **stops** and forces a decision: either split into chained PRs, or explicitly accept a `size:exception` and put it on the record.

That's not a recommendation in a README. It's a *gate*.

The distinction isn't cosmetic. We all have a style guide that says "keep PRs small". Nobody follows it, because a document doesn't interrupt anyone at eleven at night. A gate does.

And it stopped me for real: the public landing's PR-B came in at ~930 lines. The guard fired, and I accepted the exception **deliberately** — the visual slice lost cohesion if I split it — instead of discovering the problem when a reviewer opened the diff. The guard worked. My prior estimate didn't.

## What got built in Forma

The process switch shows up cleanly in the history. On Monday the 20th I was still closing work with the old flow. On Thursday the 23rd I kicked off `FOR-171` with `/sdd-new` and never went back.

**The app stopped being mine.** `FOR-169` removed every seeded personal and demo record. It sounds like minor cleanup and it's the exact opposite: until this week [Forma](https://forma.diegobarrioh.dev) was *my* app, with my measurements baked into it. Now it starts empty.

**The domain moved out of the Java code.** The first change to go through the full SDD cycle produced… documentation. `FOR-171`: a 618-line ADR, zero code. Because the diagnosis was harsh: almost the entire plan domain lived **statically in code**, not in the database — the exercise catalog, the running plan generator, the nutrition one, all 23 foods. And every persisted table used a hardcoded `owner_id = "default-user"`.

Then `FOR-172` and `FOR-173` brought the exercise and food catalogs down into real tables: schema, seed, foreign keys and repository in one PR; read API in the next. Four PRs for a single idea: **the catalog stops being a compile-time constant**.

**And real multi-user landed.** Six PRs (`FOR-145` a, b-1, b-2, c, d): a `users` table, sessions, **Argon2id** password hashing, per-user isolation in two classes, dropping the legacy `owner_id`, and the frontend session flow with `/login` and `/registro`. The product decision that unblocked it: **open public registration** — not invite-only, not single-account.

**With a front door.** `FOR-185` in three stacked PRs: first the routing boundary (`/` public, the whole protected tree under `/app`, preserving `pathname`, `search` and `hash` across login), then the themed landing, and finally a layout restructure with a global navigation bar.

## The technical detail that will bite you

I committed the HTML design templates (`docs/0-landing.html`, `docs/1-dashboard.html`…) to the repo as a reference for the agents.

SonarCloud analyzed them **as production pages**.

The mockup's login inputs had no labels. That's `Web:InputWithoutLabelCheck`, which counts as a **BUG**, not a code smell. `new_reliability_rating` dropped to C and the Quality Gate failed.

Stop and look at the shape of that failure, because it's beautiful: **the more faithful the mockup you commit, the worse you score**. The signal is inverted. You're being punished for documenting well.

The fix is one line — add `docs/**` to `sonar.exclusions`. The lesson isn't. A versioned design artifact is **not production code**, and if your static analyzer can't tell them apart, you're the one who has to. Every quality tool you install ships with an implicit definition of "what my code is". It almost never matches yours.

Same-day bonus: `main`'s Quality Gate was **already red before** my PR. A red check on your branch doesn't prove you broke it. Check it directly, no auth needed:

```bash
curl -sS "https://sonarcloud.io/api/qualitygates/project_status?projectKey=<key>&pullRequest=<N>"
```

And one from CSS, out of the layout restructure: **`position: sticky` can't pin a bar that occupies its own grid row**, because a sticky element only travels inside its containing block. But make it `fixed` and it leaves the flow, so it **doesn't fill its row** — the routed content gets auto-placed right on top of it. The fix is `fixed` plus `padding-top` on the root layout to reserve the space. And its corollary: percentage heights don't resolve under a `min-height` parent, so vertically centered pages need `calc(100dvh - var(--topbar-height))`.

## Lowlights

**The tokens. This is the big one.**

Gentle AI's process is specific and rigorous, and it **burns tokens like paper on a bonfire**. Do the arithmetic: every phase is a sub-agent with a clean context that re-reads the repo, the specs and the ADRs. Multiply by eight phases. By chained PRs. By the fresh adversarial reviews the flow itself recommends.

The real result: **every individual story, however thin, ate the 5-hour window**. And on Friday I burned through the **weekly window** after a couple of Jira tickets.

This isn't a complaint about the process. It's its price, and it needs saying out loud before someone adopts it thinking it's free. Choosing a process is choosing a budget — the same way choosing Kubernetes is choosing an infrastructure bill.

**Gentle AI's `branch-pr` skill doesn't apply to Forma.** It's written for the Gentle AI repo: it demands `Closes #N`, exactly one `type:*` label, `feat/…` branch names and shellcheck. Forma uses Jira with no GitHub issues, `feature/FOR-NNN-…` branches, no PR template and no labels. Third-party agent configuration **ships with its home repo's assumptions**. You audit it before adopting it; you don't just install it.

**Visual fidelity never verified.** There was no headless browser in that environment, so the landing was never compared against the mockup *with eyes*. All 660 tests passed. That is not the same as "it looks right", and it's worth never confusing the two.

**A stray `node_modules/` at the repo root**, courtesy of running `npx vitest --root frontend` from the wrong directory. It wasn't in `.gitignore`. It would have been committed.

## Outside Forma: the other limits

**Nginx kicking out my own users.** In the homelab, `audio.diegobarrioh.dev` (Audiobookshelf) was returning **429** during normal browsing. The cause: the app loads a lot of assets and cover art in parallel, and the rate limit sat at `10r/s + burst 20 nodelay`. Retuned to **`60r/s + burst 300`**: anti-abuse protection stays, false positives on legitimate use disappear.

It's the same pattern as the 400-line guard, inverted. A limit calibrated for an **imagined** usage pattern instead of the real one. That same week I also validated ARMv7 compatibility of Docker images before upgrading a Raspberry Pi 2 — another limit, this one physical and non-negotiable.

**Google wasn't indexing diegobarrioh.dev.** Ten unindexed pages in Search Console; three real causes, found by probing the live site:

- `/contact` did `Astro.redirect('/#contact')`, and in a static build that emits a meta-refresh **to a fragment**. Google flags it as a redirect error. Fragments aren't URLs to a crawler.
- `/about`, `/cv` and `/projects` were **orphaned**: zero internal links, because the nav points at home-page fragments. And they duplicated that content on top of it.
- `www.diegobarrioh.dev` returned **200** instead of redirecting to the apex.

And here's the gem of the week: that 200 on www was **stale Cloudflare cache**. A cache-buster query revealed the real 301, which had been there the whole time. Cloudflare sits in front of the Raspberry Pi, so after every deploy you have to purge the cache or Google — and your visitors — see old HTML. **I spent time debugging a server that was already correct.**

**And one SEO detail that looks like trivia and isn't.** I renamed the CV PDF from `/pdf/diegobarrioh_mk4.pdf` to `/cv/diego-barrio-hortiguela-cv.pdf`. Two reasons: an **underscore `_` does not separate words for Google**, only the hyphen `-` does — so `diegobarrioh_mk4` was literally one opaque token with no keywords in it. And the diaeresis in "Hortigüela" never belongs in a URL: the browser percent-encodes it to `%C3%BC`, which is fragile in rsync and in nginx. You transliterate: `güe → gue`.

## The thread

Four different projects, four problems that looked unrelated, and all of them were the same one:

| Limit | Calibrated for | Reality |
|---|---|---|
| `10r/s` in Nginx | an abusive scraper | an app loading 40 covers at once |
| 400 lines per PR | a well-sliced change | one cohesive visual landing |
| SonarCloud's scope | "all HTML is production" | versioned design mockups |
| Token window | assisted conversation | eight sub-agents re-reading the repo |

None of them was a bug. Every one was a **default set by someone who imagined your use case without knowing it**. And this week's work, in all four places, was identical: measure real usage and recalibrate.

That's the part of the craft tutorials skip. Tutorials hand you the default value. Nobody teaches you how to tell when the default is lying.

## Takeaways

1. **Good process isn't free.** Gentle AI does very specific, very correct engineering. Its token cost is real and large. Choosing a process is choosing a budget.
2. **Guardrails work when they're gates, not advice.** A README would never have stopped me at eleven at night. The guard did.
3. **Third-party agent configuration carries third-party assumptions.** Audit before adopting, every time.
4. **Green tests are not visual verification.** 660 tests passing and a landing page nobody had actually looked at.

## What's next

Finish the data-model v2 epic: the `plan` aggregate with a lifecycle and exactly one active plan, training and nutrition structure, a shopping list derived from the plan, and an onboarding flow that generates the plan on the fly.

Plus one open decision that's *process* architecture, not code: how to cut the token cost without losing the rigor. The hypothesis I'll be working with is to reserve the full SDD cycle for changes that genuinely deserve it — a data model, an auth system — and keep small slices in a shorter lane.

Because a process you can't afford to run isn't a process. It's a poster.
