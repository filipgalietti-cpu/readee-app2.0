#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");

// Google Cloud TTS client — uses GOOGLE_APPLICATION_CREDENTIALS env var
const client = new textToSpeech.TextToSpeechClient();

// Calm, warm female voice — like a kindergarten teacher
const VOICE = {
  languageCode: "en-US",
  name: "en-US-Studio-O",
  ssmlGender: "FEMALE",
};
const AUDIO_CONFIG = {
  audioEncoding: "MP3",
  speakingRate: 0.9,
  pitch: 0.0,
  volumeGainDb: 0.0,
};

const INPUT_PATH = path.join(__dirname, "..", "app", "data", "kindergarten-standards-questions.json");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "audio", "kindergarten");

// Only generate for these standards (pass --all to generate everything)
const TEST_STANDARDS = ["RL.K.1"];
const generateAll = process.argv.includes("--all");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Strip emoji and "Read:" prefix */
function cleanText(text) {
  let cleaned = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, "").trim();
  cleaned = cleaned.replace(/^Read:\s*/i, "");
  return cleaned;
}

/** Split prompt into passage and question */
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

/** Build combined teacher-style text for one question */
function buildCombinedText(q) {
  const { passage, question } = splitPrompt(q.prompt);
  const parts = [];

  if (passage) {
    parts.push(passage);
  }
  parts.push(question);

  // Add choices with "Or" before the last one
  const choices = q.choices.map((c) => cleanText(c));
  for (let i = 0; i < choices.length; i++) {
    if (i === choices.length - 1 && choices.length > 1) {
      parts.push(`Or, ${choices[i]}.`);
    } else {
      parts.push(`${choices[i]}.`);
    }
  }

  return parts.join(" ");
}

/** Generate audio via Google Cloud TTS */
async function generateAudio(text, outputFile) {
  if (fs.existsSync(outputFile)) {
    return false;
  }

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: VOICE,
    audioConfig: AUDIO_CONFIG,
  });

  fs.writeFileSync(outputFile, response.audioContent, "binary");
  return true;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const standards = generateAll
    ? data.standards
    : data.standards.filter((s) => TEST_STANDARDS.includes(s.standard_id));

  if (!generateAll) {
    console.log(`Test mode: generating for ${TEST_STANDARDS.join(", ")} only. Use --all for everything.\n`);
  }

  let totalFiles = 0;
  for (const std of standards) {
    totalFiles += std.questions.length;
  }

  let generated = 0;
  let skipped = 0;
  let fileNum = 0;

  for (const std of standards) {
    for (let qIdx = 0; qIdx < std.questions.length; qIdx++) {
      const q = std.questions[qIdx];
      const qNum = qIdx + 1;
      const fileName = `${std.standard_id}-q${qNum}.mp3`;
      const file = path.join(OUTPUT_DIR, fileName);

      fileNum++;
      console.log(`[${fileNum}/${totalFiles}] ${std.standard_id} q${qNum}...`);

      const combinedText = buildCombinedText(q);
      const didGenerate = await generateAudio(combinedText, file);

      if (didGenerate) {
        generated++;
        await delay(100);
      } else {
        skipped++;
      }
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped (existing): ${skipped}, Total: ${fileNum}`);

  // --- Phase 2: Update JSON with audio_url ---
  console.log("\nUpdating JSON with audio_url fields...");

  for (const std of standards) {
    for (let qIdx = 0; qIdx < std.questions.length; qIdx++) {
      const q = std.questions[qIdx];
      const qNum = qIdx + 1;
      q.audio_url = `/audio/kindergarten/${std.standard_id}-q${qNum}.mp3`;

      // Clean up old separate fields if they exist
      delete q.passage_audio_url;
      delete q.prompt_audio_url;
      delete q.choices_audio_urls;
      delete q.hint_audio_url;
    }
  }

  fs.writeFileSync(INPUT_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log("JSON updated successfully.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
