---
title: "Skynet gets a memory and a mascot that keeps you posted"
date: "2026-10-25"
description: "October 19 to 25. Skynet, our agent orchestrator, learned to remember what it does from one run to the next and gained a mascot that tells you what it's up to. Along the way we found that finishing a job is not the same as delivering it."
tags: ["weekly", "ai-agents", "skynet", "memory", "mcp", "home-assistant", "postgresql", "ci"]
thumb: "/blog/skynet-gets-a-memory-and-a-mascot-thumb.webp"
cover: "/blog/skynet-gets-a-memory-and-a-mascot-cover.webp"
ogImage: "/blog/skynet-gets-a-memory-and-a-mascot-og.jpg"
---

## What we set out to do

**Skynet** is the orchestrator where several coding agents (Claude Code,
Codex and Antigravity) plan, implement, review and validate changes on
their own. By last Sunday it could launch them, pass data between phases
and stop to wait for a person. What they produced, though, evaporated when
they finished: a log, a cost, and not much else.

The week started by closing what was left of Phase 2: the three real
providers actually working (Gemini CLI was retired and Antigravity took its
place) and the last piece of the visual editor, which now lets you create,
version and publish a workflow from scratch without touching YAML.

From there, the theme was **making what the agents produce stay, and reach
someone**:

- the **files** a run generates (a report, an image) should be openable
  and downloadable;
- Skynet should have **memory**: remember what earlier runs did, so the
  next one doesn't start from zero;
- and the interface should **tell you what's happening** without you
  having to go and look.

The loop was the usual one: Claude writes the PR from Claude Desktop,
Hermes deploys it on the test machine and runs its acceptance guide, and
Diego decides whether it gets merged. Twenty-four times.

## The problems we ran into

### A document that was only a path

A run generated a Markdown report inside its workspace. The interface
showed this: a path. No way to open it or download it. The work was done
and, for practical purposes, it didn't exist.

The tempting fix was to treat any file the agent had touched as a result.
It would have worked in the demo. It would also have turned every temp file
into a "deliverable" and, worse, opened the door to downloading things from
outside the workspace: reviewing the code showed that the existing
artifacts check followed symlinks, so a link to a file outside counted as
"exists".

### The event that could never be saved

While testing those artifacts, an agent got stuck. It hadn't failed: Skynet
marked it as "unresponsive" while the runner kept trying to send the same
thing over and over.

The agent had read a ZIP. The binary output carried a null byte, the runner
put it in an event, and PostgreSQL refused to store it. The whole batch came
back with an error, the runner retried it, and so on forever. One invisible
character was blocking that agent's entire queue.

### A memory the agent didn't look at

For memory, the initial plan was modest: hand-written notes added to the
prompt. Diego wanted something else: for Skynet to remember what had been
done, so projects could be picked up again and investigations launched on
top of earlier ones. That looks a lot like **Engram**, the persistent
memory we use in Claude Code. But Engram stores data in a local SQLite on
each machine, and Skynet can have several runners. So Engram wasn't used:
its model was copied into Skynet itself.

Then came the surprises. Codex rejected the memory tools because its policy
is to never run anything that asks for approval. Antigravity has no
verified support for MCP servers, so it only gets an initial block. And on
the first full test with Claude Code, the agent received five memory
entries in the prompt and didn't search or read a single one more. The
memory was there. Nobody looked at it. Hermes marked the acceptance as
**partial**, not as "almost".

### The report that never arrived

The clearest one came from Hermes. A memory acceptance run: GitHub delivers
the event, the queue picks it up, the agent deploys, works for several
minutes and finishes. All green. And the final message never showed up on
Telegram. From the outside it looked like a lost webhook; on the inside,
the work was done and the result was stored.

Along the same lines, a worker that hit its tool limit left the queue
marked as busy with no process behind it. And on Sunday, the final review
of the icons never started: GitHub delivered the event right when the test
machine was out of memory, got a 500 and didn't try again.

### Fonts that weren't ours

For the new typography, Diego passed along some font files. When opened,
they turned out to be **Duolingo Sans**, under a license that forbids using
them outside Duolingo, and the Skynet repository is public. They worked
perfectly; they couldn't be used.

## How we solved it

