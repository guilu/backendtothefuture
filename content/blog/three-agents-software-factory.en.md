---
title: "Multi-agent workflow: ChatGPT, Claude and a custom operator"
date: "2026-07-05"
description: "A week using ChatGPT, Claude, and Hermes to turn Forma, TokenMeter, Backend to the Future, and the homelab into a more repeatable software assembly line."
tags: ["weekly", "ai-agents", "multi-agent", "devops", "product"]
thumb: "/blog/three-agents-software-factory-thumb.webp"
cover: "/blog/three-agents-software-factory-cover.webp"
---

## The week in one sentence

This week wasn't just about shipping features. It was about building the factory that ships them.

I worked with three agents in different roles: ChatGPT for product thinking, architecture, and backlog shaping; Claude for technical discussion, implementation strategy, and engineering critique; Hermes for operating the real system: repositories, Docker, Jira, GitHub, nginx, Grafana, Home Assistant, and deployments.

The interesting part is not that each agent did “AI things”. The interesting part is that, when they all share context — Jira, specs, ADRs, skills, repositories, and smoke tests — they stop feeling like isolated chats and start feeling like a small software team.

## The product stopped being just an idea

The center of the week was **Forma**, a fitness application that now lives at `forma.diegobarrioh.dev` and in Jira under the `FOR` project.

ChatGPT helped mostly with turning the idea into a product: epics, modules, functional structure, backlog, and acceptance criteria. The conversation was less about writing code and more about removing ambiguity. Which modules exist? What does Body Composition mean? What belongs in Training? Which stories are part of Foundation? What needs to be explicit so another agent can implement without asking every two minutes?

![Initial Forma mockup generated with ChatGPT](/img/mockup-forma.png)

That mockup was more useful than it might look. It was not just a nice image: it fixed the visual language, the main modules, and the feel of the product before asking any agent to write code. When the AI team shares a visual reference, ambiguity drops dramatically.

The result is that Forma started to have a recognizable shape:

- application shell;
- dashboard;
- training, nutrition, body composition, and progress modules;
- settings and navigation;
- PostgreSQL database;
- planned external integrations;
- backlog structured by epics;
- stories with goal, business value, specification, technical notes, acceptance criteria, and Definition of Done.

The lesson was clear: models usually don't get stuck because they cannot write code. They get stuck because the requirements are ambiguous. The more boring and explicit the specification is, the more consistent the implementation becomes.

## Claude and the idea of building the factory

Claude focused on something that became central this week: the visible product was not the only thing that mattered. The valuable part was the assembly line.

Forma started with FOR-93, a story designed to validate the AI-assisted development workflow. The goal was not yet to build the flashiest feature, but to prove that a Jira story could become a reviewable PR through a repeatable path:

- read `AGENTS.md`;
- read the story and its specs;
- read related ADRs and documentation;
- create a branch;
- implement;
- verify;
- commit;
- open a PR;
- leave evidence behind.

The trial run with FOR-89, local development documentation, proved that the method held. After that, the loop started to repeat: Jira story, specs, PR, merge, clean main and stale branches, next story.

Along the way, the foundations landed:

- FOR-80: backend skeleton with Spring Boot, Java 21, and Gradle;
- FOR-81: frontend skeleton with Vite, React, and TypeScript;
- FOR-82: local environment with Docker Compose;
- FOR-83 to FOR-88: API base, testing, and technical structure;
- FOR-90: secrets and environment configuration with fail-fast behavior for production.

The most interesting moment came with FOR-94. That story did not fit the mold of “implement a story from specs”, because the goal was precisely to generate specs for an epic. The first temptation was to add a special case to the existing workflow. The better answer was to separate responsibilities.

One tool generates epic specs. Another implements stories from specs. That clean seam is worth more than a quick patch.

## Hermes: from scattered commands to operational memory

While ChatGPT and Claude worked on product, specs, and architecture, Hermes lived in the physical world: servers, containers, public routes, logs, health checks, and dashboards.

First we enabled `forma.diegobarrioh.dev` on the public nginx running on `red.local`, with SSL and reverse proxying to the frontend on the Omarchy host. The port convention became explicit:

- Akademia uses `3000`;
- TokenMeter uses `3001`;
- Forma uses `3002`;
- the next project should start by proposing `3003`.

That procedure became the `nginx-public-site-enable` skill. It is not just a note: it forces discovery of existing sites, port inspection, proposing the next port, creating HTTP first, issuing the certificate, writing HTTPS, validating `nginx -t`, reloading nginx, and running smoke tests.

Then we created `forma-ops`, the equivalent of `tokenmeter-ops` and `akademia-ops`. Forma became a first-class operational project: repository in `~/code/forma`, Jira `FOR`, public URL, `for up`, `for down`, Docker Compose, smoke tests, logs, and PR evidence.

The first real validation was imperfect, and that made it useful. Compose was still publishing temporary ports that did not fully match the target design, so we brought Forma up with safe validation overrides:

```bash
FRONTEND_PORT=3002 BACKEND_PORT=18080 POSTGRES_PORT=15432
```

Then we verified what actually matters: local frontend, healthy containers, backend actuator, public URL, and PR state. That is the difference between “Docker starts” and “this PR has been operationally validated”.

![Current state of Forma at the end of the development week](/img/forma-current-state-2026-07-05.png)

By the end of the week, Forma was no longer just backlog and architecture. It is still a skeleton, and the screen says so: the daily summary will be built once data sources exist. But there is already a real app running in production, with navigation, layout, visual theme, and modules ready for the next stories to start filling product instead of infrastructure.

