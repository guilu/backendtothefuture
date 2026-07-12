---
title: "Forma matures: the week I standardized the software factory"
date: "2026-07-12"
description: "Recap for July 6-12: Forma, the fitness-tracking app I kicked off last week, gains muscle screen by screen, and with it a standardized factory: two skills (jira-sdd-ai and jira-sdd-specs) to manage and implement the project, and an operations agent (Hermes) that spins up the nginx sites, publishes them, and verifies everything with a single command: for up."
tags: ["weekly", "ai-engineering", "spec-driven-development", "ai-agents", "spring-boot"]
thumb: "/blog/standardizing-the-software-factory-with-ai-agents-thumb.webp"
cover: "/blog/standardizing-the-software-factory-with-ai-agents-cover.webp"
---

## The week in one sentence

I kicked off **Forma** last week. This week the app stopped being a skeleton with four screens and started to **gain real muscle**: module after module, story after story. But what I really built wasn't just the app: it was the **factory** that manufactures it. And like any factory worth its name, the point wasn't the individual parts, it was the assembly line: skills that standardize how the code gets thought out and written, and a worker that deploys and verifies it without me having to watch.

Let me walk you through it in layers, because the lesson of the week lives exactly in how they fit together.

## Forma grows: from skeleton to product

Forma is a fitness-tracking app: body composition, training, nutrition, shopping list, progress, integrations, and settings. Spring Boot on the backend, Vite on the frontend, PostgreSQL underneath. Last week it was little more than scaffolding; this week it filled out. Here's how the dashboard looks today, running in production:

