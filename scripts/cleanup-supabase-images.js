#!/usr/bin/env node

/**
 * Delete old mismatched image folders from Supabase Storage.
 * These folders used sequential numbering that doesn't match lessons.json IDs.
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
const BUCKET = "images";

const OLD_FOLDERS = [
  "1-L6", "1-L7", "1-L8", "1-L9", "1-L10",
  "2-L11", "2-L12", "2-L13", "2-L14", "2-L15",
  "3-L16", "3-L17", "3-L18", "3-L19", "3-L20",
];

async function listFiles(folder) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: folder + "/", limit: 1000 }),
    }
  );
  if (!res.ok) return [];
  const items = await res.json();
  return items.filter((f) => f.name && !f.name.endsWith("/")).map((f) => f.name);
}

async function deleteFiles(folder, filenames) {
  const paths = filenames.map((f) => `${folder}/${f}`);
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: paths }),
    }
  );
  return res.ok;
}

async function main() {
  console.log("Cleaning up old mismatched image folders from Supabase\n");

  let totalDeleted = 0;

  for (const folder of OLD_FOLDERS) {
    const files = await listFiles(folder);
    if (files.length === 0) {
      console.log(`${folder}: empty/not found`);
      continue;
    }

    const ok = await deleteFiles(folder, files);
    if (ok) {
      console.log(`${folder}: deleted ${files.length} files`);
      totalDeleted += files.length;
    } else {
      console.error(`${folder}: delete failed`);
    }
  }

  console.log(`\nDone: deleted ${totalDeleted} files`);
}

main();
