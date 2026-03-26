#!/usr/bin/env node

/**
 * Upload only *-incorrect.mp3 files from public/audio/ to Supabase Storage bucket "audio".
 *
 * Usage: node scripts/upload-incorrect-audio.js
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

const BUCKET = "audio";
const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio");

function collectIncorrectFiles(dir, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    const storagePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectIncorrectFiles(fullPath, storagePath));
    } else if (entry.name.endsWith("-incorrect.mp3")) {
      files.push({ fullPath, storagePath });
    }
  }
  return files;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function uploadFile(filePath, storagePath) {
  const fileBuffer = fs.readFileSync(filePath);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
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
      if (res.ok) return true;
      const body = await res.text();
      if (attempt < 3) { await sleep(2000); continue; }
      console.error(`\n  FAIL ${storagePath} — ${res.status}: ${body}`);
      return false;
    } catch (err) {
      if (attempt < 3) { await sleep(2000); continue; }
      console.error(`\n  FAIL ${storagePath} — ${err.message}`);
      return false;
    }
  }
}

async function main() {
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  const files = collectIncorrectFiles(AUDIO_DIR);
  console.log(`Found ${files.length} incorrect audio files to upload\n`);

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
  if (failed > 0) process.exit(1);
}

main();
