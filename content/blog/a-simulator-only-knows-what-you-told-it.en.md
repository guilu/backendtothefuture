---
title: "A simulator only knows what you told it"
date: "2026-10-18"
description: "October 12 to 18. Skynet learned to work with Claude, Codex and Gemini, and every stand-in we used to avoid touching reality (a simulator, a percentage, a green CI) told the truth about what it knew and nothing about the rest."
tags: ["weekly", "ai-agents", "skynet", "testing", "multi-provider", "human-in-the-loop", "ci", "aws"]
thumb: "/blog/a-simulator-only-knows-what-you-told-it-thumb.webp"
cover: "/blog/a-simulator-only-knows-what-you-told-it-cover.webp"
ogImage: "/blog/a-simulator-only-knows-what-you-told-it-og.jpg"
---

## What we set out to do

**Skynet** is the orchestrator Diego is building so that several coding
agents can plan, implement, review and validate software changes on their
own. Until last Sunday it could only talk to one of them: Claude Code.
Workflows ran phases, but a phase was little more than a command that
finishes.

This week had three fronts. First, letting Skynet launch **Codex** and
**Gemini** agents as well as Claude, without the rest of the system having to
know which one it was using. Second, making workflows look like a real
process: phases that pass data to each other, get verified separately, stop
to wait for a person's approval, retry without losing why they failed, and
show up as a graph. The third arrived on Saturday, halfway through: a page
showing how much headroom is left in each CLI's quota and how much each run
ate.

The work cycle was the one you already know. Claude writes the PR from Claude
Desktop, Hermes deploys it on the test machine and runs its acceptance guide,
and Diego decides whether it gets merged. Twenty-five times.

## The problems we ran into

### The simulator that had never seen the real program

To test Skynet without spending tokens there is `fake-claude`, an executable
that replays recorded Claude Code sessions. Codex needed the same thing, but
there was a catch: there were no real Codex sessions to record. So
`fake-codex` was written by hand, by reading the CLI's source code and
imitating its events.

The tests passed. On Monday night Diego tried the real Codex and found what
the simulator could not: if you launched an agent, sent it a message and then
**forked** the session, the new branch lost the agent's configuration. No
model, no permission mode, no output format.

The uncomfortable part came next. The bug was in Claude Code too, and had
been for days. It went unnoticed there because Claude used a global model
that papered over the gap. The simulator had done exactly what we asked of
it. What we hadn't asked, it didn't know.

### Three agents that aren't the same

A common interface for several providers comes with a temptation: pretending
they all do the same thing. They don't. Claude Code resumes and forks
sessions. Codex has its own event format. Gemini can't fork (it answers with
an error) and can't return structured output.

The alternative to pretending was more work: each provider declares what it
can do, the web disables and explains what it can't, and the runner compensates where it
can. Gemini, for instance, is asked for the JSON inside the prompt, and
Skynet validates it before accepting it.

### Implemented, merged and unusable

On Saturday, while planning the quota page, some news showed up that nobody
expected: Google had closed Gemini CLI to personal accounts in June and
replaced it with a different tool, Antigravity. The Gemini provider merged on
Tuesday works. It passes its tests. And it is useless for Diego's account.

### The numbers nobody gives you

The usage page had a simple idea: show how many tokens are left in each
CLI's five-hour window and in its weekly one. It turned out that none of the
three gives that figure. They give a **percentage** used and a reset time.
Claude Code, on top of that, only reports its quota inside the output of an
agent that is running.

