---
title: "Building an orchestrator that doesn't trust its agents"
date: "2026-10-11"
description: "October 5 to 11. Skynet, the coding-agent orchestrator, closed its first phase, got a brand-new interface and started running workflows, and every verification layer caught something the previous one had waved through: CI included."
tags: ["weekly", "ai-agents", "skynet", "verification", "ci", "ui-design", "workflows", "postgresql"]
thumb: "/blog/building-an-orchestrator-that-doesnt-trust-its-agents-thumb.webp"
cover: "/blog/building-an-orchestrator-that-doesnt-trust-its-agents-cover.webp"
ogImage: "/blog/building-an-orchestrator-that-doesnt-trust-its-agents-og.jpg"
---

## What we set out to do

Last week **Skynet** was born: the orchestrator Diego is building so that
several coding agents can plan, implement, review and validate software
changes on their own, with a person supervising rather than typing. It ended
the week with its foundations on `main` and an agent waiting in a queue for a
runner that didn't exist yet.

This week had one clear goal: close the first phase. Get the runner to execute
real agents, make them resumable, retryable and forkable, have every run leave
evidence of what it did, and put all of it behind a login. What wasn't in the
plan arrived mid-week: Diego decided that, before adding anything else, the
whole interface had to be rebuilt. And on Saturday, with all of that closed,
the second phase began: workflows defined in YAML that Skynet runs step by
step.

There was one more change, less visible and more important. Everything was
built from Claude Desktop, in working threads, and Hermes, the agent that runs
the home infrastructure, started deploying and testing every pull request on
its own. The week's loop became: Claude writes and opens the PR, Hermes
deploys it and runs its test guide, Diego tries it locally and says "all good,
merge and keep going". That phrase showed up more than thirty times.

## The problems we ran into

### Three bugs under a green CI

On Tuesday, before merging the PR that taught the runner to fork sessions,
Claude gave its own code one last review. CI was green and nobody had left a
comment. Three bugs turned up anyway: files that weren't UTF-8 text got
corrupted when copied into the forked branch, symbolic links were followed
outside the repository, and a fork that failed halfway left an orphaned branch
and working directory behind.

The test suite would have caught none of them, because none of those cases
were in it. Green said that what had been tested worked. It said nothing about
what hadn't.

### A runner that said "yes" to everything

That same morning Diego tried resuming a session locally and the new reply
never arrived. The agent sat at "Starting" forever. It was Diego who found
the cause: the runner that was running was the previous binary, built before
resuming existed.

Rebuilding fixed it, but the unsettling part was something else. The old
runner had received an order it didn't understand and had **acknowledged**
it. No error, no rejection: a "received" and a hung agent. A system that
accepts something it can't do is worse than one that fails, because at least
a failure is visible.

### A redesign nobody had asked for

On Thursday, with the first phase closed, Diego stopped before starting on
workflows. The interface worked, but it was the classic internal tool: grey,
dense and hard to read at a glance. Claude studied nineteen agentic workflow
tools (Temporal, Prefect, n8n, Langfuse, Dify…) and, since their websites
were blocked from the environment, drew its conclusions from their source
code. The recommendation was what nearly all of them use: shadcn/ui.

Diego turned it down as too standard. The brief was something with personality: a
visual language inspired by gamified learning apps, with very rounded
corners, buttons that feel physical, short firm shadows and every state
conveyed at once through colour, icon and text. The mockup landed on the
first try. The hard part came after: rebuilding every screen without breaking
anything that already worked, in eight deliveries over two days.

### The engine that waited on itself

On Saturday the first version of the workflow engine failed in CI with
something you don't see in a Postgres log every day: deadlocks. The engine
decided which stage came next inside the same transaction that recorded the
state change, and that decision waited on a run that a worker had locked.

Last week, assigning the event sequence under a lock held until commit was
what guaranteed a gap-free timeline. This week showed the price: if a
transaction does too much while holding that lock, it ends up waiting on
whoever is waiting on it.

### An editor you couldn't touch

On Sunday morning, before approving command nodes, Diego tried the workflow
editor from an iPhone. Selecting text, copying and pasting were all impossible. Monaco, the
VS Code editor Skynet uses on the web, doesn't support touch screens and
swallows the taps. No test would have found it, because no test runs in
mobile Safari with a finger.

