#!/usr/bin/env python3
"""
Fix TTS scripts for any grade — removes/replaces "Was it..." and fixes ".?" punctuation.

Usage:
  python3 scripts/fix-grade-tts.py scripts/1st-grade-tts-scripts-teacher-ssml.csv
  python3 scripts/fix-grade-tts.py scripts/2nd-grade-tts-scripts-teacher-ssml.csv
  python3 scripts/fix-grade-tts.py scripts/3rd-grade-tts-scripts-teacher-ssml.csv

Same logic as fix-k-grade-tts.py but without K-specific per-question overrides.
"""

import csv
import re
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def extract_question_prompt(script_text):
    """Extract the question from SSML (text inside <emphasis> or before options)."""
    m = re.search(r"<emphasis[^>]*>(.*?)</emphasis>", script_text)
    if m:
        return m.group(1).strip()
    m = re.search(r"<break[^/]*/>\s*(.+?)\s*Was it", script_text)
    if m:
        return m.group(1).strip()
    return ""


def fix_was_it(script_text):
    """Apply the appropriate 'Was it...' fix based on context."""

    # Skip hint files — they don't have "Was it..."
    if "Was it" not in script_text:
        return script_text

    prompt = extract_question_prompt(script_text)
    prompt_lower = prompt.lower()

    # ── "What does X mean?" → "Does it mean..." ──
    if "mean" in prompt_lower:
        script_text = script_text.replace("Was it... ", "Does it mean... ")
        return script_text

    # ── Pattern B — option A in <emphasis>, "Was it" before option B ──
    if re.search(r"</emphasis>\s*<break[^/]*/>\s*Was it\.\.\.", script_text):
        script_text = re.sub(r"Was it\.\.\.\s*", "", script_text)
        return script_text

    # ── Fill-in-blank (no emphasis question, just statement + options) ──
    if not re.search(r"<emphasis", script_text) or "called the" in script_text.lower():
        script_text = script_text.replace("Was it... ", "")
        return script_text

    # ── Contextual replacement based on question word ──
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
    elif prompt_lower.startswith("how many"):
        script_text = script_text.replace("Was it... ", "Is it... ")
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
    script_text = re.sub(r"\.(\?)", r"\1", script_text)
    return script_text


def parse_csv(filepath):
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
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/fix-grade-tts.py <csv-file>")
        sys.exit(1)

    csv_path = sys.argv[1]
    if not os.path.isabs(csv_path):
        csv_path = os.path.join(os.getcwd(), csv_path)

    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        sys.exit(1)

    rows = parse_csv(csv_path)
    print(f"Loaded {len(rows)} rows from {os.path.basename(csv_path)}")

    changed_files = []
    total_was_it_fixes = 0
    total_punct_fixes = 0

    for row in rows:
        original = row["script_text"]

        row["script_text"] = fix_was_it(row["script_text"])
        row["script_text"] = fix_punctuation(row["script_text"])

        if row["script_text"] != original:
            was_it_changed = "Was it" in original and "Was it" not in row["script_text"]
            punct_changed = ".?" in original and ".?" not in row["script_text"]
            if was_it_changed:
                total_was_it_fixes += 1
            if punct_changed:
                total_punct_fixes += 1
            changed_files.append(f"{row['lesson_id']}/{row['filename']}")

    write_csv(csv_path, rows)

    print(f"\n=== SUMMARY ===")
    print(f"Total rows: {len(rows)}")
    print(f"'Was it' fixes: {total_was_it_fixes}")
    print(f"Punctuation fixes: {total_punct_fixes}")
    print(f"Total files changed: {len(changed_files)}")

    if changed_files:
        # Write regen list
        grade_tag = os.path.basename(csv_path).split("-")[0]
        list_path = os.path.join(SCRIPT_DIR, f"{grade_tag}-grade-regen-list.txt")
        with open(list_path, "w") as f:
            for fname in changed_files:
                f.write(f"public/audio/{fname}\n")
        print(f"\nRegen list saved to: {list_path}")
        print(f"Files to regenerate: {len(changed_files)}")
        print(f"Est. generation time: ~{len(changed_files) * 5 // 60} min {len(changed_files) * 5 % 60}s")


if __name__ == "__main__":
    main()
