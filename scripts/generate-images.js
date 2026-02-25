#!/usr/bin/env node

/**
 * Batch generate lesson images using Vertex AI Imagen API.
 *
 * Usage:
 *   node scripts/generate-images.js                              # runs both CSVs
 *   node scripts/generate-images.js --csv=image-prompts.csv      # runs one CSV
 *   node scripts/generate-images.js --csv=system1-image-prompts.csv
 *
 * Reads prompts from CSV files (columns: Folder, Filename, Prompt)
 * Saves PNGs to public/images/{Folder}/{Filename}
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
const IMAGES_DIR = path.resolve(__dirname, "..", "public", "images");
const PROGRESS_PATH = path.resolve(__dirname, "image-progress.json");
const DELAY_MS = 5000;
const MAX_REQUESTS = 95;
const RATE_LIMIT_WAIT_MS = 30000;

const ALL_CSVS = ["image-prompts.csv", "system1-image-prompts.csv"];

function parseCSV(content) {
  const lines = content.split("\n").filter((l) => l.trim());
  const header = lines[0];
  if (!header) return [];

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

    if (fields.length >= 3) {
      rows.push({
        folder: fields[0],
        filename: fields[1],
        prompt: fields[2],
      });
    }
  }
  return rows;
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_PATH)) {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
  }
  return { completed: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateImage(prompt) {
  const instanceValue = helpers.toValue({ prompt });
  const parameters = helpers.toValue({
    sampleCount: 1,
    aspectRatio: "1:1",
  });

  const [response] = await client.predict({
    endpoint: ENDPOINT,
    instances: [instanceValue],
    parameters,
  });

  const predictions = response.predictions;
  if (!predictions || predictions.length === 0) {
    throw new Error("No image in response");
  }

  const b64 = predictions[0].structValue.fields.bytesBase64Encoded.stringValue;
  if (!b64) {
    throw new Error("No base64 data in prediction");
  }
  return Buffer.from(b64, "base64");
}

async function processCSV(csvName, progress, state) {
  const csvPath = path.resolve(__dirname, csvName);
  if (!fs.existsSync(csvPath)) {
    console.log(`\nSkipping ${csvName} (file not found)`);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvContent);
  console.log(`\n--- ${csvName}: ${rows.length} prompts ---\n`);

  for (let i = 0; i < rows.length; i++) {
    if (state.requestCount >= MAX_REQUESTS) {
      console.log(`\nReached ${MAX_REQUESTS} request limit. Run again to continue.`);
      state.stopped = true;
      return;
    }

    const { folder, filename, prompt } = rows[i];
    const key = `${folder}/${filename}`;
    const outDir = path.join(IMAGES_DIR, folder);
    const outPath = path.join(outDir, filename);

    // Skip if already exists on disk
    if (fs.existsSync(outPath)) {
      continue;
    }

    // Skip if marked complete in progress
    if (progress.completed.includes(key)) {
      continue;
    }

    // Ensure directory
    fs.mkdirSync(outDir, { recursive: true });

    try {
      const imageBuffer = await generateImage(prompt);
      fs.writeFileSync(outPath, imageBuffer);

      progress.completed.push(key);
      saveProgress(progress);
      state.requestCount++;
      state.consecutiveRateLimits = 0;

      console.log(`[${i + 1}/${rows.length}] Generated ${key}`);
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        state.consecutiveRateLimits++;
        if (state.consecutiveRateLimits >= 5) {
          console.log(`\n5 consecutive rate limits — stopping. Run again later.`);
          state.stopped = true;
          return;
        }
        console.log(`[${i + 1}/${rows.length}] Rate limited on ${key} — waiting 30s (${state.consecutiveRateLimits}/5)`);
        await sleep(RATE_LIMIT_WAIT_MS);
        i--; // retry this image after the wait
        continue;
      }
      console.error(`[${i + 1}/${rows.length}] FAILED ${key}: ${msg}`);
    }

    // Delay between requests
    if (state.requestCount < MAX_REQUESTS) {
      await sleep(DELAY_MS);
    }
  }
}

async function main() {
  const csvFlag = process.argv.find((a) => a.startsWith("--csv="));
  const csvFiles = csvFlag ? [csvFlag.split("=")[1]] : ALL_CSVS;

  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Model: ${MODEL}`);
  console.log(`CSVs to process: ${csvFiles.join(", ")}`);

  const progress = loadProgress();
  const state = { requestCount: 0, consecutiveRateLimits: 0, stopped: false };

  for (const csvName of csvFiles) {
    if (state.stopped) break;
    await processCSV(csvName, progress, state);
  }

  console.log(`\nDone: ${state.requestCount} images generated this run`);
  console.log(`Total completed: ${progress.completed.length}`);
}

main();
