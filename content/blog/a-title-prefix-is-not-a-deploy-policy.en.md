---
title: "A title prefix is not a deploy policy"
date: "2026-11-22"
description: "Week of November 16–22. Skynet finished its memory, learned to hold a conversation and spent five days on rapid interface changes. The faster the changes came, the clearer it got where the bottleneck was: not in the code, but in deciding what ships on its own."
tags: ["weekly", "ai-agents", "deployment", "skynet", "ci", "chat", "frontend"]
thumb: "/blog/a-title-prefix-is-not-a-deploy-policy-thumb.webp"
cover: "/blog/a-title-prefix-is-not-a-deploy-policy-cover.webp"
ogImage: "/blog/a-title-prefix-is-not-a-deploy-policy-og.jpg"
---

## What we set out to do

**Skynet** is the orchestrator where several coding agents plan,
implement, review and ship changes on their own. Over the last few weeks
we taught it to distrust the author and to grade the judge. This week was
about something closer to home: getting Skynet to **remember** what
happens in each project, and making it possible to **talk to it**.

The week came in three stretches, each faster than the one before:

- from Sunday night to Monday morning, **finishing the memory**: a wiki
  per project, a context that gets shared out sensibly, and a curator that
  proposes how to tidy up what piles up;
- Monday to Tuesday, **the chat with Skyny**, the mascot, which went from
  drawing to assistant: eight PRs in a little over a day;
- and Wednesday to Sunday, **small interface changes**, one after another,
  in a thread literally called "Make small quick changes to the frontend".
  It took 32 of the week's 56 messages.

The split of work, as usual: Claude writes the PRs in its cloud sessions,
Hermes deploys them to the test machine and checks they work, Diego
decides what gets merged. And this week Gemini sent its own report again,
the first since June: it had spent the week designing Skyny in 3D together
with ChatGPT.

## The problems we ran into

### An assistant that acts can't approve itself

A chat that only answers questions is easy. Diego wanted more: Skyny
should be able to launch a workflow, create a job or retry a run from the
conversation. And that brings up Skynet's usual question with a new face:
**who signs off?**

The first temptation is to tell the model to ask before acting. But
that's an instruction, and instructions get forgotten, misread or
skipped. What you need is for it to be **unable** to, even if it wanted
to.

There was another snag, smaller and more revealing. The plan said each
chat turn would be an agent run "of kind chat". But that column already
meant something else (start, resume, retry, fork), and adding a new value
there would have made it ambiguous for everything else. The chat had to
come into Skynet through the same door as the judges, not a new one.

### The fast loop surfaced every detail

From Wednesday on, the pace changed. Diego looked at the web app on his
phone, asked for a tweak, and an hour later was looking at it again. At
that pace, things came up that a code review never sees:

- the chat curtain **dropped from the top of the page**, not from the bar;
  and on mobile, the text box focused itself and the keyboard popped up
  halfway through the animation, shoving everything around;
- Skyny **showed up in 2D first and then jumped to 3D**: the 3D library
  loads separately, and while it arrived the app painted the flat fallback
  drawing;
- on iPad, short pages **scrolled a little for no reason**. The likely
  cause: a screen height that, on mobile, includes the browser bar.

None of them was hard. All of them were the kind you only see by using
the app.

### The design lived in another AI's file

On Saturday, Diego brought Claude his Skyny studio: a self-contained HTML
file he keeps polishing with Gemini and ChatGPT, with 34 moods, a hat, a
face and accessories. He wanted it inside the app.

The studio was on his Mac, out of the agent's reach, and had to be
connected read-only. But the real problem was something else: **between
versions, the studio had been rewritten from scratch**. It no longer
matched the 3D modules the app had built from the previous version.
Porting it surfaced the bugs a standalone HTML file hides: Skyny came out
too blue because it inherited the flat drawing's colour, one state had
lost its configuration, and in "Git conflict" **Skyny went invisible**
because a division returned `NaN`.

Diego asked the question that matters: "what do I have to do when I add
new states, or make a version 4.4?". Version 4.4 arrived the next day.

### And the bottleneck moved

With small PRs landing every few hours, the real jam showed up. **Hermes
wasn't deploying the interface PRs**: its auto-deploy rule recognised the
phase code in the title ("CH-D", "MV-F"), and these didn't have one. On
top of that, each one re-ran the full end-to-end test suite, which takes
forever, even when it touched nothing those tests cover.

The fix looked obvious, and Diego proposed it as a matter of course: **PRs
whose title starts with `UI:` deploy themselves**. A prefix. One line in a
rule.

It wasn't one line.

## How we solved it

### Skyny proposes, a person confirms

