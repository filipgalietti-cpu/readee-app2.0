#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ── Load GEMINI_API_KEY from .env.local ─────────────────
const ENV_PATH = path.join(__dirname, "..", ".env.local");
const envFile = fs.readFileSync(ENV_PATH, "utf-8");
const keyMatch = envFile.match(/^GEMINI_API_KEY=(.+)$/m);
if (!keyMatch) {
  console.error("GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}
const GEMINI_API_KEY = keyMatch[1].trim();

// ── Config ──────────────────────────────────────────────
const TTS_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
const STYLE_PREFIX =
  "Read this like a warm, encouraging kindergarten teacher reading to a small child. Speak slowly and clearly with gentle pauses:";

const INPUT_PATH = path.join(__dirname, "..", "app", "data", "kindergarten-standards-questions.json");
const KINDERGARTEN_DIR = path.join(__dirname, "..", "public", "audio", "kindergarten");
const FEEDBACK_DIR = path.join(__dirname, "..", "public", "audio", "feedback");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Feedback phrases ────────────────────────────────────
const FEEDBACK_PHRASES = [
  // Correct
  { file: "correct-1.mp3", text: "Great job!" },
  { file: "correct-2.mp3", text: "Brilliant!" },
  { file: "correct-3.mp3", text: "Super smart!" },
  { file: "correct-4.mp3", text: "You got it!" },
  { file: "correct-5.mp3", text: "Amazing!" },
  // Incorrect
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

const INTRO_PHRASE = {
  file: "intro.mp3",
  text: "Ready to practice? Let's answer five questions. Tap the screen to start!",
};

// ── Gemini 2.5 Flash TTS API ────────────────────────────

async function synthesizeToMp3(text, outputMp3) {
  const body = {
    contents: [{
      parts: [{
        text: `${STYLE_PREFIX} ${text}`,
      }],
    }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Autonoe",
          },
        },
      },
    },
  };

  let json;
  for (let attempt = 0; attempt < 10; attempt++) {
    const res = await fetch(TTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      const errBody = await res.text();
      // Try to parse "retryDelay": "27s" or "retry in 27.6s"
      const retryMatch = errBody.match(/"retryDelay":\s*"(\d+)s?"/i)
        || errBody.match(/retry in ([\d.]+)s/i);
      const waitSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) + 5 : 35;
      console.log(`    ⏳ Rate limited (attempt ${attempt + 1}/10), waiting ${waitSec}s...`);
      await delay(waitSec * 1000);
      continue;
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini TTS API ${res.status}: ${errText}`);
    }

    json = await res.json();
    break;
  }

  if (!json) throw new Error("Failed after 10 retries");

  const audioData = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) {
    throw new Error(`No audio data in response: ${JSON.stringify(json).slice(0, 500)}`);
  }

  // Write raw PCM to temp file
  const tmpPcm = outputMp3.replace(/\.mp3$/, ".tmp.pcm");
  fs.writeFileSync(tmpPcm, Buffer.from(audioData, "base64"));

  // Convert PCM (signed 16-bit LE, 24kHz, mono) to MP3 via ffmpeg
  try {
    execSync(
      `ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tmpPcm}" "${outputMp3}"`,
      { stdio: "pipe" }
    );
  } finally {
    // Clean up temp PCM file
    if (fs.existsSync(tmpPcm)) fs.unlinkSync(tmpPcm);
  }
}

// ── Helpers ─────────────────────────────────────────────

function deleteAllFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mp3"));
  for (const f of files) {
    fs.unlinkSync(path.join(dir, f));
  }
  return files.length;
}

// ── Main ────────────────────────────────────────────────

