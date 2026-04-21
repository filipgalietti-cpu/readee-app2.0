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
const FILES = ["lessons/RF.K.3c/S2b.mp3", "lessons/RF.K.3c/S2c.mp3"];
(async () => {
  const ROOT = path.resolve(__dirname, "..", "public", "audio");
  let ok = 0, fail = 0;
  for (const rel of FILES) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/audio/${rel}`, {
      method: "POST", headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "audio/mpeg", "x-upsert": "true" }, body: buf,
    });
    if (r.ok) { console.log("OK  ", rel); ok++; } else { console.error("FAIL", rel, r.status, await r.text()); fail++; }
  }
  console.log(`Done: ${ok} uploaded, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
