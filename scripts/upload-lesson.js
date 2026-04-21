#!/usr/bin/env node
/**
 * Reusable per-lesson uploader.
 * Usage: node scripts/upload-lesson.js <STANDARD_ID>
 *   e.g. node scripts/upload-lesson.js RF.1.1a
 *
 * Walks public/audio/lessons/<id>/ and public/images/lessons/<id>/ and
 * uploads everything with x-upsert. Used instead of hand-rolling a new
 * upload-<id>.js per lesson.
 */
const fs = require("fs");
const path = require("path");

const id = process.argv[2];
if (!id) { console.error("Usage: node scripts/upload-lesson.js <STANDARD_ID>"); process.exit(1); }

const env = {};
for (const line of fs.readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf-8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio", "lessons", id);
const IMAGES_DIR = path.resolve(__dirname, "..", "public", "images", "lessons", id);

async function uploadFile(bucket, relPath, fullPath, contentType) {
  const buf = fs.readFileSync(fullPath);
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${relPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": contentType, "x-upsert": "true" },
    body: buf,
  });
  if (!r.ok) { console.error(`FAIL ${bucket}/${relPath}: ${r.status} ${await r.text()}`); return false; }
  console.log(`OK   ${bucket}/${relPath}`);
  return true;
}

(async () => {
  let ok = 0, fail = 0;
  if (fs.existsSync(AUDIO_DIR)) {
    for (const f of fs.readdirSync(AUDIO_DIR).filter((n) => n.endsWith(".mp3"))) {
      if (await uploadFile("audio", `lessons/${id}/${f}`, path.join(AUDIO_DIR, f), "audio/mpeg")) ok++; else fail++;
    }
  }
  if (fs.existsSync(IMAGES_DIR)) {
    for (const f of fs.readdirSync(IMAGES_DIR).filter((n) => n.endsWith(".png"))) {
      if (await uploadFile("images", `lessons/${id}/${f}`, path.join(IMAGES_DIR, f), "image/png")) ok++; else fail++;
    }
  }
  console.log(`\nDone: ${ok} uploaded, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
