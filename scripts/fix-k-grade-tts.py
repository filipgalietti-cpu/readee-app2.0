#!/usr/bin/env python3
"""
Fix kindergarten TTS scripts based on audit feedback.

Main issue: "Was it..." before answer options sounds grammatically wrong.
Fix approach:
  - "What does X mean?" questions → "Does it mean..."
  - "How old is X?" questions → contextual ("Is she turning...")
  - "What happened" questions → "Did..."
  - Fill-in-blank / text-type / author-illustrator → remove "Was it..."
  - Pattern B (option A in <emphasis>, "Was it..." before option B) → remove
  - Specific per-question fixes from audit comments

Also fixes:
  - ".?" punctuation pattern → just "?"
  - RL.K.6-Q3 over-excited voice direction
  - RL.K.9-Q5 option A structure
"""

import csv
import re
import io
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(SCRIPT_DIR, "k-grade-tts-teacher-no-intro.csv")

# ── Per-question overrides ─────────────────────────────────────────
# These are specific fixes from the audit that go beyond "Was it..." removal.
# Format: (lesson_id, filename) → dict of replacements or full script override
SPECIFIC_FIXES = {
    # RL.K.1-Q3: user says "is she turning" sounds better
    ("RL.K.1", "q3.mp3"): {
        "replace": [
            ("Was it... 5?", "Is she turning... 5?"),
        ]
    },
    # RL.K.2-Q4: user says "Did Rabbit win the race" — but actual question is
    # "What happened at the END?" so just remove "Was it..."
    ("RL.K.2", "q4.mp3"): {
        "replace": [
            ("Was it... ", ""),
        ]
    },
    # RL.K.2-Q5: user says "Did it start raining again" — question is
    # "What happened AFTER the sun came out?" so remove "Was it..."
    ("RL.K.2", "q5.mp3"): {
        "replace": [
            ("Was it... ", ""),
        ]
    },
    # RL.K.5-Q5: "This is a?" needs to be a proper question + remove Was it
    ("RL.K.5", "q5.mp3"): {
        "replace": [
            ("Was it... ", ""),
        ]
    },
    # RL.K.6-Q3: too excited — tone down voice direction; also fix structure
    # Current: "Who drew the pictures? <emphasis>Maria Lopez?</emphasis> Was it... James Park?"
    # Fix: remove "Was it..." and soften voice
    ("RL.K.6", "q3.mp3"): {
        "replace": [
            ("Was it... ", ""),
        ],
        "voice_direction": "Read this like a calm, clear elementary school teacher reading to a small child:",
    },
    # RL.K.6-Q4: "What does an AUTHOR do? <emphasis>Draws the pictures?</emphasis> Was it... Writes the words?"
    # "was it after writes the words does not make sense" — remove Was it
    ("RL.K.6", "q4.mp3"): {
        "replace": [
            ("Was it... ", ""),
        ]
    },
    # RL.K.9-Q1: fix option text — "They both live in the forest.?" → "They both live in the forest?"
    # and "They are the same size.?" → "They are the same size?"
    # Also remove "Was it..."
    ("RL.K.9", "q1.mp3"): {
        "replace": [
            ("Was it... ", ""),
        ]
    },
    # RL.K.9-Q5: "Option A should include both characters without was"
    # Current: <emphasis>Zoe cried?</emphasis> Was it... James searched for his toy.?
    # Fix: option A → "Zoe cried and James searched for his toy?"
    ("RL.K.9", "q5.mp3"): {
        "replace": [
            (
                "<emphasis level='moderate'>Zoe cried?</emphasis><break time='800ms'/> Was it... James searched for his toy.?",
                "Zoe cried and James searched for his toy?",
            ),
        ]
    },
}


def extract_question_prompt(script_text):
    """Extract the question from SSML (text inside <emphasis> or before options)."""
    # Try to find emphasized text
    m = re.search(r"<emphasis[^>]*>(.*?)</emphasis>", script_text)
    if m:
        return m.group(1).strip()
    # Fallback: text between last break and "Was it"
    m = re.search(r"<break[^/]*/>\s*(.+?)\s*Was it", script_text)
    if m:
        return m.group(1).strip()
    return ""


