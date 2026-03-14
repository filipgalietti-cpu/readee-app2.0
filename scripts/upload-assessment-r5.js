#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.local") });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ROOT = path.resolve(__dirname, "..");

const AUDIO = [
  "assessment/kindergarten/RF.K.2d/K_I_09.mp3",
  "assessment/kindergarten/RF.K.2d/K_I_09-hint.mp3",
];

async function upload(bucket, storagePath, localDir) {
  const localPath = path.join(ROOT, "public", localDir, storagePath);
  if (!fs.existsSync(localPath)) { console.error("MISSING:", localPath); return false; }
  const body = fs.readFileSync(localPath);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${storagePath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "audio/mpeg", "x-upsert": "true" },
    body,
  });
  if (res.ok) return true;
  console.error("FAIL", res.status, storagePath);
  return false;
}

async function main() {
  let ok = 0, fail = 0;
  for (const f of AUDIO) { if (await upload("audio", f, "audio")) { ok++; process.stdout.write("."); } else fail++; }
  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
main();
