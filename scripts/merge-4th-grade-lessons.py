#!/usr/bin/env python3
"""
Merge 4th-grade lessons from Downloads/lessons.json into lib/data/lessons.json.
Transforms the raw TTS+MCQ data into the app's lesson format.
"""

import json
import re
import os

SUPABASE_CDN = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/audio"

# ── Lesson metadata ────────────────────────────────────────────────
LESSON_META = {
    "4-L1":  {"skill": "greek_latin_roots",  "story_title": "The Word Detective",       "emoji_set": ["🔤","👂","👀","✍️","📦","📝","🔭"]},
    "4-L2":  {"skill": "figurative_language", "story_title": "The Soccer Game",          "emoji_set": ["✨","☀️","💨","🎪","💰","💎","🧵"]},
    "4-L3":  {"skill": "idioms_proverbs",     "story_title": "Grandma's Wisdom",         "emoji_set": ["🗣️","🦵","🍰","👄","☁️","🐝","🎉"]},
    "4-L4":  {"skill": "text_structure",      "story_title": "Two Kinds of Energy",      "emoji_set": ["📐","🔗","⚖️","📊","📋"]},
    "4-L5":  {"skill": "theme",               "story_title": "The Art Contest",          "emoji_set": ["💡","💪","🪞","🤝","🏠","🌱"]},
    "4-L6":  {"skill": "point_of_view",       "story_title": "Two Sides of the Story",   "emoji_set": ["👁️","👤","👥","🔮"]},
    "4-L7":  {"skill": "authors_purpose",     "story_title": "Save the School Garden!",  "emoji_set": ["🎯","📚","🗳️","😂"]},
    "4-L8":  {"skill": "context_clues",       "story_title": "The Mysterious Museum",    "emoji_set": ["🔎","📖","🔍","💬","🧩"]},
    "4-L9":  {"skill": "character_analysis",  "story_title": "The New Student",          "emoji_set": ["🧠","💬","🎭","🏃","🔄"]},
    "4-L10": {"skill": "summarizing",         "story_title": "The Great Migration",      "emoji_set": ["📋","👤","📌","🔧","❓"]},
}


def strip_ssml(text: str) -> str:
    """Remove all SSML/XML tags and clean up whitespace."""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_intro_description(ssml: str) -> str:
    """Extract a short description from the intro SSML."""
    text = strip_ssml(ssml)
    # Remove "Welcome to today's lesson — [title]!" prefix
    text = re.sub(r"^Welcome to today's lesson\s*[—–-]\s*[^!]+!\s*", "", text)
    # Remove "Let's get started!" suffix
    text = re.sub(r"\s*Let's get started!?\s*$", "", text)
    return text.strip()


def parse_item_technique(ssml: str) -> dict:
    """Parse an item SSML into technique/definition/example format."""
    text = strip_ssml(ssml)

    # Try to split into concept and explanation
    # Common patterns:
    # "Our next root is X. It comes from... For example: ..."
    # "Here's a simile: X. Uses 'like'..."
    # "The phrase is: X. It means: ..."
    # "Cause & Effect. Explains..."
    # "Theme: X. A character..."
    # "First Person. Uses pronouns..."
    # "Definition Clue. The author..."
    # "Thoughts. What the character thinks..."

    # Split into first sentence and rest
    parts = re.split(r'(?<=\.)\s+', text, maxsplit=1)
    if len(parts) == 2:
        technique = parts[0].rstrip('.')
        rest = parts[1]
    else:
        technique = text[:60]
        rest = text[60:]

    # Further split rest into definition and example
    rest_parts = re.split(r'(?<=\.)\s+', rest, maxsplit=1)
    if len(rest_parts) == 2:
        definition = rest_parts[0].rstrip('.')
        example = rest_parts[1].rstrip('!').rstrip('.')
    else:
        definition = rest
        example = ""

    return {"technique": technique, "definition": definition, "example": example}


def parse_story_text(ssml: str) -> str:
    """Extract story text from SSML, formatted for display."""
    text = strip_ssml(ssml)
    # Add newlines before dialog for readability (after periods followed by quotes)
    text = re.sub(r"\.\s+'", ".\n'", text)
    return text


def audio_url(lesson_id: str, filename: str) -> str:
    return f"{SUPABASE_CDN}/{lesson_id}/{filename}"


