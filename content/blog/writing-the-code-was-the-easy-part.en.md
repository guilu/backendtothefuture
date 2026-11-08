---
title: "Writing the code was the easy part"
date: "2026-11-08"
description: "Week of November 2 to 8. Skynet already knew how to take a change all the way to merge. This week we built everything around it: waiting when quota runs out, a judge that doesn't trust the author, deployments that reconcile themselves, and an interface that finally looks like a factory."
tags: ["weekly", "ai-agents", "skynet", "ai-factory", "llm-as-judge", "github", "deployments", "postgresql"]
thumb: "/blog/writing-the-code-was-the-easy-part-thumb.webp"
cover: "/blog/writing-the-code-was-the-easy-part-cover.webp"
ogImage: "/blog/writing-the-code-was-the-easy-part-og.jpg"
---

## What we set out to do

**Skynet** is the orchestrator where several coding agents (Claude Code,
Codex and Antigravity) plan, implement, review and validate changes on their
own. Last Sunday it learned to finish: push the branch, open the PR, wait
for CI and merge. It already wrote code and delivered it.

This week we found out that was the tip. A software factory isn't an agent
that writes; it's everything that happens around what it writes. Who hands
it the work. What it does when it runs out of quota halfway through a task.
Who decides whether what it did is right. What happens after the merge,
when the change gets deployed. And how all of that looks from the outside,
to someone who doesn't want to read logs.

So that was the week, in that order:

- **launching work from GitHub**: an issue, a `/skynet` comment on a PR or
  a scheduled task, with one queue per repository so two agents don't step
  on the same checkout;
- **carrying on when quota runs out**, instead of failing;
- **independent validation**: the agent that writes is not the one that
  approves;
- **reorganising the interface** around projects, repositories and work;
- **the deployment loop**, from GitHub to the test machine and back;
- and **importing real projects** from repositories already on disk.

The split was the usual one: Claude writes the PRs in its cloud sessions,
Hermes deploys them on the test machine and runs its acceptance guide,
Diego decides whether they get merged. This week Codex joined with
something new: writing the milestone plans for Claude to review before
starting.

## The problems we ran into

### The agent ran out of fuel mid-job

Until now, when an agent's account used up its five-hour window, the stage
failed. It didn't matter if the window renewed in twenty minutes: the work
was lost and had to be relaunched by hand. For an orchestrator that wants
to work alone at night, that's a design problem, not an accident.

And we lived the irony first-hand: on Tuesday, right after opening the
judge's PR, the Claude session writing it ran out of quota and sat idle for
fifty minutes until Diego typed "Continue".

### Going green is too easy

With automatic delivery there was an obvious hole once you looked straight
at it: an agent that can't get a test to pass can **delete it**, or slap
`@Disabled` on it, or touch the acceptance guide. CI goes green and nobody
is exactly lying. It's just no longer checking the same thing.

The review the agents already did didn't fully fix this, because the
reviewer read what the author said it had done. And a convinced author is
very persuasive.

### A judge gets things wrong too

Once we added a judge, the opposite problem appeared. A reviewer looking
for faults finds them, even when they aren't there. A badly grounded
"blocking" finding sends the agent off to fix something that was fine, and
in the next round the good parts get lost.

### Skynet can't listen to itself

For the deployment loop, the plan Codex wrote proposed the obvious thing:
the deploy script calls Skynet with a signed request when it starts and
when it finishes. Reviewing it, the flaw showed up: when what's being
deployed is Skynet itself, **it restarts in the middle of the deploy**. The
"starting" notice can reach a server that's shutting down, and get lost.

And when it was installed for real, Hermes found another detail: the
script sending the notice wasn't actually sending the auth token.

### It looked like an admin panel

With all of that working, Diego opened the app and wrote what anyone would
have thought: *"Skynet's problem is no longer aesthetic, it's information
architecture."* There were menus for projects, workflows, runners, runs and
usage, all with the same weight. It looked like an infrastructure console,
not a factory. You couldn't tell at a glance what software the agents were
working on, what they had changed, what it had cost or what needed
attention.

And there were three words being used almost as synonyms that aren't:
work, workflow and run.

