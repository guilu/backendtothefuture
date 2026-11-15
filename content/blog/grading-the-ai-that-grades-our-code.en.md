---
title: "Grading the AI that grades our code"
date: "2026-11-15"
description: "Week of November 9–15. Last week Skynet learned not to trust the agent that writes the code. This week the next question came up: who keeps an eye on the judge? Risk measured from the diff, a reviewer that remembers what it already said, lessons the machine proposes and a person applies, and a table that counts what happened to everything the judge approved."
tags: ["weekly", "ai-agents", "llm-as-judge", "skynet", "evals", "agent-memory", "code-review"]
thumb: "/blog/grading-the-ai-that-grades-our-code-thumb.webp"
cover: "/blog/grading-the-ai-that-grades-our-code-cover.webp"
ogImage: "/blog/grading-the-ai-that-grades-our-code-og.jpg"
---

## What we set out to do

**Skynet** is the orchestrator where several coding agents (Claude Code,
Codex and Antigravity) plan, implement, review and ship changes on their
own. Last week we gave it a judge: an agent that reviews another agent's
work without reading what the author claims to have done, with sceptics
that try to knock down every finding before it sends anyone off to fix
anything.

On Monday morning, Diego handed Claude a repository,
[rsc-harness](https://github.com/ericrisco/rsc-harness), with a short
request: study which of its ideas we can bring into Skynet. That study
became the plan for the week, and it carried an uncomfortable question
all the way through. If the judge decides what gets merged, **who decides
whether the judge is doing a good job?**

So the week was mostly about building around the judge:

- **reviewing according to risk**, measured from the diff, not from what
  the agent says;
- making the reviewer **remember what it already said** and stop
  repeating what was already dismissed;
- letting each repository write **its own review criteria**;
- having Skynet **learn from what keeps repeating**, without applying
  anything on its own;
- and making the judge **get its grade**: what happened to what it
  approved.

Around that, three more visible things: a project memory that knows what
to trust, a full redesign of the workflow pages, and Skyny, the mascot,
who went this week from a 3D sketch to living inside the app.

The cast, as usual: Claude writes the PRs in its cloud sessions, Hermes
deploys them to the test machine and runs its acceptance guide, Diego
decides what gets merged. Codex spent the week on something else:
polishing Skyny with Diego, pixel by pixel.

## The problems we ran into

### One judge for everything costs as much as no judge at all

With the judge working, the first problem was proportion. A change that
only touched a README went through the same panel as a database
migration. Either everything got judged with the same effort and we paid
for it in tokens and time, or everything got relaxed and we lost rigour
exactly where it mattered.

And there was a worse hole, the kind you only see when you look at it
head on. The judge approves a commit. Then CI fails, the agent that fixes
CI comes in and changes a couple of things. CI goes green and the change
is merged. **What lands on `main` is not what the judge saw.**

### A reviewer without memory repeats itself

In the second review round, the judge would flag again things the
sceptics had already refuted in the first. Or two judges found the same
thing in different words, and Skynet launched one sceptic for each. Every
repetition costs a call, and every repeated blocking finding sends the
agent off to fix something that had already been accepted.

### The repository had no voice, and once it did, it needed protecting

The judge reviewed with a general rubric. But every repository has its
conventions, its exceptions and its things you don't touch. Giving it a
`REVIEW.md` to write them in was easy. The hard part came right after:
**an agent could edit that file to get a softer review.** Protecting it,
the same way the rubric and the tests are already protected, changed the
behaviour of every judged stage and forced us to adjust seventeen
integration tests.

### Nobody told the judge when it got it wrong

This is the real one. The judge approves, the PR is merged and, a week
later, someone reverts it because it broke something. At that point,
nothing in Skynet connected the revert to the judge that let it through.
The judge never found out. Neither did we, except from memory. A reviewer
that never gets its grade doesn't improve: it just accumulates
confidence.

### One agent's memory is read by another agent

Skynet already had project memory: what an agent learns in one run, the
next can look up. The problem is what that implies. If an agent saves
something wrong, or something that sounds like an order ("from now on you
must…"), the next agent reads it as trusted context. And the memory
didn't prevent the silliest thing of all: launching again a piece of work
that had already been delivered.

### And the week's friction

Claude stated, with complete confidence, that a password passed to a
script didn't show up in `ps`. That was false: the script handed it to
`curl` as an argument, and it is visible for a moment. Three separate
times, an agent said it couldn't create milestones on GitHub, and it
could, through the API; Diego had to write "in theory you should be able
to create milestones". On Saturday, the five-hour quota ran out right as
the workflow redesign started. Diego had warned about it: "even though
you're going to burn through the quota".

## How we solved it

### Risk is measured, not asked

Skynet now computes **the risk of a change from the diff**, without
asking the agent. Level 0 if only documentation changes. Level 1 if code
changes. Level 2 if it touches a sensitive path (migrations, CI,
dependencies, deployment, auth, `.env`) or adds a sensitive line, such as
a schema change or a secret. Each repository can add its own rules, but
only to raise the level, never to lower it.

![Header of a run in Skynet: "Attempt 2 of ESBGFY0-1", status Completed, title "ES-B REVIEW.md". Below, the labels for the workflow Agente suelto v1, the runner omarchy, Claude Code, the model claude-opus-5-5, the work branch and a green "Risk 0" badge. Further down, duration 15 s, 65 tokens and a cost of 0.1151 US$](/img/skynet-2026-11-15-risk.webp)

*A change that only touches a text file comes out as risk 0. The diff
sets the level, and the level decides how many judges are needed.*

With that number, effort distributes itself. And the CI hole was closed
by storing **the exact commit the judge saw**. If anyone changes
something afterwards, Skynet judges only the delta from that commit, with
as many judges as its risk calls for: none if the delta is level 0, one
if it's level 1, the full panel if it's level 2. The merge gate says it
in one line: judged at this commit, merging this other one, delta
reviewed.

### The reviewer remembers

Every finding now leaves a **fingerprint** and an **outcome**: fixed,
refuted, accepted as intentional, not applicable. From the second round
on, the judge receives "what has already been flagged" and is told to
look first at the diff since the previous round. Anything matching
something already refuted is discarded before it reaches the sceptics
and shows up in the UI as "Already seen". Duplicates are grouped and
refuted once. And the agent doing the fixing gets a new section, "What
keeps coming back", with whatever is still unfixed from the round before.

The repository, for its part, got its `REVIEW.md`, a check against the
spec and a list of assumptions to revisit later. The file is protected:
no agent can touch it. This is how the judge step looks in the new
workflow editor, which was also redesigned top to bottom this week:

![Step-by-step workflow editor in Skynet. Step 4, "implementar", of type Agent: Claude Code as developer with the sonnet model and Codex as fallback, with the checks Tests green, Doesn't touch the tests, There are changes (diff) and Respects protected paths. Step 5, "juzgar", of type Judge: Codex as reviewer with Antigravity CLI as fallback; "Scores 5 criteria (2 mandatory). 2 sceptics try to refute every blocking finding. Whatever remains is fixed by implementar, at most 2 rounds"](/img/skynet-2026-11-15-judge-step.webp)

*It used to be a YAML file. Now each step explains what it does, who does
it and what it has to meet.*

### The machine proposes lessons and a person applies them

When the same class of finding shows up in two different runs of the
same repository, Skynet **proposes a lesson**. If what repeats ended up
being fixed, it's a prevent lesson: it goes into the repository's memory
as a constraint every agent sees. If what repeats ended up being
accepted, it's a don't-flag lesson: it goes into the judge's criteria so
it stops insisting.

Two decisions here are deliberate. The lesson's text comes from a
template, **with no model involved**: we don't want one LLM summarising
another LLM and turning it into a rule. And **nothing is applied without
a person**. Dismissing one takes a written reason, and it won't be
proposed again until there are new cases across three more runs.

### The memory knows what to trust

Every memory now carries a trust level. What a person writes is born
confirmed. What an agent writes is born **unconfirmed**, and is only
confirmed when its run's PR is merged or when a person approves a gate
in that run. At start-up, agents only receive what's confirmed; the rest
they can search, but flagged as doubtful. And a model-free detector puts
in **quarantine** any sentence that talks to the agent ("ignore the
instructions…", "from now on, you must…") or that downloads and runs
code. Only a person can take something out of quarantine.

On top of that, a simple question before launching anything: **is this
already done?** Skynet compares the new piece of work against what the
project has already delivered, again without a model: word stems and a
similarity index. If it looks a lot like something already merged, it
doesn't launch: it answers "This looks already done", with the PR where
it shipped, and you have to confirm on purpose to go ahead.

### Skyny, finally, inside

While all of that was happening in Claude, Diego spent the week with
Codex polishing Skyny in 3D: trying mittens, rotating them, dropping them
and going back to satin-white spheres; giving the face screen messages
that type themselves out letter by letter with a cursor, symbols that
appear in a raised hand when Skyny needs something, and a dot-matrix
variant that ended up as its own version because "I'm not sure I'm fully
convinced by this pixel thing".

On Friday that studio went into the repository, and from there into the
app: the login, the page of every run, and the home screen. For the small
sizes the plan was to use pre-rendered images of the 3D model; it was
dropped because they would freeze the colours and ignore the palette each
user picks. The 2D Skyny was redrawn in SVG to look like the new one.

![Skynet home: "Good afternoon, admin. No agent working · 2 things need your attention · 1.16 US$ this week". Below, a panel with Skyny in 3D, a blue triangular robot with two white spheres and a black screen with its eyes lit, next to the message "Hi, I'm Skyny. Nothing is running: shall we launch something? That's 5 runs in a row without failures." and the buttons Launch a workflow and See the runs](/img/skynet-2026-11-15-home.webp)

*Skyny is no longer just at the front door.*

And on Sunday, the next step: Diego saw how GitHub peeks its mascot out
of its homepage and proposed a blind that drops down from the top bar
with Skyny at full size and a single prompt to launch workflows or ask
the memory. Sketches approved; Haiku by default. Testing them turned up a
lovely detail: Skyny's LED signs only have the letters drawn that are in
use today, and "CONFIRMA" came out without the F.

#### The only technical bit in this post

Grading a judge sounds easy until you try to define what a judge's
mistake is. What we did:

- an **escape** is a change the judge approved, Skynet merged, and was
  later reverted on the main branch, or that a person marks by hand
  because the judge missed something. Skynet detects it on its own, by
  reading revert PRs and "This reverts commit…" commits that match what
  was merged. At most one per run;
- for everything the judge approved, Skynet counts its **outcome**:
  *stayed* (merged and nobody reverted it), *escape*, *rejection* (a
  person rejected it at a later gate) or *closed* without merging.
  Anything without an outcome yet doesn't count, and neither does what
  the judge failed: this measures what it let through;
- **calibration** crosses that with the score it gave: of what it
  approved below 4, between 4 and 4.5, or above, how much stayed? A
  well-calibrated judge is one whose high-scoring approvals almost never
  come back;
- and each escape goes into an **evaluation bank**: the same change can
  be judged again with another judge or another model, to compare whether
  it would have failed what the first one let through.

![The Judges page in Skynet's Factory. It explains: Noise, what a sceptic knocked down or didn't apply; Hit, what the agent fixed; and of what it approved, stayed if it was merged and not reverted, escape if it was reverted or marked, rejection if someone rejected it later; with fewer than 10, little data. One row: the general judge, claude-code with claude-opus-5-5, 5 findings, 40 % noise with the "little data" label, 60 % hit rate, 0 escapes and 0 rejections; outcomes: 1 refuted, 1 not applicable and 3 fixed](/img/skynet-2026-11-15-judges.webp)

*The table, on Sunday afternoon. Five findings and the label that
matters: little data.*

The screenshot carries its own lesson. The machinery is built and the
table is honest: with five findings, it says "little data" instead of
making up a trend. The Lessons and Evaluations pages exist, but on Sunday
they were still empty. Grading a judge takes weeks of real runs. What we
did this week was make sure that, when they come, they get written down.

## Meanwhile, Hermes

Hermes accepted the PRs it could and, above all, put in writing the
sentence that sums up the week better than any other: **an
implementation is not an acceptance**. Of the thirty-three merged PRs,
not all have a complete functional acceptance behind them. The
step-by-step editor was merged with TypeScript, the linter and eighteen
tests green, but without the desktop, dark-theme and mobile scenarios.
The "is this already done?" PR left integration tests pending in its
first acceptance. And the wiki pages PR is deployed, with all of CI green
except Sonar, and no acceptance: it was missing a bounded driver for its
scenarios. None of those merges proves, after the fact, that acceptance
was completed. It's exactly the judge's problem, seen from the other
side.

Outside Skynet, Hermes built a private home-lab wiki, with twenty-four
pages, CLI tests and a clean linter, so any agent can look up the house's
context before touching anything. And it had to diagnose layer by layer:
a report saying "provider timeout" when what was failing was SSH to the
wiki host; Forma's machine after a power cut, healthy but with a new IP;
an old OpenClaw service restarting in a loop because it pointed at a
folder that no longer existed; and a `black.local` that stopped
resolving because Avahi was installed but not running. It also updated
itself, switched models, and now shows in the footer of every Telegram
message how much five-hour and weekly quota it has left. With a caveat it
wrote down itself: its fallback model shares provider and account with
the main one, so it doesn't protect against a shared outage.

## What didn't go well

- **A false security claim.** Claude said a password didn't show up in
  `ps`, and it did. It was struck through and corrected, but it was said
  with the same confidence as everything else.
- **"I can't create milestones", three times.** It could, through the
  GitHub API.
- **Thirty-three merges are not thirty-three acceptances.** Several PRs
  were merged with acceptance half done.
- **The last PR is still open with Sonar red**, and the agent can't open
  SonarCloud to read why; two blind fixes changed nothing.
- **The five-hour quota ran out** on Saturday as the workflow redesign
  started, and the weekly one reached 83 % with a warning before the
  reset.
- **Lessons and Evaluations exist, but they're empty.** There's no data
  yet to grade anyone with.
- **The deployment testbench, planned a week ago, was dropped** without
  writing a line.

## What I'm taking away

Last week we learned not to trust the author. This week we learned the
judge doesn't deserve trust by default either: it has to **earn it with
outcomes**. A reviewer that never finds out what it let through isn't a
reviewer, it's an opinion with a badge.

And almost everything we built has the same shape: **closing the loop**.
What gets merged has to be what was judged. What the judge approves has
to come back to it when it fails. What repeats has to become a rule, but
a person signs it. What an agent remembers counts once it's merged, not
once it's written.

The uncomfortable part is that Hermes applied the same rule to us, and
we didn't fully pass: merged is not accepted. The machine that grades
the judge is built. The one that grades our own acceptances isn't yet.

Next week: finishing the memory's wiki pages, the chat with Skyny (with
the letters it's missing), bounded acceptance drivers so Hermes can
finish the scenarios that are left half done today, and starting to see
real numbers in the judges' table.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">5-hour windows per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>W</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">14 windows across 13 Claude cloud sessions · Monday 09:14 → Sunday 15:47 · no activity on Wednesday or Thursday · the weekly quota reached 83 % with a warning before Saturday's 21:00 reset, without running out · the 5-hour limit was hit on Saturday between 14:20 and 19:20</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">33</span>
  <span class="ws-note">All in Skynet, #262 to #328 · 169 cumulative · one more open, #329</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines in Skynet</span>
  <span class="ws-v">+26,207 / −1,413</span>
  <span class="ws-meter"><i class="ws-add" style="width:95%"></i><i class="ws-del" style="width:5%"></i></span>
  <span class="ws-note">Summed PR by PR · the net diff of <code>main</code> touches 332 files</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V49 → V57</span>
  <span class="ws-note">9 new: risk, judged delta, autonomy, findings and their class, lessons, escapes, evaluation bank and memory trust</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones finished</span>
  <span class="ws-v">7</span>
  <span class="ws-note">AU, RH, ES, AP, EV, SV and WF · MV halfway · 33 issues closed · TB dropped</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts to Claude</span>
  <span class="ws-v">71</span>
  <span class="ws-note">5.1 per 5-hour window · 32 of them include a "merge"</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Messages to Hermes</span>
  <span class="ws-v">96</span>
  <span class="ws-note">26 sessions and 1,007 tool calls in the calendar week</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧠</span>
  <span class="ws-k">Prompts to Codex</span>
  <span class="ws-v">59</span>
  <span class="ws-note">3 threads, almost all of it Skyny's 3D studio · no ChatGPT conversations</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Equivalent API cost</span>
  <span class="ws-v">≈$272</span>
  <span class="ws-note">Estimated from Claude's token usage, within the subscription and with no overage</span>
</div>

</div>

<blockquote><small>The screenshots come from Skynet's private deployment on
the test machine, on Sunday the 15th in the afternoon, with whatever real
data was there: the risk-0 run is one of the ES-B acceptance runs, and the
judges' table only has one judge with five findings. The Lessons and
Evaluations pages aren't shown because they were empty at that time. The
UI is in Spanish; captions translate it. Hermes's count comes from its
local index for the calendar week; its Insights, over a rolling window
from the 8th to the 15th, give different figures.</small></blockquote>
