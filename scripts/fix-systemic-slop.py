#!/usr/bin/env python3
"""
Deterministic slop fixer — applies the obvious, no-LLM-required fixes
across every lesson in app/data/sample-lessons.json to clear the
catalog-wide findings surfaced by lib/qc/spec-checks.ts.

Operations:
  1. heading_redundancy → drop displayText that duplicates slide heading
  2. text_accumulation (per-step ≥4 chunks) → collapse to single chunk
                                              (audio teaches, visual anchors)
  3. text_accumulation (slide ≥7 chunks)  → collapse all steps' parts
                                              to single chunks each
  4. tableRow_empty → flag for manual review (no safe auto-fix)

Idempotent — running twice is a no-op on already-fixed lessons.
After running, re-run scripts/align-slide-timings.ts to derive real
Whisper delays on the surviving displayParts.
"""
import json
import re
from pathlib import Path

PATH = Path(__file__).parent.parent / "app/data/sample-lessons.json"


def normalize(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def fix_heading_redundancy(slide: dict, step: dict) -> bool:
    """Drop displayText that EXACTLY echoes the slide heading (after
    normalization). Filip's 'A Detective Trick' displayText on a
    slide titled 'A Detective Trick' was the canonical case.
    Substring matches alone are not enough — a longer displayText
    that happens to start with the heading is doing additional
    teaching work and shouldn't be removed."""
    text = (step.get("displayText") or "").strip()
    heading = (slide.get("heading") or "").strip()
    if not text or not heading:
        return False
    t = normalize(text)
    h = normalize(heading)
    if not t or not h:
        return False
    # Exact normalized match only. If they're within a 2-char
    # difference (eg. trailing punctuation drift) treat as equal.
    if t == h or (abs(len(t) - len(h)) <= 2 and (t.startswith(h) or h.startswith(t))):
        step.pop("displayText", None)
        step.pop("displayDelay", None)
        return True
    return False


def fix_text_accumulation_step(step: dict) -> bool:
    """Collapse a step's displayParts (≥4 chunks) into a single
    chunk. The audio carries the teaching; the visual is a single
    anchor that shows the spoken sentence (no fragmentation)."""
    parts = step.get("displayParts")
    if not isinstance(parts, list) or len(parts) < 4:
        return False
    merged = "".join(
        (p.get("text") if isinstance(p, dict) else "") or "" for p in parts
    ).strip()
    # Collapse any multiple spaces from the join
    merged = re.sub(r"\s+", " ", merged).strip()
    if not merged:
        return False
    step["displayParts"] = [{"text": merged, "delay": 0}]
    # Pills paired by index will now point at a single part — keep
    # only pill[0] if any pill targets >0. Pills should be re-thought
    # at the rewrite layer; for now we just don't reference invalid
    # indices.
    pills = step.get("highlightPills")
    if isinstance(pills, list) and pills:
        step["highlightPills"] = [{"pill": 0, "delay": 0}]
    return True


def fix_text_accumulation_slide(slide: dict) -> bool:
    """Slide-wide collapse: if total displayParts across the slide is
    ≥7, collapse every multi-part step to a single chunk. Same as
    above but applied broadly when even the cumulative count is too
    dense (Filip's 'throw up of pills' across a whole slide)."""
    steps = slide.get("steps") or []
    total = sum(
        len(s.get("displayParts") or []) if isinstance(s, dict) else 0
        for s in steps
    )
    if total < 7:
        return False
    changed = False
    for step in steps:
        if not isinstance(step, dict):
            continue
        parts = step.get("displayParts")
        if isinstance(parts, list) and len(parts) >= 2:
            merged = "".join(
                (p.get("text") if isinstance(p, dict) else "") or "" for p in parts
            ).strip()
            merged = re.sub(r"\s+", " ", merged).strip()
            if merged:
                step["displayParts"] = [{"text": merged, "delay": 0}]
                pills = step.get("highlightPills")
                if isinstance(pills, list) and pills:
                    step["highlightPills"] = [{"pill": 0, "delay": 0}]
                changed = True
    return changed


def main():
    with open(PATH) as f:
        lessons = json.load(f)

    counts = {
        "heading_redundancy_fixed": 0,
        "text_accumulation_step_fixed": 0,
        "text_accumulation_slide_fixed": 0,
        "tableRow_empty_flagged": 0,
        "lessons_touched": 0,
    }
    flagged_empty_rows: list[str] = []

    for lesson in lessons:
        touched = False
        for slide in lesson.get("slides") or []:
            if slide.get("type") == "mcq":
                continue
            # Per-step fixes
            for step in slide.get("steps") or []:
                if not isinstance(step, dict):
                    continue
                if fix_heading_redundancy(slide, step):
                    counts["heading_redundancy_fixed"] += 1
                    touched = True
                if fix_text_accumulation_step(step):
                    counts["text_accumulation_step_fixed"] += 1
                    touched = True
                # Detect tableRow_empty (no auto-fix — flag for review)
                tr = step.get("displayTableRow")
                if isinstance(tr, dict):
                    if not (
                        isinstance(tr.get("label"), str) and tr["label"].strip()
                    ) or not (
                        isinstance(tr.get("value"), str) and tr["value"].strip()
                    ):
                        flagged_empty_rows.append(
                            f"{lesson['standardId']} slide {slide.get('slide')}.{step.get('sub')}"
                        )
                        counts["tableRow_empty_flagged"] += 1
            # Slide-wide accumulation sweep
            if fix_text_accumulation_slide(slide):
                counts["text_accumulation_slide_fixed"] += 1
                touched = True
        if touched:
            counts["lessons_touched"] += 1

    with open(PATH, "w") as f:
        json.dump(lessons, f, indent=2)

    print("─" * 60)
    print("Deterministic slop-fix results")
    print("─" * 60)
    for k, v in counts.items():
        print(f"  {k}: {v}")
    if flagged_empty_rows:
        print("\nFlagged for manual review (tableRow_empty):")
        for f in flagged_empty_rows:
            print(f"  {f}")
    print()
    print("Next: npx tsx scripts/align-slide-timings.ts --apply")


if __name__ == "__main__":
    main()
