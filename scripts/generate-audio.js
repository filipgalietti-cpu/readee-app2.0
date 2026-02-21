#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// ── Load OPENAI_API_KEY from .env.local ──────────────────
const ENV_PATH = path.join(__dirname, "..", ".env.local");
const envFile = fs.readFileSync(ENV_PATH, "utf-8");
const keyMatch = envFile.match(/^OPENAI_API_KEY=(.+)$/m);
if (!keyMatch) {
  console.error("OPENAI_API_KEY not found in .env.local");
  process.exit(1);
}
const OPENAI_API_KEY = keyMatch[1].trim();

// ── Config ──────────────────────────────────────────────
const TTS_ENDPOINT = "https://api.openai.com/v1/audio/speech";
const VOICE = "nova";
const MODEL = "tts-1";
const SPEED = 0.9;

const DELAY_BETWEEN_REQUESTS = 500; // 0.5s — OpenAI TTS has generous limits

const INPUT_PATH = path.join(__dirname, "..", "app", "data", "kindergarten-standards-questions.json");
const KINDERGARTEN_DIR = path.join(__dirname, "..", "public", "audio", "kindergarten");
const FEEDBACK_DIR = path.join(__dirname, "..", "public", "audio", "feedback");
const PROGRESS_PATH = path.join(__dirname, "progress.json");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Text helpers ────────────────────────────────────────

function cleanText(text) {
  let cleaned = text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, "")
    .trim();
  cleaned = cleaned.replace(/^Read:\s*/i, "");
  return cleaned;
}

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

