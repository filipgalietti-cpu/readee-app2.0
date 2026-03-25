#!/usr/bin/env node

/**
 * Generate avatar profile pictures using Vertex AI Imagen 4.0.
 *
 * Usage:
 *   node scripts/generate-avatars.js              # generate all
 *   node scripts/generate-avatars.js --skip-existing  # skip already generated
 *
 * Reads prompts from scripts/avatar-prompts.csv (columns: Filename, Prompt)
 * Saves PNGs to public/images/avatars/{Filename}
 *
 * Requires:
 *   - gcloud auth application-default login
 *   - GCP project with Vertex AI API enabled
 */

const fs = require("fs");
const path = require("path");
const aiplatform = require("@google-cloud/aiplatform");

const { PredictionServiceClient } = aiplatform.v1;
const { helpers } = aiplatform;

const PROJECT_ID = "readee-487403";
const LOCATION = "us-central1";
const MODEL = "imagen-4.0-generate-001";

const client = new PredictionServiceClient({
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
});

const ENDPOINT = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}`;
const AVATARS_DIR = path.resolve(__dirname, "..", "public", "images", "avatars");
const CSV_PATH = path.resolve(__dirname, "avatar-prompts.csv");
const DELAY_MS = 1500;
const RATE_LIMIT_WAIT_MS = 30000;

const SKIP_EXISTING = process.argv.includes("--skip-existing");

function parseCSV(content) {
  const lines = content.split("\n").filter((l) => l.trim());
  if (!lines[0]) return [];

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());

    if (fields.length >= 2) {
      rows.push({
        filename: fields[0],
        prompt: fields[1],
      });
    }
  }
  return rows;
}

async function generateImage(prompt) {
  const instance = helpers.toValue({ prompt });
  const parameters = helpers.toValue({
    sampleCount: 1,
    aspectRatio: "1:1",
    safetyFilterLevel: "block_few",
    personGeneration: "allow_all",
  });

  const [response] = await client.predict({
    endpoint: ENDPOINT,
    instances: [instance],
    parameters,
  });

  if (!response.predictions || response.predictions.length === 0) {
    throw new Error("No predictions returned");
  }

  const prediction = response.predictions[0];
  const b64 =
    prediction.structValue?.fields?.bytesBase64Encoded?.stringValue;

  if (!b64) throw new Error("No image data in response");
  return Buffer.from(b64, "base64");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(AVATARS_DIR, { recursive: true });

  // Read CSV
  const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(csvContent);
  console.log(`Found ${rows.length} avatar prompts`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const { filename, prompt } = rows[i];
    const outPath = path.join(AVATARS_DIR, filename);

    // Skip if exists and flag set
    if (SKIP_EXISTING && fs.existsSync(outPath)) {
      console.log(`[${i + 1}/${rows.length}] SKIP (exists): ${filename}`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${rows.length}] Generating: ${filename}`);

    let retries = 3;
    while (retries > 0) {
      try {
        const imageBuffer = await generateImage(prompt);
        fs.writeFileSync(outPath, imageBuffer);
        console.log(`  ✓ Saved ${filename} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
        generated++;
        break;
      } catch (err) {
        const code = err.code || err.status;
        if (code === 8 || code === 429 || (err.message && err.message.includes("429"))) {
          console.log(`  ⏳ Rate limited, waiting ${RATE_LIMIT_WAIT_MS / 1000}s...`);
          await sleep(RATE_LIMIT_WAIT_MS);
          retries--;
        } else {
          console.error(`  ✗ Failed: ${err.message}`);
          retries--;
          if (retries > 0) {
            console.log(`  Retrying... (${retries} left)`);
            await sleep(DELAY_MS * 2);
          } else {
            failed++;
          }
        }
      }
    }

    // Delay between requests
    if (i < rows.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
