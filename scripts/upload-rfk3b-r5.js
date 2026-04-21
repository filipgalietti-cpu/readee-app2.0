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

const AUDIO_FILES = [
  "lessons/RF.K.3b/S3sl-c.mp3",
  "lessons/RF.K.3b/S4me-b.mp3",
  "lessons/RF.K.3b/S4me-c.mp3",
];

async function uploadFile(bucket, relPath, localRoot, contentType) {
  const fullPath = path.join(localRoot, relPath);
  const buf = fs.readFileSync(fullPath);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${relPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buf,
  });
  if (!res.ok) {
    console.error(`FAIL ${bucket}/${relPath}: ${res.status} ${await res.text()}`);
    return false;
  }
  console.log(`OK   ${bucket}/${relPath}`);
  return true;
}

(async () => {
  const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio");
  let ok = 0, fail = 0;
  for (const f of AUDIO_FILES) {
    if (await uploadFile("audio", f, AUDIO_DIR, "audio/mpeg")) ok++; else fail++;
  }
  console.log(`\nDone: ${ok} uploaded, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
