#!/usr/bin/env node

/**
 * Get word-level timestamps from K lesson TTS audio using Gemini 2.5 Flash.
 * Sends each audio file and asks Gemini to return when each display phrase starts.
 * Then updates sample-lessons.json with accurate timing.
 *
 * Usage: node scripts/get-word-timestamps.js
 */

const fs = require("fs");
const path = require("path");

const LESSONS_PATH = path.resolve(__dirname, "..", "app", "data", "sample-lessons.json");
const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio", "lessons");
const OUTPUT = path.resolve(__dirname, "word-timestamps.json");

const env = fs.readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf8");
const API_KEY = env.match(/GOOGLE_AI_API_KEY=(.+)/)?.[1]?.trim() || env.match(/GEMINI_API_KEY=(.+)/)?.[1]?.trim();
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const DELAY_MS = 1500;
const AUDITED = new Set(["RL.K.1", "RF.K.2a", "RI.K.1", "RL.K.2", "RL.K.5"]);

async function getTimestamps(audioPath, script, phrases) {
  const audioBase64 = fs.readFileSync(audioPath).toString("base64");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [
        { inlineData: { mimeType: "audio/mpeg", data: audioBase64 } },
        { text: `Listen to this audio. The script is: "${script}"

I need the MILLISECOND timestamp for when each of these phrases START being spoken in the audio:
${phrases.map((p, i) => `${i + 1}. "${p}"`).join("\n")}

Respond ONLY with JSON array, no markdown, no explanation:
[{"phrase":"...","startMs":1234},...]` },
      ]}],
      generationConfig: { maxOutputTokens: 500, temperature: 0 },
    }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  try {
    const clean = text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "");
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

function findAudio(lessonId, audioFile) {
  const candidates = [
    path.resolve(AUDIO_DIR, lessonId, path.basename(audioFile)),
    path.resolve(__dirname, "..", "public", audioFile),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

async function main() {
  if (!API_KEY) { console.error("No GOOGLE_AI_API_KEY in .env.local"); process.exit(1); }

  const lessons = JSON.parse(fs.readFileSync(LESSONS_PATH, "utf8"));
  const kLessons = lessons.filter((l) => l.grade === "Kindergarten" && !AUDITED.has(l.standardId));

  // Collect steps with displayParts
  const items = [];
  for (const lesson of kLessons) {
    for (const slide of lesson.slides || []) {
      for (const step of slide.steps || []) {
        if (!step.audioFile || !step.ttsScript || !step.displayParts || step.displayParts.length < 2) continue;
        const audioPath = findAudio(lesson.standardId, step.audioFile);
        if (!audioPath) continue;
        items.push({
          lessonId: lesson.standardId,
          slide: slide.slide,
          stepSub: step.sub,
          audioPath,
          script: step.ttsScript,
          phrases: step.displayParts.map((p) => p.text),
          stepRef: step, // direct reference to update
        });
      }
    }
  }

  console.log(`Found ${items.length} steps with displayParts to timestamp`);
  const results = [];
  let updated = 0, failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    process.stdout.write(`\r  ${Math.round(((i + 1) / items.length) * 100)}% (${i + 1}/${items.length}) | OK:${updated} FAIL:${failed}`);

    const timestamps = await getTimestamps(item.audioPath, item.script, item.phrases);
    if (timestamps && Array.isArray(timestamps)) {
      // Update the displayParts with real timing
      timestamps.forEach((ts) => {
        const part = item.stepRef.displayParts.find((p) => p.text === ts.phrase);
        if (part && ts.startMs >= 0) {
          part.delay = ts.startMs;
        }
      });
      results.push({ lessonId: item.lessonId, slide: item.slide, step: item.stepSub, timestamps });
      updated++;
    } else {
      failed++;
    }

    if (i < items.length - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`\n\nDone: ${updated} updated, ${failed} failed`);

  // Save timestamps log
  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`Timestamps: ${OUTPUT}`);

  // Save updated lessons
  fs.writeFileSync(LESSONS_PATH, JSON.stringify(lessons, null, 2));
  console.log(`Updated: ${LESSONS_PATH}`);
}

main().catch(console.error);
