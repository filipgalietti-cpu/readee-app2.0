#!/usr/bin/env python3
"""
Fix scrambled correct_answer values and comma-split options
for 4th-grade lessons (4-L4 through 4-L8 and 4-L10).

Lessons 4-L1, 4-L2, 4-L3, 4-L9 are already correct.
"""

import json
import os

# ── Corrections ────────────────────────────────────────────────────
# Format: { lesson_id: { question_id: { "correct": ..., "options": ... (if fixing split) } } }

FIXES = {
    "4-L4": {
        "q1": {"correct": "Cause & Effect"},
        "q2": {
            "options": [
                "First, then, finally",
                "Because, so, therefore",
                "However, on the other hand, similarly",
                "Once upon a time",
            ],
            "correct": "However, on the other hand, similarly",
        },
        "q3": {"correct": "Problem & Solution"},
        "q4": {"correct": "Chronological Order"},
        "q5": {"correct": "Compare & Contrast"},
        "rq1": {"correct": "Compare & Contrast"},
        "rq2": {"correct": "On the other hand"},
        "rq3": {"correct": "It only works well on sunny days"},
    },
    "4-L5": {
        "q1": {"correct": "Persistence leads to success"},
        "q2": {"correct": "Don't judge others by their appearance"},
        "q3": {"correct": "Believe in yourself and work hard"},
        "q4": {"correct": "Working together can achieve great things"},
        "q5": {"correct": "Honesty is rewarded"},
        "rq1": {"correct": "Being yourself leads to success"},
        "rq2": {"correct": "She saw how good the other entries were"},
        "rq3": {"correct": "She was being authentically herself"},
    },
    "4-L6": {
        "q1": {"correct": "First person"},
        "q2": {"correct": "Third person limited"},
        "q3": {"correct": "I"},
        "q4": {"correct": "Third person omniscient"},
        "q5": {"correct": "To make the reader feel close to one character"},
        "rq1": {"correct": "First person"},
        "rq2": {"correct": "Emma baked the cookies"},
        "rq3": {"correct": "We hear the narrator's exact thoughts and feelings"},
    },
    "4-L7": {
        "q1": {"correct": "Inform you about the pyramids"},
        "q2": {"correct": "Persuade"},
        "q3": {"correct": "Entertain"},
        "q4": {"correct": "They use opinions and emotional language"},
        "q5": {"correct": "Inform about coral reefs and their challenges"},
        "rq1": {"correct": "To persuade readers to save the school garden"},
        "rq2": {"correct": "Test score data and examples from other schools"},
        "rq3": {"correct": "A call to action"},
    },
    "4-L8": {
        "q1": {"correct": "Very hungry"},
        "q2": {"correct": "Fallen apart and ruined"},
        "q3": {"correct": "Calm and peaceful"},
        "q4": {
            "options": [
                "Mammals",
                "Birds",
                "A group including snakes, lizards, and turtles",
                "Fish",
            ],
            "correct": "A group including snakes, lizards, and turtles",
        },
        "q5": {"correct": "Amazing and noteworthy"},
        "rq1": {"correct": "The nearby pottery and tools as examples"},
        "rq2": {"correct": "Very cold"},
        "rq3": {"correct": "By defining it directly"},
    },
    "4-L10": {
        "q1": {"correct": "Only the most important information"},
        "q2": {"correct": "Tom forgot his homework but his teacher gave him extra time and he finished it"},
        "q3": {"correct": "She wore a blue shirt"},
        "q4": {"correct": "The main idea and key supporting details"},
        "q5": {"correct": "Shorter than the original"},
        # rq1 and rq2 are already correct
        "rq3": {
            "options": [
                "The temperature is just right",
                "They travel up to 3,000 miles",
                "Some scientists study the sun",
                "The forests are in mountains",
            ],
            "correct": "They travel up to 3,000 miles",
        },
    },
}


def main():
    app_path = os.path.expanduser("~/readee-app2.0/lib/data/lessons.json")
    with open(app_path) as f:
        app_data = json.load(f)

    lessons = app_data["levels"]["4th"]["lessons"]
    total_fixes = 0
    option_fixes = 0

    for lesson in lessons:
        lid = lesson["id"]
        if lid not in FIXES:
            continue

        fixes = FIXES[lid]
        print(f"\n=== {lid}: {lesson['title']} ===")

        # Fix practice questions (q1-q5)
        for pq in lesson["practice"]["questions"]:
            # Extract question number from question_id (e.g., "4-L4-P1" → "q1")
            pnum = pq["question_id"].split("-P")[1]
            qid = f"q{pnum}"
            if qid in fixes:
                fix = fixes[qid]
                old_correct = pq["correct"]
                new_correct = fix["correct"]
                if "options" in fix:
                    pq["choices"] = fix["options"]
                    option_fixes += 1
                    print(f"  {qid}: Fixed options")
                pq["correct"] = new_correct
                in_choices = new_correct in pq["choices"]
                print(f"  {qid}: '{old_correct}' → '{new_correct}' [in choices: {in_choices}]")
                total_fixes += 1

        # Fix reading questions (rq1-rq3)
        for rq in lesson["read"]["questions"]:
            rnum = rq["question_id"].split("-R")[1]
            qid = f"rq{rnum}"
            if qid in fixes:
                fix = fixes[qid]
                old_correct = rq["correct"]
                new_correct = fix["correct"]
                if "options" in fix:
                    rq["choices"] = fix["options"]
                    option_fixes += 1
                    print(f"  {qid}: Fixed options")
                rq["correct"] = new_correct
                in_choices = new_correct in rq["choices"]
                print(f"  {qid}: '{old_correct}' → '{new_correct}' [in choices: {in_choices}]")
                total_fixes += 1

    # Write back
    with open(app_path, "w") as f:
        json.dump(app_data, f, indent=2, ensure_ascii=False)

    print(f"\nDone! Fixed {total_fixes} correct answers and {option_fixes} split options.")


if __name__ == "__main__":
    main()
