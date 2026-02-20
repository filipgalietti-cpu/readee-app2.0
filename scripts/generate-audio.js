#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY environment variable");
  process.exit(1);
}

const VOICE_ID = "kXsOSDWolD7e9l1Z0sbH";
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";
const VOICE_SETTINGS = {
  stability: 0.85,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: false,
};

const INPUT_PATH = path.join(__dirname, "..", "app", "data", "kindergarten-standards-questions.json");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "audio", "kindergarten");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Strip emoji prefixes like "🐶 Read: " from text */
function cleanText(text) {
  // Remove emoji characters (common unicode ranges)
  let cleaned = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, "").trim();
  // Remove leading "Read: " if present
  cleaned = cleaned.replace(/^Read:\s*/i, "");
  return cleaned;
}

/** Split a prompt into passage and question parts */
function splitPrompt(prompt) {
  const parts = prompt.split("\n\n");
  if (parts.length >= 2) {
    return {
      passage: cleanText(parts.slice(0, -1).join(" ").trim()),
      question: cleanText(parts[parts.length - 1].trim()),
    };
  }
  return { passage: "", question: cleanText(prompt.trim()) };
}

/** Generate audio via ElevenLabs REST API */
async function generateAudio(text, outputFile) {
  if (fs.existsSync(outputFile)) {
    return false; // already exists, skip
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs API error ${res.status}: ${errText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputFile, buffer);
  return true;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Count total audio files to generate
  let totalFiles = 0;
  for (const std of data.standards) {
    for (const q of std.questions) {
      const { passage } = splitPrompt(q.prompt);
      if (passage) totalFiles++; // passage
      totalFiles++; // prompt
      totalFiles += q.choices.length; // choices
      totalFiles++; // hint
    }
  }

  let generated = 0;
  let skipped = 0;
  let fileNum = 0;

  for (const std of data.standards) {
    for (let qIdx = 0; qIdx < std.questions.length; qIdx++) {
      const q = std.questions[qIdx];
      const qNum = qIdx + 1;
      const prefix = `${std.standard_id}-q${qNum}`;
      const { passage, question } = splitPrompt(q.prompt);

      console.log(`Generating ${std.standard_id} question ${qNum}... (${fileNum + 1}/${totalFiles})`);

      // Passage audio (if exists)
      if (passage) {
        const file = path.join(OUTPUT_DIR, `${prefix}-passage.mp3`);
        const didGenerate = await generateAudio(passage, file);
        if (didGenerate) { generated++; await delay(500); } else { skipped++; }
        fileNum++;
      }

      // Question prompt audio
      {
        const file = path.join(OUTPUT_DIR, `${prefix}-prompt.mp3`);
        const didGenerate = await generateAudio(question, file);
        if (didGenerate) { generated++; await delay(500); } else { skipped++; }
        fileNum++;
      }

      // Choice audio
      for (let cIdx = 0; cIdx < q.choices.length; cIdx++) {
        const file = path.join(OUTPUT_DIR, `${prefix}-choice${cIdx + 1}.mp3`);
        const didGenerate = await generateAudio(cleanText(q.choices[cIdx]), file);
        if (didGenerate) { generated++; await delay(500); } else { skipped++; }
        fileNum++;
      }

      // Hint audio
      {
        const file = path.join(OUTPUT_DIR, `${prefix}-hint.mp3`);
        const didGenerate = await generateAudio(cleanText(q.hint), file);
        if (didGenerate) { generated++; await delay(500); } else { skipped++; }
        fileNum++;
      }
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped (existing): ${skipped}, Total: ${fileNum}`);

  // --- Phase 2: Update JSON with audio URLs ---
  console.log("\nUpdating kindergarten-standards-questions.json with audio URLs...");

  for (const std of data.standards) {
    for (let qIdx = 0; qIdx < std.questions.length; qIdx++) {
      const q = std.questions[qIdx];
      const qNum = qIdx + 1;
      const prefix = `${std.standard_id}-q${qNum}`;
      const { passage } = splitPrompt(q.prompt);

      if (passage) {
        q.passage_audio_url = `/audio/kindergarten/${prefix}-passage.mp3`;
      }
      q.prompt_audio_url = `/audio/kindergarten/${prefix}-prompt.mp3`;
      q.choices_audio_urls = q.choices.map((_, cIdx) =>
        `/audio/kindergarten/${prefix}-choice${cIdx + 1}.mp3`
      );
      q.hint_audio_url = `/audio/kindergarten/${prefix}-hint.mp3`;
    }
  }

  fs.writeFileSync(INPUT_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log("JSON updated successfully.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
