#!/usr/bin/env node

/**
 * Add audio_url and hint_audio_url to all grade-level standards question JSON files.
 * Also normalizes field names to match the kindergarten format.
 *
 * Usage: node scripts/wire-all-standards-audio.js
 */

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://rwlvjtowmfrrqeqvwolo.supabase.co";
const AUDIO_BASE = `${SUPABASE_URL}/storage/v1/object/public/audio`;
const DATA_DIR = path.resolve(__dirname, "..", "app", "data");

const FILES = [
  "kindergarten-standards-questions.json",
  "1st-grade-standards-questions.json",
  "2nd-grade-standards-questions.json",
  "3rd-grade-standards-questions.json",
  "4th-grade-standards-questions.json",
];

for (const file of FILES) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} (not found)`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let updated = 0;

  for (const std of data.standards) {
    // Normalize standard-level field names
    if (std.id && !std.standard_id) {
      std.standard_id = std.id;
      delete std.id;
    }
    if (std.desc && !std.standard_description) {
      std.standard_description = std.desc;
      delete std.desc;
    }

    const stdId = std.standard_id;

    for (const q of std.questions) {
      // Extract question number from id like "RL.K.1-Q1" -> "1"
      const qNum = q.id.split("-Q")[1];

      q.audio_url = `${AUDIO_BASE}/${stdId}/q${qNum}.mp3`;
      if (q.hint) {
        q.hint_audio_url = `${AUDIO_BASE}/${stdId}/q${qNum}-hint.mp3`;
      }
      updated++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`${file}: ${updated} questions updated with audio URLs`);
}

console.log("\nDone.");
