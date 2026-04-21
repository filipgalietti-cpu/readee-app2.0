#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const env = {};
for (const line of fs.readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf-8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const FILES = [
  ["audio", "lessons/RF.K.3c/S1a.mp3", "audio/mpeg"],
  ["audio", "lessons/RF.K.3c/S3f.mp3", "audio/mpeg"],
  ["images", "lessons/RF.K.3c/S1.png", "image/png"],
];
(async () => {
  const ROOTS = { audio: path.resolve(__dirname, "..", "public", "audio"), images: path.resolve(__dirname, "..", "public", "images") };
  let ok = 0, fail = 0;
  for (const [bucket, rel, ct] of FILES) {
    const buf = fs.readFileSync(path.join(ROOTS[bucket], rel));
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${rel}`, {
      method: "POST", headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": ct, "x-upsert": "true" }, body: buf,
    });
    if (r.ok) { console.log("OK  ", bucket, rel); ok++; } else { console.error("FAIL", bucket, rel, r.status, await r.text()); fail++; }
  }
  console.log(`Done: ${ok} uploaded, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
