---
title: "Configured isn't the same as working"
date: "2026-10-04"
description: "Week of September 28 to October 4. A new router, a laptop that lost its Wi‑Fi after an update, an encrypted backup that had to be provably restorable, and the birth of Skynet: four fronts with the same lesson — a system isn't ready when its configuration exists, it's ready when the whole path answers."
tags: ["weekly", "homelab", "ai-agents", "skynet", "backups", "networking", "event-sourcing", "observability"]
thumb: "/blog/configured-isnt-the-same-as-working-thumb.webp"
cover: "/blog/configured-isnt-the-same-as-working-cover.webp"
ogImage: "/blog/configured-isnt-the-same-as-working-og.jpg"
---

## What we set out to do

This week product code took a back seat. Forma rested, and the spotlight went
to the home infrastructure and to a new idea.

Diego bought a Wi‑Fi 7 router to replace one that had been running for years.
Swapping a router sounds like a Saturday afternoon: plug it in, copy the Wi‑Fi
password, done. But behind that router live the fibre line with its
three‑VLAN profile, the DHCP reservations for every machine, the ports that
reach the services published from home, and the script that keeps the domains
pointing at the public IP. If any of that breaks, Forma, Akademia, TokenMeter
and this blog go down together.

So Hermes, the agent that runs the home infrastructure, treated it as a real
migration: inventory, an isolated staging setup, and a way back.

In parallel, **Skynet** was born. Development agents already write specs,
tests, code and pull requests, but all of that happens in terminals and
vanishes when you close them. There was no place to see what each agent is
doing, with which prompt, in what state, and what it has produced. A control
panel for the factory.

## The problems we ran into

### Two roads to the Internet, neither of them working

The new router was configured over a cable from a Windows machine, while that
same machine's Wi‑Fi kept reaching the Internet through the old network. A
sensible setup. And suddenly the machine stopped browsing, even though it was
"connected" on both sides.

The problem wasn't the router: it was two interfaces, each announcing its own
default route. The system picked the one that led nowhere. The temptation at
that point is to flip router settings until something changes; what worked was
deliberately separating the route used to administer the router from the route
used to reach the Internet.

Then came the ASUS setup wizard, which saved the configuration halfway. After
a reboot it no longer showed the wizard, but asked for credentials created
during the failed attempt. An in‑between state the interface didn't recognise
as one.

### An update that turned the rollback plan into a necessity

With the network migrated, Omarchy — the Linux laptop that serves the apps —
was updated. On reboot, its Broadcom Wi‑Fi card ceased to exist. The driver is
compiled against the kernel, and the kernel had moved on without the driver.
A USB adapter stood in while driver and kernel headers were brought back in
line.

The desktop came back, the network came back… and that's where the most
interesting failure of the week started.

### A running process doesn't read your configuration

Hermes's user already belonged to the `docker` group. It was in the
configuration; the command that checks it said so. And still the Hermes
gateway and some scheduled jobs couldn't talk to Docker: permission denied.

The reason is simple once you see it. A process's groups are fixed when it
starts. Adding a user to a group changes what **future** processes get; the one
already running keeps the groups it inherited. Restarting the gateway was
enough. But the lesson is wider than Docker: an account's persisted
configuration and a live process's effective credentials are two different
states, and only one of them is the one that matters.

### A backup that runs isn't a backup that restores

Before taking on more risk, Hermes set up a weekly, encrypted backup of all its
state to the NAS. Compressing directories is easy. Knowing you'll be able to
get them back is the hard part.

So the backup isn't trusted when it's written. It's decrypted in streaming,
walked while rejecting dangerous paths and links, and every SQLite database is
copied transactionally and passes an integrity check. The private key doesn't
live on the NAS: it was tested by recovering it from the password manager,
which is exactly what you'd have to do on the bad day.

And it still failed on Friday. `rsync` tried to preserve numeric groups the
destination didn't know about. It was fixed, rerun, and finished cleanly. But
the Telegram watchdog kept reporting an error: it looked for any severe message
in the last hour, and the first attempt's error was still there. A monitor
that reads a window of logs without looking at the job's final state tells you
what happened, not what is.

### A webhook that should have worked and never arrived

Skynet was meant to deploy itself: every time a pull request opens or merges,
rebuild. The webhook first returned 405, because the entry nginx only had one
exact route — Forma's. Once that was fixed, the request just hung: Omarchy's
firewall blocked that port from the local network.

The uncomfortable part was what that uncovered. **Forma's** webhook route had
the same problem. Its configuration was valid, nobody had seen it fail… and it
wasn't operational. The fix was to point the webhooks at Omarchy's Tailscale
IP and check, with a real signed request, that it crossed nginx and reached
Hermes.

### What the CLI doesn't tell you

Skynet has to understand what Claude Code emits while it works. Before writing
a single line of the parser, nine real sessions were recorded: with tools,
resumed, forked, cancelled, out of budget, with permissions denied.

The recordings told things the docs didn't. The budget limit isn't a hard
limit. A cancellation doesn't emit the final result line every parser expects.
Cost is cumulative per session, so resuming carries the earlier cost along.
And there's an option that works but doesn't show up in the help. A parser
written against `--help` would have been a parser written against a promise.

## How we solved it

The router went into production with its fibre profile, its reservations, its
ports and Merlin firmware. The old model's configuration wasn't restored
blindly: what was needed was rebuilt and checked layer by layer. The dynamic
DNS script was recovered from its private copy, actually run by restarting
the service, and not considered done until the domains resolved to the new IP
and their pages answered. The old router sits switched off in a drawer, just in
case.

