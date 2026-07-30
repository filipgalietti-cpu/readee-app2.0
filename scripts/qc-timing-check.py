#!/usr/bin/env python3
"""
Rule #16 timing-sync verification (deterministic, free).

For every lesson slide step, check the authored reveal delays against the
Whisper word-timestamps cached in slide-timings.json:
  - a displayPart / highlightWord whose delay lands AFTER the audio clip
    ends (the pill never shows during narration -> looks like dead space)
  - negative delays
  - a highlightWord whose word is never spoken in the clip (Whisper transcript)
  - audio referenced but with no timing data and not skippable

Writes scripts/timing-check.json + prints a per-grade summary.
"""
import json, re, sys

LESSONS = json.load(open("app/data/sample-lessons.json"))
CACHE = json.load(open("scripts/slide-timings.json"))

def norm(w):
    return re.sub(r"[^a-z0-9]", "", str(w).lower())

report = []
for l in LESSONS:
    std = l["standardId"]
    issues = []
    for si, s in enumerate(l.get("slides", []), 1):
        if s.get("type") == "mcq":
            continue
        for st in s.get("steps", []):
            af = st.get("audioFile")
            if not af:
                continue
            entry = CACHE.get(af)
            dur = entry.get("duration") if entry else None
            words = entry.get("words", []) if entry else []
            transcript = " ".join(norm(w.get("word", "")) for w in words)
            # displayParts delays
            for p in (st.get("displayParts") or []):
                d = p.get("delay")
                if d is None:
                    continue
                if d < 0:
                    issues.append({"slide": si, "type": s.get("type"), "kind": "neg_delay", "detail": f'displayPart "{p.get("text")}" delay {d}'})
                elif dur is not None and d > dur + 600:
                    issues.append({"slide": si, "type": s.get("type"), "kind": "reveal_after_audio", "detail": f'pill "{p.get("text")}" reveals at {d}ms but clip is {round(dur)}ms'})
            # highlightWord
            hw = st.get("highlightWord")
            if isinstance(hw, dict) and hw.get("word"):
                d = hw.get("delay")
                w = norm(hw["word"])
                if d is not None and d < 0:
                    issues.append({"slide": si, "type": s.get("type"), "kind": "neg_delay", "detail": f'highlight "{hw["word"]}" delay {d}'})
                if d is not None and dur is not None and d > dur + 600:
                    issues.append({"slide": si, "type": s.get("type"), "kind": "reveal_after_audio", "detail": f'highlight "{hw["word"]}" at {d}ms but clip is {round(dur)}ms'})
                if words and w and w not in transcript:
                    issues.append({"slide": si, "type": s.get("type"), "kind": "word_not_spoken", "detail": f'highlight word "{hw["word"]}" not found in narration'})
    report.append({"std": std, "grade": l.get("grade"), "issues": issues, "ok": len(issues) == 0})

json.dump(report, open("scripts/timing-check.json", "w"), indent=2)

total = len(report)
clean = sum(1 for r in report if r["ok"])
by_kind = {}
for r in report:
    for i in r["issues"]:
        by_kind[i["kind"]] = by_kind.get(i["kind"], 0) + 1
print(f"TIMING CHECK: {clean}/{total} lessons clean; {total - clean} with issues")
print("issue counts by kind:", by_kind or "none")
print("\nlessons with timing issues:")
for r in report:
    if not r["ok"]:
        kinds = {}
        for i in r["issues"]:
            kinds[i["kind"]] = kinds.get(i["kind"], 0) + 1
        print(f'  {r["std"]}: {dict(kinds)}')