def build_lesson(raw_lesson: dict) -> dict:
    """Transform a raw lesson into the app's lesson format."""
    lid = raw_lesson["id"]
    meta = LESSON_META[lid]

    # Index content by filename
    content_by_name = {c["filename"]: c for c in raw_lesson["content"]}

    # Index questions by id
    questions_by_id = {q["id"]: q for q in raw_lesson["questions"]}

    # ── Learn section ──────────────────────────────────────
    intro_ssml = content_by_name.get("intro.mp3", {}).get("ssml_script", "")
    description = parse_intro_description(intro_ssml)

    # Build learn items
    items = []
    item_idx = 1
    while f"item{item_idx}.mp3" in content_by_name:
        item_ssml = content_by_name[f"item{item_idx}.mp3"]["ssml_script"]
        parsed = parse_item_technique(item_ssml)
        emoji = meta["emoji_set"][item_idx] if item_idx < len(meta["emoji_set"]) else "📚"
        items.append({
            "technique": parsed["technique"],
            "definition": parsed["definition"],
            "example": parsed["example"],
            "emoji": emoji,
            "audio_url": audio_url(lid, f"item{item_idx}.mp3"),
        })
        item_idx += 1

    learn = {
        "type": "introduction",
        "content": description,
        "items": items,
        "intro_audio_url": audio_url(lid, "intro.mp3"),
    }

    # ── Practice section (q1-q5) ───────────────────────────
    practice_questions = []
    for i in range(1, 6):
        qid = f"q{i}"
        q = questions_by_id.get(qid)
        if not q:
            continue
        practice_questions.append({
            "prompt": q["prompt"],
            "choices": q["options"],
            "correct": q["correct_answer"],
            "type": "multiple_choice",
            "question_id": f"{lid}-P{i}",
            "audio_url": audio_url(lid, f"q{i}.mp3"),
            "hint_audio_url": audio_url(lid, f"q{i}-hint.mp3"),
        })

    practice = {
        "type": "multiple_choice",
        "instructions": "Choose the best answer!",
        "questions": practice_questions,
    }

    # ── Read section (story + rq1-rq3) ────────────────────
    story_ssml = content_by_name.get("story.mp3", {}).get("ssml_script", "")
    story_text = parse_story_text(story_ssml)

    reading_questions = []
    for i in range(1, 4):
        qid = f"rq{i}"
        q = questions_by_id.get(qid)
        if not q:
            continue
        reading_questions.append({
            "prompt": q["prompt"],
            "choices": q["options"],
            "correct": q["correct_answer"],
            "type": "multiple_choice",
            "question_id": f"{lid}-R{i}",
            "audio_url": audio_url(lid, f"rq{i}.mp3"),
        })

    read = {
        "type": "story",
        "title": meta["story_title"],
        "text": story_text,
        "questions": reading_questions,
        "story_audio_url": audio_url(lid, "story.mp3"),
    }

    # ── Audio URLs map ────────────────────────────────────
    audio_urls = {
        "intro": audio_url(lid, "intro.mp3"),
    }
    # Add item audio
    for i in range(1, item_idx):
        audio_urls[f"item{i}"] = audio_url(lid, f"item{i}.mp3")
    # Add practice question + hint audio
    for i in range(1, 6):
        if f"q{i}" in questions_by_id:
            audio_urls[f"q{i}"] = audio_url(lid, f"q{i}.mp3")
            audio_urls[f"q{i}_hint"] = audio_url(lid, f"q{i}-hint.mp3")
    # Add story + reading question audio
    audio_urls["story"] = audio_url(lid, "story.mp3")
    for i in range(1, 4):
        if f"rq{i}" in questions_by_id:
            audio_urls[f"rq{i}"] = audio_url(lid, f"rq{i}.mp3")

    # ── Assemble full lesson ──────────────────────────────
    return {
        "id": lid,
        "title": raw_lesson["title"],
        "skill": meta["skill"],
        "description": description[:120],
        "learn": learn,
        "practice": practice,
        "read": read,
        "standards": [],
        "audio_urls": audio_urls,
    }


def main():
    # Read source data
    src_path = os.path.expanduser("~/Downloads/lessons.json")
    with open(src_path) as f:
        raw_lessons = json.load(f)

    # Read existing app lessons.json
    app_path = os.path.expanduser("~/readee-app2.0/lib/data/lessons.json")
    with open(app_path) as f:
        app_data = json.load(f)

    # Build 4th grade lessons
    fourth_grade_lessons = []
    for raw in raw_lessons:
        lesson = build_lesson(raw)
        fourth_grade_lessons.append(lesson)
        print(f"  Built {lesson['id']}: {lesson['title']} ({len(lesson['learn']['items'])} items, "
              f"{len(lesson['practice']['questions'])} practice, {len(lesson['read']['questions'])} reading)")

    # Sort by lesson number
    fourth_grade_lessons.sort(key=lambda l: int(l["id"].split("-L")[1]))

    # Inject into app data
    app_data["levels"]["4th"] = {
        "level_name": "Advanced Reader",
        "level_number": 6,
        "focus": "Figurative language, text structure, theme, point of view, author's purpose",
        "lessons": fourth_grade_lessons,
    }

    # Update lessons_per_level
    app_data["lesson_config"]["lessons_per_level"]["4th"] = 10

    # Write back
    with open(app_path, "w") as f:
        json.dump(app_data, f, indent=2, ensure_ascii=False)

    print(f"\nDone! Wrote {len(fourth_grade_lessons)} 4th-grade lessons to {app_path}")
    print(f"Updated lessons_per_level.4th = 10")


if __name__ == "__main__":
    main()
