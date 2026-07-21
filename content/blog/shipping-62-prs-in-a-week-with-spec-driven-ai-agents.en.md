---
title: "62 Pull Requests in One Week: Spec-Driven Development with AI Agents"
date: "2026-07-19"
description: "Week of July 13–19: 62 PRs merged into Forma with a specs-and-agents loop, encrypted Withings OAuth, my real training plan turned into software — and an entire afternoon lost debugging a Google Analytics setup that was working perfectly."
tags: ["weekly", "spec-driven-development", "ai-agents", "ai-engineering", "spring-boot", "oauth"]
thumb: "/blog/shipping-62-prs-in-a-week-with-spec-driven-ai-agents-thumb.webp"
cover: "/blog/shipping-62-prs-in-a-week-with-spec-driven-ai-agents-cover.webp"
ogImage: "/blog/shipping-62-prs-in-a-week-with-spec-driven-ai-agents-og.jpg"
---

## The week in one sentence

Spain won the World Cup and Forma stopped being a mockup.

It sounds like a joke, but the two halves of that sentence are more connected than they look, and it took me the whole week to see it.

Numbers first, because they're the part that raises an eyebrow: **62 pull requests merged** between Monday the 13th and Sunday the 19th. 708 files touched. Over 51,000 lines added. All of it in [Forma](https://forma.diegobarrioh.dev), the health and fitness app I started at the end of June.

I didn't write a single line of Java by hand.

And before you think what you're thinking: **no, the speed isn't the achievement**. The speed is the symptom. The achievement is that I stopped making the same decision twice.

## The weekend Spain won the World Cup

Context, because it matters for what follows.

**Tuesday, July 14th** — semifinal against France. 0-2. A match Spain didn't win through individual brilliance but through the thing that always wins properly: a plan, executed in phases, with nobody trying to settle the match on their own.

**Sunday the 19th** — the final against Argentina. 1-0. Not one goal more, not one less. **Champions.**

And there, watching the final on Sunday night — with the weekly recap unwritten, which I'll own — the two things collided. I had spent seven days building a **training** app using exactly the mechanic that wins a World Cup: a plan written before you start, executed in small blocks, no heroics, no skipping phases.

Forma isn't a fitness project because it looks good in a portfolio. It's the app I use to follow my own plan: weight, body composition, strength training, running, nutrition, groceries, progress. And this week I put **my real plan** inside it — the one I'd been maintaining by hand in a spreadsheet.

This is what Forma looks like today, running in production with real data:

