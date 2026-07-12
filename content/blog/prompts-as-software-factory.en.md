---
title: "Prompts as a production line"
date: "2026-07-12"
description: "A weekly recap on how prompts stopped being isolated messages and became a production line for Forma, operations, and real validation."
tags: ["weekly", "ai-agents", "prompts", "forma", "devops"]
thumb: "/blog/prompts-as-software-factory-thumb.webp"
cover: "/blog/prompts-as-software-factory-cover.webp"
---

## The week in one sentence

This week prompts stopped feeling like conversations and started feeling like machinery.

Not machinery in the grandiose sense of “AI replaces the team”, but something much more practical: a sequence of instructions, constraints, evidence, and checks that turns an idea into backlog, backlog into PRs, PRs into containers, and containers into a public application with smoke tests.

The important difference was not writing prettier prompts. It was making them more operational.

## A prompt is not a sentence: it is an interface

When you work with agents for several days in a row, the prompt stops being only “what you ask the model”. It becomes an interface between systems:

- product intent;
- the real state of the repository;
- architecture rules;
- Jira and its stories;
- GitHub and its pull requests;
- Docker and its containers;
- nginx and public routes;
- Grafana, logs, and smoke tests.

A weak prompt asks for an output. A strong prompt defines the context, the boundaries, and the evidence that will tell us whether the output is useful.

This week the main example was **Forma**.

## Forma: from product prompts to a visible application

Forma moved a lot this week. At the beginning it was a product with clear modules in my head: body composition, training, nutrition, shopping, progress, integrations, and settings. But modules are not enough. They need to become a sequence that other agents can execute without asking for clarification every minute.

Prompts did three different jobs there.

First, they helped split the product into epics and stories. Not a vague feature list, but goals, value, acceptance criteria, and Definition of Done. That became specs under `specs/FOR-XXX/` and a more repeatable workflow for Claude and Hermes.

Then they helped keep agents inside the lane. `AGENTS.md` is not decoration: it forces the agent to read the architecture, ADRs, specs, and repository reality before implementing. That changes the implicit prompt from “build this feature” into “implement this story inside this system, with these rules and these checks”.

Finally, prompts became operational. `for up` no longer means “start something”. It means: sync the repo, build, start Docker, verify containers, test the frontend, test actuator, inspect logs, and report evidence.

That is the jump: the prompt stops being a request and becomes a protocol.

## The Forma conveyor belt

The week left a clear chain:

1. Product prompt: define modules, screens, and expected behavior.
2. Specification prompt: turn epics into implementable stories.
3. Implementation prompt: Claude works on one story and opens a PR.
4. Operations prompt: Hermes updates `main`, rebuilds Docker, and smoke-tests.
5. Closure prompt: evidence, clean branch state, merged PR, next story.

The result is visible in Forma's history. In a few days, body composition, training, nutrition, shopping, insights, dashboard, design system, navigation, integrations, and settings landed.

That does not mean “finished product”. But it does mean the pipeline works. Stories enter on one side and come out as reviewed code, healthy containers, and checked public routes.

This week `main` reached:

```text
461d50a ✨ feat(ui): build profile and settings screens (FOR-58) (#85)
```

And `for up` validated the real app:

```text
local frontend : http://127.0.0.1:3002/ -> 200 OK
public frontend: https://forma.diegobarrioh.dev -> HTTP/2 200
backend health : /actuator/health -> {"status":"UP"}
containers     : frontend, backend, postgres healthy
```

That is not just “AI wrote code”. It is a chain of prompts with verification at the end.

## Prompts also fix the system

One interesting part of the week was that prompts were not only used to build. They were used to debug the system itself.

Forma hit a classic public-application problem: the UI tried to talk to `localhost:8080` from the browser. Locally that can look reasonable. In production it is nonsense: `localhost` is the user's machine, not the backend.

The solution was not to say “fix CORS” and hope for magic. A good prompt separates layers:

- does the bundle contain `localhost:8080`?
- does the frontend use same-origin `/api`?
- does public nginx route `/api/` correctly?
- does the backend allow the public origin?
- does a browser-like `OPTIONS` return the right headers?
- does a real `POST` return `201`?

That pattern ended up documented in the Forma skill. Next time the investigation does not need to be rediscovered: the procedure is available.

Another bug was less visible but more backend-shaped: PostgreSQL queries comparing `uuid` columns with Java `String` parameters. H2 does not always expose it; PostgreSQL does. A useful prompt does not stop at “there is a 500”. It reads logs, recognizes `operator does not exist: uuid = character varying`, inspects the JDBC repository, and forces real `UUID` binding.

Again: prompt as diagnostic checklist, not as wish.

## Network, nginx, and rate limits: prompts against ambiguity

There were also pure operations prompts.

When I asked whether WiFi was down, the useful answer was not “seems fine”. It was measurement:

- interface `wlan0`;
- SSID `dbhstudios_5G`;
- IP `192.168.1.175`;
- gateway `192.168.1.1`;
- ping to the gateway, `1.1.1.1`, and `8.8.8.8`;
- DNS;
- real HTTPS;
- local hosts such as `red.local`, `black.local`, and `homeassistant.local`.

The right prompt forces the distinction between “there is no WiFi”, “this device has no Internet”, “DNS is failing”, “the LAN is alive but a service is down”, and “one specific host is slow”.

The same happened with nginx on `red.local`. The question was whether Akademia, TokenMeter, and Forma had rate limiting. The useful answer was to SSH into `red.local`, read `nginx.conf`, inspect `sites-enabled`, validate `nginx -t`, and confirm the zones:

```nginx
akademia_limit   10r/s
tokenmeter_limit 10r/s
forma_limit      10r/s
```

It also clarified an intentional design detail in Forma: `/` and `/api/` both point to `192.168.1.175:3002`, and the internal frontend nginx handles API routing. That is a small detail, but it prevents a future agent from “fixing” something that was actually design.

## The weekly prompt as a memory tool

This article is part of the system too.

The weekly recap is not a vanity post. It is a way of compressing operational learning:

- which prompts worked;
- which prompts were too ambiguous;
- which procedures deserve to become skills;
- which checks prevented a false conclusion;
- which small decisions protect the system.

Last week the theme was the multi-agent workflow: ChatGPT, Claude, and Hermes as a small assembly line. This week the focus is one level lower: the concrete prompts that keep that assembly line from turning into chaos.

A good weekly prompt does not list everything. It chooses the narrative thread. This week the thread was clear: prompts as operational interfaces.

## What I learned

I am taking five ideas from the week.

First: the more real the system is, the less useful a generic prompt becomes. “Check the network” is not enough. You need to define which layers to measure and what evidence counts.

Second: the best prompts eventually become procedures. If an investigation repeats, it should become a skill, script, or checklist.

Third: `200 OK` does not always mean success. It may be a SPA fallback, the wrong endpoint, or an HTML response where you expected JSON.

Fourth: an agent needs boundaries as much as it needs context. Telling it what not to touch, what not to assume, and what to verify is part of the prompt.

Fifth: the result of a week is not only commits. It is also better prompts.

## My takeaway

This week Forma moved forward, nginx became better understood, the network was diagnosed more precisely, and the agent pipeline kept accelerating.

But the main lesson was different: prompts are starting to become infrastructure.

Not because they live in a magic file, but because they connect intent, context, rules, and verification. When a prompt captures that interface well, the agent does not only produce text or code. It produces a traceable intervention on a real system.

And when many good prompts are chained together, something like a factory starts to appear.
