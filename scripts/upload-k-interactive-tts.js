#!/usr/bin/env node

/**
 * Upload K interactive audit TTS audio to Supabase (x-upsert: true).
 *
 * Run after: node scripts/generate-audio.js --csv=audit-k-interactive-tts.csv
 */

const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const AUDIO = [
  "kindergarten/RF.K.1d/RF.K.1d-Q3.mp3",
  "kindergarten/RF.K.1d/RF.K.1d-Q3-hint.mp3",
  "kindergarten/RF.K.2a/RF.K.2a-Q4.mp3",
  "kindergarten/RF.K.2a/RF.K.2a-Q4-hint.mp3",
];

async function upload(storagePath) {
  const localPath = path.resolve(__dirname, "..", "public", "audio", storagePath);
  if (!fs.existsSync(localPath)) {
    console.error(`  MISSING: ${localPath}`);
    return false;
  }
  const buf = fs.readFileSync(localPath);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/audio/${storagePath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "audio/mpeg",
      "x-upsert": "true",
    },
    body: buf,
  });
  if (res.ok) return true;
  const body = await res.text();
  console.error(`  FAIL ${storagePath} — ${res.status}: ${body.slice(0, 200)}`);
  return false;
}

async function main() {
  let ok = 0, fail = 0;
  console.log(`Uploading ${AUDIO.length} TTS audio files...`);
  for (const aud of AUDIO) {
    const result = await upload(aud);
    if (result) { ok++; process.stdout.write("."); } else fail++;
  }
  console.log(`\n\nDone: ${ok} uploaded, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main();
