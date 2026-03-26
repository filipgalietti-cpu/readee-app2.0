#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function upload(file) {
  const buf = fs.readFileSync(path.resolve(__dirname, "..", "public", "audio", "feedback", file));
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/audio/feedback/${file}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "audio/mpeg", "x-upsert": "true" },
    body: buf,
  });
  console.log(file, res.ok ? "OK" : "FAIL " + res.status);
}

(async () => {
  for (let i = 1; i <= 6; i++) await upload(`encourage-${i}.mp3`);
  console.log("Done");
})();