### Green that wasn't acceptance

And the last one. The conditional-nodes PR ended the week with its five
GitHub checks green: Java, Vite, Playwright, Docker Compose and SonarCloud.
Hermes deployed it, ran its test guide and found that a web test couldn't
locate a link that should have been there. 130 out of 131.

CI said the PR was ready. It wasn't.

## How we solved it

The three fork bugs were fixed with one test each before merging. The runner
that acknowledged what it didn't understand became a rule: an agent that
misses two heartbeats moves to "Failed", and the command that brings Skynet up
always rebuilds the runner from the same revision as the API.

The first phase closed with the thing that makes it useful: the runner uploads
the prompt, logs, commits and diff of every invocation, and runs
verifications on its own. The web tells apart what the agent **says** it did
from what the system **has checked**. To test all of that without spending
tokens there is `fake-claude`, an executable that replays recorded Claude Code
sessions (success, cancellation, budget exceeded, permission denied) and can
even edit files and make real commits.

The new interface shipped in full: navigation, dashboard, a three-panel run
view (steps, activity and inspector) resizable from the keyboard,
customisable colours with a contrast check, archiving and deleting without
losing history, and the visual identity Diego designed for Skynet.

![Skynet dashboard in dark theme with the new interface. On the left, navigation with Dashboard, Projects, Workflows, Runs, Runners, Activity and Settings, and "1 runner online" at the bottom. At the top, a green strip: "Nothing needs attention right now". Below, metrics for the last 7 days in rounded cards: 0 active, 0 failed, US$1.7861 cost, 12 s median duration, 13 runs, 9 completed, 4 cancelled. At the bottom, a bar chart of runs per day from 4 to 11 October. The interface is in Spanish](/img/skynet-2026-10-11-dashboard.webp)

*The dashboard in the new visual language: cards with depth, states shown by
colour, icon and text, and the first thing you read is whether anything needs
attention.*

![Run SKY-9 "Lanzo Revisar y arreglar", completed. The header shows the "Revisar y arreglar v1" workflow, the omarchy runner, the claude-opus-5-5 model and the branch, with Retry, Fork and Delete worktree buttons. Below, 2 min 41 s duration, 13,341 tokens and US$1.1337. Under "Progress", four stages joined by lines: review completed in 2 min 40 s, fix skipped (dashed line), limpio and final completed. The conversation and inspector panels begin below](/img/skynet-2026-10-11-ejecucion.webp)

*A run of a four-stage workflow, launched while Hermes was testing the
still-unmerged conditions PR. The `fix` stage is skipped because the review
found nothing blocking, and Skynet shows it as a skip, not a failure.*

![Settings screen. At the top, six palettes to choose from: Skynet (selected), Bosque, Laguna, Mandarina, Frambuesa and Grafito. On the left, the six editable colours and what each is for: accent, success, warning, failure, in progress and waiting, each with its hex code. On the right, a light and dark preview with "Launch agent", "Approve" and "Delete" buttons, status pills and a diff](/img/skynet-2026-10-11-colores.webp)

*Colours are picked per role and everything else is derived, in both themes,
checking that text always reaches AA contrast.*

The engine stopped deciding the next stage inside the state-change
transaction: the worker does it now, after commit, and the deadlock went
away. With that came versioned workflows (draft and published), nodes that
run commands, and parallel stages, each in its own working directory. On
mobile, the YAML editor swaps Monaco for a native text field with the same
validation.

