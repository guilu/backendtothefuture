---
title: "An AI agent as a homelab operator"
date: "2026-06-28"
description: "A week using Hermes as a home operator: Home Assistant on armv7, broken integrations, Plex, Blink, corrupted statistics, and small automations that prevent future surprises."
tags: ["ai-agents", "home-assistant", "homelab"]
thumb: "/blog/ai-agent-as-home-lab-operator-thumb.webp"
cover: "/blog/ai-agent-as-home-lab-operator-cover.webp"
---

## The week in one sentence

This wasn't a week of building a shiny new feature from scratch. It was a more realistic kind of week: keeping a homelab alive with old hardware, integrations changing underneath, services half-updated, and a 32-bit Raspberry Pi living on the edge of what is still supported.

The difference is that I didn't do it only with terminals and memory. I did it with Hermes acting as an operator: reading logs, comparing versions, connecting over SSH, editing files with backups first, validating after each change, and turning repeatable work into skills.

## Home Assistant: life on 32-bit

The starting point was Home Assistant running on an armv7 / 32-bit Raspberry Pi. It works, but it can no longer follow every release that comes out. In this case it was on `2025.11.3`, the latest version that still made sense for that platform.

That made a normal-looking update of the Smart M-Air integration, used to control Mitsubishi WF-RAC units, impossible to install from HACS. The new release shown was `2025.12-v2`, but it required Home Assistant 2025.12. HACS wasn't failing; it was protecting the system.

The fix was boring and correct: don't force it. Install the compatible version, keep Smart M-Air on `2025.2`, and verify that the integration was still working without relevant log errors.

The lesson is simple: once the host is limited by architecture, the problem stops being "update everything" and becomes "know exactly what not to update".

## Cleaning up things that no longer exist

Another classic homelab problem showed up too: things that don't exist anymore, but still appear in the UI.

Node-RED was still visible in Home Assistant's sidebar. There was no container, no active integration, no service listening. In the end it wasn't real infrastructure at all: it was an old Lovelace dashboard with `show_in_sidebar: true` pointing to an iframe.

Portainer had a similar story, with more nuance. The service itself was fine: separated into its own `docker-compose.yml`, with its data in its own directory and direct access working at `http://homeassistant.local:9000`. What wasn't reliable was embedding it inside Home Assistant as an iframe: login broke with session and authorization errors.

The practical conclusion was to remove it from the sidebar and use it externally. Not everything that can be embedded in Home Assistant should live inside Home Assistant.

## Plex: automating what used to be manual

Plex was running on another node, `black.local`, also on ARM. Home Assistant could detect an update, but the `update.black_actualizar` entity didn't provide a useful download URL. On top of that, from inside the Home Assistant container, `black.local` didn't resolve properly via mDNS, while `black` did.

The work became turning a manual operation into a reusable routine:

- detect the installed and latest versions;
- confirm the architecture: `armv7l` / `armhf`;
- download the right `.deb` package for `linux-armv7neon`;
- validate package, version, and architecture before installing;
- copy it to the server over SSH;
- run `dpkg -i`;
- verify the service and `/identity` endpoint afterwards.

That became a Hermes skill for updating Plex on `black.local`. It isn't a big piece of software. It's better than that: a small automation that removes an entire class of future mistakes.

## When a chart fails because of one corrupted row

The most interesting bug of the week was in an energy cost card for the bedroom air conditioner. Home Assistant showed a generic error, but the logs pointed to a `TypeError` inside `recorder.statistics.statistic_during_period`.

The card wasn't the real problem. The recorder database was. There were rows for `sensor.aire_dormitorio_energy_usage_cycle_cost` with `start_ts` set to `NULL` in both `statistics` and `statistics_short_term`.

The cleanup was surgical:

- identify the sensor's `metadata_id`;
- export a backup of the affected rows;
- delete only the rows for that sensor where `start_ts IS NULL`;
- restart Home Assistant;
- confirm that the recorder errors were gone.

After that, instead of insisting on `utility_meter` for cost sensors that didn't fit well because of their `state_class`, I created a SQL sensor: total monthly air-conditioning cost across the four units, calculated directly from long-term statistics.

It's less flashy than dragging blocks around the UI, but more honest: if the good data lives in recorder, read recorder.

## Blink and the cost of falling behind

Blink was another example of a dependency broken by time. The credentials were correct, but the integration failed with `UnauthorizedError`. Testing outside Home Assistant revealed the clue: the `blinkpy` version bundled with Home Assistant 2025.11.3 was too old for the current Blink/Amazon login flow.

With `blinkpy 0.25.7`, login reached the 2FA step and the integration finally loaded the cameras and alarm entity.

The ugly part is that the patch lives inside the container. If the image is recreated, it has to be applied again. But that's also an honest picture of many homelabs: sometimes the solution isn't perfect; it's explicit, documented, and reversible.

## The important part wasn't fixing things

The important part of the week wasn't that Smart M-Air worked, Plex was updated, or Blink loaded again.

The important part was the pattern:

- inspect the real state of the system first;
- don't force incompatible versions;
- back up before touching internal storage;
- change one thing at a time;
- validate with logs, HTTP, containers, or SQL;
- turn repeatable work into a skill.

That last point changes the workflow the most. Before, every maintenance operation was a mix of notes, remembered commands, and intuition. Now, when an operation repeats or carries risk, I turn it into operational memory for the agent.

## My takeaway

An AI agent doesn't replace understanding your infrastructure. In fact, if you don't understand the system, it will probably just help you break it faster.

But used properly, as an assisted operator, it does change the experience. It reduces the friction of investigation, forces evidence, remembers procedures, and turns an afternoon of maintenance into something you can repeat with less anxiety.

This week Hermes didn't write much new code. It did something more mundane and more useful: it kept the house running.