Artifacts were solved with a **contract**: a phase declares which files it
produces, and Skynet captures only those. No "whatever changed". The
capture checks that the path is inside the workspace, rejects links that
leave it, and the web shows the files next to the phase that produced them,
Markdown documents and images included. Since images load from the download
endpoint itself, the content security policy didn't even need touching.

The null byte was fixed at both ends (more below, in the post's only
technical deep-dive).

Memory ended up with provenance and permissions: who wrote each entry,
versions, pinning, editing and archiving. Agents read and write it through
explicit MCP tools; Codex gets approval for the memory server's tools only,
nothing else. Each phase declares whether memory is off, read-only or
writable, and when every run ends Skynet leaves a **run log** entry with
status, branch, changes and cost. The investigate-improvements workflow now
explicitly asks the agent to search memory, and on the second test it did.

![Memory tab of the Demo Repo project. At the top, under Pinned, a restriction "Don't touch the README": "A person maintains the README: don't change it", written by a person. Below, grouped by date, run log entries written by Skynet: "Run investigar-mejoras v1 of DEMO-1: finished well", with workflow, status, phases, branch and costs of 0.41 and 0.32 USD, and another one from probar-memoria with investigate and apply phases](/img/skynet-2026-10-25-memoria.webp)

*A project's memory. At the top, what a person writes and pins; below, the
run log Skynet leaves on its own at the end of every run.*

![Detail of run DEMO-1 "Aceptación AG-A archivos declarados", completed in 49 s for 0.4103 US$ with Claude Code and claude-opus-5-5. On the left, the conversation: the prompt asks to start with the project memory using mem_search and mem_get, and below it the calls ToolSearch, Bash, mcp__skynet_memoria__mem_context and mcp__skynet_memoria__mem_search, all done. On the right, the final answer: "I reviewed the project memory: the initial context, mem_context, mem_search… There is only one pinned restriction, 'Don't touch the README'"](/img/skynet-2026-10-25-ejecucion.webp)

*The second test. This time the agent opens memory with its tools, finds
the pinned restriction and respects it.*

To keep tests with real agents cheap, Hermes created `demo-repo`: a tiny
Python project with a text analyzer and three tests. A full memory
acceptance run cost about 41 cents. Done against Skynet itself, it would
have been much slower and more expensive to check the same thing.

For the last stretch towards people, this week's answer was the
**mascot**. A companion that lives on every page and says whether Skynet is
waiting, working, needs an approval, has failed or has finished, even
outside the tab: in the title, in the favicon and with browser
notifications. The first version was a nigiri from Diego's sketch and
didn't fit the look; the final one comes from the logo. And building it
uncovered another gap: a new connection to the live events received the
full history from the very beginning. Now it only asks for what's coming.

![Skynet dashboard. At the top, "Good afternoon, admin, 0 agents working. All good" and the mascot, a triangle with three spheres and a face, with a bubble saying "All caught up". Below, a panel with the mascot and "Hi, I'm Skynet. Nothing running: shall we launch something?", with buttons to launch a workflow and see runs. Further down, the last-7-days summary: 14 runs, 13 completed, 1 failed, 1.529 US$ cost and 35 s median duration](/img/skynet-2026-10-25-companion.webp)

*The dashboard with the companion and the new typeface. What you used to
have to look up in the runs list, it now tells you.*

The Duolingo fonts were dropped in favour of the closest free alternative,
**Barlow**, with JetBrains Mono for code.

The report that never arrived, on the other hand, **is not solved**.
Hermes rebuilt the path from GitHub's deliveries, the queue and the
sessions, and recovered the report by hand. What's needed is a durable
*outbox*: store the result, the destination and the delivery state, and
retry after a restart. It's on next week's list.

#### The only technical deep-dive in this post

The null byte is a textbook **poison message**, and the way it blocked the
queue repeats in any event-driven system.

PostgreSQL does not accept the `\u0000` character inside a `jsonb`, not even
escaped. If the producer sends a batch of events and one of them carries
it, the whole batch fails. If the producer's policy is "retry until it
works", it never will, and everything behind it gets stuck.

The fix has three parts, and all three are needed:

- **sanitize at the source**: the runner strips characters the database
  won't accept before sending;
- **sanitize at the destination**: the control plane doesn't trust the
  runner to have done it, because tomorrow there will be another runner or
  another version;
