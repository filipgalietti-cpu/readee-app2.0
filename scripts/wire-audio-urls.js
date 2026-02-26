#!/usr/bin/env node

/**
 * Wire Supabase audio URLs into lessons.json.
 *
 * Reads the generated audio files from public/audio/ and adds audio_urls
 * objects to each lesson in lessons.json.
 *
 * Audio URL format:
 *   {SUPABASE_URL}/storage/v1/object/public/audio/{lessonId}/{filename}.mp3
 *
 * Usage: node scripts/wire-audio-urls.js
 */

const fs = require("fs");
const path = require("path");

// Load .env.local for Supabase URL
const envPath = path.resolve(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
if (!SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const AUDIO_BASE = `${SUPABASE_URL}/storage/v1/object/public/audio`;
const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio");
const LESSONS_PATH = path.resolve(__dirname, "..", "lib", "data", "lessons.json");

function audioUrl(lessonId, filename) {
  return `${AUDIO_BASE}/${lessonId}/${filename}.mp3`;
}

function audioExists(lessonId, filename) {
  return fs.existsSync(path.join(AUDIO_DIR, lessonId, `${filename}.mp3`));
}

function main() {
  const data = JSON.parse(fs.readFileSync(LESSONS_PATH, "utf-8"));
  let updated = 0;

  for (const levelKey of Object.keys(data.levels)) {
    const level = data.levels[levelKey];
    if (!level.lessons) continue;

    for (const lesson of level.lessons) {
      const id = lesson.id;
      if (!fs.existsSync(path.join(AUDIO_DIR, id))) continue;

      // Build audio_urls map for this lesson
      const urls = {};

      // Intro
      if (audioExists(id, "intro")) urls.intro = audioUrl(id, "intro");

      // Learn items (item1, item2, ...)
      for (let i = 1; i <= 10; i++) {
        if (audioExists(id, `item${i}`)) urls[`item${i}`] = audioUrl(id, `item${i}`);
      }

      // Practice questions (q1, q1-hint, ...)
      for (let i = 1; i <= 10; i++) {
        if (audioExists(id, `q${i}`)) urls[`q${i}`] = audioUrl(id, `q${i}`);
        if (audioExists(id, `q${i}-hint`)) urls[`q${i}_hint`] = audioUrl(id, `q${i}-hint`);
      }

      // Story
      if (audioExists(id, "story-title")) urls.story_title = audioUrl(id, "story-title");
      if (audioExists(id, "story")) urls.story = audioUrl(id, "story");

      // Read questions (rq1, rq2, ...)
      for (let i = 1; i <= 10; i++) {
        if (audioExists(id, `rq${i}`)) urls[`rq${i}`] = audioUrl(id, `rq${i}`);
      }

      // Feedback
      for (let i = 1; i <= 5; i++) {
        const suffix = i === 1 ? "" : String(i);
        if (audioExists(id, `correct${suffix}`)) urls[`correct${suffix || "1"}`] = audioUrl(id, `correct${suffix}`);
        if (audioExists(id, `incorrect${suffix}`)) urls[`incorrect${suffix || "1"}`] = audioUrl(id, `incorrect${suffix}`);
      }

      // Lesson lifecycle
      if (audioExists(id, "lesson-complete")) urls.lesson_complete = audioUrl(id, "lesson-complete");
      if (audioExists(id, "section-complete")) urls.section_complete = audioUrl(id, "section-complete");
      if (audioExists(id, "level-up")) urls.level_up = audioUrl(id, "level-up");
      if (audioExists(id, "try-again")) urls.try_again = audioUrl(id, "try-again");
      if (audioExists(id, "tap-to-start")) urls.tap_to_start = audioUrl(id, "tap-to-start");
      if (audioExists(id, "streak")) urls.streak = audioUrl(id, "streak");
      if (audioExists(id, "lesson-complete-generic")) urls.lesson_complete_generic = audioUrl(id, "lesson-complete-generic");

      // Encouragement
      for (let i = 1; i <= 5; i++) {
        if (audioExists(id, `encouragement${i}`)) urls[`encouragement${i}`] = audioUrl(id, `encouragement${i}`);
      }

      if (Object.keys(urls).length > 0) {
        lesson.audio_urls = urls;
        updated++;
        console.log(`${id}: ${Object.keys(urls).length} audio URLs`);
      }
    }
  }

  fs.writeFileSync(LESSONS_PATH, JSON.stringify(data, null, 2) + "\n");
  console.log(`\nDone: updated ${updated} lessons with audio URLs`);
}

main();
