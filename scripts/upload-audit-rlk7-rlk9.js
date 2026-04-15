#!/usr/bin/env node

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
const BUCKET = "audio";
const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio");

const FILES = [
  "lessons/RL.K.7/S3a.mp3",
  "lessons/RL.K.7/S4b.mp3",
  "lessons/RL.K.7/S4c.mp3",
  "lessons/RL.K.7/S4d.mp3",
  "lessons/RL.K.9/S4b.mp3",
  "lessons/RL.K.9/S4c.mp3",
  "lessons/RL.K.9/S4d.mp3",
];

async function uploadFile(relPath) {
  const fullPath = path.join(AUDIO_DIR, relPath);
  const buf = fs.readFileSync(fullPath);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${relPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "audio/mpeg",
      "x-upsert": "true",
    },
    body: buf,
  });
  if (!res.ok) {
    console.error(`FAIL ${relPath}: ${res.status} ${await res.text()}`);
    return false;
  }
  console.log(`OK   ${relPath}`);
  return true;
}

(async () => {
  let ok = 0, fail = 0;
  for (const f of FILES) {
    if (await uploadFile(f)) ok++; else fail++;
  }
  console.log(`\nDone: ${ok} uploaded, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
