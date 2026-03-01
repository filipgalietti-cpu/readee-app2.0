#!/usr/bin/env node

/**
 * Batch generate TTS audio using Vertex AI Gemini 2.5 Pro TTS.
 *
 * Usage:
 *   node scripts/generate-audio.js
 *   node scripts/generate-audio.js --csv=my-scripts.csv
 *
 * Reads from readee-tts-scripts.csv (columns: lesson_id, filename, script_text, voice_direction)
 * Saves MP3s to public/audio/{lesson_id}/{filename}.mp3
 *
 * Requires:
 *   - gcloud auth application-default login
 *   - ffmpeg installed (for LINEAR16 → MP3 conversion)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { GoogleAuth } = require("google-auth-library");

const PROJECT_ID = "readee-487403";
const LOCATION = "us-central1";
const MODEL = "gemini-2.5-pro-preview-tts";
const VOICE = "Autonoe";
const SAMPLE_RATE = 22050;

const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:streamGenerateContent`;

const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio");
const DEFAULT_CSV = "readee-tts-scripts.csv";
const MAX_RETRIES = 3;

/* ── CSV parser (handles quoted fields) ───────────── */

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

    if (fields.length >= 3) {
      rows.push({
        lessonId: fields[0],
        filename: fields[1],
        scriptText: fields[2],
        voiceDirection: fields[3] || "",
      });
    }
  }
  return rows;
}

/* ── Auth (auto-refresh every 30 min) ─────────────── */

let _authClient = null;
let _token = null;
let _tokenTime = 0;
const TOKEN_REFRESH_MS = 15 * 60 * 1000; // 15 min (safety margin)

async function getAccessToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _token && now - _tokenTime < TOKEN_REFRESH_MS) return _token;

  if (!_authClient) {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    _authClient = await auth.getClient();
  }
  const { token } = await _authClient.getAccessToken();
  _token = token;
  _tokenTime = now;
  if (forceRefresh) console.log("\n  [token refreshed]");
  return token;
}

/* ── TTS request ──────────────────────────────────── */

async function generateAudio(scriptText, voiceDirection, accessToken) {
  const textParts = [];
  if (voiceDirection) textParts.push(voiceDirection);
  textParts.push(scriptText);
  const fullText = textParts.join(" ");

  const body = {
    contents: [{ role: "user", parts: [{ text: fullText }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE },
        },
      },
    },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = await res.json();

  // Streaming endpoint returns an array of chunks
  const chunks = Array.isArray(json) ? json : [json];
  const audioBuffers = [];

  for (const chunk of chunks) {
    const parts = chunk?.candidates?.[0]?.content?.parts;
    if (!parts) continue;
    for (const part of parts) {
      if (part.inlineData?.data) {
        audioBuffers.push(Buffer.from(part.inlineData.data, "base64"));
      }
    }
  }

  if (audioBuffers.length === 0) {
    throw new Error("No audio data in response");
  }

  return Buffer.concat(audioBuffers);
}

/* ── LINEAR16 → MP3 via ffmpeg ────────────────────── */

function convertToMp3(pcmBuffer, outPath) {
  const tmpPcm = outPath.replace(/\.mp3$/, ".raw");
  fs.writeFileSync(tmpPcm, pcmBuffer);

  try {
    execSync(
      `ffmpeg -y -f s16le -ar ${SAMPLE_RATE} -ac 1 -i "${tmpPcm}" -codec:a libmp3lame -qscale:a 2 "${outPath}"`,
      { stdio: "pipe" }
    );
  } finally {
    if (fs.existsSync(tmpPcm)) fs.unlinkSync(tmpPcm);
  }
}

/* ── Helpers ───────────────────────────────────────── */

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

/* ── Main ──────────────────────────────────────────── */

async function main() {
  const csvFlag = process.argv.find((a) => a.startsWith("--csv="));
  const limitFlag = process.argv.find((a) => a.startsWith("--limit="));
  const csvName = csvFlag ? csvFlag.split("=")[1] : DEFAULT_CSV;
  const limit = limitFlag ? parseInt(limitFlag.split("=")[1], 10) : Infinity;
  const csvPath = path.resolve(__dirname, csvName);

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const rows = parseCSV(fs.readFileSync(csvPath, "utf-8"));
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Model:   ${MODEL}`);
  console.log(`Voice:   ${VOICE}`);
  console.log(`CSV:     ${csvName} (${rows.length} rows)`);
  if (limit < Infinity) console.log(`Limit:   ${limit}`);
  console.log();

  let generated = 0;
  let skipped = 0;
  let failures = 0;
  const total = rows.length;
  progressBar(0, total, 0);

  for (let i = 0; i < rows.length; i++) {
    if (generated >= limit) {
      console.log(`\n\nReached --limit=${limit}, stopping.`);
      break;
    }

    const { lessonId, filename, scriptText, voiceDirection } = rows[i];
    const outDir = path.join(AUDIO_DIR, lessonId);
    const outFile = filename.endsWith(".mp3") ? filename : `${filename}.mp3`;
    const outPath = path.join(outDir, outFile);

    // Skip existing files
    if (fs.existsSync(outPath)) {
      skipped++;
      progressBar(generated + skipped, total, failures);
      continue;
    }

    fs.mkdirSync(outDir, { recursive: true });

    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Force token refresh on retry (auth errors)
        const token = await getAccessToken(attempt > 1);
        const pcmBuffer = await generateAudio(
          scriptText,
          voiceDirection,
          token
        );
        convertToMp3(pcmBuffer, outPath);
        generated++;
        success = true;
        break;
      } catch (err) {
        const isAuth = /40[13]/.test(err.message);
        if (attempt < MAX_RETRIES && isAuth) {
          // Auth error — retry with fresh token
          continue;
        }
        if (attempt < MAX_RETRIES) {
          // Other error — wait 2s then retry
          await sleep(2000);
          continue;
        }
        // Final attempt failed
        failures++;
        console.error(`\n  FAIL [${outFile}]: ${err.message.slice(0, 120)}`);
      }
    }
    progressBar(generated + skipped, total, failures);
  }

  console.log(`\n\nDone: ${generated} generated, ${skipped} skipped, ${failures} failed`);
}

main();