## TokenMeter: when tests protect the bug

TokenMeter produced the sharpest technical lesson of the week.

GA4 was reporting no data for `tokenmeter.backendtothefuture.com`. The strange part was that `gtag.js` loaded correctly, the measurement ID was right, and everything looked reasonable. The problem was one line: the `gtag` shim was written as an arrow function that pushed a flat array into `dataLayer`.

The official Google snippet does not do that. It uses a normal function and pushes the native `arguments` object. `gtag.js` expects that exact shape. The flat array is silently ignored. No nice error. No red console. Just no real analytics request.

The worst part: the tests were green because they validated the buggy shape. They were not detecting the problem; they were protecting it.

The real fix was not only changing one line. It was changing the test contract:

- validate the real shape expected by `gtag.js`;
- add a regression so no `dataLayer` entry is ever a flat array;
- verify analytics through Network and real hits, not only through a green build.

That is a useful lesson for any agent workflow: a test that encodes the bug is worse than no test. It gives confidence exactly where it should not.

## Fresh data, logs, and observability

There was also TokenMeter work around data and observability.

The “Popular this week” section was using the GitHub Search API in a way that returned repositories with high absolute star counts, not necessarily real trending repositories. The result was a list that felt too stable, almost frozen. The solution moved toward an adapter that reads real trending data and keeps the Search API as fallback.

TKM-72 also landed, and backend logs improved for the central Promtail → Loki → Grafana stack on `red.local`.

The pattern repeats: it is not enough to have a feature. You need to observe it, understand it, and change its data source without breaking the whole system.

## Backend to the Future and the invisible side of publishing

Backend to the Future also showed up this week, in a less flashy but important way.

There was ongoing work around Google indexing. Some pages were not being indexed as expected, and the diagnosis expanded to include the TokenMeter subdomain, with its own sitemap and analytics tag.

Publishing content does not end with writing Markdown and deploying. You also need to think about how Google discovers pages, which sitemap it sees, which Search Console property applies, and whether analytics is actually measuring what you think it is measuring.

It is the same theme again: the value lives in the system around the content.

## Home Assistant, Grafana, and the real homelab

Hermes also kept operating the house.

In Home Assistant we refined dashboards: Mushroom chips with temperature-based colors, cleaner cards, dark backgrounds, thinner `mini-graph-card` lines, and a Trakt integration that clarified an important point: sensors are not manual lists; they are derived views of the Trakt account.

In Grafana we investigated an alert with many `429` responses on `audio.diegobarrioh.dev`. The conclusion was that Audiobookshelf was fine; the noise came from an external scanner looking for `.env`, `.git`, WordPress paths, and common vulnerable files. Nginx was doing the right thing: rate limiting.

We also diagnosed an Omarchy freeze. There was no OOM, no full disk, and no serious filesystem failure. There was a Hyprland segfault inside `libaquamarine.so.0.10.0`, followed by `upower` errors. The more precise conclusion was that the graphical session likely crashed, not the whole system.

That distinction matters. Rebooting everything fixes the symptom, but understanding what actually crashed helps operate better next time.

## Small security: public actuator

We closed the week with a simple but important check: whether actuator endpoints were reachable from outside.

We tested routes such as:

```text
https://forma.diegobarrioh.dev/actuator/health
https://akademia.diegobarrioh.dev/actuator/health
https://tokenmeter.backendtothefuture.com/actuator/health
```

All returned `200`, but it was not Spring Actuator. It was the frontend `index.html` served by the SPA fallback.

That is a good lesson: in a SPA, a `200` does not necessarily mean the endpoint exists. It can simply mean nginx is serving the frontend for any unknown route.

In this case, the right answer was that there did not appear to be a real public actuator endpoint. And that is what we want.

## The three-agent team

Looking at the whole week, the division of work felt natural:

- **ChatGPT** helped think through the product: vision, modules, backlog, roadmap, architecture, and requirement ambiguity.
- **Claude** helped turn that into a development factory: workflows, specs, stories, PRs, tests, and technical decisions.
- **Hermes** operated the real world: repositories, containers, nginx, certificates, GitHub, Jira, Grafana, Home Assistant, and smoke tests.

The productivity gain did not come from one model being magically better than another. It came from assigning roles and sharing context.

The repository, Jira, specs, ADRs, and skills became the shared source of truth. The better that source becomes, the less the result depends on the memory of a specific conversation.

## Lowlights

Not everything was clean.

The DeepSeek tokenizer in TokenMeter exposed a classic native dependency problem: something can work on one host and fail on another because of library loading. The GA4 bug had been alive for a while because the test suite protected the wrong behavior. And Forma moved quickly, but mostly through foundations: backend, frontend, Docker, testing, configuration, and workflow. The visible fitness features start now.

There is also a clear tension: the faster the pipeline becomes, the more important its boundaries become. If a skill tries to do everything, it fills up with special cases. If tests validate what the agent happened to write instead of the external contract, they create false confidence.

## My takeaway

This week confirmed an idea that feels increasingly important: working with agents is not about asking for code faster. It is about moving engineering upstream.

The bottleneck is no longer only writing software. It is describing it well, structuring the backlog, defining contracts, creating workflows, validating with evidence, and leaving reusable procedures behind.

The factory matters as much as the product.

Forma is not yet a complete fitness application. TokenMeter still has technical debt. Backend to the Future still has indexing work. The homelab still has old and fragile pieces.

But something important happened this week: ChatGPT, Claude, and Hermes did not work as three isolated chats. They worked around the same assembly line.

And when that happens, each session stops being an experiment and starts becoming accumulated capability.
