#!/usr/bin/env node

/**
 * Wire audio URLs to individual practice and read questions in lessons.json.
 *
 * Maps: q1 → practice question 1, rq1 → read question 1, etc.
 * Also adds hint audio from q1_hint URLs.
 */

const fs = require("fs");
const path = require("path");

const LESSONS_PATH = path.resolve(__dirname, "..", "lib", "data", "lessons.json");
const data = JSON.parse(fs.readFileSync(LESSONS_PATH, "utf-8"));

let updated = 0;

for (const level of Object.values(data.levels)) {
  if (!level.lessons) continue;

  for (const lesson of level.lessons) {
    const urls = lesson.audio_urls;
    if (!urls) continue;

    // Wire practice questions
    if (lesson.practice && lesson.practice.questions) {
      lesson.practice.questions.forEach((q, i) => {
        const num = i + 1;
        if (urls[`q${num}`]) {
          q.audio_url = urls[`q${num}`];
          updated++;
        }
        if (urls[`q${num}_hint`]) {
          q.hint_audio_url = urls[`q${num}_hint`];
          updated++;
        }
      });
    }

    // Wire read questions
    if (lesson.read && lesson.read.questions) {
      lesson.read.questions.forEach((q, i) => {
        const num = i + 1;
        if (urls[`rq${num}`]) {
          q.audio_url = urls[`rq${num}`];
          updated++;
        }
      });
    }

    // Wire story audio
    if (lesson.read) {
      if (urls.story) lesson.read.story_audio_url = urls.story;
      if (urls.story_title) lesson.read.story_title_audio_url = urls.story_title;
    }

    // Wire intro audio
    if (lesson.learn && urls.intro) {
      lesson.learn.intro_audio_url = urls.intro;
    }

    // Wire learn item audio
    if (lesson.learn && lesson.learn.items) {
      lesson.learn.items.forEach((item, i) => {
        const num = i + 1;
        if (urls[`item${num}`]) {
          item.audio_url = urls[`item${num}`];
          updated++;
        }
      });
    }
  }
}

fs.writeFileSync(LESSONS_PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`Done: wired ${updated} audio URLs to individual questions/items`);
