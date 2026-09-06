---
title: "My test measured the box, not the letters"
date: "2026-09-06"
description: "Week of 31 August to 6 September: a holiday week with only enough time to look. Looking turned up three bugs that had CI green — a clipped headline, a consent banner that didn't consent, and a button sitting on top of three others."
tags: ["weekly", "forma", "testing", "playwright", "css", "analytics", "claude-code", "ai-agents"]
thumb: "/blog/my-test-measured-the-box-not-the-letters-thumb.webp"
cover: "/blog/my-test-measured-the-box-not-the-letters-cover.webp"
ogImage: "/blog/my-test-measured-the-box-not-the-letters-og.jpg"
---

## Where the week started

Nowhere, honestly. I spent this week on holiday with my family at Disneyland
Paris, and that was exactly the plan: don't touch a keyboard. Nine prompts all
week, four sessions, three working windows, all of them squeezed into the
weekend. Next to the twenty-PR weeks, this is background noise.

And it still taught me more than most weeks this year. Precisely because there
was no time to build anything. There was only time to **look**.

Here's what happened. I opened one of my sites on a monitor I don't normally
use, and it was broken. Meanwhile Hermes — the agent that operates my
infrastructure — had spent the weekend instrumenting analytics across all four
products, and had run into two more broken things. Three bugs, three different
projects, three different days.

All three had CI green.

## The headline read "Entrenam"

On Sunday morning I opened Forma's landing page on a 1080x1920 monitor stood on
its side. It is a perfectly ordinary monitor — anyone who writes code has one
in portrait next to the main one — and the page was wrecked. The headline,
which reads "Entrenamiento y nutrición con la compra ya hecha", came out as
**"Entrenam"**.

No scrollbar. No console warning. Not a single error in any log. The word
simply stopped.

The diagnosis is a chain of reasonable decisions that end in disaster. The hero
lays out in two columns above a 1025px breakpoint. A 1080px-wide monitor
**clears** that breakpoint, so as far as the CSS is concerned this is "desktop".
The right column is sized for the muscle-map drawing — two silhouettes side by
side need about 32rem before they stop being figures and start being thumbnails
— and the copy gets whatever is left. What's left at 1080px is about 440px. And
"Entrenamiento" at that size is about 512px of unbreakable Montserrat 900, with
nowhere to hyphenate.

The container clips horizontal overflow. So it didn't overflow. It got shaved.

Here's the uncomfortable part. Forma has an end-to-end suite with a helper
called `expectNoHorizontalOverflow` that exists **precisely to catch this**. It
was green. And it wasn't badly written: it could not see this, and it never
will.

The `h1`'s block box stops obediently where its column ends. It's the glyphs
inside that keep going. If you measure the block against the viewport
everything checks out, because the block genuinely does fit. The failure lives
at a level that measurement never reaches.

## The other two

While I was queuing for a ride, Hermes was turning analytics across all four
products into something that could tell **interest from outcome**: stop counting
page views and start knowing whether a visit produced anything. A CTA click, an
article genuinely read, an outbound click — those are interest. A completed
sign-up or a finished analysis is an outcome. The taxonomy has to preserve that
difference.

That work turned up the other two bugs, and they are the same bug.

On my portfolio, the implementation passed seven tests and compiled all four
pages. But validating in the deployed browser showed that **Google Tag Manager
was loading before the visitor had decided anything**. The event handlers
checked consent correctly — that's what the tests verified — but the SDK was
already inside the page, and Google was reporting `analytics_storage` as
implicit consent. The suite checked that events respected the user's decision.
Nobody checked which scripts had loaded before there was a decision.

On TokenMeter, the suite passed **258 tests**. And after deploying, a screenshot
showed the floating "Analytics settings" button sitting on top of the Sponsor,
Buy me a coffee and GitHub buttons. All 258 tests verified that the dialog
opened, closed, persisted the decision and sent no personal data. Not one of
them knew where the button ended up in the final layout.

Three bugs. The exact same shape: **green in CI, broken on screen, found by
somebody looking.**

## How they got fixed

In Forma, two decisions. The two-column breakpoint moves from 1025 to 1280,
which is the first width where the copy column clears "Entrenamiento" with real
room to spare — 22% of margin, not the three pixels that survived at 1200.
Below it the hero stacks, which is exactly what an iPad already got, and a far
better trade than two columns neither of which fits.

Important: **I did not move the whole `@media` block up.** Inside that 1025px
block there were section-typography rules that don't depend on the column split
and were perfectly fine where they were. Only the three rules that actually
depended on the grid moved. Moving a whole block because one rule inside it is
wrong is the fastest way to fix one bug by creating three.

Second decision: stacking hands the muscle-map card the full width of the page,
and the silhouette is 854x1840. Every pixel of card width buys more than two of
card height. Uncapped, at 1080px that's a nearly 1200px illustration under
450px of copy — two and a half times the copy — and the drawing stops
illustrating the argument and becomes the page. Capped at 34rem, and centred.