### Adding a project meant filling in a form

For Skynet to work on Forma, Akademia or TokenMeter, someone had to create
the project by hand: name, description, local repository path, git URL. The
repositories were already cloned on the test machine, but Skynet didn't
know.

### And the usual friction

Maven Central rate-limited downloads five times. Several end-to-end tests
fell over on races that already existed and passed on a rerun. One PR's CI
went over the hundred connections PostgreSQL allows because a new test
spun up another Spring context. And Claude classified a small PR as medium,
so it waited for Diego's "merge" when Hermes's approval was enough. Diego
put it plainly: "why didn't you read it?".

## How we solved it

Quota became **orchestrator state, not an error**. Skynet recognises each
CLI's out-of-quota message, puts the stage on hold until the window renews
(with a small random margin so they don't all start at once), and then
resumes the same session in the same workspace. Waiting doesn't consume
attempts. And if the wait goes past fifteen minutes, every agent can have a
**fallback provider**: if Codex is out of quota, Claude Code steps in.

Against easy green, two mechanical defences that don't depend on anyone's
good faith. The first reads the diff and **fails if there are fewer tests
than before** or if any way of skipping them shows up, in Java, JavaScript,
Python or Go, and says which: "The test `CalculadoraTest.divideEntreCero`
was deleted". The second is **protected paths**: the test guide or the CI
are declared off limits, and Claude Code simply loses permission to edit
them.

On top of that, the judge and its sceptics (further down, the one
technical section of this post). This is how one of the starter workflows
ended up:

![Skynet workflow page "Especificar, planificar e implementar". The description reads: Antigravity specifies in openspec/proposal.md, Claude Code plans, you approve the plan, Claude Code implements with green tests and Codex judges it against the approved proposal; the sceptics discard false positives and Claude Code fixes what really blocks. On the left, the YAML with the agents and their fallback providers. On the right, "What it defines": the stages spec, plan, approve-plan, implement, judge, pr, ci, approve-merge and merge](/img/skynet-2026-11-08-workflow.webp)

*Every agent has a fallback, the plan and the merge go through a person,
and between implementing and opening the PR there's a judge that isn't the
author.*

For deployments, the decision was **not to be the receiver**. The deploy
scripts tell GitHub, through its *Deployments* API, and GitHub forwards the
events to Skynet over the signed channel that already existed since last
week. If Skynet is restarting, GitHub keeps the state and retries. And
since a notice can still get lost, Skynet checks the health of what was
deployed and **reconciles**: if a deployment has been "in progress" for too
long, it goes and looks at how it really is. The token got fixed, with a
test that checks the header arrives without ever printing its value.

The interface was reorganised into three areas. **Workspace**: projects,
repositories, work and activity; it's the first thing you see. **Factory**:
what's running, the workflows, approvals and results. **Administration**:
providers, runners, usage and settings. The project became the operations
centre:

![Skynet project page for AKA · Akadem.ia. At the top, five counters: 1 open work item, 0 runs in progress, 0 open PRs, 0 pending approvals and the 30-day total. Tabs for Summary, Work, Runs, Changes, Deployments, Workflows, Memory and Configuration. Below, the akadem.ia repository on main and a board of work by phase (Not started, Running, Needs you, Delivered) with AKA-1 "Get to know the repository" delivered. On the right, Needs attention, Changes and Cost per work item](/img/skynet-2026-11-08-project.webp)

*Akadem.ia, the first real project inside Skynet. The interesting number is
no longer the global spend, but what each piece of work cost in each
repository.*

And the three words were pulled apart on the work page itself: **what** you
want to achieve, **how** it's done (the workflow) and **each real attempt**
at doing it:

![Detail of work item AKA-1 "Conocer el repositorio", marked as Delivered, on the akadem.ia repository with the conocer-repositorio v1 workflow. Three cards: "What: the work", "How: the workflow" and "Attempts: the runs", with one completed attempt. Below, the current attempt with its stages commands and map, the list of attempts (one completed in 18 min 45 s) and what it cost: 676.5k input tokens and 52.9k output](/img/skynet-2026-11-08-work.webp)

*One work item, one workflow, one attempt. If it fails, you launch another
attempt at the same work, not a new work item.*

Akadem.ia wasn't added by hand. It came in through the new wizard, which
looks for repositories already cloned on the runner's machine, reads their
remote, branch, manifest and README, **doesn't read `.env` or secrets** and
creates nothing until the last step:

![Skynet's "Import project" wizard, step 1 of 4, Repository. A list of repositories found under ~/code on the runner: akadem.ia (already in AKA), backendtothefuture-com, demo-repo, demo-repo-github (already in DEMO), diegobarrioh-dev, forma, skynet and skynet-commands, each with its GitHub remote, branch, detected tooling and last commit date. On the right, "What this wizard does": it looks for git repositories in the SKYNET_REPO_ROOTS folders, reads the remote, branch, manifest and README, doesn't read .env or secrets and strips credentials from URLs, and nothing is created until the last step](/img/skynet-2026-11-08-import.webp)

*The repositories already on disk, ready to become projects. The ones
already inside are dimmed.*

The misclassified PR was fixed where it should be: in the written rule in
the project's memory, not in an apology. The next small PR was merged on
Hermes's approval, without waiting.

And to close Saturday, something lighter: Skyny, the mascot, now exists in
3D. Diego is designing it with Codex in a separate studio built with
three.js. Claude proposed rolling it out across the whole app with sprites
for the small sizes; Diego preferred something narrower, and for now it
only lives on the login screen. The studio moved into the repository, so
each new version of the model reaches the code without translating it by
hand.

![Skynet's login screen in dark mode. On the left, Skyny in 3D, a light blue triangular robot with three white balls and a black screen with two eyes, above the line "Tus agentes, a la vista." and three status pills: Thinking, Completed and Waiting. On the right, the form with Username, Password and the Sign in button](/img/skynet-2026-11-08-login.webp)

*3D Skyny, for now only at the front door.*

#### The one technical section of this post

The problem with one agent reviewing another isn't ability, it's
**contamination**. If the judge reads the author's explanation, it judges
the explanation. So Skynet's judge is built so it can't:

- **it doesn't see what the author said**. It gets the task, the starting
  commit, the results of the checks and the rubric. To see the change it
  has to look at the diff itself, in its own copy of the repository;
- **it can only read**: it runs in plan mode, without permission to edit
  and without the project's memory;
- **it scores against a rubric**, from 1 to 5, with a 3.5 threshold. The
  default weighs three things: whether it solves the task, whether it has
  tests and whether it stays in scope. There can be several judges with
  different lenses: Codex looking at correctness, Antigravity at security;
- and if it fails, **the author fixes it** with the findings in hand, and
  it gets judged again, two rounds at most.

The opposite problem taught us the second half. Every blocking finding goes
through **sceptics**: read-only agents that try to refute it, and that see
even less (the task, the finding and the commit; not the rubric, not the
score, not the author). If most of them refute it, the finding is struck
through with the reason and doesn't trigger any fix. A tie doesn't refute.
And there are caps, because this is paid for in tokens: eight findings per
round and twenty agent calls per stage, and if anything gets cut, it says
so.

The idea we take away is symmetrical: **the author doesn't approve itself,
and the critic doesn't get to agree with itself either**.

## Meanwhile, Hermes

On top of accepting every PR, Hermes made sure the factory had a floor. It
reset Skynet to leave it empty with only the starter workflows, and turned
`demo-repo` into the target of every test guide, so none of them depends on
the repositories at home.

It also invented, on the spot, a procedure that didn't exist. The frontend
PR still open arrived with no stage and no acceptance guide. Instead of
loosening the webhook or faking an acceptance, it treated it as an explicit
exception: check it only touches the frontend, require all of CI green,
deploy that exact commit, restore the real runner and run the full
verifier. The exception didn't change the rule.

Outside Skynet, it was a caretaker's week. The test machine finally got
rebooted (it still needs someone at the keyboard for the login) and several
gigabytes of disk were recovered from Docker images, caches and tools
nobody used. OpenClaw, an old assistant, was retired, but not with an
`rm -rf`: its secrets folder still fed some of Hermes's integrations, so
they were migrated first, checked by hash and by real use, and only then
deleted. Audiobookshelf played again after checking the NFS mount to the
Synology. And on Saturday, once more, Forma, Akademia and TokenMeter went
dark from the outside while working perfectly at home: the routes to
Cloudflare stop answering from Movistar during football matches. A strong,
repeated correlation, not proof.

## What didn't go well

- **Claude's session ran out of quota** on Tuesday, right while it was
  building the quota wait. The weekly quota reached 93% before Saturday's
  reset.
- **Claude's out-of-quota message** was inferred from its documented
  format, not from a real capture. If it doesn't match, the stage will fail
  like before.
- **Several E2E tests fell over on races that already existed**, like a
  PostgreSQL lock when cancelling two agents in parallel. They passed on a
  rerun; they're still not fixed.
- **Maven Central rate-limited downloads** five times, and the Gradle
  download timed out several times in CI.
- **A small PR was treated as medium** and waited for Diego for no reason.
- **Importing projects is half done**: Akadem.ia is in; Forma and
  TokenMeter, not yet.

## What I take away

Last week I thought an agent's delivery ends at the merge. This week I
learned the merge is in the middle. Before it, there's someone handing out
the work, an agent that can run out of quota and a judge that doesn't trust
it. After it, there's a deployment that can get lost and a screen that has
to explain all of that to someone who wasn't watching. Writing the code
was, by far, the part that cost the least.

And almost everything we did looks alike: **don't trust whoever has a
stake**. Not the author reviewing itself, not the reviewer hunting for
faults, not the server deploying itself, not a test that disappears right
when it was failing. Every time, the fix was the same: take the decision
out of the hands of whoever is living through it.

Next week: the test bench to validate deployments end to end, which Codex
has already planned; importing Forma and TokenMeter; taking 3D Skyny to the
rest of the app, and a batch of small frontend PRs with no milestone.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">5-hour windows per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>W</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">16 windows across 21 Claude cloud sessions · Monday 09:13 → Sunday 13:48 · no idle days · the weekly quota reached 93% with a warning before Saturday's 21:00 reset, without running out · the 5-hour limit was hit on Tuesday between 16:40 and 21:40</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">26</span>
  <span class="ws-note">All in Skynet, from #209 to #261 · 136 to date · one more open, #262</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines in Skynet</span>
  <span class="ws-v">+43,471 / −2,198</span>
  <span class="ws-meter"><i class="ws-add" style="width:95%"></i><i class="ws-del" style="width:5%"></i></span>
  <span class="ws-note">Summed PR by PR · the net diff of <code>main</code> touches 381 files</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V35 → V48</span>
  <span class="ws-note">14 new: triggers, queue, quota waits and fallback, protected paths, judge, refutation, guide, deployments and repository catalogue</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones closed</span>
  <span class="ws-v">24</span>
  <span class="ws-note">DS, CQ, SB, VA, FS, DL, IP and TD · 26 issues closed · one milestone per PR</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts to Claude</span>
  <span class="ws-v">63</span>
  <span class="ws-note">3.9 per 5-hour window · 24 of them include a "merge"</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Messages to Hermes</span>
  <span class="ws-v">68</span>
  <span class="ws-note">8 sessions, 453 tool calls and 316 API calls · ≈1.2M input tokens</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧠</span>
  <span class="ws-k">Prompts to ChatGPT and Codex</span>
  <span class="ws-v">91</span>
  <span class="ws-note">6 conversations: the navigation redesign, the test bench and Skyny's 3D studio</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Equivalent API cost</span>
  <span class="ws-v">≈$238</span>
  <span class="ws-note">Estimated from Claude's token usage, within the subscription and with no overage</span>
</div>

</div>

<blockquote><small>The screenshots are from Skynet's private deployment on
the test machine, on Sunday the 8th around noon, on <code>main</code> after
#261 and with the real data left by Hermes's reset. The interface is in
Spanish. In the import wizard, the catalogue of an already disconnected
acceptance runner and two repositories unrelated to these projects have
been hidden. Hermes counts 25 merged PRs in its note; the 26 in the table
come from GitHub.</small></blockquote>
