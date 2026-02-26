#!/usr/bin/env node

/**
 * Rename audio folders in Supabase Storage to match lessons.json IDs.
 * Copies files from old path to new path, then deletes old files.
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
const BUCKET = "audio";

const RENAMES = [
  ["1-L7", "1-L1"],
  ["1-L8", "1-L2"],
  ["1-L9", "1-L3"],
  ["1-L10", "1-L5"],
  ["2-L11", "2-L1"],
  ["2-L12", "2-L2"],
  ["2-L13", "2-L3"],
  ["2-L14", "2-L4"],
  ["2-L15", "2-L5"],
  ["3-L16", "3-L1"],
  ["3-L17", "3-L2"],
  ["3-L18", "3-L3"],
  ["3-L19", "3-L4"],
  ["3-L20", "3-L5"],
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
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const items = await res.json();
  return items.filter((f) => f.name && !f.name.endsWith("/")).map((f) => f.name);
}

async function copyFile(oldPath, newPath) {
  // Download from old path
  const dlRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${oldPath}`,
    { headers: { Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  if (!dlRes.ok) throw new Error(`Download failed: ${oldPath} (${dlRes.status})`);
  const buffer = await dlRes.arrayBuffer();

  // Upload to new path
  const ulRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${newPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "audio/mpeg",
        "x-upsert": "true",
      },
      body: Buffer.from(buffer),
    }
  );
  if (!ulRes.ok) throw new Error(`Upload failed: ${newPath} (${ulRes.status})`);
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
  if (!res.ok) {
    const text = await res.text();
    console.error(`  Delete warning: ${res.status} ${text.slice(0, 200)}`);
  }
}

async function main() {
  console.log("Renaming audio folders in Supabase Storage\n");

  for (const [oldFolder, newFolder] of RENAMES) {
    process.stdout.write(`${oldFolder} → ${newFolder}: `);

    let files;
    try {
      files = await listFiles(oldFolder);
    } catch {
      console.log("skipped (not found)");
      continue;
    }

    if (files.length === 0) {
      console.log("skipped (empty)");
      continue;
    }

    // Copy all files to new folder
    for (const file of files) {
      await copyFile(`${oldFolder}/${file}`, `${newFolder}/${file}`);
    }

    // Delete old files
    await deleteFiles(oldFolder, files);

    console.log(`${files.length} files moved`);
  }

  console.log("\nDone!");
}

main();