Omarchy came back whole, and wasn't declared recovered at the sight of a
desktop: SSH, Docker, the gateway, the scheduled jobs, Tailscale, the NAS and
every published app, checked from the outside.

Skynet now has its foundations and its domain model in `main`: projects,
repositories, work items, runs and an event timeline you can watch live. It
deploys only to the private Tailscale network; nothing is exposed to the
Internet, and the database doesn't even publish a port.

This is Skynet's first life, registering itself as a project:

![Skynet's "Actividad (en vivo)" (live activity) screen in dark theme. At the top, the bar with "Skynet", "Proyectos", "Actividad" and, on the right, "Control plane: disponible" in green. Below, six events with the newest on top; in chronological order: 13:48:44 project.created "Proyecto SKY creado"; 13:49:45 repository.registered "Repositorio Skynet registrado"; 13:50:09 workitem.created "Trabajo SKY-1 creado: Nuevo bug"; 13:50:31 workflow.started "Ejecución iniciada (workflow adhoc)"; 13:50:31 stage.ready "Fase agent preparada (intento 1)"; and 13:50:31 agent.spawned "Agente claude-code en cola" (claude-code agent queued)](/img/skynet-2026-10-04-timeline.webp)

The agent stays "queued" because the runner that will execute it arrives in
the next milestone. But everything above it is already real, already in the
database, and replays if you reload.

![The "SKY · Skynet" project page with the description "Mi red de agentes que van a destruir el mundo" (my network of agents that will destroy the world). On the left, "Repositorios", with Skynet's own repository registered on the main branch and the form to register another (name, local path on the runner's machine, default branch). On the right, "Trabajos" (work items), with "SKY-1 Nuevo bug" open and the form to create a new one, with a type selector: feature, bug, refactoring, dependencies, incident or security review](/img/skynet-2026-10-04-proyecto.webp)

#### The one technical deep-dive in this post

A live timeline looks easy: store events with an increasing number, and the
client asks "give me whatever comes after 41". The catch is that the number is
assigned when the transaction starts, and the event becomes visible when it
ends.

If two transactions take 42 and 43, and 43 commits first, the reader sees 43,
moves its cursor there… and when 42 shows up a moment later, the reader has
already gone past. It has skipped it forever, with no error and no warning.

Skynet solves it by assigning the sequence under a lock held until commit. The
cost is serialising event writes; the gain is a guarantee worth its weight in
gold: if you read "everything after N", you miss nothing. With that, the same
event table works as an outbox for live broadcasting, a client can reconnect
with the last id it saw without gaps or duplicates, and a trigger stops anyone
from editing or deleting history.

It's the database version of the week's lesson: the order in which something
is *declared* isn't the order in which it *exists*.

## What didn't go well

- **Skynet's first deployment collided with ports already in use** and had to
  move. Nothing serious, but one more thing that "should" have worked.
- **The backup watchdog reported an error that was already fixed.** It needs
  to reconcile with the job's final state.
- **M2 didn't close.** The runner contract and the Claude Code parser sit in an
  open pull request, CI green, not merged. It doesn't count as shipped.
- **Home devices without Tailscale can't reach Skynet.** That's on purpose, but
  an authenticated local access path is still to be decided.

## What I take away

**A service isn't ready because its configuration exists. It's ready when the
whole path answers, checked from the right client.** Forma's webhook was valid
and didn't work. The user was in the group and the process wasn't. The backup
got written, and it still had to be proven readable.

And that same idea is what shapes Skynet: the system doesn't believe what an
agent says it did. It checks the commit, the diff and the tests on its own.
The model's narration is just one more claim.

Next week: merge M2 and get the first agent out of the queue for real, decide
local access to Skynet, and watch a second weekly backup run go by without a
scare.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Skynet commits per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>M</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>T</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>W</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>T</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">7 commits · Saturday 09:00 → Sunday 11:15 · Monday to Friday was infrastructure work, in Hermes's hands</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">3</span>
  <span class="ws-note">All in Skynet: plan, M0 and M1 · M2 open with green CI</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines to <code>main</code></span>
  <span class="ws-v">+9,261 / −84</span>
  <span class="ws-meter"><i class="ws-add" style="width:99%"></i><i class="ws-del" style="width:1%"></i></span>
  <span class="ws-note">A project being born: almost everything is new lines</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V1 → V2</span>
  <span class="ws-note">Skynet's baseline and core model · verified with Testcontainers and PostgreSQL 16</span>
</div>

<div class="ws-row">
  <span class="ws-i">🎞️</span>
  <span class="ws-k">Claude Code sessions recorded</span>
  <span class="ws-v">9</span>
  <span class="ws-note">Real fixtures for the parser: cancellation, fork, budget exhausted, permissions denied…</span>
</div>

<div class="ws-row">
  <span class="ws-i">💾</span>
  <span class="ws-k">Hermes encrypted backup</span>
  <span class="ws-v">1.63 GB</span>
  <span class="ws-note">8 SQLite databases intact · 3 generations retained · Friday's rerun, 1.59 GB</span>
</div>

<div class="ws-row">
  <span class="ws-i">🌐</span>
  <span class="ws-k">Router migrated</span>
  <span class="ws-v">1</span>
  <span class="ws-note">PPPoE, triple VLAN, DHCP reservations, ports and dynamic DNS verified · the old one off, kept as rollback</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts to Hermes</span>
  <span class="ws-v">193</span>
  <span class="ws-note">Across 16 sessions, with 621 tool calls</span>
</div>

</div>

<blockquote><small>The screenshots are from Skynet's private deployment on Sunday, with
the real data it held at the time.</small></blockquote>
