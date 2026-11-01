---
title: "Skynet is becoming an AI factory"
date: "2026-11-01"
description: "Week of October 26 to November 1. Skynet, our agent orchestrator, took its first step towards becoming an AI factory. It learned to carry a change all the way: push the branch, open the PR, wait for CI, fix it and merge. Along the way we found out how many tests were passing on whatever the previous one left behind."
tags: ["weekly", "ai-agents", "skynet", "ai-factory", "github", "ci", "outbox", "telegram", "postgresql"]
thumb: "/blog/skynet-is-becoming-an-ai-factory-thumb.webp"
cover: "/blog/skynet-is-becoming-an-ai-factory-cover.webp"
ogImage: "/blog/skynet-is-becoming-an-ai-factory-og.jpg"
---

## What we set out to do

**Skynet** is the orchestrator where several coding agents (Claude Code,
Codex and Antigravity) plan, implement, review and validate changes on
their own. Last Sunday it already remembered what it did and had a mascot
telling you what it was up to. But its work ended in an odd place: a
branch in a folder on the test machine. For that change to go anywhere,
someone had to push it, open the PR, watch CI and merge.

On Tuesday, Diego asked for deep research into what people are calling
**AI Factories**: auditable, repeatable agent workflows that ship features
end to end, with human approvals where they matter. He cited a Stripe
system called *Orbit* as the reference. The research couldn't find it: no
such thing exists under that name, and what does exist is Stripe's
*Minions*. With the premise corrected, out came a roadmap of fourteen
milestones in five stages. It was approved on Thursday night, and the
starting point chosen:

- give Skynet **its own identity on GitHub**, no personal tokens;
- teach it to **deliver**: push the branch, open the PR, wait for CI, fix
  it if it fails and merge once the gate allows;
- and, in parallel, let Diego **give it orders from his phone**, talking to
  ChatGPT, through a GitHub issue.

Before that, the week opened by wrapping up the visual side: a screenshot
generator for the whole app, version 3 of **Skyny** (the mascot has a name
now), the new app icon and each provider's logo on the usage screen.

The loop was the usual one: Claude writes the PR in its cloud sessions,
Hermes deploys it to the test machine and runs its acceptance guide, and
Diego decides whether it merges. With one change: small, all-green PRs
that Hermes asks to merge no longer wait for Diego.

## The problems we ran into

### A test that passed by accident

The first delivery phase, pushing the branch and opening the PR, failed
Hermes's acceptance. The guide checked that the agent had written `a + b`
into a `calc.py`, and it wasn't there. Nothing was wrong with Skynet's
code: the workspace the test used was the one left over from an earlier
run, and this time it didn't carry the expected change.

In other words, the earlier tests had passed **because someone had left the
ground prepared**. And it wasn't the only assumption of that kind. The
plans for the next two phases mentioned `guilu/demo-repo` on GitHub for the
real test. Halfway through, Diego asked the obvious question: "But does the
guilu/demo-repo repo exist?" It didn't. There was only a local `demo-repo`
on the test machine.

### Runners pretending to be fine

Acceptance runs sometimes spin up simulated runners, so they don't burn
the real agents' quota. Hermes noticed that some survived the test. The
install looked healthy, the panel said "1 runner online", and behind it
there was no real Claude Code, Codex or Antigravity. The next real run
would have met an actor.

### CI that switched operating systems without telling anyone

Midway through the GitHub milestone, the end-to-end tests went red on a PR
and also on `main`, which hadn't changed. GitHub had moved its runners to
Ubuntu 26.04, which Playwright doesn't support yet. Nothing in our code was
broken.

The last phase brought another red that wasn't ours: a database deadlock
between the cleanup the Java tests run at the end and the runner's
heartbeat, which writes quota every few seconds.

### An order that couldn't be retried

Meanwhile, with ChatGPT, Diego set up the channel for launching work from
his phone: a private repository, `skynet-commands`, where an issue labelled
`skynet:run` fires a webhook to Hermes, and Hermes launches the workflow in
Skynet. The first order worked. The bridge rejected the second: the issue
body carried text outside the JSON block that defines the order. The text
was fixed… and nothing happened. Editing an issue doesn't fire the creation
event again.

### Notifying can't be part of the work

The last requirement was getting a Telegram message when an order arrived
and when it finished. The first version sent it inside the webhook request
itself. It worked, but every message stretched the response, and if
Telegram failed, the bridge failed with it. It's the same problem last week
left unsolved: the report that never arrived.

## How we solved it

Identity arrived in three deliveries. Skynet now has a **GitHub App**,
`skynet-guilu`, with installation tokens that last an hour and only work
for the repositories and permissions granted. GitHub's events come in
signed: an invalid signature gets a 401, a repeated delivery is recognised
by its ID and never processed twice, and the endpoint only listens on the
private network.