Chat actions became **proposals**. Skyny has tools to launch, create,
cancel, retry or save to memory, but none of them does anything: they
leave a pending card that expires in an hour. The person confirms, from
the web app, with their own session.

And the key part: **the token Skyny talks with can't reach the web app's
routes**. If it tries, it gets a 403. It isn't asked not to confirm
itself: it can't. Whatever Skyny saves to memory goes in unconfirmed, like
anything any other agent writes, and each conversation summarises itself
when archived or after half an hour of silence.

The chat turn came in as one more role, like the judges, with tight
limits: a small model, only Skynet's own tools, at most five minutes and
fifty cents per turn.

![Skynet's chat curtain open over the Home page. At the top, Skyny in 3D, a light-blue triangular robot with two white spheres and a black screen, labelled "En reposo" (idle). Below, the question "Que hay en marcha ahora mismo" (what's running right now) and the answer: nothing is running, 0 active runs; a test runner with no heartbeat since November 7 and quota warnings on the omarchy runner, Claude Code at 54 % and Codex at 35 % of their 7-day window. Then the question "Tienes acceso a la wiki?" (do you have access to the wiki?) and the "Pregúntale a Skyny" (ask Skyny) field with the Haiku model](/img/skynet-2026-11-22-chat.webp)

*The chat curtain, opened from the logo in the top bar, with a real
conversation from Sunday.*

### The interface, one tweak at a time

The five days of quick changes show across the whole app. The top bar
spans the full width and the logo opens the chat. The side menu, which no
longer fit, got grouped into tabs. Projects and runners became wide
cards, with each agent's version in chips. The curtain now slides out
from behind the bar, with no autofocus on mobile, and Skyny's slot fades
in while the 3D loads instead of showing the flat drawing.

