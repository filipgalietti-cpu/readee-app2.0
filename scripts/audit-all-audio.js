#!/usr/bin/env node
const fs = require("fs");

// 1. Lesson questions
const lessons = JSON.parse(fs.readFileSync("lib/data/lessons.json", "utf-8"));
let lessonTotal = 0, lessonWithAudio = 0, lessonMissing = [];
for (const level of Object.values(lessons.levels)) {
  if (!level.lessons) continue;
  for (const lesson of level.lessons) {
    if (lesson.practice && lesson.practice.questions) {
      for (const q of lesson.practice.questions) {
        lessonTotal++;
        if (q.audio_url) lessonWithAudio++;
        else lessonMissing.push(q.question_id + " (practice)");
      }
    }
    if (lesson.read && lesson.read.questions) {
      for (const q of lesson.read.questions) {
        lessonTotal++;
        if (q.audio_url) lessonWithAudio++;
        else lessonMissing.push(q.question_id + " (read)");
      }
    }
  }
}

// 2. Standards questions — all grades
const gradeFiles = [
  { file: "app/data/kindergarten-standards-questions.json", label: "Kindergarten" },
  { file: "app/data/1st-grade-standards-questions.json", label: "1st Grade" },
  { file: "app/data/2nd-grade-standards-questions.json", label: "2nd Grade" },
  { file: "app/data/3rd-grade-standards-questions.json", label: "3rd Grade" },
  { file: "app/data/4th-grade-standards-questions.json", label: "4th Grade" },
];
let stdTotal = 0, stdWithWorkingAudio = 0, stdBrokenAudio = 0, stdNoAudio = 0;
let brokenList = [];
for (const { file, label } of gradeFiles) {
  const standards = JSON.parse(fs.readFileSync(file, "utf-8"));
  let gradeCount = 0;
  for (const std of standards.standards) {
    for (const q of std.questions) {
      stdTotal++;
      gradeCount++;
      const url = q.audio_url || q.prompt_audio_url;
      if (!url) {
        stdNoAudio++;
      } else if (url.startsWith("/audio/")) {
        stdBrokenAudio++;
        brokenList.push(q.id);
      } else if (url.startsWith("http")) {
        stdWithWorkingAudio++;
      }
    }
  }
  console.log(`  ${label}: ${gradeCount} questions`);
}

console.log("=== LESSON QUESTIONS (lessons.json) ===");
console.log("Total:", lessonTotal);
console.log("With working audio:", lessonWithAudio + "/" + lessonTotal);
if (lessonMissing.length > 0) {
  console.log("MISSING:", lessonMissing.length);
  lessonMissing.forEach(m => console.log("  -", m));
} else {
  console.log("ALL GOOD");
}

console.log("");
console.log("=== STANDARDS QUESTIONS (all grades) ===");
console.log("Total:", stdTotal);
console.log("With working audio (CDN URLs):", stdWithWorkingAudio);
console.log("With BROKEN audio (local paths, files missing):", stdBrokenAudio);
console.log("No audio URL at all:", stdNoAudio);

console.log("");
console.log("=== SUMMARY ===");
console.log("Total questions in app:", lessonTotal + stdTotal);
console.log("Working audio:", lessonWithAudio + stdWithWorkingAudio);
console.log("BROKEN/MISSING audio:", lessonMissing.length + stdBrokenAudio + stdNoAudio);
