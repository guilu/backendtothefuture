---
title: "My CI turned green without running a test"
date: "2026-09-20"
description: "Week of 14–20 September. I built a CI job to verify database migrations against a real PostgreSQL. It passed first time, green, without running a single test. Pulling that thread surfaced the pattern that shaped the whole week: the system was full of claims nobody was checking."
tags: ["weekly", "forma", "ci", "postgresql", "testing", "ai-agents", "claude-code"]
projects: ["forma"]
thumb: "/blog/my-ci-turned-green-without-running-a-test-thumb.webp"
cover: "/blog/my-ci-turned-green-without-running-a-test-cover.webp"
ogImage: "/blog/my-ci-turned-green-without-running-a-test-og.jpg"
---

## What we set out to do

Forma is the training and nutrition app I'm building with AI agents. Last week
I had three things on the list, and none of them was particularly exciting:

1. **Turn the plan generator into something real.** Until now the wizard
   collected answers and produced nothing. It needed vocabulary, persistence,
   an API and a contract with the AI agent that writes the plan.
2. **Unify the domains.** Akademia and Forma each lived somewhere else; time to
   bring them under the same umbrella as TokenMeter, on
   `backendtothefuture.com`.
3. **Make the READMEs decent** in the repos that had fallen behind.

What actually happened was something else. Midweek I set up a continuous
integration job to verify the database migrations against a real PostgreSQL,
because until then they were validated against H2 in compatibility mode. The
job passed. Green, first try. I stared at the log for a long while, because the
log said `BUILD SUCCESSFUL` and nothing else.

It hadn't run a single test.

From there I couldn't stop seeing the same thing everywhere. This week wasn't
about nutrition plans or DNS. It was about **claims nobody checks**.

## The problems we ran into

### The dashboard assumed a plan that didn't exist

I started by implementing Google sign-in, the same one I already had in
Akademia. It worked, and the first thing I did was log in with a brand-new,
empty account.

The dashboard greeted me with a banner reading **"Your plan is under way"**.

There was no plan. There was nothing. The component never checked whether there
was data behind it: it painted that sentence always, for everyone, from the
first second. And two screens away there was a button, "Create your free plan",
that led to the public, anonymous funnel on the landing page — a form that
captures a lead and that, for someone already signed in, produces absolutely
nothing. The user filled in four steps and came back exactly as they were.

Neither of those was a logic bug. Both were the interface claiming something
the backend couldn't back up.

### Guessing someone's calories

The plan generator's original design had a decision that seemed reasonable to
me when I wrote it: infer the direction of the plan from the user's general
goal. If someone had said their goal was "body composition", the system assumed
fat loss and applied a 20% deficit.

Diego rejected it, and he was right. "Body composition" is an equally honest
answer for someone who wants to lose fat and for someone who wants to gain
muscle. A silent 20% deficit applied to the wrong person isn't a product
detail: it's a claim about what somebody should eat, made without asking.

The wizard now asks explicitly, in a step of its own. And along the way a
free-text field disappeared — "foods you'd rather avoid" — which was exactly
where people write their allergies and their medical conditions. GDPR Article 9
special-category data, collected in a text box nobody ever read.

### H2 says PostgreSQL, and it isn't PostgreSQL

The project's 62 migrations were validated on every pull request against H2 in
PostgreSQL compatibility mode. That mode is a compatibility layer, not Postgres,
and it had already bent real design decisions: there's a partial-unique-index
trick in the schema that exists solely because H2 won't parse the syntax
Postgres accepts.

Which means: no migration in this repository had ever been verified against the
database that runs in production before being deployed.

The fix was obvious: a separate CI job, a `postgres:17-alpine` container, and
apply all 62 migrations against it. I built it, it went green, and that's where
it got interesting.

#### The one technical dive in this post

A Gradle `Test` task that matches no tests **does not fail**. It finishes
successfully, silently, in a couple of seconds. Filter by a JUnit tag nobody
uses and the build is still green.

The first thing I reached for was the option that looks purpose-built for this:

```groovy
test {
  filter { failOnNoMatchingTests = true }
}
```

It doesn't help. That property governs filters **by name** (`--tests`,
`includeTestsMatching`), not JUnit Platform's `includeTags`. I checked it by
pointing `includeTags` at a tag that doesn't exist, on Gradle 8.14.1: still
`BUILD SUCCESSFUL`. And `failOnNoDiscoveredTests` doesn't exist in that version.

What does work is counting and breaking:

```groovy
tasks.register('postgresTest', Test) {
    useJUnitPlatform {
        includeTags 'postgres'
    }

    def executedTests = new java.util.concurrent.atomic.AtomicInteger()
    afterTest { desc, result -> executedTests.incrementAndGet() }
    doLast {
        if (executedTests.get() == 0) {
            throw new GradleException(
                'postgresTest ran zero tests: the `postgres` tag matched nothing, ' +
                'so not a single migration was verified against real PostgreSQL.')
        }
    }

    // Without this the CI log shows only `BUILD SUCCESSFUL`, and a reader
    // cannot tell a real 62-migration run from a no-op.
    testLogging {
        showStandardStreams = true
        events 'passed', 'failed'
    }
}
```

