#!/usr/bin/env node

/**
 * Generate TTS CSV for all kindergarten standards questions.
 * Output: scripts/standards-tts-scripts.csv
 */

const fs = require("fs");
const path = require("path");

const data = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "..", "app", "data", "kindergarten-standards-questions.json"),
    "utf-8"
  )
);

const rows = [];

for (const std of data.standards) {
  for (const q of std.questions) {
    const stdId = q.id.split("-Q")[0];
    const qNum = q.id.split("-Q")[1];
    const folder = stdId;

    // Question prompt audio
    rows.push({
      lessonId: folder,
      filename: `q${qNum}`,
      scriptText: q.prompt.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim(),
      voiceDirection: "",
    });

    // Hint audio
    if (q.hint) {
      rows.push({
        lessonId: folder,
        filename: `q${qNum}-hint`,
        scriptText: q.hint,
        voiceDirection: "",
      });
    }
  }
}

function escapeCSV(val) {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

const header = "lesson_id,filename,script_text,voice_direction";
const csvLines = rows.map(
  (r) =>
    `${escapeCSV(r.lessonId)},${escapeCSV(r.filename)},${escapeCSV(r.scriptText)},${escapeCSV(r.voiceDirection)}`
);

const outPath = path.resolve(__dirname, "standards-tts-scripts.csv");
fs.writeFileSync(outPath, [header, ...csvLines].join("\n") + "\n");
console.log(`Written ${rows.length} rows to ${outPath}`);
