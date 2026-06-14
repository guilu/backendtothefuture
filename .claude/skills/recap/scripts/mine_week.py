#!/usr/bin/env python3
"""Mine this week's Claude Code activity for the weekly blog recap.

Walks every project transcript under ~/.claude/projects/*/*.jsonl, keeps the
sessions touched during the target week, and prints a compressed digest of the
user's own prompts per project. Those prompts are the highest-signal trace of
what was actually worked on — far cheaper to read than full transcripts.

Usage:
    python mine_week.py [YYYYMMDD]

YYYYMMDD is the Monday that starts the week. Omit it to default to the Monday
of the current week.
"""
import json, glob, os, sys
from datetime import datetime, timedelta


def week_start(arg: str | None) -> datetime:
    if arg:
        return datetime.strptime(arg, "%Y%m%d")
    today = datetime.now()
    return (today - timedelta(days=today.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )


def clean(text: str) -> str:
    return " ".join(text.split())


def main() -> None:
    start = week_start(sys.argv[1] if len(sys.argv) > 1 else None)
    end = start + timedelta(days=7)
    print(f"# Claude activity {start:%Y-%m-%d} .. {end:%Y-%m-%d}\n")

    base = os.path.expanduser("~/.claude/projects")
    any_activity = False
    for proj_dir in sorted(glob.glob(os.path.join(base, "*"))):
        files = [
            f
            for f in glob.glob(os.path.join(proj_dir, "*.jsonl"))
            if start.timestamp() <= os.path.getmtime(f) < end.timestamp()
        ]
        if not files:
            continue
        # Dir name encodes the path with '/' and '.' both flattened to '-':
        # -Users-x-code-akadem-ia  ->  akadem-ia  (the part after '-code-').
        name = os.path.basename(proj_dir)
        proj = name.split("-code-", 1)[-1] if "-code-" in name else name
        prompts: list[str] = []
        for f in sorted(files, key=os.path.getmtime):
            for line in open(f, encoding="utf-8"):
                try:
                    e = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if e.get("type") != "user":
                    continue
                c = e.get("message", {}).get("content")
                if isinstance(c, str):
                    t = c
                elif isinstance(c, list):
                    t = " ".join(
                        x.get("text", "")
                        for x in c
                        if isinstance(x, dict) and x.get("type") == "text"
                    )
                else:
                    t = ""
                t = clean(t)
                # Drop tool results, system reminders, image stubs, noise.
                if (
                    t
                    and not t.startswith("<")
                    and not t.startswith("[Image")
                    and "tool_result" not in t
                    and len(t) > 3
                ):
                    prompts.append(t[:300])
        if not prompts:
            continue
        any_activity = True
        print(f"\n========== {proj} ({len(prompts)} prompts) ==========")
        for p in prompts:
            print("- " + p)

    if not any_activity:
        print("(no Claude activity found for this week)")


if __name__ == "__main__":
    main()