def fix_was_it(lesson_id, filename, script_text):
    """Apply the appropriate 'Was it...' fix based on context."""

    # Check for specific per-question overrides first
    key = (lesson_id, filename)
    if key in SPECIFIC_FIXES:
        fix = SPECIFIC_FIXES[key]
        for old, new in fix.get("replace", []):
            script_text = script_text.replace(old, new)
        return script_text

    # Skip hint files — they don't have "Was it..."
    if "-hint" in filename:
        return script_text

    # Skip if no "Was it" present
    if "Was it" not in script_text:
        return script_text

    # Get the question prompt for context
    prompt = extract_question_prompt(script_text)

    # ── Category 1: "What does X mean?" → "Does it mean..." ──
    if "mean" in prompt.lower() or "does" in prompt.lower() and "mean" in script_text.lower():
        script_text = script_text.replace("Was it... ", "Does it mean... ")
        return script_text

    # ── Category 2: Pattern B — option A is in <emphasis>, "Was it" before option B ──
    # These have: </emphasis><break .../> Was it...
    if re.search(r"</emphasis>\s*<break[^/]*/>\s*Was it\.\.\.", script_text):
        script_text = re.sub(r"Was it\.\.\.\s*", "", script_text)
        return script_text

    # ── Category 3: Fill-in-blank (no emphasis question, just statement + options) ──
    # e.g., "The person who WRITES... is called the. Was it..."
    # e.g., "A STORYBOOK usually has. Was it..."
    if not re.search(r"<emphasis", script_text) or "called the" in script_text.lower():
        script_text = script_text.replace("Was it... ", "")
        return script_text

    # ── Category 4: Contextual replacement based on question word ──
    prompt_lower = prompt.lower()

    if prompt_lower.startswith("what does") and "mean" in prompt_lower:
        script_text = script_text.replace("Was it... ", "Does it mean... ")
    elif prompt_lower.startswith("where"):
        if "they" in prompt_lower or "birds" in prompt_lower:
            script_text = script_text.replace("Was it... ", "Do they... ")
        else:
            script_text = script_text.replace("Was it... ", "Is it... ")
    elif prompt_lower.startswith("how old"):
        if "she" in prompt_lower:
            script_text = script_text.replace("Was it... ", "Is she turning... ")
        elif "he" in prompt_lower:
            script_text = script_text.replace("Was it... ", "Is he turning... ")
        else:
            script_text = script_text.replace("Was it... ", "Are they... ")
    elif prompt_lower.startswith("how"):
        if "she" in prompt_lower:
            script_text = script_text.replace("Was it... ", "Is she... ")
        elif "he" in prompt_lower:
            script_text = script_text.replace("Was it... ", "Is he... ")
        else:
            script_text = script_text.replace("Was it... ", "Is it... ")
    elif prompt_lower.startswith("who"):
        script_text = script_text.replace("Was it... ", "Is it... ")
    elif prompt_lower.startswith("when"):
        script_text = script_text.replace("Was it... ", "Is it... ")
    elif prompt_lower.startswith("what"):
        # "What happened" / "What is" / "What kind" etc.
        script_text = script_text.replace("Was it... ", "Is it... ")
    elif prompt_lower.startswith("which"):
        script_text = script_text.replace("Was it... ", "Is it... ")
    elif prompt_lower.startswith("why"):
        script_text = script_text.replace("Was it... ", "")
    else:
        # Default: just remove it
        script_text = script_text.replace("Was it... ", "")

    # Clean up any remaining "Was it..." after break tags
    script_text = re.sub(
        r"<break time='600ms'/>\s*Was it\.\.\.\s*",
        "<break time='600ms'/> ",
        script_text,
    )

    return script_text


def fix_punctuation(script_text):
    """Fix '.?' pattern → just '?' in option text."""
    # "They both live in the forest.?" → "They both live in the forest?"
    script_text = re.sub(r"\.(\?)", r"\1", script_text)
    return script_text


def parse_csv(filepath):
    """Parse TTS CSV handling quoted fields."""
    rows = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if len(row) >= 3:
                rows.append({
                    "lesson_id": row[0].strip(),
                    "filename": row[1].strip(),
                    "script_text": row[2].strip(),
                    "voice_direction": row[3].strip() if len(row) > 3 else "",
                })
    return rows


def write_csv(filepath, rows):
    """Write rows back to CSV."""
    with open(filepath, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["lesson_id", "filename", "script_text", "voice_direction"])
        for row in rows:
            writer.writerow([
                row["lesson_id"],
                row["filename"],
                row["script_text"],
                row["voice_direction"],
            ])


def main():
    rows = parse_csv(CSV_PATH)
    print(f"Loaded {len(rows)} rows from CSV")

    changed_files = []
    total_was_it_fixes = 0
    total_punct_fixes = 0

    for row in rows:
        original = row["script_text"]
        lid = row["lesson_id"]
        fname = row["filename"]
        key = (lid, fname)

        # Apply "Was it..." fix
        row["script_text"] = fix_was_it(lid, fname, row["script_text"])

        # Apply punctuation fix
        row["script_text"] = fix_punctuation(row["script_text"])

        # Apply voice direction override if specified
        if key in SPECIFIC_FIXES and "voice_direction" in SPECIFIC_FIXES[key]:
            row["voice_direction"] = SPECIFIC_FIXES[key]["voice_direction"]

        # Track changes
        if row["script_text"] != original:
            was_it_changed = "Was it" in original and "Was it" not in row["script_text"]
            punct_changed = ".?" in original and ".?" not in row["script_text"]
            if was_it_changed:
                total_was_it_fixes += 1
            if punct_changed:
                total_punct_fixes += 1
            changed_files.append(f"{lid}/{fname}")
            print(f"  Fixed: {lid}/{fname}")

    # Write back
    write_csv(CSV_PATH, rows)

    print(f"\n=== SUMMARY ===")
    print(f"Total rows: {len(rows)}")
    print(f"'Was it' fixes: {total_was_it_fixes}")
    print(f"Punctuation fixes: {total_punct_fixes}")
    print(f"Total files changed: {len(changed_files)}")

    if changed_files:
        print(f"\n=== FILES TO RE-GENERATE ===")
        print(f"Delete these from public/audio/ then re-run generate-audio.js:\n")
        for f in changed_files:
            print(f"  rm public/audio/{f}")

        # Also write the list to a file for easy scripting
        list_path = os.path.join(SCRIPT_DIR, "k-grade-regen-list.txt")
        with open(list_path, "w") as f:
            for fname in changed_files:
                f.write(f"public/audio/{fname}\n")
        print(f"\nList saved to: {list_path}")


if __name__ == "__main__":
    main()