![YAML editor for a "revisar-y-arreglar" workflow: a reviewer agent that returns a boolean hasBlockingFindings and four stages, review, fix (with the condition review.hasBlockingFindings), limpio (type conditional) and final (type command, runs "echo terminado"). On the right, the "Problems" panel with one error, "unknown key output" on line 6, and two yellow notices saying that condition and the conditional type don't run yet and arrive in W3. Below, "What it defines", listing each stage, its type and what it depends on](/img/skynet-2026-10-11-workflow.webp)

*The workflow editor on Sunday's deployment. Look at the yellow notices: the
merged version can't run conditions yet, and the editor says so instead of
pretending it can.*

The conditions PR is still open. It doesn't count as shipped.

#### The one technical deep-dive in this post

Hermes doesn't test PRs from a list of steps someone maintains on the side.
**The PR carries its own acceptance test.** Since Wednesday every PR is titled
with its milestone (`M6-B - Name`) and adds or edits a
`docs/tests/probar-m6b.md` file with the guide to validate it. When GitHub
reports a PR opened or updated, Hermes checks a contract before touching
anything:

- the PR is open, against `main` and not a draft;
- the working directory is clean;
- the SHA is exact, and it's the one being deployed;
- the milestone matches the title;
- and the PR adds or edits its own `probar-*.md`.

Only then does it rebuild the containers, rebuild the runner from that same
revision, run the guide and send the result over Telegram. A passing build is
not acceptance; the guide is the acceptance.

Just as important is what the webhook **can't** do. It doesn't run
`git reset --hard` or clean a dirty working directory: if it finds changes, it
stops and lists the paths. When a guide asked for something destructive or
tripped the approval policy, Hermes didn't look for a way around it: it
deployed what it could verify, marked acceptance as incomplete and released
the queue. Automation is useful because of how well it's fenced in, not
because of how much it can do.

## What didn't go well

- **Conditional nodes didn't ship.** Green CI, red acceptance.
- **SonarCloud was unreachable from Claude Desktop.** Three times Diego had to
  send screenshots, and once Claude changed code for a warning it couldn't
  see and guessed wrong.
- **The GitHub milestones didn't exist.** Issues had been linked for days as
  if they did, until Diego spotted a PR without its milestone.
- **The webhook aborted several times for no real reason**, on actions that
  tripped approval or an E2E reaching for the wrong Postgres.
- **The weekly quota hit 98 %** before resetting on Saturday night. It didn't
  run out, but nothing was left over.

## What I'm taking away

**Every verification layer caught something the previous one had waved
through.** Self-review found bugs under a green CI. Diego's testing found a
stale binary and an editor you couldn't touch. Hermes's acceptance found a
regression with all five checks green.

A green check is a claim, just like an agent saying "I'm done". Neither is a
lie, but neither is proof. Skynet exists precisely so it doesn't believe
either without evidence, and this week it started applying that rule to
itself.

Next week: fix conditions and close the W3 nodes, prepare the milestone that
lets workflows use Codex or Gemini as well as Claude, and cut the webhook's
false aborts without loosening a single one of its limits.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">5-hour windows per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>W</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:4"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">20 windows across 10 Claude Desktop sessions · Monday 08:46 → Sunday 08:56 · no idle days · the weekly quota reached 98 % before Saturday's 22:00 reset, without running out</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">35</span>
  <span class="ws-note">All in Skynet, #16 to #70 · 42 to date · #71 still open</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines</span>
  <span class="ws-v">+50,844 / −4,787</span>
  <span class="ws-meter"><i class="ws-add" style="width:91%"></i><i class="ws-del" style="width:9%"></i></span>
  <span class="ws-note">Summed per PR · the net diff on <code>main</code> touches 429 files</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V4 → V14</span>
  <span class="ws-note">11 new: projections, sessions, artifacts, policies, archiving, workflows and parallel stages</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones closed</span>
  <span class="ws-v">11</span>
  <span class="ws-note">Phase 1 complete, UI-A → UI-H, archiving and W1–W2 · 24 issues closed</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts in Claude Desktop</span>
  <span class="ws-v">79</span>
  <span class="ws-note">4.0 per 5-hour window · zero Claude Code sessions</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Prompts to Hermes</span>
  <span class="ws-v">130</span>
  <span class="ws-note">84 sessions (each webhook event opens one) and 2,564 tool calls</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">API-equivalent cost</span>
  <span class="ws-v">≈$325</span>
  <span class="ws-note">Estimated from token usage, within the subscription, no overage · 43 % in the Phase 1 thread</span>
</div>

</div>

<blockquote><small>Screenshots are from Skynet's private deployment on Sunday
the 11th in the morning, with the real data from the week's testing.</small></blockquote>
