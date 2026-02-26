#!/usr/bin/env node

/**
 * Update kindergarten-standards-questions.json with correct Supabase CDN audio URLs.
 *
 * Old format: https://…/audio/kindergarten/RL.K.1-q1.mp3
 * New format: https://…/audio/RL.K.1/q1.mp3
 */

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://rwlvjtowmfrrqeqvwolo.supabase.co";
const AUDIO_BASE = `${SUPABASE_URL}/storage/v1/object/public/audio`;

const jsonPath = path.resolve(__dirname, "..", "app", "data", "kindergarten-standards-questions.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

let updated = 0;

for (const std of data.standards) {
  for (const q of std.questions) {
    const stdId = q.id.split("-Q")[0];
    const qNum = q.id.split("-Q")[1];

    // Set prompt audio URL
    q.audio_url = `${AUDIO_BASE}/${stdId}/q${qNum}.mp3`;

    // Set hint audio URL (all questions have hints)
    if (q.hint) {
      q.hint_audio_url = `${AUDIO_BASE}/${stdId}/q${qNum}-hint.mp3`;
    }

    // Remove old prompt_audio_url field if it exists
    if (q.prompt_audio_url) {
      delete q.prompt_audio_url;
    }

    updated++;
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
console.log(`Updated ${updated} questions with Supabase CDN audio URLs.`);