![Forma's landing page on a 1080x1920 portrait monitor, now fixed: the hero stacks, the headline reads in full, and the muscle-map card sits underneath with its width capped.](/img/forma-2026-09-06-hero-vertical.webp)

On the portfolio, the fix wasn't adding another check: it was **moving the block
to the load point**. The `noscript` iframe was removed, GTM is prevented from
loading before an explicit acceptance, a bilingual banner and a permanent
privacy control in the footer were added, and `_ga` cookies are deleted when
consent is withdrawn. The suite finished at 12 of 12.

![The portfolio's consent banner, stating explicitly that Google Tag Manager is not loaded until the visitor accepts.](/img/diegobarrioh-2026-09-06-consentimiento.webp)

On TokenMeter, the dialog's state was lifted up to the `AppShell` and the
floating control became a `Privacy` button inside the footer's Support row,
aligned with the other three. And a test was added that prevents `fixed`
positioning from being reintroduced there, because a bug that has already
bitten you once deserves a guardrail.

![TokenMeter's footer Support row, with Sponsor, Buy me a coffee, GitHub and Privacy aligned and not overlapping.](/img/tokenmeter-2026-09-06-privacy-footer.webp)

## The test that does see it

This is the part I'm keeping, and I think it's useful to anyone writing layout
tests.

The new test doesn't measure the headline against the viewport. It measures
where **the glyphs actually reach**, with `Range.getClientRects()`, and compares
that against the heading's own content box:

```ts
const measured = await title.evaluate((heading) => {
  const range = document.createRange();
  range.selectNodeContents(heading);
  const widest = Math.max(...[...range.getClientRects()].map((line) => line.right));
  const style = getComputedStyle(heading);
  const box = heading.getBoundingClientRect();
  return { widest, columnRight: box.right - parseFloat(style.paddingRight) };
});
```

Two details that matter more than the code.

First: it measures **against the column, not the viewport**. At this width the
column is the constraint that actually bites, and measuring against the
viewport is answering the wrong question correctly.

Second: the failure message says literally how many pixels the headline reaches
and where the column ends. An `expect(true).toBe(false)` is no use to anyone at
eleven at night.

And the viewport has a name and a comment in the file, because in six months
nobody is going to remember why such an odd size exists:

```ts
const PORTRAIT = { width: 1080, height: 1920 };
```

It's the width where "desktop layout" and "desktop room" stop being the same
thing.

## What I'm taking away

**A green test proves the module's contract, not the result on screen.** This
isn't an argument against tests: it's an argument about what each one measures.
`expectNoHorizontalOverflow` measured blocks against the viewport, and that's a
correct question with a correct answer. It just wasn't the question that
mattered.

**Breakpoints are a hypothesis about other people's hardware, not a truth.**
1025px assumed that "wider than a tablet" means "desktop room". A monitor stood
on its side breaks that assumption without being exotic at all.

**When you correct a breakpoint, move the rules that depend on it, not the whole
block.** That's the difference between fixing a bug and creating three.

**Consent can't be a condition inside the function that sends the event** while
the SDK is already loaded. The block has to happen at the load point, and it
can only be verified in a real browser.

**Don't invent capabilities the backend doesn't have.** TokenMeter still can't
tell whether an analysis came from cache or joined an existing job, so that
parameter can only be `new`. The taxonomy allows the other values, but you widen
the contract first and measure second. Same with this blog's subscriptions: no
fake sign-up event was created, because there is no form to sign up to yet.

## What's next

The new events need real traffic and several days of processing before the
reports mean anything, so next week is about watching the
interest → start → outcome sequence and adjusting the daily analysis to use
conversions instead of page views. There's also widening TokenMeter's backend
contract, and updating this blog's vulnerable dependencies in a PR of their own,
not mixed with anything editorial.

And getting back to normal pace. Forma got no further than a hero this week.

## The week in numbers

| Metric | Value |
|---|---|
| PRs merged | 8 (Forma #268 · blog #35 · portfolio #11, #12 · TokenMeter #73, #74, #75 · akadem.ia #146) |
| Lines | +1,601 / −113 |
| Production deploys | 5 (the four instrumented products + Forma's autonomous convergence) |
| Flyway migrations | 0 |
| My sessions | 4 sessions · 3 five-hour windows · 9 prompts |
| Claude Code weekly window | Not exhausted (holiday) |
| Hermes sessions | 9 sessions · 29 prompts · 601 tool calls |
| Hermes tokens | ~1.97M in · 108,613 out |
| Suites verified | 406 akadem.ia · 258 TokenMeter · 12 portfolio · 4 blog · +2 e2e in Forma |
| GA4 properties instrumented | 4, with key events and custom dimensions |
| Near-misses | 1 (accidental `npm run format` in TokenMeter: 57 files restored before the commit) |
| Skills used | `branch-pr`, `work-unit-commits`, `recap` |

> <small>Screenshots are taken from the preproduction deploys, hence the PREPRO
> marker in the headers. They are the real state of each site after this week's
> merges, not mockups.</small>