- **isolate the failure**: if a batch fails, it is resent one event at a
  time, and the one that can't be stored is marked invalid and set aside
  instead of being retried forever.

The third is the one people forget. The first two fix this byte; the third
fixes the next one nobody has imagined yet. The eight tests reproducing the
blockage were written first and failed before the fix.

## Meanwhile, Hermes

Besides accepting every PR, Hermes had an operator's week. Code review with
real providers became a security boundary: a reviewer agent has tools, and
nothing stopped one of them from writing where it shouldn't. Four
deliveries came out of that to harden paths, Git, secrets, inputs and
deployment. The principle: a reviewer inspects and explains, but doesn't
gain permissions by accident.

Outside Skynet, it restored the Alexa to Home Assistant integration (account
linking pointed to an old URL), brought the home rack back up in the right
order after a power cut (the NAS first, then the Raspberry Pis that depend
on it) and diagnosed a reboot of the test machine: opening VS Code remotely
with Java and Gradle exhausted its 8 GiB of RAM and all of its compressed
swap. The decision was not to use it as a development machine. After the
reboot, Akademia didn't come back on its own because its containers had no
restart policy. Now they do.

## What didn't go well

- **The report that never reached Telegram** still has no durable fix.
- **A worker left the queue busy with no process**, again.
- **The icons review got lost** to a webhook 500 during the test machine's
  memory lockup.
- **The first memory test was partial**: the agent didn't consult memory
  and a secret wasn't flagged.
- **The fonts couldn't be used** because of their license.
- **Flaky tests** everywhere: PostgreSQL deadlocks when cancelling two
  agents at once, a git race when creating worktrees, and Maven Central
  rate-limiting downloads four times.
- **The five-hour limit ran out on Sunday** halfway through the icons,
  which are still in an open PR.

## What I take away

This week Skynet learned to produce things that stay: files, memory, a run
log, a mascot that tells you. And nearly every problem came from the same
place, the last stretch. A document that exists but is only a path. A
memory that sits in the prompt and nobody consults. An event that gets
generated and never stored. A report that gets finished and never sent.

"The agent finished" is a state of the system. "Someone received it" is
another one, and it doesn't follow from the first. It has to be built on
its own, with its contract (what gets delivered), its persistence (what
happens if it dies halfway) and its evidence (how do I know it arrived).

Next week: the durable outbox for reports, a worker shutdown that doesn't
depend on the agent reaching its last call, and the remaining icons.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">5-hour windows per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>W</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">18 windows across 15 Claude Desktop sessions (1 from the previous Sunday) · Sunday 18 18:14 → Sunday 25 12:54 · no day without activity · the weekly quota reached 81% with a warning before Saturday's 22:00 reset, without running out · the 5-hour limit was hit on Sunday between 09:20 and 14:20</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">24</span>
  <span class="ws-note">All in Skynet, #121 to #173 · 94 to date · 1 open at close (icons)</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines</span>
  <span class="ws-v">+26,009 / −2,735</span>
  <span class="ws-meter"><i class="ws-add" style="width:90%"></i><i class="ws-del" style="width:10%"></i></span>
  <span class="ws-note">Summed PR by PR · the net diff of <code>main</code> touches 348 files</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V26 → V29</span>
  <span class="ws-note">4 new: simulated run, memory, memory token and agent memory</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones closed</span>
  <span class="ws-v">23</span>
  <span class="ws-note">AR, W8, AL, RV, AG, ME, CI, CO, TI and SG · 27 issues closed · Phase 2 done</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts in Claude Desktop</span>
  <span class="ws-v">71</span>
  <span class="ws-note">3.9 per 5-hour window · zero working sessions in Claude Code</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Messages to Hermes</span>
  <span class="ws-v">88</span>
  <span class="ws-note">8 main sessions, 524 tool calls and 706 API calls</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">API-equivalent cost</span>
  <span class="ws-v">≈$279</span>
  <span class="ws-note">Estimated from token usage, within the subscription and with no overage</span>
</div>

</div>

<blockquote><small>The screenshots come from Skynet's private deployment on
the test machine, on Sunday 25 around noon, with the real data from the
acceptance runs on <code>demo-repo</code>. The UI is in Spanish. The
artifacts tab isn't shown because none of the retained runs declared output
files.</small></blockquote>