function lowercaseFirst(text) {
  if (!text) return text;
  if (text === "I" || text.startsWith("I ") || text.startsWith("I'")) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

const NUMBER_WORDS = [
  "zero","one","two","three","four","five","six","seven","eight","nine",
  "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
  "seventeen","eighteen","nineteen","twenty",
];

function numbersToWords(text) {
  return text.replace(/\b(\d+)\b/g, (match, num) => {
    const n = parseInt(num, 10);
    return n >= 0 && n <= 20 ? NUMBER_WORDS[n] : match;
  });
}

/** Build a teacher-style TTS script from prompt + choices */
function buildScript(q) {
  const { passage, question } = splitPrompt(q.prompt);
  const choices = q.choices.map((c) => numbersToWords(cleanText(c)));

  let script = "";
  if (passage) script += `"${passage}" ...`;
  script += `${question}..? `;

  const list = choices.map((c) => lowercaseFirst(c));
  if (list.length > 1) {
    const last = list.pop();
    script += list.map((c) => `..${c}`).join(".. ") + `.. or..., ${last}. ..What do you think?`;
  }
  return script;
}

// ── Feedback phrases ────────────────────────────────────
const FEEDBACK_PHRASES = [
  { file: "correct-1.mp3", text: "Great job!" },
  { file: "correct-2.mp3", text: "Brilliant!" },
  { file: "correct-3.mp3", text: "Super smart!" },
  { file: "correct-4.mp3", text: "You got it!" },
  { file: "correct-5.mp3", text: "Amazing!" },
  { file: "incorrect-1.mp3", text: "Almost! Let's see the answer." },
  { file: "incorrect-2.mp3", text: "Not quite. Let's learn from this one." },
  { file: "incorrect-3.mp3", text: "Good try! Here's the answer." },
  { file: "complete-perfect-1.mp3", text: "Wow, five out of five! You made that look easy!" },
  { file: "complete-perfect-2.mp3", text: "Perfect score! You're a reading superstar!" },
  { file: "complete-perfect-3.mp3", text: "You got every single one right! That was amazing!" },
  { file: "complete-good-1.mp3", text: "Four out of five, so close to perfect! Great work!" },
  { file: "complete-good-2.mp3", text: "Almost perfect! You're getting really good at this!" },
  { file: "complete-good-3.mp3", text: "Wow, four out of five! You're on fire!" },
  { file: "complete-ok-1.mp3", text: "Three out of five, nice job! Let's keep practicing!" },
  { file: "complete-ok-2.mp3", text: "Good effort! You're learning something new every time!" },
  { file: "complete-ok-3.mp3", text: "Three right! Practice makes perfect, let's try again!" },
  { file: "complete-try-1.mp3", text: "Good try! Every reader starts somewhere. Let's practice more!" },
  { file: "complete-try-2.mp3", text: "Don't give up! You're getting better every time you practice!" },
  { file: "complete-try-3.mp3", text: "Keep going! The more you practice, the easier it gets!" },
];

// ── OpenAI TTS ──────────────────────────────────────────

async function synthesizeToMp3(text, outputMp3) {
  const body = {
    model: MODEL,
    input: text,
    voice: VOICE,
    speed: SPEED,
  };

  let res;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(TTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      console.log(`    ⏳ Rate limited (attempt ${attempt + 1}/3), waiting 30s...`);
      await delay(30000);
      continue;
    }

    if (res.status >= 500) {
      console.log(`    ⚠️  Server error ${res.status} (attempt ${attempt + 1}/3), waiting 10s...`);
      await delay(10000);
      continue;
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI TTS API ${res.status}: ${errText}`);
    }

    break;
  }

  if (!res || !res.ok) {
    throw new Error("Failed after 3 retries");
  }

  // Response is raw MP3 binary — save directly
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputMp3, buffer);
}

// ── Progress tracking ───────────────────────────────────

function loadProgress() {
  if (fs.existsSync(PROGRESS_PATH)) {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
  }
  return { generated: [], skipped: [], totalRequests: 0, runs: 0, lastRun: null };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2) + "\n", "utf-8");
}

// ── Build full job list ─────────────────────────────────

function buildJobList(data) {
  const jobs = [];

  // All 36 standards × 5 questions = question + hint audio
  for (const std of data.standards) {
    for (let qIdx = 0; qIdx < std.questions.length; qIdx++) {
      const q = std.questions[qIdx];
      const qNum = qIdx + 1;
      const script = buildScript(q);

      jobs.push({
        type: "question",
        file: `${std.standard_id}-q${qNum}.mp3`,
        dir: KINDERGARTEN_DIR,
        text: script,
        label: `${std.standard_id}-q${qNum}`,
        stdId: std.standard_id,
        qIdx,
      });

      if (q.hint) {
        jobs.push({
          type: "hint",
          file: `${std.standard_id}-q${qNum}-hint.mp3`,
          dir: KINDERGARTEN_DIR,
          text: q.hint,
          label: `${std.standard_id}-q${qNum}-hint`,
        });
      }
    }
  }

  // Feedback audio
  for (const phrase of FEEDBACK_PHRASES) {
    jobs.push({
      type: "feedback",
      file: phrase.file,
      dir: FEEDBACK_DIR,
      text: phrase.text,
      label: phrase.file.replace(".mp3", ""),
    });
  }

  // Intro
  jobs.push({
    type: "intro",
    file: "intro.mp3",
    dir: KINDERGARTEN_DIR,
    text: "Ready to practice? Let's answer five questions. Tap the screen to start!",
    label: "intro",
  });

  return jobs;
}

// ── Main ────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(KINDERGARTEN_DIR, { recursive: true });
  fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

  const data = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  const jobs = buildJobList(data);
  const progress = loadProgress();

  const totalJobs = jobs.length;
  let generated = 0;
  let skipped = 0;
  let requestCount = 0;

  console.log(`\n=== OpenAI TTS — ${VOICE} (${MODEL}, speed ${SPEED}) ===`);
  console.log(`  Total files needed: ${totalJobs}`);
  console.log(`  Delay between requests: ${DELAY_BETWEEN_REQUESTS / 1000}s`);
  console.log(`  Previous runs: ${progress.runs} (${progress.generated.length} files generated so far)\n`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const outputPath = path.join(job.dir, job.file);
    const num = i + 1;

    if (fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    console.log(`[${num}/${totalJobs}] Generating ${job.file}...`);
    await synthesizeToMp3(job.text, outputPath);
    generated++;
    requestCount++;
    progress.generated.push(job.file);
    console.log(`[${num}/${totalJobs}] ✓ ${job.file}`);

    // Update JSON audio_url for question jobs
    if (job.type === "question") {
      const std = data.standards.find((s) => s.standard_id === job.stdId);
      if (std) {
        const q = std.questions[job.qIdx];
        q.audio_url = `/audio/kindergarten/${job.file}`;
        delete q.passage_audio_url;
        delete q.prompt_audio_url;
        delete q.choices_audio_urls;
      }
    }
    if (job.type === "hint") {
      const m = job.file.match(/^(.+)-q(\d+)-hint\.mp3$/);
      if (m) {
        const std = data.standards.find((s) => s.standard_id === m[1]);
        if (std) std.questions[parseInt(m[2]) - 1].hint_audio_url = `/audio/kindergarten/${job.file}`;
      }
    }

    await delay(DELAY_BETWEEN_REQUESTS);
  }

  // Save updated JSON
  fs.writeFileSync(INPUT_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");

  // Save progress
  progress.totalRequests += requestCount;
  progress.runs++;
  progress.lastRun = new Date().toISOString();
  progress.skipped = skipped;
  saveProgress(progress);

  // Summary
  const existing = jobs.filter((j) => fs.existsSync(path.join(j.dir, j.file))).length;
  const remaining = totalJobs - existing;

  console.log(`\n${"=".repeat(50)}`);
  console.log(`  Generated this run:  ${generated}`);
  console.log(`  Skipped (existing):  ${skipped}`);
  console.log(`  API requests used:   ${requestCount}`);
  console.log(`  Total files done:    ${existing}/${totalJobs}`);
  console.log(`  Remaining:           ${remaining}`);
  console.log(`  Total runs so far:   ${progress.runs}`);
  console.log(`${"=".repeat(50)}`);

  if (remaining === 0) {
    console.log(`\n🎉 All ${totalJobs} audio files generated!\n`);
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
