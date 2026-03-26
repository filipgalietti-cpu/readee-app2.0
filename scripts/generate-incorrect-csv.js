#!/usr/bin/env node

/**
 * Generate a TTS CSV for incorrect-answer audio.
 *
 * For each MCQ question, produces a row with:
 *   lesson_id:       grade/standard  (e.g. kindergarten/RL.K.1)
 *   filename:        id-incorrect    (e.g. RL.K.1-Q1-incorrect)
 *   script_text:     "The correct answer is C, a red ball."
 *   voice_direction: encouraging teacher tone
 *
 * Output: scripts/incorrect-answer-tts.csv
 *
 * Usage:
 *   node scripts/generate-incorrect-csv.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "..", "app", "data");
const OUT_CSV = path.resolve(__dirname, "incorrect-answer-tts.csv");

const GRADE_FILES = [
  { file: "kindergarten-standards-questions.json", folder: "kindergarten" },
  { file: "1st-grade-standards-questions.json", folder: "1st-grade" },
  { file: "2nd-grade-standards-questions.json", folder: "2nd-grade" },
  { file: "3rd-grade-standards-questions.json", folder: "3rd-grade" },
  { file: "4th-grade-standards-questions.json", folder: "4th-grade" },
];

const VOICE_DIRECTION =
  "Say this in a warm, encouraging tone like a supportive teacher. Speak naturally and gently, like you're helping a child learn the right answer:";

function escapeCSV(str) {
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function main() {
  const rows = [];

  for (const { file, folder } of GRADE_FILES) {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const standards = data.standards || data;

    for (const std of standards) {
      for (const q of std.questions) {
        if (q.type !== "multiple_choice") continue;
        if (!q.correct) continue;

        // Lowercase the answer start for natural speech flow, unless it's
        // a proper noun (e.g. "Bear", "Lily") or "I".
        let answer = q.correct;
        // Common sentence starters that should be lowercased
        if (/^(A |An |The |To |In |On |At |He |She |It |They |His |Her |By |If |So |But |And |Or )/.test(answer)) {
          answer = answer.charAt(0).toLowerCase() + answer.slice(1);
        }
        // Strip trailing period/punctuation to avoid double periods
        answer = answer.replace(/[.!]+$/, "");
        const scriptText = `The correct answer is ${answer}.`;
        const lessonId = `${folder}/${std.standard_id}`;
        const filename = `${q.id}-incorrect`;

        rows.push({ lessonId, filename, scriptText });
      }
    }
  }

  // Build CSV
  const header = "lesson_id,filename,script_text,voice_direction";
  const csvRows = rows.map(
    (r) =>
      `${escapeCSV(r.lessonId)},${escapeCSV(r.filename)},${escapeCSV(r.scriptText)},${escapeCSV(VOICE_DIRECTION)}`
  );

  fs.writeFileSync(OUT_CSV, [header, ...csvRows].join("\n") + "\n");
  console.log(`Generated ${rows.length} rows → ${OUT_CSV}`);
}

main();
