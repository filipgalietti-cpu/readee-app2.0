#!/usr/bin/env node

/**
 * Upload all .mp3 files from public/audio/ to Supabase Storage bucket "audio".
 *
 * Usage: node scripts/upload-audio.js
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs = require("fs");
const path = require("path");

// Load .env.local
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

const BUCKET = "audio";
const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio");

async function ensureBucket() {
  // Try to create the bucket (will 409 if it already exists)
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
    }),
  });

  if (res.ok) {
    console.log(`✓ Created public bucket "${BUCKET}"`);
  } else {
    const body = await res.json();
    if (body.error === "Duplicate" || body.statusCode === "409" || res.status === 409) {
      console.log(`✓ Bucket "${BUCKET}" already exists`);
    } else {
      console.error("Failed to create bucket:", body);
      process.exit(1);
    }
  }
}

function collectMp3Files(dir, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    const storagePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectMp3Files(fullPath, storagePath));
    } else if (entry.name.endsWith(".mp3")) {
      files.push({ fullPath, storagePath });
    }
  }
  return files;
}

async function uploadFile(filePath, storagePath) {
  const fileBuffer = fs.readFileSync(filePath);

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "audio/mpeg",
        "x-upsert": "true",
      },
      body: fileBuffer,
    }
  );

  if (res.ok) {
    return true;
  } else {
    const body = await res.text();
    console.error(`\n  FAIL ${storagePath} — ${res.status}: ${body}`);
    return false;
  }
}

async function main() {
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Audio dir: ${AUDIO_DIR}\n`);

  await ensureBucket();

  const files = collectMp3Files(AUDIO_DIR);
  console.log(`\nFound ${files.length} .mp3 files to upload\n`);

  let success = 0;
  let failed = 0;
  const total = files.length;

  function progressBar() {
    const done = success + failed;
    const width = 30;
    const pct = total > 0 ? done / total : 0;
    const filled = Math.round(width * pct);
    const bar = "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
    const pctStr = (pct * 100).toFixed(1).padStart(5);
    const failStr = failed > 0 ? ` | ${failed} failed` : "";
    process.stdout.write(`\r  ${bar} ${pctStr}% (${done}/${total})${failStr}  `);
  }

  progressBar();
  for (const { fullPath, storagePath } of files) {
    const ok = await uploadFile(fullPath, storagePath);
    if (ok) success++;
    else failed++;
    progressBar();
  }

  console.log(`\n\nDone: ${success} uploaded, ${failed} failed`);

  if (success > 0) {
    const samplePath = files[0].storagePath;
    console.log(`\nPublic URL format:`);
    console.log(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${samplePath}`);
  }

  if (failed > 0) process.exit(1);
}

main();
