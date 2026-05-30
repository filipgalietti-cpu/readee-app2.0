#!/usr/bin/env python3
"""
Deterministic fix for spec.image_style findings — appends the required
style + no-text clauses to imagePrompts that are missing them.

Hardened negative prompts per Filip's May 18 audit feedback on
Gemini-image AI-slop tells (eye twinkles, hallucinated text).
Generator should be regenerated for prompts that change.
"""
import json
import re
from pathlib import Path

PATH = Path(__file__).parent.parent / "app/data/sample-lessons.json"

STYLE_CLAUSE = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors"
NO_TEXT_CLAUSE = "No text, no words, no letters"
NEGATIVE_PROMPTS = (
    "No twinkles or sparkles in characters' eyes. "
    "No text overlays, no hallucinated words, no signs with writing. "
    "Natural-looking eyes, no AI-generated glints."
)


def needs_style(prompt: str) -> bool:
    return STYLE_CLAUSE.lower() not in prompt.lower()


def needs_no_text(prompt: str) -> bool:
    return NO_TEXT_CLAUSE.lower() not in prompt.lower()


# Earlier version only added negatives if "twinkle/sparkle" wasn't
# present — but the original RL.1.1 S4 prompt literally said "and
# sparkles around it," so the check skipped it and the model
# happily added what was requested. Now: strip those phrases from
# the positive part and always append the negative clause.
POSITIVE_SLOP_PATTERNS = [
    r"\b(?:and\s+)?(?:tiny\s+|little\s+|small\s+)?sparkles?\s+(?:around|on|in|near|over|above)\s+[^.,]+",
    r"\b(?:and\s+)?(?:tiny\s+|little\s+|small\s+)?twinkles?\s+(?:around|on|in|near|over|above)\s+[^.,]+",
    r"\bwith\s+sparkles?\b[^.,]*",
    r"\bwith\s+twinkles?\b[^.,]*",
    r"\bglinting\s+eyes?\b",
    r"\bshining\s+eyes?\b",
    r"\bsparkly\s+eyes?\b",
]


def strip_positive_slop(prompt: str) -> tuple[str, bool]:
    out = prompt
    changed = False
    for pat in POSITIVE_SLOP_PATTERNS:
        new = re.sub(pat, "", out, flags=re.IGNORECASE)
        if new != out:
            changed = True
            out = new
    # Tidy up double spaces, orphaned commas/conjunctions
    out = re.sub(r",\s*,", ",", out)
    out = re.sub(r"\s+,", ",", out)
    out = re.sub(r"\s+\.", ".", out)
    out = re.sub(r"\s{2,}", " ", out)
    out = re.sub(r",\s*\.", ".", out)
    return out.strip(), changed


def fix_prompt(prompt: str) -> tuple[str, bool]:
    out, slop_changed = strip_positive_slop(prompt)
    out = out.rstrip(". ").rstrip()
    changed = slop_changed
    if needs_style(out):
        out += f". {STYLE_CLAUSE}"
        changed = True
    if needs_no_text(out):
        out += f". {NO_TEXT_CLAUSE}"
        changed = True
    if NEGATIVE_PROMPTS not in out:
        out += f". {NEGATIVE_PROMPTS}"
        changed = True
    if not out.endswith("."):
        out += "."
    return out, changed


def main():
    with open(PATH) as f:
        lessons = json.load(f)

    fixed = 0
    slop_stripped = 0
    touched_lessons = set()
    sample_stripped = []
    for lesson in lessons:
        for slide in lesson.get("slides") or []:
            prompt = slide.get("imagePrompt")
            if not isinstance(prompt, str) or not prompt.strip():
                continue
            new_prompt, changed = fix_prompt(prompt)
            if changed:
                # Did we strip slop specifically?
                stripped, slop_changed = strip_positive_slop(prompt)
                if slop_changed:
                    slop_stripped += 1
                    if len(sample_stripped) < 5:
                        sample_stripped.append(
                            (lesson["standardId"], slide.get("slide"), prompt[:90])
                        )
                slide["imagePrompt"] = new_prompt
                fixed += 1
                touched_lessons.add(lesson["standardId"])

    with open(PATH, "w") as f:
        json.dump(lessons, f, indent=2)

    print(f"Fixed {fixed} imagePrompts across {len(touched_lessons)} lessons")
    print(f"  {slop_stripped} prompts had positive sparkle/twinkle requests stripped")
    print(f"  All prompts now carry explicit negative clauses")
    if sample_stripped:
        print(f"\nSample stripped slop:")
        for std, slide, prompt in sample_stripped:
            print(f"  {std} slide {slide}: {prompt}…")
    print(f"\nAffected lessons need image regen for prompt changes to land in the .png")


if __name__ == "__main__":
    main()
