#!/usr/bin/env node

/**
 * Upload all generated PNGs from public/images/ to Supabase Storage bucket "images".
 *
 * Usage: node scripts/upload-images-to-supabase.js
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

const BUCKET = "images";
const IMAGES_DIR = path.resolve(__dirname, "..", "public", "images");

async function ensureBucket() {
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
    console.log(`Created public bucket "${BUCKET}"`);
  } else {
    const body = await res.json();
    if (body.error === "Duplicate" || body.statusCode === "409" || res.status === 409) {
      console.log(`Bucket "${BUCKET}" already exists`);
    } else {
      console.error("Failed to create bucket:", body);
      process.exit(1);
    }
  }
}

function collectPngFiles(dir, prefix = "") {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    const storagePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectPngFiles(fullPath, storagePath));
    } else if (entry.name.endsWith(".png")) {
      files.push({ fullPath, storagePath });
    }
  }
  return files;
}

async function listExisting(prefix) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix: prefix || "",
        limit: 10000,
      }),
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.map((f) => (prefix ? `${prefix}/${f.name}` : f.name));
}

async function getUploadedSet() {
  const uploaded = new Set();

  // List top-level folders
  const topLevel = await listExisting("");
  for (const item of topLevel) {
    // Each folder — list its contents
    const children = await listExisting(item);
    for (const child of children) {
      uploaded.add(child);
    }
  }

  return uploaded;
}

async function uploadFile(filePath, storagePath) {
  const fileBuffer = fs.readFileSync(filePath);

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "image/png",
        "x-upsert": "false",
      },
      body: fileBuffer,
    }
  );

  if (res.ok || res.status === 409) {
    return true;
  } else {
    const body = await res.text();
    console.error(`\n  FAIL ${storagePath} — ${res.status}: ${body}`);
    return false;
  }
}

async function main() {
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Images dir: ${IMAGES_DIR}\n`);

  await ensureBucket();

  const files = collectPngFiles(IMAGES_DIR);
  console.log(`\nFound ${files.length} .png files locally`);

  if (files.length === 0) {
    console.log("Nothing to upload. Run generate-images.js first.");
    return;
  }

  // Check which files already exist in storage
  console.log("Checking existing uploads...");
  const uploaded = await getUploadedSet();
  console.log(`${uploaded.size} files already in bucket\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;
  const total = files.length;

  function progressBar() {
    const done = success + skipped + failed;
    const width = 30;
    const pct = total > 0 ? done / total : 0;
    const filled = Math.round(width * pct);
    const bar = "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
    const pctStr = (pct * 100).toFixed(1).padStart(5);
    const failStr = failed > 0 ? ` | ${failed} failed` : "";
    process.stdout.write(`\r  ${bar} ${pctStr}% (${done}/${total})${failStr}  `);
  }

  progressBar();
  for (let i = 0; i < files.length; i++) {
    const { fullPath, storagePath } = files[i];

    if (uploaded.has(storagePath)) {
      skipped++;
      progressBar();
      continue;
    }

    const ok = await uploadFile(fullPath, storagePath);
    if (ok) success++;
    else failed++;
    progressBar();
  }

  console.log(`\n\nDone: ${success} uploaded, ${skipped} skipped, ${failed} failed`);

  if (success > 0) {
    const samplePath = files[0].storagePath;
    console.log(`\nPublic URL format:`);
    console.log(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${samplePath}`);
  }

  if (failed > 0) process.exit(1);
}

main();
