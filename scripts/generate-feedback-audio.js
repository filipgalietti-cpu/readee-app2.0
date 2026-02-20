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
  // Correct answer feedback
  { file: "correct-1.mp3", text: "Great job!" },
  { file: "correct-2.mp3", text: "Brilliant!" },
  { file: "correct-3.mp3", text: "Super smart!" },
  { file: "correct-4.mp3", text: "You got it!" },
  { file: "correct-5.mp3", text: "Amazing!" },
  // Incorrect answer feedback
  { file: "incorrect-1.mp3", text: "Almost! Let's see the answer." },
  { file: "incorrect-2.mp3", text: "Not quite. Let's learn from this one." },
  { file: "incorrect-3.mp3", text: "Good try! Here's the answer." },
  // Completion: perfect (5/5)
  { file: "complete-perfect-1.mp3", text: "Wow, five out of five! You made that look easy!" },
  { file: "complete-perfect-2.mp3", text: "Perfect score! You're a reading superstar!" },
  { file: "complete-perfect-3.mp3", text: "You got every single one right! That was amazing!" },
  // Completion: great (4/5)
  { file: "complete-good-1.mp3", text: "Four out of five, so close to perfect! Great work!" },
  { file: "complete-good-2.mp3", text: "Almost perfect! You're getting really good at this!" },
  { file: "complete-good-3.mp3", text: "Wow, four out of five! You're on fire!" },
  // Completion: ok (3/5)
  { file: "complete-ok-1.mp3", text: "Three out of five, nice job! Let's keep practicing!" },
  { file: "complete-ok-2.mp3", text: "Good effort! You're learning something new every time!" },
  { file: "complete-ok-3.mp3", text: "Three right! Practice makes perfect, let's try again!" },
  // Completion: needs work (0-2/5)
  { file: "complete-try-1.mp3", text: "Good try! Every reader starts somewhere. Let's practice more!" },
  { file: "complete-try-2.mp3", text: "Don't give up! You're getting better every time you practice!" },
  { file: "complete-try-3.mp3", text: "Keep going! The more you practice, the easier it gets!" },
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