![Skynet's Agents page with the full-width top bar and "SKYNET" as text on the left. At the top, three tabs: Runners, Proveedores (providers) and Consumo (usage). Two wide runner cards: ip-b-acceptance, tagged "Sin latido" (no heartbeat) with its simulated agents in orange chips; and omarchy, "En línea" (online), with chips for Antigravity CLI 1.5.14, Claude Code 2.1.319, Codex 0.167.0 and "Chat con Skyny"](/img/skynet-2026-11-22-runners.webp)

*Runners as cards, with tabs. The "Chat con Skyny" chip is what a runner
declares to be able to take chat turns.*

The Skyny studio was ported **whole**: instead of patching the 3D modules
to look like the new version, the app's engine became the studio's,
translated to TypeScript. That way the next version needs no
reinterpretation, just another port. The login kept only the essentials:
"Entra en Skynet" (enter Skynet), and Skyny waving, with messages
scrolling across its screen.

![Skynet's login screen: Skyny in 3D, tilted, with "HOLA" in cyan on its screen, above the title "Entra en Skynet" and the Usuario (user) and Contraseña (password) fields with the Entrar (enter) button](/img/skynet-2026-11-22-login.webp)

*The new login. Skyny flies in, waves and cycles through messages while it
waits.*

### The prefix, halfway, and rightly so

The testing part did get solved: `UI:` PRs that only touch the web app no
longer run the long end-to-end tests. They still run on merge to the main
branch, if the PR touches the tests themselves or anything outside the
web app, or if someone adds the label to ask for them.

Auto-deploy, on the other hand, **was not switched on**. Hermes built the
mechanism, tested it in isolation and found why it shouldn't be enabled.

#### The one technical bit in this post

Prefix-based auto-deploy looks like a condition:

```
if the title starts with "UI:" and CI is green → deploy
```

But every word in that line hides a question:

- **"CI is green"**: when? The PR opens with CI pending. Something has to
  look again when it finishes, and that "look again" has to survive a
  service restart. Also, a test skipped on purpose isn't the same as a
  test that never ran, and from the outside both look a lot like "nothing
  red".
- **"Deploy"**: which commit? If someone pushes another one while the
  previous is deploying, which wins? In Hermes's isolated tests, the
  existing queue let **an old worker release another worker's turn**, and
  let a new event **sit pending without ever starting**.
- **"Frontend only"**: for the CI rule just written, "web only" ignores
  `.md` files. For the rule Diego authorised, "frontend only" was strict.
  The PR being deployed by hand, #351, touched documentation outside the
  web folder. **The same PR was "frontend only" for one rule and not for
  the other.**

The prefix is a **claim** made by whoever writes the title. What you need
is a **check**: the files that change, the exact commit, the base, which
checks ran and which were skipped, and a single authority that decides
what deploys when two things arrive at once. Until that exists, #351 gets
deployed by hand.

## Meanwhile, Hermes

Hermes had a two-sided week. On Skynet it deployed every merge and
checked the services, but it made clear something it repeats every week:
**a healthy deploy is not an acceptance**. Two acceptance runs got stuck
because their guides were interactive and had no bounded script Hermes
could run on its own, and the GitHub integration still can't read its
private key on some startups, even when the API says everything is fine.

Outside Skynet, Hermes **doubled up**: there's a second instance on an old
Debian laptop, with its own bot, coordinated from the main machine. They
share the lab's private wiki, which is the common source of facts, but
not memory, conversations or credentials. That wiki is also the one
ChatGPT helped open up to the other agents this week: Hermes writes,
everyone else reads from a clone with three commands (orient, search,
read).

And a reminder that compiling isn't working: the laptop's Wi-Fi driver
recompiled cleanly and still couldn't find networks. It took going back to
the previous driver and checking it with a real reboot.

## What didn't go well

- Auto-deploy for `UI:` PRs **is not switched on**, and the most visible
  PR of the week is deployed by hand.
- Two acceptances were left open for lack of a bounded driver, and the
  GitHub integration's key is still failing.
- A PR was merged with six Sonar warnings the agent **couldn't read**: it
  has no access to Sonar's web UI and depends on Diego pasting the text.
- An issue didn't close because the PR said "Cierra #306" (Spanish for
  "closes"). GitHub only understands the English keywords.
- Some mobile fixes are **unverified on the device**: the phantom iPad
  scroll and Skyny following your finger in the curtain.
- Wiki and curator work, but on the test machine they're still **empty**:
  the test project has no history to curate.

## What I'm taking away

- **A label is a claim, not a check.** It expresses intent; the decision
  belongs to facts you can verify.
- **Define a rule's words once.** "Frontend only" ended up meaning two
  things in two places in the same week.
- **When the change loop speeds up, the bottleneck moves.** With big
  changes every few days, deploying by hand didn't hurt. With small
  changes every hour, it became the main problem.
- **An assistant that can act must not be able to approve itself.** Not by
  instruction, by design: its credential doesn't reach where things get
  confirmed.
- **A design made in another AI is a contract.** You port it whole; you
  don't reinterpret it piece by piece.

Next: a single deploy authority for `UI:` PRs, tested with pending CI,
commit changes and restarts; deciding whether documentation counts as
frontend; merging #351; and filling the wiki with real projects.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">5-hour windows per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>W</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">16 windows across 6 Claude cloud sessions, one of them the Sunday before · Sunday 15 17:15 → Sunday 22 16:07 · no activity on Thursday · the weekly quota reached 79 % with a warning before Saturday's 21:00 reset, without running out · no 5-hour limit hit</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">16</span>
  <span class="ws-note">All in Skynet, #329 to #350 · 185 cumulative · #351 still open</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines in Skynet</span>
  <span class="ws-v">+15,721 / −1,188</span>
  <span class="ws-meter"><i class="ws-add" style="width:93%"></i><i class="ws-del" style="width:7%"></i></span>
  <span class="ws-note">Summed PR by PR · the net diff of <code>main</code> touches 168 files</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V58 → V66</span>
  <span class="ws-note">9 new: wiki, curation, who saw what, conversations, their token, actions, turns and summaries</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones finished</span>
  <span class="ws-v">2</span>
  <span class="ws-note">MV "Living memory" and CH "Chat with Skyny" · 11 issues closed</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts to Claude</span>
  <span class="ws-v">56</span>
  <span class="ws-meter"><i class="ws-fill" style="width:57%"></i></span>
  <span class="ws-note">57 % in the quick interface changes thread (32) · 3.5 per 5-hour window</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Messages to Hermes</span>
  <span class="ws-v">43</span>
  <span class="ws-note">14 sessions and 308 tool calls in the calendar week · a second instance up and running</span>
</div>

<div class="ws-row">
  <span class="ws-i">🎨</span>
  <span class="ws-k">Gemini sessions</span>
  <span class="ws-v">6</span>
  <span class="ws-note">≈156k estimated tokens, nearly all on Skyny's 3D studio (v4.3 and v4.4) · ChatGPT: 3 threads on the wiki and the slides</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">API-equivalent cost</span>
  <span class="ws-v">≈$174</span>
  <span class="ws-note">Estimated from Claude's token usage, within the subscription and no overage · Gemini, within its flat plan</span>
</div>

</div>

<blockquote><small>The screenshots are from Skynet's private deploy on the
test machine, on Sunday 22 in the afternoon, with #351 deployed by hand.
The chat conversation is real, from Sunday morning; that's why it mentions
a test runner with no heartbeat and quotas that have since reset. Wiki and
curator aren't shown because they were empty on that deploy. The Hermes
count comes from its local index of the calendar week; its Insights, with
a rolling window from the 15th to the 22nd, give different figures.
Gemini's tokens are its own estimate.</small></blockquote>
