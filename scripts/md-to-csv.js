#!/usr/bin/env node

/**
 * Convert readee-tts-scripts.md → readee-tts-scripts.csv
 *
 * Parses the markdown format:
 *   ## pk-L1: Meet the Letters (A-F)
 *   **Folder: audio/pk-L1/**
 *   ### intro.mp3
 *   "Script text here"
 *
 * Outputs CSV: lesson_id,filename,script_text,voice_direction
 */

const fs = require("fs");
const path = require("path");

const mdPath =
  process.argv[2] ||
  path.resolve(
    process.env.HOME,
    "Desktop/Readee/Scripts/readee-tts-scripts.md"
  );
const outPath = path.resolve(__dirname, "readee-tts-scripts.csv");

const content = fs.readFileSync(mdPath, "utf-8");
const lines = content.split("\n");

const rows = [];
let currentLessonId = null;
let currentFilename = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Match folder line: **Folder: audio/pk-L1/**
  const folderMatch = line.match(/\*\*Folder:\s*audio\/([^/]+)\//);
  if (folderMatch) {
    currentLessonId = folderMatch[1];
    continue;
  }

  // Match filename line: ### intro.mp3
  const fileMatch = line.match(/^###\s+(\S+\.mp3)/);
  if (fileMatch) {
    currentFilename = fileMatch[1].replace(/\.mp3$/, "");
    continue;
  }

  // Match script text line: "Script text here"
  const scriptMatch = line.match(/^"(.+)"$/);
  if (scriptMatch && currentLessonId && currentFilename) {
    rows.push({
      lessonId: currentLessonId,
      filename: currentFilename,
      scriptText: scriptMatch[1],
      voiceDirection: "",
    });
    currentFilename = null;
  }
}

// Build CSV
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

fs.writeFileSync(outPath, [header, ...csvLines].join("\n") + "\n");
console.log(`Written ${rows.length} rows to ${outPath}`);