async function main() {
  // Check ffmpeg
  try {
    execSync("which ffmpeg", { stdio: "pipe" });
  } catch {
    console.error("ffmpeg is required but not installed. Install with: brew install ffmpeg");
    process.exit(1);
  }

  const freshStart = process.argv.includes("--clean");

  if (freshStart) {
    // ── Phase 1: Delete old audio files ───────────────────
    console.log("=== Deleting old audio files ===\n");
    const deletedK = deleteAllFiles(KINDERGARTEN_DIR);
    console.log(`  Deleted ${deletedK} files from kindergarten/`);
    const deletedF = deleteAllFiles(FEEDBACK_DIR);
    console.log(`  Deleted ${deletedF} files from feedback/`);
  } else {
    console.log("=== Resumable mode (pass --clean to delete old files first) ===\n");
  }

  fs.mkdirSync(KINDERGARTEN_DIR, { recursive: true });
  fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

  let totalGenerated = 0;

  // ── Phase 2: Generate question audio ──────────────────
  console.log("\n=== Generating question audio (RL.K.1) ===\n");

  const data = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));

  // Only generate for questions that have audio_script
  for (const std of data.standards) {
    const questionsWithScript = std.questions.filter((q) => q.audio_script);
    if (questionsWithScript.length === 0) continue;

    for (let qIdx = 0; qIdx < std.questions.length; qIdx++) {
      const q = std.questions[qIdx];
      if (!q.audio_script) continue;

      const qNum = qIdx + 1;
      const fileName = `${std.standard_id}-q${qNum}.mp3`;
      const file = path.join(KINDERGARTEN_DIR, fileName);

      if (fs.existsSync(file)) {
        console.log(`  [question] ${fileName} — SKIP (exists)`);
      } else {
        console.log(`  [question] ${fileName}`);
        console.log(`    Script: "${q.audio_script.slice(0, 80)}..."`);
        await synthesizeToMp3(q.audio_script, file);
        totalGenerated++;
        console.log(`    ✓ Generated`);
        await delay(21000);
      }

      // Hint audio
      if (q.hint) {
        const hintFileName = `${std.standard_id}-q${qNum}-hint.mp3`;
        const hintFile = path.join(KINDERGARTEN_DIR, hintFileName);

        if (fs.existsSync(hintFile)) {
          console.log(`  [hint]     ${hintFileName} — SKIP (exists)`);
        } else {
          console.log(`  [hint]     ${hintFileName}`);
          await synthesizeToMp3(q.hint, hintFile);
          totalGenerated++;
          console.log(`    ✓ Generated`);
          await delay(21000);
        }
      }

      // Update JSON audio_url fields
      q.audio_url = `/audio/kindergarten/${std.standard_id}-q${qNum}.mp3`;
      if (q.hint) {
        q.hint_audio_url = `/audio/kindergarten/${std.standard_id}-q${qNum}-hint.mp3`;
      }
      delete q.passage_audio_url;
      delete q.prompt_audio_url;
      delete q.choices_audio_urls;
    }
  }

  // Save updated JSON
  fs.writeFileSync(INPUT_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log("\n  JSON updated with audio_url fields.");

  // ── Phase 3: Generate feedback audio ──────────────────
  console.log("\n=== Generating feedback audio ===\n");

  for (const phrase of FEEDBACK_PHRASES) {
    const file = path.join(FEEDBACK_DIR, phrase.file);
    if (fs.existsSync(file)) {
      console.log(`  [feedback] ${phrase.file} — SKIP (exists)`);
      continue;
    }
    console.log(`  [feedback] ${phrase.file}: "${phrase.text}"`);
    await synthesizeToMp3(phrase.text, file);
    totalGenerated++;
    console.log(`    ✓ Generated`);
    await delay(21000);
  }

  // ── Phase 4: Generate intro audio ─────────────────────
  console.log("\n=== Generating intro audio ===\n");

  const introFile = path.join(KINDERGARTEN_DIR, INTRO_PHRASE.file);
  if (fs.existsSync(introFile)) {
    console.log(`  [intro] ${INTRO_PHRASE.file} — SKIP (exists)`);
  } else {
    console.log(`  [intro] ${INTRO_PHRASE.file}: "${INTRO_PHRASE.text}"`);
    await synthesizeToMp3(INTRO_PHRASE.text, introFile);
    totalGenerated++;
    console.log(`    ✓ Generated`);
  }

  console.log(`\n=== Done! Total files generated: ${totalGenerated} ===`);
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
