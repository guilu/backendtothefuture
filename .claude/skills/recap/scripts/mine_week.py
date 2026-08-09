#!/usr/bin/env python3
"""Mine this week's Claude Code activity for the weekly blog recap.

Walks every project transcript under ~/.claude/projects/*/*.jsonl, keeps the
messages written during the target week, and prints a compressed digest of the
user's own prompts per project. Those prompts are the highest-signal trace of
what was actually worked on — far cheaper to read than full transcripts.

Each message is filtered by **its own timestamp**, not by the file's mtime. A
session that stays open for days would otherwise drag the previous week's
prompts into this week's digest, which is exactly the kind of quiet error that
ends up as a wrong claim in a published post.

Also prints a summary the post's closing stats section needs: sessions, 5-hour
working windows and prompt counts.

Usage:
    python mine_week.py [YYYYMMDD]

YYYYMMDD is the Monday that starts the week. Omit it to default to the Monday
of the current week.
"""
import json, glob, os, sys
from datetime import datetime, timedelta

WINDOW = timedelta(hours=5)


def week_start(arg: str | None) -> datetime:
    """Local midnight on the week's Monday, timezone-aware.

    Aware because the transcript timestamps are UTC, and comparing those to a
    naive local datetime silently shifts every boundary by the UTC offset.
    """
    if arg:
        start = datetime.strptime(arg, "%Y%m%d")
    else:
        today = datetime.now()
        start = today - timedelta(days=today.weekday())
    return start.replace(hour=0, minute=0, second=0, microsecond=0).astimezone()


def clean(text: str) -> str:
    return " ".join(text.split())


def message_time(entry: dict) -> datetime | None:
    stamp = entry.get("timestamp")
    if not stamp:
        return None
    try:
        return datetime.fromisoformat(stamp.replace("Z", "+00:00")).astimezone()
    except ValueError:
        return None


def prompt_text(entry: dict) -> str:
    content = entry.get("message", {}).get("content")
    if isinstance(content, str):
        text = content
    elif isinstance(content, list):
        text = " ".join(
            part.get("text", "")
            for part in content
            if isinstance(part, dict) and part.get("type") == "text"
        )
    else:
        text = ""
    text = clean(text)
    # Drop tool results, system reminders, image stubs, noise.
    if (
        not text
        or text.startswith("<")
        or text.startswith("[Image")
        or "tool_result" in text
        or len(text) <= 3
    ):
        return ""
    return text


def windows(times: list[datetime]) -> list[tuple[datetime, datetime]]:
    """Greedy 5-hour blocks — how Claude Code's usage windows actually open."""
    spans: list[list[datetime]] = []
    for moment in times:
        if not spans or moment - spans[-1][0] >= WINDOW:
            spans.append([moment, moment])
        else:
            spans[-1][1] = moment
    return [(a, b) for a, b in spans]


def main() -> None:
    start = week_start(sys.argv[1] if len(sys.argv) > 1 else None)
    end = start + timedelta(days=7)
    print(f"# Claude activity {start:%Y-%m-%d} .. {end:%Y-%m-%d}\n")

    base = os.path.expanduser("~/.claude/projects")
    by_project: dict[str, list[tuple[datetime, str]]] = {}
    sessions: set[tuple[str, str]] = set()
    all_times: list[datetime] = []

    for proj_dir in sorted(glob.glob(os.path.join(base, "*"))):
        # Dir name encodes the path with '/' and '.' both flattened to '-':
        # -Users-x-code-akadem-ia  ->  akadem-ia  (the part after '-code-').
        name = os.path.basename(proj_dir)
        proj = name.split("-code-", 1)[-1] if "-code-" in name else name

        for path in glob.glob(os.path.join(proj_dir, "*.jsonl")):
            # mtime is the last write, so a file untouched since before the week
            # cannot hold a message inside it. There is no matching upper bound:
            # a session still being written today may well contain this week's
            # messages, which is the bug this script used to have.
            if os.path.getmtime(path) < start.timestamp():
                continue

            for line in open(path, encoding="utf-8"):
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if entry.get("type") != "user":
                    continue
                when = message_time(entry)
                if when is None or not (start <= when < end):
                    continue

                sessions.add((proj, entry.get("sessionId") or path))
                all_times.append(when)
                text = prompt_text(entry)
                if text:
                    by_project.setdefault(proj, []).append((when, text[:300]))

    if not by_project:
        print("(no Claude activity found for this week)")
        return

    total = sum(len(v) for v in by_project.values())
    all_times.sort()
    spans = windows(all_times)

    print("## Summary\n")
    print(f"- Prompts: {total}")
    print(f"- Sessions: {len(sessions)}")
    print(f"- 5-hour windows: {len(spans)}")
    print(f"- First: {all_times[0]:%a %d %b %H:%M} · Last: {all_times[-1]:%a %d %b %H:%M}")
    for opened, closed in spans:
        print(f"    {opened:%a %d %H:%M} → {closed:%H:%M}")

    for proj in sorted(by_project, key=lambda p: -len(by_project[p])):
        prompts = sorted(by_project[proj])
        print(f"\n========== {proj} ({len(prompts)} prompts) ==========")
        for when, text in prompts:
            print(f"[{when:%m-%d %H:%M}] {text}")


if __name__ == "__main__":
    main()
