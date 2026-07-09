#!/usr/bin/env python3
"""Strip baked-in 'A.' / 'B)' letter prefixes from MCQ choices + correct.

The prefix belongs to the renderer, not the data. Strips from choices AND
the `correct` field consistently so they still match. Idempotent.

  python3 scripts/strip-letter-prefixes.py            # dry run
  python3 scripts/strip-letter-prefixes.py --apply
"""
import json, re, sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "app" / "data"
FILES = ["kindergarten", "1st-grade", "2nd-grade", "3rd-grade", "4th-grade"]
APPLY = "--apply" in sys.argv
PREFIX = re.compile(r"^\s*[A-Da-d]\s*[.)]\s+")


def strip(s):
    return PREFIX.sub("", s) if isinstance(s, str) else s


def main():
    changed = 0
    for fn in FILES:
        p = DATA / f"{fn}-standards-questions.json"
        d = json.loads(p.read_text())
        file_changed = False
        for s in d.get("standards", []):
            for q in s.get("questions", []):
                if q.get("type", "multiple_choice") != "multiple_choice":
                    continue
                choices = q.get("choices") or []
                if not any(PREFIX.match(str(c)) for c in choices):
                    continue
                q["choices"] = [strip(c) for c in choices]
                # correct may be a string, "a|b", or a list
                c = q.get("correct")
                if isinstance(c, list):
                    q["correct"] = [strip(x) for x in c]
                elif isinstance(c, str):
                    q["correct"] = "|".join(strip(x) for x in c.split("|"))
                changed += 1
                file_changed = True
        if file_changed and APPLY:
            p.write_text(json.dumps(d, indent=2) + "\n")
    print(f"{'STRIPPED' if APPLY else 'WOULD STRIP'} letter prefixes on {changed} questions")
    if not APPLY:
        print("(dry run — pass --apply to write)")


if __name__ == "__main__":
    main()