![Forma's current dashboard: side navigation with every module, body-composition cards (weight, body fat, muscle mass, BMI), a weight-evolution chart, and training, nutrition, and shopping-budget widgets](/img/forma-current-state-2026-07-12.png)

And there's the first trap most people miss: **having clear modules is not having a project**. A tidy idea in your head is still chaos to any agent that has to implement it, because it lacks what actually matters: goals, acceptance criteria, architecture rules, and an order.

So before writing a single line of business logic, the right question wasn't "how do I build the nutrition screen?". It was "how do I turn this idea into something an assembly line can execute story by story, without asking me for clarification every minute?". That question is what shaped the factory.

## Standardizing the factory: two skills, two jobs

Here's the heart of the week. I split the work into **two skills** that do two deliberately different things. Think of it as the difference between the **architect who draws the blueprints** and the **bricklayer who raises the wall**: different trades, different tools, and mixing them is exactly where projects sink.

**`jira-sdd-specs` - the architect.** Its only job is to turn a Jira epic into implementable stories: each with a goal, value, acceptance criteria, and Definition of Done, written as specs under `specs/FOR-XXX/`. It never touches code. Ever. And because the decisions here are architectural -where each thing lives, what contract it exposes, which rules it respects- this skill uses **Opus exclusively**. The expensive reasoning goes where the shape of the building is decided.

**`jira-sdd-ai` - the bricklayer.** Its job is to implement **one** story at a time, with the repository as the source of truth. It reads the specs, reads `AGENTS.md` (which forces it to know the architecture, ADRs, and repo reality before touching anything), implements, opens a PR. Because the work here is executing a blueprint that already exists, this skill **delegates code writing to a Sonnet subagent**. And Git plumbing -merging, deleting branches, pulling- is a candidate to drop down to Haiku.

Why split the models like that? Because not all work costs the same to think through. Putting Opus to move branches is like sending your senior architect to sweep the site: it works, but you're burning talent where it adds nothing. **The expensive model decides; the cheap model executes.** That's the rule, baked into the skills themselves so it enforces itself.

The result of standardizing this way was an almost hypnotic rhythm that repeats across every transcript of the week: *spec the epic → implement a story → open PR → merge → clean branches → next*. Dozens of times. From FOR-15 to the FOR-56-63 run. In a few days, body composition, training, nutrition, shopping, insights, dashboard, design system, navigation, integrations, and settings all landed. It's not "finished product", but it's something better: **it's a pipeline that works**. Stories enter on one side and come out the other as reviewed code.

## Hermes: the worker who publishes and verifies

An assembly line that produces code but doesn't deploy it is only halfway done. Enter the third character: **Hermes**, the operations agent. If `jira-sdd-specs` is the architect and `jira-sdd-ai` the bricklayer, Hermes is the **site foreman who hands over the keys** and checks the house is standing.

Hermes handled two big things this week. First, **generating the nginx sites and publishing them**: configuring the public routes, bringing up `forma.diegobarrioh.dev` on the server, and confirming the details a careless agent would break -for example, that in Forma both `/` and `/api/` point to the same `192.168.1.175:3002` **by design**, not a bug to "fix"-. It also documented the real rate limits after reading `nginx.conf` and validating with `nginx -t`: `forma_limit`, `akademia_limit`, and `tokenmeter_limit`, at 10r/s each.

And second, the most useful part: it distilled the whole deployment ritual into **a single command, `for up`**. This is pure factory thinking. `for up` no longer means "start something"; it means a complete, verified sequence:

1. sync the repo
2. build
3. bring up the Docker containers
4. verify they're *healthy*
5. test the frontend and the backend's `/actuator/health`
6. inspect logs and **report evidence**

The difference between "I think it works" and this:

```text
local frontend : http://127.0.0.1:3002/ -> 200 OK
public frontend: https://forma.diegobarrioh.dev -> HTTP/2 200
backend health : /actuator/health -> {"status":"UP"}
containers     : frontend, backend, postgres healthy
```

That's what a good procedure gives you: it turns an investigation you did once into something that runs the same way every time. Next time you don't remember the steps -you run them.

## The lessons two bugs left behind

Two failures taught more than many green stories.

**The `localhost` bug.** The frontend was compiled with `http://localhost:8080` hardcoded as `VITE_API_BASE_URL`. Locally, perfect; in production, pointing at the user's own machine. The root cause: **Vite build variables are baked at compile time, not runtime**. An `ARG` defaulting to `localhost` in a `Dockerfile` is a trap waiting for production. And the good fix wasn't "fix CORS": it was going layer by layer -does the bundle contain `localhost`? does the front use same-origin `/api`? does nginx route `/api/`? does a real `POST` return `201`?- and documenting that checklist in the Forma skill so it never gets re-investigated.

**The `uuid = varchar` bug.** Queries comparing PostgreSQL `uuid` columns against Java `String` parameters. H2 forgives it; PostgreSQL doesn't, and throws `operator does not exist: uuid = character varying`. The moral: `200 OK` isn't always success, and a test that passes on H2 guarantees nothing on the real database.

## The thread connecting it all

The app moved forward, yes. But if a month from now someone asks what I built this week, the honest answer isn't "Forma's screens". It's **the factory**: two skills that separate thinking from executing, a worker that publishes and verifies with one command, and a clear rule about which model does what. Forma was the first product to roll off that assembly line. It won't be the last.

## Takeaways

- **A tidy idea in your head is not a project.** Until it has specs with acceptance criteria, it's still chaos for whoever implements it.
- **Separate the architect from the bricklayer.** `jira-sdd-specs` thinks (Opus), `jira-sdd-ai` executes (Sonnet). Mixing them is where projects die.
- **The expensive model decides, the cheap one executes.** Putting Opus to move branches is burning talent where it adds nothing.
- **A good procedure is run, not remembered.** `for up` turned a deployment ritual into a single command with evidence.
- Frontend build-time variables are a constant foot-gun: never a `localhost` default in an `ARG`.

## What's next

Keep working down the "UI Backend enablers" epics to close the wiring gaps, and finish the FOR-56-63 run with the deltas note that will feed the final enabler. And, at some point, back to Backend to the Future -which this week only saw this recap go by-.
