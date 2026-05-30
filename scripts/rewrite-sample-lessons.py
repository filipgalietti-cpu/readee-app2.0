#!/usr/bin/env python3
"""
One-shot rewrite of the 4 audit-sample lessons to match the design
rules Filip locked in on May 18:

  • Visual = anchor, not transcription
  • <=3 displayParts beats per step (ideally 1-2)
  • Tables for structured info ("X means Y" / "rule + example")
  • highlightPills only on genuine callouts, not every reveal
  • RL.K.1 is the bar — stays untouched

Touches: RL.1.1, RF.2.3b, L.3.4b, L.4.4b. Drops the throw-up of pills
and over-fragmented displayParts; converts comparison content (5W
questions, vowel teams, prefixes, roots) to displayTableRow so the
table renderer (fixed earlier today) actually carries the teaching.

Delays are set placeholder (0) — run `npx tsx scripts/align-slide-timings.ts`
after this to derive real delays from Whisper timestamps.
"""
import json
from pathlib import Path

PATH = Path(__file__).parent.parent / "app/data/sample-lessons.json"

# Fields that survive cleanup. Everything else (displayParts, pills,
# displayText, highlightWord, etc.) gets dropped before we write the
# new structure — prevents stale fields from haunting the step.
PRESERVE = {
    "sub", "audioFile", "ttsScript", "audioRegenAt", "interaction",
    "imageFile", "phonemeLetterIndices", "afterPhonemes",
    "displayDiagram", "displayDiagramSwap", "displayAlphabetGrid",
    "checkmarkDelay", "checkmarkTriggerDelay", "checkmarkTriggerStagger",
    "feedbackDelay", "displayStyle",
}


def reset(st):
    """Drop everything that defines visual structure — caller adds back."""
    return {k: v for k, v in st.items() if k in PRESERVE}


def parts(*chunks):
    """Build displayParts with delay=0 placeholders. Aligner fills real values."""
    return [{"text": c, "delay": 0} for c in chunks]


def replace_step(lessons_idx, std, slide_num, sub, new_step):
    lesson = lessons_idx[std]
    for s in lesson["slides"]:
        if s.get("slide") != slide_num:
            continue
        for i, st in enumerate(s["steps"]):
            if st.get("sub") == sub:
                s["steps"][i] = new_step
                return
    raise KeyError(f"{std} slide {slide_num}.{sub} not found")


def get_step(lessons_idx, std, slide_num, sub):
    for s in lessons_idx[std]["slides"]:
        if s.get("slide") != slide_num:
            continue
        for st in s["steps"]:
            if st.get("sub") == sub:
                return st


def set_heading(lessons_idx, std, slide_num, heading):
    for s in lessons_idx[std]["slides"]:
        if s.get("slide") == slide_num:
            s["heading"] = heading
            return