![GitHub tab in Skynet's Settings. At the top, the GitHub App card with the skynet-guilu app by guilu, its Id, the API https://api.github.com and the last check on 1/11/26 at 9:44, marked Connected. Below, Skynet repositories: demo-repo in the DEMO project and three ENB acceptance projects, forma-repo in FOR and skynet-repo in SKY, all with access "Not on GitHub". At the bottom, Latest deliveries: a check_suite.completed from guilu/skynet received on 31/10/26 at 21:47 and marked Ignored because no Skynet repository is guilu/skynet](/img/skynet-2026-11-01-github.webp)

*The App, connected. And the awkward truth underneath: every Skynet project
still points at a local repository, so the events from its own GitHub repo
are received, verified and ignored.*

Delivery was split into three phases that build on each other: **push and
open the PR**, **wait for CI and fix it** (the agent no longer calls its
task done on push; it reads the checks, interprets the failure and goes
back to work) and **merge only after the gate**. And the local flow, with
no GitHub, still works: it skips those phases and doesn't show a PR card
for a PR that doesn't exist.

For tests, the new rule is that **every scenario prepares and cleans up its
own repository**. A temporary one is created, used during the flow and
deleted at the end. A shared, mutable demo repository turns every
acceptance run into a lottery that depends on the order the previous ones
ran in.

The runners were solved by making them an invariant: every acceptance run
ends by restoring the real runner and **proving it** with API data: a
single runner online, the three real providers, none simulated, and no
fake process still alive. If that doesn't hold, the queue doesn't move.

For CI, the call was not to mix things: a separate six-line PR that pins
`ubuntu-24.04`. A third party's fix doesn't sneak into a feature. The
database deadlock was solved by changing the order in which tables are
emptied.

For orders from the phone, the rule got written down: correcting an order
means **opening a new issue**, not editing the old one. The third order,
with the right format, finished fine.

![Detail of run SKY-3 "E2E test from ChatGPT: get to know the Skynet repository (second attempt)", completed in 9 min 31 s with Antigravity CLI on the omarchy runner, on branch skynet/sky-3. 436,057 tokens, quota at 3% of the 5-hour window and tests green. Below, the progress graph with two completed phases: commands and map](/img/skynet-2026-11-01-chatgpt-run.webp)

*The order that came out of a conversation with ChatGPT: an issue on
GitHub, a webhook to Hermes and Skynet getting to know its own repository.
Second attempt, because the first couldn't be retried by editing.*

And Telegram moved out of the request (below, the one technical snippet in
this post).

On the visual side, the week left a generator that photographs the whole
application on a throwaway database (160 screenshots across desktop and
mobile, light and dark) and that, while at it, uncovered an old bug: a
misplaced comment made the test runner use the user's home folder instead
of its own. Skyny went through several rounds with Diego: the bands on its
head came out upside down, the magnifying glass in "Reviewing" was too
small for the hand holding it, and the seasonal hats covered the speech
bubbles. Now it wears them tilted. This week, a witch's hat.

![Settings › Companion: "Skyny, your companion". Options to show the mascot in the top bar, floating notices and seasonal accessories. A large view of Skyny at rest wearing a witch's hat, with animation buttons: hop, nod, yawn, cover eyes, side-eye and sweating. Below, its twelve states: idle, inactive, waiting, thinking, running, reviewing with a magnifying glass, success, error, needs you, paused, offline and cancelled. At the end, the Halloween, Christmas and summer accessories with their dates](/img/skynet-2026-11-01-companion.webp)

*Skyny v3 with all its states. The hat only shows up between October 24
and November 2.*

![CLI usage screen. Skyny says "Plenty of quota left". Three cards with each provider's logo: Claude Code 2.1.316 at 0%, Codex 0.166.0 with the 5-hour window at 9% and the week at 55%, only 3% of which is Skynet's, and Antigravity CLI 1.4.12 at 0%, with its Claude and GPT models on one side and Gemini on the other](/img/skynet-2026-11-01-uso.webp)

*Usage, now with each provider's logo instead of a letter. The striped bar
is what Diego spent outside Skynet.*

#### The one technical snippet in this post

The Telegram problem is the problem of any external effect hanging off a
transaction: **if the notification is part of the work, a failed
notification is a failed piece of work**. And if retrying the notification
also retries the work, the workflow launches twice.

The way out is a durable *outbox*, and the bridge implements it on SQLite:

- **persist before notifying**: receiving the webhook validates the order,
  stores its decision and enqueues the message in the same transaction. It
  answers straight away, without talking to Telegram;
- **a separate worker claims and delivers**: with a *lease* that expires if
  the worker dies and a claim token that stops two of them sending at once;
- **the final state and its notification are written together**: so a
  restart between "finished" and "notified" can't lose the message;
- **retrying the notification never relaunches the work**.

The adversarial review added what usually gets forgotten: escaping HTML,
staying under Telegram's 4,096-character message limit, keeping tokens out
of the logs and not leaving zombie processes in the *healthcheck*. Telegram
can be down for an hour; Skynet won't notice.

## Meanwhile, Hermes

Besides accepting every PR, Hermes had its operator week. It did a clean
reset of Skynet and forced a split between four things a "delete
everything" mixes up: runs, which can be wiped; the initial workflows,
which get rebuilt; the project's memory and documentation, which must not
disappear; and configuration and secrets, which never belong in a reset.
It also wrote down an idea about quota: having real agents available
doesn't mean running without limits, and those limits have to live in the
orchestrator, not in a sentence in the prompt.

Outside Skynet, a Raspberry Pi hung and had to be power-cycled by hand.
SSH looked stuck, but it was actually landing in a tmux session without
showing the prompt; now the physical screen and SSH share the same
session. The main computer's update is ready but not rebooted: on boot it
stops at the graphical login, and it lives inside a cupboard. And the
Alexa–Home Assistant integration went from sharing everything to sharing
only the air conditioners.

## What didn't go well

- **Skynet's projects don't point at GitHub yet**: the App is connected and
  deliveries arrive, but they're ignored. The test with a real project is
  for next week.
- **Tests were relying on leftovers from earlier runs**, and the plans on a
  repository that didn't exist.
- **Two CI reds that weren't ours**: Ubuntu 26.04 and the deadlock with the
  runner's heartbeat.
- **Maven Central rate-limited downloads** twice.
- **The small-PR rule** ran into the session's permission the first time,
  which still demanded Diego's "merge".
- **The five-hour limit ran out on Saturday** from 14:00 to 19:00, right in
  the middle of the delivery milestone.
- **Rebooting the main computer remotely** still needs someone at the
  keyboard.

## What I'm taking away

This week Skynet learned to finish. And almost everything that was hard
came from working out what that means: it isn't writing the code, or
pushing, or opening the PR. It's CI passing, the gate being respected, the
change being merged and someone finding out. Each of those steps is a state
that can be lost if it isn't stored.

The other half of the lesson is about tests. An acceptance run that passes
because the previous one left something prepared proves nothing. Not a
shared repository, not a runner that "looks" real, not a plan that assumes
something exists. Every test prepares its world, uses it, cleans it up and
proves how it left it.

Next week: the first real external project, from issue to merge; the
milestone for launching work from GitHub, which looks a lot like what
`skynet-commands` already does; and quota budgets in the orchestrator.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">5-hour windows per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>W</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">15 windows across 16 Claude cloud sessions (1 from the previous Sunday) · Sunday 25 15:44 → Sunday 1 09:27 · no activity on Thursday · weekly quota reached 77% with a warning before Saturday's 21:00 reset, without running out · the 5-hour limit was hit on Saturday between 14:00 and 19:00</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">21</span>
  <span class="ws-meter"><i class="ws-fill" style="width:76%"></i></span>
  <span class="ws-note">76% in Skynet (16, #169 to #205, 110 in total) · 5 in <code>skynet-commands</code>, per Hermes</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines in Skynet</span>
  <span class="ws-v">+27,488 / −1,352</span>
  <span class="ws-meter"><i class="ws-add" style="width:95%"></i><i class="ws-del" style="width:5%"></i></span>
  <span class="ws-note">Summed PR by PR · the net diff on <code>main</code> touches 400 files</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V30 → V34</span>
  <span class="ws-note">5 new, all GitHub: the App, deliveries, PRs, the CI wait and the merge</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones closed</span>
  <span class="ws-v">14</span>
  <span class="ws-note">IC, VS, SY, MP, GH and EN · 20 issues closed · 14-milestone, 5-stage roadmap approved</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts to Claude</span>
  <span class="ws-v">56</span>
  <span class="ws-note">3.7 per 5-hour window · zero local Claude Code work sessions</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Messages to Hermes</span>
  <span class="ws-v">73</span>
  <span class="ws-note">18 sessions, 855 tool calls and 749 API calls</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧠</span>
  <span class="ws-k">ChatGPT threads</span>
  <span class="ws-v">6</span>
  <span class="ws-note">Reconstructed by topic, no prompt count: research, architecture, bridge, tests and recap</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Equivalent API cost</span>
  <span class="ws-v">≈$160</span>
  <span class="ws-note">Estimated from Claude's token usage, within the subscription and no overage</span>
</div>

</div>

<blockquote><small>The screenshots come from Skynet's private deployment on
the test machine, Sunday 1 in the morning, on <code>280ca12</code> and with
the real data from the acceptance runs. They are in Spanish, Skynet's UI
language. The installation's repository list was hidden in the GitHub tab.
There is no screenshot of a PR opened by Skynet: the GitHub acceptance runs
use temporary repositories that are deleted when they finish.</small></blockquote>