![Forma dashboard in production: sidebar navigation with Dashboard, Measurements, Training, Nutrition, Shopping list, Progress and Goals; body composition cards showing weight, body fat, muscle mass and BMI; a weight evolution chart; widgets for next workout, today's nutrition and grocery budget; and a Withings card marked as Connected](/img/forma-current-state-2026-07-19.png)

Look at the bottom left: **Withings · Connected**. That's a real scale sending real measurements. We'll come back to it.

## The loop

What happened this week wasn't "a lot of coding". It was repeating a loop:

```
/jira-sdd-specs FOR-XX   → generate the epic's specs (documentation, zero code)
/jira-sdd-ai  FOR-YYY    → implement ONE story from its specs
docs PR → merge → clean up branches
code PR → merge → clean up branches
```

Over thirty times. The phrase I typed most often all week, by a wide margin, was literally `pr merged clean up branches`.

And here's what I want you to take away: **my input stopped being technical and became directional.** I didn't write code. I wrote decisions. Which story goes next. What's a slice and what's an enabler. Which gap gets fixed and which gap gets logged.

That is not "the AI codes for me". That's me **moving up an altitude**. Which is exactly what should happen and almost never does, because most people use AI to write the same code they were already writing, only faster, instead of changing the level they work at.

## Stub, slice, gap: the pattern holding it all up

This is the technical core of the week. If you take one thing away, take this.

While building the UX screens the same problem kept showing up: **the screen needs an endpoint that doesn't exist**. The temptation is obvious and enormous — fix it right there, in the same PR, "it's five minutes".

I didn't do it once.

Instead: **log the gap and keep going.** When the UX block was done, all the accumulated gaps became new stories under two *UI backend enablers* epics, grouped into three large stubs:

- **FOR-102** — nutrition
- **FOR-103** — integrations
- **FOR-104** — progress

And a stub doesn't get implemented in one sitting. **It gets sliced.** FOR-103 was three slices (connection → encrypted OAuth → real sync). FOR-102, four. FOR-104, five. Each slice with its own specs folder, docs PR, code PR and merge.

Why does this matter so much? Two reasons that travel together:

1. **Not a single PR that week was unreviewable.** Not one. With 62 PRs, that's the only reason the system didn't turn into a swamp.
2. **The agent's context never had to hold the whole system.** Only one slice, with its specs in front of it. Give an agent the entire project and ask it to "do nutrition" and you get mud. Give it a closed 200-line spec and you get a PR you can actually read.

It's the same principle as on the pitch: nobody tries to settle the match alone. Everyone plays their phase.

## Withings: real OAuth, and where the encryption lives

My favourite piece of the week. I registered a real application in the Withings developer portal to sync measurements from my scale. Three slices:

**Slice 1 (FOR-126)** — connection domain, status, and a connect/disconnect/sync API. With the application port **token-free**, deliberately, even though connect was still a mock at that point.

**Slice 2 (FOR-131)** — the real OAuth. And here's the architectural decision I want you to see:

> The application port **still doesn't know about a single token**. Encryption, the code-for-token exchange, refresh, revoke — all of it lives in the adapter. The domain doesn't know Withings exists.

Concretely: a V15 migration into a **separate table** (not a new column on `integration_connection`, which would have been the convenient and wrong choice), PKCE plus a single-use, expiring `state` for CSRF, and a test verifying the stored bytes are **not** the plaintext. Plus explicit assertions that no token, `code` or `state` ever leaks into a response, a header or a log.

That's hexagonal architecture doing its job. It isn't academic decoration: it's what lets Garmin or Fitbit walk in tomorrow without touching the domain.

**Slice 3 (FOR-132)** — real measurement sync into `BodyMeasurement`. Plus FOR-133 for the frontend `/auth` route, because the Withings `redirect_uri` points at the SPA, not the backend, and the SPA then calls the backend callback with `{code, state}`.

## Everything else that got built

Quickly, because the list is long:

- **Accessibility** (FOR-112 to FOR-114): threaded heading hierarchy across `Card`, `MetricCard` and `ChartContainer`, shared error and empty states, and **automated a11y tests with `jest-axe`**. Putting accessibility in CI is one of those things you either do early or never do.
- **Real backend under the UI**: profile and preferences, server-persisted theme, onboarding answers actually stored, shopping list with real quantities, units and servings, insight history with week-over-week deltas. **The UI stopped lying.**
- **Goals, adherence, achievements**: goals and milestones domain, a Goals screen, an adherence read model (planned vs completed per category), rule-driven persisted achievements and a muscle-worked map for strength sessions.
- **Nutrition and hydration**: meal consumption against the day's target, a day-type resolver by date, water logging with hydration progress, key nutrients in the food catalog.
- **Progress**: streaks, weekly history bars, and progress-photo upload with private, owner-scoped storage.

## And then, the real plan

Saturday and Sunday brought the turn that takes this from project to product.

I took my real plan — an `.xlsm` I'd been maintaining by hand — and turned it into stories: real strength templates (five exercises per block, with per-exercise programming), a real running plan with a volume curve, 6x400m intervals and a deload week, **weekly adjustment rules taken literally from the "Reglas" sheet**, a weekly tracking record, real food and Mercadona catalogs with a cost threshold, and my own baseline values seeded into the profile.

That's when Forma stopped being *a* fitness app and became **my** fitness app.

And that's the part that connects back to Sunday night. A national team doesn't win a World Cup by improvising, and you don't change your body composition by improvising. What a written plan does — on the pitch, in the gym, or in the repository — is take the decision off your shoulders on the day you don't feel like deciding. The plan decides for you. You just execute today's slice.

It is literally the same mechanism as specs.

## Model routing: think expensive, type cheap

A small decision with large consequences.

I'd been wondering for days: if I have Opus selected, does Opus write all the code? I asked, and it ended up as an explicit rule baked into the skills themselves:

- **`jira-sdd-specs`** (thinking, deciding, writing the specification) → **Opus**, always.
- **`jira-sdd-ai`** (implementing from a closed spec) → delegates to a **Sonnet** subagent.

The reasoning is the usual one: **thinking is expensive and worth it; typing from a closed spec isn't.** If the specification is good, implementation is mechanical work, and paying architect rates for mechanical work is burning money.

I also considered dropping git chores (merging, deleting branches, commit, pull) down to Haiku. They're still inline for now, but the question was the right one: **not every piece of work in a session deserves the same model.**

## Lowlights

### The afternoon I lost debugging a system that worked

On Monday I migrated `diegobarrioh.dev` from inline `gtag` to Google Tag Manager. The migration was clean: PR merged, GTM published, deployed. Ten minutes.

Then I spent **hours** chasing a ghost: Realtime showed 0 active users. I tried incognito. I tried my phone on 4G. I fired hits with headless Chrome. Nothing.

It wasn't broken. It was **three things at once**, and any one of them would have been enough:

- Headless Chrome gets a 204 and records events, but GA4 flags it as a **bot** and doesn't count it as an active user.
- My main browser sends `traffic_type=internal`, and GA4's internal traffic filter — active, and correctly configured — excludes me **by design**.
- My phone routes through a relay with a Paris IP, and when the relay blocked, the request to `google-analytics.com` never even left.

So: I burned an afternoon debugging a correct system because **all three of my measuring instruments were contaminated**. DebugView with `?debug_mode=1` finally settled it, showing active user = 1 with `user_engagement` — the signature of an actual human.

The lesson stings, which is why I'm writing it down: **validate the instrument before you debug the system.** If your way of measuring is broken, you'll "fix" things that were never wrong.

### Debt merged knowingly

Several times I said, literally, "I've merged it like this — if there's a gap, log it for later". It's a conscious decision and I stand by it, but it needs saying out loud: **logged debt is still debt.** The only difference — and it isn't a small one — is that this debt has a Jira number and specs.

### Sunday's recap

I didn't write it. Spain were playing the final. Priorities.

## Takeaways

1. **Once the process is standardized, volume stops being the problem.** 62 PRs didn't come from typing faster, they came from not deciding the same thing twice.
2. **Logging the gap instead of fixing it is what keeps PRs small.** It takes discipline, because fixing it *right there* always looks cheaper than it is.
3. **Use the expensive model to think and the cheap one to type.** The value is in the spec, not the typing.
4. **Validate the instrument before the system.**
5. And the underlying one: a written plan takes the decision off your shoulders on the day you don't feel like deciding. It works for winning a World Cup, for dropping body fat, and for merging 62 PRs without leaving a swamp behind.

## What's next

**Design System v2** is already moving (FOR-162 and its children FOR-163 to FOR-168): reconciling design tokens with the mockup templates, aligning shared components, a full-height sidebar and a floating mobile navigation bar. And UI stories FOR-143 to FOR-161 still need finishing.

Forma already stands on its own in production, with real data and a connected scale. Now it needs to look the part.

Come on, champions. 🏆