Two ideas: **the job counts what it runs and breaks if that's zero**, and the
log prints how many migrations it applied and which one was last. A job that
verifies something has to be able to prove it in its own log. If reading the
output can't tell "verified 62 migrations" apart from "did nothing", that job
isn't a guarantee: it's a green ornament.

### The plan the agent claims isn't the plan that adds up

This is the same mistake, made by an AI instead of by me.

When a model generates a nutrition plan it returns the meals **and** the day's
calorie and macro totals. Those totals are a claim it makes. The repository
contains a real LLM-generated diet, imported weeks ago, in which the calories
the model itself declares fall short **by between 379 and 702 kcal every day**
compared to what its own food list adds up to. Every single day. Protein,
curiously, checks out.

The spec had said from the start that the backend must recalculate and validate
before saving anything, "because the AI may report an incorrect total". It had
never been implemented.

The hard part wasn't deciding how to recalculate — it was deciding what to do
with the difference. And the right answer is: **nothing**. The auditor reports
and never corrects the declared value, because the distance between declared and
calculated *is* the evidence that the model got it wrong. Overwrite it and you
delete the only proof you had.

### A domain isn't migrated until the login works

The domain change looked like the boring task of the week. It wasn't.

An OAuth `redirect_uri` is an exact match against what's registered in the
provider's console. Changing the domain in code without registering the new URL
— **first**, and without removing the old one — takes the login down in the
window between deploy and registration. And it had to be checked across four
providers and two applications, with Akademia's OAuth client hiding in a
different Google Cloud project from Forma's.

What we did was not read the configuration and call it good. We started the real
flow for both applications, followed the redirect all the way to Google, and
confirmed each one reached its login screen with the correct client. That's the
difference between reviewing a list of URLs and verifying a flow.

### On Sunday three applications went down. None of them were down

With the domains now behind Cloudflare's proxy, on Sunday all three apps stopped
responding from the home wifi. At the same time.

Nothing was broken. The containers were healthy, nginx validated its config, all
three upstreams returned 200, and everything loaded fine over mobile data. The
failure sat between the ISP and Cloudflare's anycast range: neither the laptop,
nor the wired machine, nor the router itself could reach those two IPs, while
the rest of the internet was perfectly fine.

Akademia gave the clean comparison: its old domain, still pointing straight at
the public IP, worked from home; the new one, behind the edge, didn't. A symptom
that looked like "everything is down" was, once again, an unverified claim —
mine this time.

## How it turned out

The first-run wizard now asks for the plan's direction in a step of its own,
with the three options and what each one means spelled out underneath. Nothing
is inferred:

