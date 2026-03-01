#!/usr/bin/env node

/**
 * Batch generate background images using Vertex AI Imagen 4.0.
 *
 * Usage:
 *   node scripts/generate-background-images.js
 *
 * Reads prompts from scripts/background-prompts.csv (columns: Filename, Prompt)
 * Saves PNGs to public/images/backgrounds/{Filename}
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
const OUTPUT_DIR = path.resolve(__dirname, "..", "public", "images", "backgrounds");
const CSV_PATH = path.resolve(__dirname, "background-prompts.csv");
const DELAY_MS = 1500;
const RATE_LIMIT_WAIT_MS = 30000;

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
      rows.push({ filename: fields[0], prompt: fields[1] });
    }
  }
  return rows;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function progressBar(completed, total, failures) {
  const width = 30;
  const pct = total > 0 ? completed / total : 0;
  const filled = Math.round(width * pct);
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
  const pctStr = (pct * 100).toFixed(1).padStart(5);
  const failStr = failures > 0 ? ` | ${failures} failed` : "";
  process.stdout.write(`\r  ${bar} ${pctStr}% (${completed}/${total})${failStr}  `);
}

async function generateImage(prompt) {
  const instanceValue = helpers.toValue({ prompt });
  const parameters = helpers.toValue({
    sampleCount: 1,
    aspectRatio: "16:9",
    outputOptions: { mimeType: "image/png" },
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
  if (!b64) throw new Error("No base64 data in prediction");
  return Buffer.from(b64, "base64");
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const rows = parseCSV(fs.readFileSync(CSV_PATH, "utf-8"));
  const total = rows.length;

  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Aspect ratio: 16:9`);
  console.log(`Total prompts: ${total}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  let failures = 0;
  let consecutiveRateLimits = 0;
  const skipped = [];

  progressBar(0, total, 0);

  for (let i = 0; i < rows.length; i++) {
    const { filename, prompt } = rows[i];
    const outPath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(outPath)) {
      generated++;
      progressBar(generated, total, failures);
      continue;
    }

    try {
      const imageBuffer = await generateImage(prompt);
      fs.writeFileSync(outPath, imageBuffer);
      generated++;
      consecutiveRateLimits = 0;
      progressBar(generated, total, failures);
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        consecutiveRateLimits++;
        if (consecutiveRateLimits >= 5) {
          console.log(`\n\n5 consecutive rate limits — stopping.`);
          break;
        }
        console.log(`\n  Rate limited — waiting 30s (${consecutiveRateLimits}/5)`);
        await sleep(RATE_LIMIT_WAIT_MS);
        i--;
        continue;
      }

      failures++;
      skipped.push({ filename, error: msg.slice(0, 120) });
      progressBar(generated, total, failures);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n\nDone: ${generated} generated, ${failures} failed`);

  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} due to errors:`);
    for (const s of skipped) {
      console.log(`  ${s.filename}: ${s.error}`);
    }
  }
}

main();
