#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");

const client = new textToSpeech.TextToSpeechClient();

// Same voice as question audio
const VOICE = {
  languageCode: "en-US",
  name: "en-US-Studio-O",
  ssmlGender: "FEMALE",
};
const AUDIO_CONFIG = {
  audioEncoding: "MP3",
  speakingRate: 0.82,
  pitch: 0.0,
  volumeGainDb: 0.0,
};

const OUTPUT_DIR = path.join(__dirname, "..", "public", "audio", "feedback");

const PHRASES = [
  { file: "correct-1.mp3", text: "Great job!" },
  { file: "correct-2.mp3", text: "Brilliant!" },
  { file: "correct-3.mp3", text: "Super smart!" },
  { file: "correct-4.mp3", text: "You got it!" },
  { file: "correct-5.mp3", text: "Amazing!" },
  { file: "incorrect-1.mp3", text: "Almost! Let's see the answer." },
  { file: "incorrect-2.mp3", text: "Not quite. Let's learn from this one." },
  { file: "incorrect-3.mp3", text: "Good try! Here's the answer." },
  { file: "complete-perfect.mp3", text: "Wow, you got them all right! Amazing work!" },
  { file: "complete-good.mp3", text: "Great effort! You're getting better every day!" },
  { file: "complete-ok.mp3", text: "Good try! Practice makes perfect!" },
];

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const { file, text } of PHRASES) {
    const outputFile = path.join(OUTPUT_DIR, file);
    if (fs.existsSync(outputFile)) {
      console.log(`  SKIP ${file} (exists)`);
      continue;
    }

    console.log(`  GEN  ${file}: "${text}"`);
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: VOICE,
      audioConfig: AUDIO_CONFIG,
    });
    fs.writeFileSync(outputFile, response.audioContent, "binary");
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