![Step 4 of 8 in Forma's first-run wizard, dark theme: header with the FORMA logotype, the title "Configuración inicial", the "Ahora no, ir al panel" exit link and a progress bar at 50%; below it the "Dirección del plan" step asking which direction the next plan should take — noting that this decides the calorie target and is different from the general goal — with three selectable cards: Perder grasa (selected, green border, "a calorie deficit to reduce body fat"), Ganar músculo ("a calorie surplus to gain muscle mass") and Mantenerme ("keep your current weight and composition"); Back, Skip this step and Next buttons at the foot](/img/forma-2026-09-20-onboarding-direccion.webp)

And when you finish, the request actually goes out to the backend, which freezes
it with the calories already computed:

![Final screen of Forma's first-run wizard: the heading "Todo listo", text confirming the preferences have been saved, a green highlighted notice reading "Hemos enviado tu petición de un plan generado por IA", and a "Ir al panel" button](/img/forma-2026-09-20-onboarding-completion.webp)

For an account with no plan, the dashboard no longer promises anything. The menu
widget says there are no meals for today, and the notice at the bottom says
exactly what is going on, with a button to the only plan creator that actually
works inside the app:

![Forma's main dashboard on desktop, dark theme: four metric cards with sparklines (Weight 74.0 kg, Body fat 15.0%, Muscle 62.9 kg, BMI 22.5), the Training widget showing today's session "Fuerza · Pierna y core" with two muscle silhouettes lit green on the legs and a "2 de 6 sesiones completadas" counter, the Menu widget reading "No hay un plan de comidas para hoy todavía", the Nutrition ring with every macro at 0/0, the 30-day Trend and Evolution charts, the shopping list with five items, a highlighted recommendation card about body fat, and, bottom right, the notice "Todavía no tienes un plan — Créalo y en cuanto esté en marcha verás aquí tu progreso" with a green "Crear mi plan" button](/img/forma-2026-09-20-dashboard-sin-plan.webp)

And deleting a plan — which now also releases the request that produced it —
makes you type the word before the button will let you through:

![Forma's nutrition "Mis planes" page with a modal dialog open on top: the title "Eliminar Recomposición 12 semanas", a warning that the plan and all its days disappear for good, a confirmation field with the word "eliminar" already typed in, and the red "Eliminar" button now enabled next to Cancel](/img/forma-2026-09-20-eliminar-plan.webp)

Beyond the wizard, the week left the plan's full skeleton in place: a table that
freezes the input data at the moment you ask for a plan (the calories it
computes are the ones the person will see, not the ones the formula would give
tomorrow), an endpoint that rejects with a clean 409 if you already have an open
request, a neutral port towards the AI agent with its adapter and fixtures, and
a twelve-week programme modelled as three four-week blocks instead of 84 days
generated in one go.

And Forma's README went from being the repo's kick-off note to a proper front
page with 21 screenshots and, above all, a section that says out loud **what the
application does not do**: that Strava, Garmin and Apple Health don't exist,
that the AI agent is wired up but inert without its environment variable, and
that the app starts empty by design. Staying quiet about it doesn't avoid the
disappointment, it just postpones it to the first issue.

## What didn't go well

- **The Postgres job went green without running anything.** I found it reading
  the log out of curiosity, not because it failed. Had I not looked, I'd have a
  job today that verifies nothing and that I trust.
- **One test wiped another test's seed data.** All the integration tests share a
  single in-memory H2 database for the whole process, so one class that emptied
  tables made another fail depending on **alphabetical order**. My first fix was
  a `@DirtiesContext` that couldn't possibly work — a fresh context reuses the
  same named database — and it had to be redone.
- **Google sign-in didn't work first time.** Behind the double proxy it
  generated the `redirect_uri` over HTTP instead of HTTPS, and on localhost it
  dropped the port along the way.
- **The tool we document the project with was serving two broken screens.** The
  fixture-driven dev mode painted "NaN €" in the shopping list and an error on
  the plans page. It had been like that for a while.
- **I wrote a CHECK that was too clever.** I pinned block length to exactly 4
  weeks in the schema. That doesn't validate an input: it forbids a product
  change. It had to be relaxed to a range in the same PR.
- **Dispatching to the agent never started.** Slice 6 is still pending: today
  the request gets stored and there's still nobody on the other side.

## What I'm taking away

**A claim nobody checks is technical debt with interest.** The dashboard banner,
the README, H2's PostgreSQL mode, the calories the model declares and my own
"everything is down" are exactly the same bug wearing five different faces. They
don't fail: they're simply not true, and since nothing contradicts them, they
stay.

Two rules came out of it, and I've written both down:

**If a value can be claimed by whoever produced it, recalculate it — and store
the difference, don't correct it.** The discrepancy is the evidence.

**And a CHECK should rule out the impossible, not the undecided.** Freezing a
product decision into the schema turns a change of mind into a migration.

Next week: dispatching to the agent and ingesting the plan it returns, with the
auditor's report stored alongside the request. And starting the second entrance
to the building — the one for people who ask for a plan before they have an
account.

## The week in numbers

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">5-hour windows per day</span>
  <div class="ws-days">
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>W</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>T</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>F</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>S</b></div>
  </div>
  <span class="ws-pulse-foot">9 windows across 5 sessions · Tuesday 08:12 → Sunday 18:17 · nothing happened on Monday · the weekly quota was not exhausted</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs merged</span>
  <span class="ws-v">23</span>
  <span class="ws-meter"><i class="ws-fill" style="width:78%"></i></span>
  <span class="ws-note">78% of them in Forma (18) · Akademia 1 · this blog 2 · diegobarrioh.dev 2 — Forma running total ≈273 PRs (#269 → #288)</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Lines changed</span>
  <span class="ws-v">+13,056 / −456</span>
  <span class="ws-meter"><i class="ws-add" style="width:96.6%"></i><i class="ws-del" style="width:3.4%"></i></span>
  <span class="ws-note">97% of it is new code: a week of building, not of rewriting. Across four repositories.</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Flyway migrations</span>
  <span class="ws-v">V62 → V65</span>
  <span class="ws-note">4 new ones · and for the first time all 62 in the project are verified against real PostgreSQL 17 in CI</span>
</div>

<div class="ws-row">
  <span class="ws-i">🌐</span>
  <span class="ws-k">Domains migrated</span>
  <span class="ws-v">2</span>
  <span class="ws-note"><code>akademia</code> and <code>forma</code> moved under <code>backendtothefuture.com</code>, alongside <code>tokenmeter</code></span>
</div>

<div class="ws-row">
  <span class="ws-i">🔒</span>
  <span class="ws-k">Certificates dry-run renewed</span>
  <span class="ws-v">8</span>
  <span class="ws-note">After repairing a Certbot broken by a Python package collision</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">My prompts</span>
  <span class="ws-v">74</span>
  <span class="ws-note">≈8 per 5-hour window. Most of them read "merged, clean up the branch, start the next slice".</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧰</span>
  <span class="ws-k">Skills used</span>
  <span class="ws-v">4</span>
  <span class="ws-note"><code>branch-pr</code> · <code>chained-pr</code> · <code>work-unit-commits</code> · <code>recap</code></span>
</div>

</div>

<blockquote><small>A note on the screenshots: they are taken against the
application at the last commit of the week, with sample data and no real
backend. Nothing you see here is real health data.</small></blockquote>
