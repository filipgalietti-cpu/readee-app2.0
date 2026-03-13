#!/usr/bin/env node

/**
 * Upload assessment audit R2 assets to Supabase.
 * 13 images, 20 TTS audio, 3 word audio — all with x-upsert: true.
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");

const IMAGES = [
  "assessment/kindergarten/RF.K.1d/K_M_01.png",
  "assessment/kindergarten/RF.K.2a/K_M_02.png",
  "assessment/kindergarten/RF.K.2d/K_I_09.png",
  "assessment/1st-grade/RF.1.3b/G1_M_01.png",
  "assessment/1st-grade/RF.1.3a/G1_E_03.png",
  "assessment/1st-grade/L.1.5a/G1_E_04.png",
  "assessment/1st-grade/L.1.5a/G1_I_08.png",
  "assessment/2nd-grade/RL.2.2/G2_H_05.png",
  "assessment/2nd-grade/RI.2.2/G2_M_02.png",
  "assessment/3rd-grade/RI.3.1/G3_M_01.png",
  "assessment/3rd-grade/L.3.5a/G3_E_04.png",
  "assessment/3rd-grade/L.3.1i/G3_I_11.png",
  "assessment/4th-grade/L.4.5b/G4_E_04.png",
];

const AUDIO = [
  "assessment/kindergarten/RF.K.1d/K_M_01.mp3",
  "assessment/kindergarten/RF.K.1d/K_M_01-hint.mp3",
  "assessment/kindergarten/RF.K.2a/K_M_02.mp3",
  "assessment/kindergarten/RF.K.2a/K_M_02-hint.mp3",
  "assessment/kindergarten/L.K.5a/K_E_04.mp3",
  "assessment/kindergarten/L.K.5a/K_E_04-hint.mp3",
  "assessment/kindergarten/L.K.5a/K_I_07.mp3",
  "assessment/kindergarten/L.K.5a/K_I_07-hint.mp3",
  "assessment/1st-grade/L.1.5a/G1_E_04.mp3",
  "assessment/1st-grade/L.1.5a/G1_E_04-hint.mp3",
  "assessment/2nd-grade/L.2.4e/G2_I_07.mp3",
  "assessment/2nd-grade/L.2.4e/G2_I_07-hint.mp3",
  "assessment/2nd-grade/RF.2.3/G2_I_08.mp3",
  "assessment/2nd-grade/RF.2.3/G2_I_08-hint.mp3",
  "assessment/3rd-grade/L.3.4b/G3_I_07.mp3",
  "assessment/3rd-grade/L.3.4b/G3_I_07-hint.mp3",
  "assessment/4th-grade/RI.4.9/G4_H_05.mp3",
  "assessment/4th-grade/RI.4.9/G4_H_05-hint.mp3",
  "assessment/4th-grade/RI.4.3/G4_I_08.mp3",
  "assessment/4th-grade/RI.4.3/G4_I_08-hint.mp3",
  // Word audio
  "words/excited.mp3",
  "words/consequently.mp3",
  "words/although.mp3",
];

async function upload(bucket, storagePath, localDir) {
  const localPath = path.join(ROOT, "public", localDir, storagePath);
  if (!fs.existsSync(localPath)) {
    console.error(`  MISSING: ${localPath}`);
    return false;
  }

  const body = fs.readFileSync(localPath);
  const contentType = storagePath.endsWith(".png") ? "image/png" : "audio/mpeg";

  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${storagePath}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body,
  });

  if (res.ok || res.status === 200) return true;
  console.error(`  FAIL ${res.status}: ${storagePath}`);
  return false;
}

async function main() {
  let ok = 0;
  let fail = 0;

  console.log(`Uploading ${IMAGES.length} images...`);
  for (const img of IMAGES) {
    const success = await upload("images", img, "images");
    if (success) { ok++; process.stdout.write("."); } else fail++;
  }
  console.log();

  console.log(`Uploading ${AUDIO.length} audio files...`);
  for (const aud of AUDIO) {
    const success = await upload("audio", aud, "audio");
    if (success) { ok++; process.stdout.write("."); } else fail++;
  }
  console.log();

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main();