It would have been easy to invent an equivalence ("40% is roughly this many
tokens"). It would have looked good on a chart. It would have been a lie.

And on Sunday, when testing the page, the Claude card didn't show up: no
agent had run on the test machine since the deploy, so there was no sample.
Looking into it turned up something else: that machine's runner still had
Codex pointing at `fake-codex`. The simulator, once again, passing itself off
as the real thing without anybody noticing.

### Arrows that only vanished in CI

The graph of a run lost its arrows every time a new event arrived. Locally,
never. In CI, always. The graph library measured each box's position in the
browser to know where to attach the arrows, and in the CI environment that
measurement arrived late.

### Seventeen minutes to move a column

On Sunday, a one-line CSS change to make three cards fill the full width set
off the usual: seventeen minutes of CI, the webhook, a redeploy of containers
and runners, and Hermes's full guide. Diego asked the question anyone would:
isn't there a way to make small changes without the whole protocol?

## How we solved it

Forking stopped inheriting the configuration of the last run and now always
reads it from the agent's definition. Before fixing it, a test was written
that repeats the exact sequence: launch, message, fork, message to the
branch. Then everything was tried again with real Claude Code and Codex, in
a throwaway repository. Since then the rule is explicit: the simulator is
there to make tests deterministic; final acceptance happens against the real
executable.

Gemini got its own milestone reserved for Antigravity. Until then, on the
usage page, Antigravity is only used to read quotas.

The usage page shows what the CLIs give, a percentage and a reset time, and
next to it the tokens and cost Skynet can actually attribute to each agent
and each run. Not one invented figure. Provider cards always show up, with an
honest "No data" until the first reading. And recording the real quotas took
a second attempt, because on Diego's machine the `grep` in the first command
was an alias for a different tool.

The graph's arrows stopped depending on a measurement: each box now brings
its connection points already computed. The test that reproduces the bug was
written first and failed before the fix.

The seventeen minutes got the least flashy answer. Three ways to shorten the
cycle were proposed, and Diego decided not to touch anything yet. A CSS
change doesn't need full acceptance; a migration change does. Telling one
from the other is exactly the kind of judgement you don't want to hand to a
shortcut improvised on a Sunday. Measure first.

With all that, Skynet ended the week with:

- **interchangeable providers**: Claude, Codex and Gemini, each with its
  capabilities declared and the web saying what each one can do;
- **phases that pass data** and verifications that run separately from what
  the agent says it did;
- **approval gates**: a run moves on its own until a person is needed, who
  can approve or request changes, and an approvals centre that gathers it
  all;
- **retries, timeouts and cancellation**, keeping the reason for the first
  failure;
- **graphs** of the workflow and of each run, with lanes;
- the **usage page**, and two more redesigns: the dashboard and a run's
  detail view in two panels.

![Run SKY-10 "Con Gemini", completed. Chips: workflow "Con Gemini v1", runner omarchy, provider Gemini CLI, model gemini-2.5-pro and the branch. The "Bifurcar…" (fork) button is disabled, and underneath it reads "Gemini CLI no permite bifurcar una sesión" (Gemini CLI can't fork a session). Metrics: 17 s, 24,620 tokens, US$0.0444 and no quota data. Below, the progress graph with two completed phases, fix and review](/img/skynet-2026-10-18-gemini.webp)

*A run with Gemini. Skynet doesn't pretend every agent is the same: the
fork button is there, but disabled, and it says why.*

![Run SKY-9 "Lanzo Revisar y arreglar" in the new view. Header with status, chips for workflow, runner, Claude Code, model and branch, and a note that the worktree was deleted. Four cards: 2 min 41 s duration, 13,341 tokens, US$1.1337 and quota. Below, "Progreso" in graph mode: completed review leads to limpio and to fix, which shows with a dashed border as skipped; limpio leads to final, completed](/img/skynet-2026-10-18-ejecucion.webp)

*A run's graph. The `fix` phase is skipped because the review found nothing
blocking, and the arrows no longer vanish with every event.*

![The "Uso de los CLIs" page. At the top: Codex is at 23% of its 5-hour window, which resets at 20:26. Three cards. Claude Code, version "2.1.0 (fake-claude)", with the 5-hour and weekly windows at 0% and a note that the data is 6 h 7 min old and may be stale. Codex, "codex-cli 0.50.0 (fake-codex) · plan Plus", at 23% of the 5-hour window and 13% of the weekly one, with the Skynet share and the outside share split. Antigravity CLI, read-only, with its Claude/GPT and Gemini models listed separately](/img/skynet-2026-10-18-uso.webp)

*The Usage page on the test machine. Look at the versions: "fake-claude" and
"fake-codex". This is the runner Hermes uses to accept PRs, and the
simulators are still there passing themselves off as the real CLIs. The
percentages, though, are the ones the CLIs report; not one invented
token.*

#### The one technical fragment in this post

The fork bug has a shape that repeats in many systems with sessions. When a
run is born from another one (resume, retry, fork), there are two places to
take its configuration from:

- **the previous run**, which is convenient because it's already at hand;
- **the definition** (in Skynet, the agent declared in the workflow's YAML).

The first option looks equivalent and isn't. The previous run carries what
was used, not what was asked for. If at some point a value got filled in
with a global default, or changed for a one-off reason, the copy drags it
along and the branch inherits an accident. In Claude Code the global model
covered the gap; in Codex, which has no such default, the branch was left
without a model.

The rule that came out of it: **whatever defines behaviour is always
resolved from the definition; from the previous run you only inherit state**
(the session, the working directory, the history). And the test doesn't
check "forking works": it repeats the sequence that broke it, step by step,
and looks at the branch's configuration at the end.

## Meanwhile, Hermes

Hermes was the acceptance layer all week, and several times it said what CI
didn't: Java, web, Docker, Playwright and SonarCloud green, and the web's
local suite red. It answered "deployed, but not accepted" and merged nothing.

On Sunday it also set up its access to an old AWS account. The first login
went in as **root**. It would have worked. Hermes deleted those credentials
on the spot and created an identity of its own, with operator permissions,
no power over users or permissions, and four-hour sessions. No permanent
keys. Same lesson, different clothes: something working doesn't mean it's
what you wanted.

## What didn't go well

- **The Gemini provider shipped and is useless** for Diego's account. We
  found out four days later, while planning something else.
- **The fork bug had been in Claude Code for days**, hidden behind a default
  value.
- **The Codex quota query was first tested only against the simulator.**
  Diego validated it with the real CLI before it was merged.
- **A command broken by a shell alias**, and a message linking to the wrong
  PR.
- **The five-hour limit ran out on Sunday** halfway through the run-detail
  redesign: almost an hour and a half stopped.
- **A CSS change still costs seventeen minutes** and a full redeploy.

## What I take away

This week we used plenty of stand-ins to avoid touching reality: a simulator
instead of the CLI, a percentage instead of tokens, a green CI instead of an
acceptance, an implemented provider instead of a usable one. None of them
lied. Each one told the truth about what it knew, and nothing about the rest.

A simulator only knows what you told it. The valuable thing isn't having
fewer stand-ins, since they are what lets you go fast, but knowing at which
point along the way you have to let go of them and look at the real system.
And when the real system won't give you a number, showing that gap instead
of filling it in.

Next week: settle Gemini with a real Antigravity provider or switch it off
explicitly where it doesn't work, watch the usage page with real data from
the three CLIs and with concurrent runs, and start classifying changes by
risk in the acceptance pipeline without taking away the full path before
merging.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">5-hour windows per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>W</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">16 windows across 11 Claude Desktop sessions (2 from the previous Sunday) · Sunday 11, 10:35 → Sunday 18, 15:13 · no day without activity · the weekly quota reached 82% with a warning before Saturday's 22:00 reset, without running out · the 5-hour limit was hit on Sunday between 08:30 and 13:30</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">25</span>
  <span class="ws-note">All in Skynet, #71 to #117 · 70 cumulative · none open at the close</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines</span>
  <span class="ws-v">+32,031 / −2,217</span>
  <span class="ws-meter"><i class="ws-add" style="width:94%"></i><i class="ws-del" style="width:6%"></i></span>
  <span class="ws-note">Summed PR by PR · the net diff of <code>main</code> touches 337 files</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V15 → V25</span>
  <span class="ws-note">11 new: structured output, providers, verification, approvals, retries, timeouts and quotas</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones closed</span>
  <span class="ws-v">23</span>
  <span class="ws-note">W3, UI-I → UI-K, PV-A → PV-D, W4 → W7 and CU-A → CU-C · 24 issues closed</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts in Claude Desktop</span>
  <span class="ws-v">49</span>
  <span class="ws-note">3.1 per 5-hour window · zero working sessions in Claude Code</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Messages to Hermes</span>
  <span class="ws-v">164</span>
  <span class="ws-note">96 sessions (47 webhook, 40 cron) and 2,721 tool calls</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">API-equivalent cost</span>
  <span class="ws-v">≈$254</span>
  <span class="ws-note">Estimated from token usage, within the subscription and with no overage</span>
</div>

</div>

<blockquote><small>The screenshots come from Skynet's private deployment on
the test machine, on Sunday the 18th in the afternoon, after the week's last
PR was merged, with the real data from the tests.</small></blockquote>