def main():
    with open(PATH) as f:
        lessons = json.load(f)
    idx = {l["standardId"]: l for l in lessons}

    # ════════════════════════════════════════════════════════════
    # RL.1.1 — Asking Story Questions (1st)
    # ════════════════════════════════════════════════════════════
    std = "RL.1.1"

    # Slide 1 intro — anchor each beat, drop pill spam
    s = reset(get_step(idx, std, 1, "a"))
    s["displayParts"] = parts("Great readers are", "detectives.")
    s["highlightWord"] = {"word": "detectives", "delay": 0}
    replace_step(idx, std, 1, "a", s)

    s = reset(get_step(idx, std, 1, "b"))
    s["displayParts"] = parts("They ask questions.")
    s["highlightWord"] = {"word": "questions", "delay": 0}
    replace_step(idx, std, 1, "b", s)

    s = reset(get_step(idx, std, 1, "c"))
    s["displayParts"] = parts("Let's learn how!")
    replace_step(idx, std, 1, "c", s)

    # Slide 2 teach — 4-row Q-question chart. Step a's audio is
    # the preamble ("five big questions") — pure audio, no display.
    # Headers + all 4 rows are visible from slide load via the
    # LessonSlideshow pre-populate; each row highlights when its
    # step's audio plays (teacher pointing at the chart).
    set_heading(idx, std, 2, "Story Questions")
    s = reset(get_step(idx, std, 2, "a"))
    # No display content — audio-only preamble. The full chart
    # already shows because steps b-e carry the rows + headers.
    replace_step(idx, std, 2, "a", s)

    s = reset(get_step(idx, std, 2, "b"))
    s["displayTableRow"] = {
        "label": "Who?",
        "value": "is in the story",
        "tableHeaders": ["Question", "Asks About"],
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "b", s)

    s = reset(get_step(idx, std, 2, "c"))
    s["displayTableRow"] = {"label": "What?", "value": "is happening"}
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "c", s)

    s = reset(get_step(idx, std, 2, "d"))
    s["displayTableRow"] = {"label": "Where + When?", "value": "did it happen"}
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "d", s)

    s = reset(get_step(idx, std, 2, "e"))
    s["displayTableRow"] = {"label": "Why?", "value": "did it happen"}
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "e", s)

    # Slide 3 example — passage in b, then Q→A pattern with table.
    # Step a is preamble audio ("Listen to this little story") — no
    # visual content, kid hears the cue and the slide rests on its
    # heading. Filler-style audio doesn't need a visual anchor.
    s = reset(get_step(idx, std, 3, "a"))
    replace_step(idx, std, 3, "a", s)

    s = reset(get_step(idx, std, 3, "b"))
    s["displayText"] = (
        "Bella picked three red apples from the tree. "
        "She put them in her basket."
    )
    s["displayDelay"] = 0
    replace_step(idx, std, 3, "b", s)

    s = reset(get_step(idx, std, 3, "c"))
    s["displayParts"] = parts("Who?", "Bella!")
    s["highlightWord"] = {"word": "Bella", "delay": 0}
    replace_step(idx, std, 3, "c", s)

    s = reset(get_step(idx, std, 3, "d"))
    s["displayParts"] = parts("What?", "Picked apples.")
    s["highlightWord"] = {"word": "apples", "delay": 0}
    replace_step(idx, std, 3, "d", s)

    s = reset(get_step(idx, std, 3, "e"))
    s["displayParts"] = parts("How many?", "Three!")
    s["highlightWord"] = {"word": "Three", "delay": 0}
    replace_step(idx, std, 3, "e", s)

    # Slide 4 tip — three anchors, one per step. Drop displayParts spam.
    s = reset(get_step(idx, std, 4, "a"))
    s["displayText"] = "A Detective Trick"
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "a", s)

    s = reset(get_step(idx, std, 4, "b"))
    s["displayText"] = "Find it in the words."
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "b", s)

    s = reset(get_step(idx, std, 4, "c"))
    s["displayText"] = "You got it!"
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "c", s)

    # ════════════════════════════════════════════════════════════
    # RF.2.3b — Vowel Team Sounds (2nd)
    # ════════════════════════════════════════════════════════════
    std = "RF.2.3b"

    # Slide 1 intro — concept anchors, no transcription
    s = reset(get_step(idx, std, 1, "a"))
    s["displayParts"] = parts("Two vowels,", "one sound.")
    s["highlightWord"] = {"word": "vowels", "delay": 0}
    replace_step(idx, std, 1, "a", s)

    s = reset(get_step(idx, std, 1, "b"))
    s["displayParts"] = parts("They share", "one sound.")
    s["highlightWord"] = {"word": "sound", "delay": 0}
    replace_step(idx, std, 1, "b", s)

    s = reset(get_step(idx, std, 1, "c"))
    s["displayText"] = "Meet the teams →"
    s["displayDelay"] = 0
    replace_step(idx, std, 1, "c", s)

    # Slide 2 teach — table: EA + EE, both saying /ee/, with examples
    set_heading(idx, std, 2, "EA and EE")
    s = reset(get_step(idx, std, 2, "a"))
    s["displayTableRow"] = {
        "label": "EA",
        "value": "ee",
        "example": "eat, read",
        "exampleDelay": 0,
        "tableHeaders": ["Team", "Sound", "Like"],
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "a", s)

    s = reset(get_step(idx, std, 2, "b"))
    s["displayTableRow"] = {
        "label": "EE",
        "value": "ee",
        "example": "bee, tree",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "b", s)

    s = reset(get_step(idx, std, 2, "c"))
    s["displayText"] = "Same sound, two ways!"
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "c", s)

    # Slide 3 teach — extend the same table format: AI + OA
    set_heading(idx, std, 3, "AI and OA")
    s = reset(get_step(idx, std, 3, "a"))
    s["displayTableRow"] = {
        "label": "AI",
        "value": "ay",
        "example": "rain, train",
        "exampleDelay": 0,
        "tableHeaders": ["Team", "Sound", "Like"],
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 3, "a", s)

    s = reset(get_step(idx, std, 3, "b"))
    s["displayTableRow"] = {
        "label": "OA",
        "value": "oh",
        "example": "boat, road",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 3, "b", s)

    # Slide 4 tip — three short anchors
    s = reset(get_step(idx, std, 4, "a"))
    s["displayText"] = "A helpful trick:"
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "a", s)

    s = reset(get_step(idx, std, 4, "b"))
    s["displayText"] = "The first vowel talks."
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "b", s)

    s = reset(get_step(idx, std, 4, "c"))
    s["displayText"] = "You got it!"
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "c", s)

    # ════════════════════════════════════════════════════════════
    # L.3.4b — Prefix Power (3rd)
    # ════════════════════════════════════════════════════════════
    std = "L.3.4b"

    # Slide 1 intro — concise anchors
    s = reset(get_step(idx, std, 1, "a"))
    s["displayText"] = "Prefix"
    s["displayDelay"] = 0
    replace_step(idx, std, 1, "a", s)

    s = reset(get_step(idx, std, 1, "b"))
    s["displayText"] = "front of a word"
    s["displayDelay"] = 0
    replace_step(idx, std, 1, "b", s)

    s = reset(get_step(idx, std, 1, "c"))
    s["displayText"] = "Let's see how →"
    s["displayDelay"] = 0
    replace_step(idx, std, 1, "c", s)

    # Slide 2 teach — table with Example column (was just label/value)
    s = reset(get_step(idx, std, 2, "a"))
    s["displayTableRow"] = {
        "label": "UN",
        "value": "not",
        "example": "unhappy",
        "exampleDelay": 0,
        "tableHeaders": ["Prefix", "Means", "Like"],
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "a", s)

    s = reset(get_step(idx, std, 2, "b"))
    s["displayTableRow"] = {
        "label": "RE",
        "value": "again",
        "example": "redo",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "b", s)

    s = reset(get_step(idx, std, 2, "c"))
    s["displayTableRow"] = {
        "label": "PRE",
        "value": "before",
        "example": "preview",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "c", s)

    # Slide 3 teach — same table style, two more prefixes
    s = reset(get_step(idx, std, 3, "a"))
    s["displayTableRow"] = {
        "label": "DIS",
        "value": "opposite",
        "example": "disagree",
        "exampleDelay": 0,
        "tableHeaders": ["Prefix", "Means", "Like"],
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 3, "a", s)

    s = reset(get_step(idx, std, 3, "b"))
    s["displayTableRow"] = {
        "label": "MIS",
        "value": "wrongly",
        "example": "misspell",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 3, "b", s)

    # Slide 4 tip — concrete worked example instead of the abstract
    # "peel the prefix" recipe. Filip flagged the recipe as unhelpful;
    # this swaps to a visible UNHAPPY → HAPPY → not happy peel beat
    # that lands while the audio narrates the rule. Three reveals
    # mapped to the three audio beats ("Peel" / "What is left" /
    # "Add the meaning back!"). Delays are approximate to the audio's
    # natural pause rhythm; Whisper aligner will refine if it can find
    # the tokens (not present in the script, so they're stable as set).
    s = reset(get_step(idx, std, 4, "a"))
    s["displayText"] = "A helpful trick"
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "a", s)

    s = reset(get_step(idx, std, 4, "b"))
    s["displayParts"] = [
        {"text": "unhappy", "delay": 0},
        {"text": "  →  un + happy", "delay": 2200},
        {"text": "  =  not happy", "delay": 4800},
    ]
    s["highlightWord"] = {"word": "un", "delay": 2200}
    replace_step(idx, std, 4, "b", s)

    s = reset(get_step(idx, std, 4, "c"))
    s["displayText"] = "Prefix power!"
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "c", s)

    # ════════════════════════════════════════════════════════════
    # L.4.4b — Greek and Latin Roots (4th)
    # ════════════════════════════════════════════════════════════
    std = "L.4.4b"

    # Slide 1 intro — two anchors
    s = reset(get_step(idx, std, 1, "a"))
    s["displayText"] = "Greek + Latin roots"
    s["displayDelay"] = 0
    replace_step(idx, std, 1, "a", s)

    s = reset(get_step(idx, std, 1, "b"))
    s["displayText"] = "unlock big words."
    s["displayDelay"] = 0
    replace_step(idx, std, 1, "b", s)

    # Slide 2 teach — already a table. Just add Example column.
    s = reset(get_step(idx, std, 2, "a"))
    s["displayTableRow"] = {
        "label": "Bio",
        "value": "life",
        "example": "biology",
        "exampleDelay": 0,
        "tableHeaders": ["Root", "Means", "Like"],
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "a", s)

    s = reset(get_step(idx, std, 2, "b"))
    s["displayTableRow"] = {
        "label": "Photo",
        "value": "light",
        "example": "photograph",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "b", s)

    s = reset(get_step(idx, std, 2, "c"))
    s["displayTableRow"] = {
        "label": "Tele",
        "value": "far",
        "example": "telescope",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "c", s)

    s = reset(get_step(idx, std, 2, "d"))
    s["displayTableRow"] = {
        "label": "Phone",
        "value": "sound",
        "example": "telephone",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 2, "d", s)

    # Slide 3 teach — Aqua + Geo as the same table format
    s = reset(get_step(idx, std, 3, "a"))
    s["displayTableRow"] = {
        "label": "Aqua",
        "value": "water",
        "example": "aquarium",
        "exampleDelay": 0,
        "tableHeaders": ["Root", "Means", "Like"],
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 3, "a", s)

    s = reset(get_step(idx, std, 3, "b"))
    s["displayTableRow"] = {
        "label": "Geo",
        "value": "earth",
        "example": "geography",
        "exampleDelay": 0,
    }
    s["displayDelay"] = 0
    replace_step(idx, std, 3, "b", s)

    # Slide 4 tip — showcase the aqua word family so the trick lands
    # concretely. Filip flagged the abstract "One root → many words"
    # as not showing what the trick actually does. Audio for S4b
    # narrates "Aqua: aquarium, aquatic, aqueduct!" so the kid hears
    # AND sees each word land — reinforcement, not redundancy. Step
    # 4.b uses ≤3 displayParts; Whisper aligner finds aquarium and
    # aqueduct in the audio and aligns the reveals.
    s = reset(get_step(idx, std, 4, "a"))
    s["displayText"] = "A helpful trick"
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "a", s)

    s = reset(get_step(idx, std, 4, "b"))
    s["displayParts"] = [
        {"text": "AQUA →", "delay": 0},
        {"text": "  aquarium  ·  aquatic", "delay": 0},
        {"text": "  ·  aqueduct", "delay": 0},
    ]
    s["highlightWord"] = {"word": "Aqua", "delay": 0}
    replace_step(idx, std, 4, "b", s)

    s = reset(get_step(idx, std, 4, "c"))
    s["displayText"] = "Roots unlocked!"
    s["displayDelay"] = 0
    replace_step(idx, std, 4, "c", s)

    # ──────────────────────────────────────────────────────────
    with open(PATH, "w") as f:
        json.dump(lessons, f, indent=2)
    print(f"Wrote rewrites to {PATH}")
    print("Next: npx tsx scripts/align-slide-timings.ts --standard=<id> --apply")


if __name__ == "__main__":
    main()
