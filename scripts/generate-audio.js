#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");

// ── Config ──────────────────────────────────────────────
const TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";
const VOICE = {
  languageCode: "en-us",
  name: "Autonoe",
  model_name: "gemini-2.5-flash-tts",
};
const AUDIO_CONFIG = { audioEncoding: "MP3" };
const PROMPT_STYLE =
  "Read this like a warm, encouraging kindergarten teacher reading to a small child. Speak slowly and clearly with natural pauses.";

const INPUT_PATH = path.join(__dirname, "..", "app", "data", "kindergarten-standards-questions.json");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "audio", "kindergarten");

// Only generate for these standards (pass --all to generate everything)
const TEST_STANDARDS = ["RL.K.1"];
const generateAll = process.argv.includes("--all");
// Pass --force to regenerate files that already exist
const forceRegenerate = process.argv.includes("--force");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Auth ────────────────────────────────────────────────

let cachedToken = null;

async function getAccessToken() {
  if (cachedToken && cachedToken.expiry > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  cachedToken = { token: res.token, expiry: Date.now() + 50 * 60_000 };
  return res.token;
}

// ── Text helpers ────────────────────────────────────────

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

/** Lowercase the first letter unless it's "I" or proper-noun-like */
function lowercaseFirst(text) {
  if (!text) return text;
  if (text === "I" || text.startsWith("I ") || text.startsWith("I'")) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Convert numbers 0-20 to written words for natural TTS */
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
  "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

function numbersToWords(text) {
  return text.replace(/\b(\d+)\b/g, (match, num) => {
    const n = parseInt(num, 10);
    if (n >= 0 && n <= 20) return NUMBER_WORDS[n];
    return match;
  });
}

// ── Build audio_script fallback from prompt + choices ───

function buildFallbackScript(q) {
  const { passage, question } = splitPrompt(q.prompt);
  const choices = q.choices.map((c) => numbersToWords(cleanText(c)));

  let script = "";
  if (passage) {
    script += `"${passage}" ...`;
  }
  script += `${question}..? `;

  const choiceList = choices.map((c) => lowercaseFirst(c));
  if (choiceList.length > 1) {
    const last = choiceList.pop();
    script += choiceList.map((c) => `..${ c}`).join(".. ") + `.. or..., ${last}. ..What do you think?`;
  }

  return script;
}

// ── Gemini 2.5 Flash TTS API call ──────────────────────

async function synthesize(text, outputFile) {
  if (!forceRegenerate && fs.existsSync(outputFile)) {
    return false;
  }

  const token = await getAccessToken();
  const body = {
    input: {
      prompt: PROMPT_STYLE,
      text,
    },
    voice: VOICE,
    audioConfig: AUDIO_CONFIG,
  };

  const res = await fetch(TTS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TTS API ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const audioBuffer = Buffer.from(json.audioContent, "base64");
  fs.writeFileSync(outputFile, audioBuffer);
  return true;
}

// ── Main ────────────────────────────────────────────────

async function main() {
  const data = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const standards = generateAll
    ? data.standards
    : data.standards.filter((s) => TEST_STANDARDS.includes(s.standard_id));

  if (!generateAll) {
    console.log(`Test mode: generating for ${TEST_STANDARDS.join(", ")} only. Use --all for everything.\n`);
  }
  if (forceRegenerate) {
    console.log("Force mode: regenerating all files even if they exist.\n");
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

      // Use audio_script if present, otherwise build a fallback
      const script = q.audio_script || buildFallbackScript(q);

      // --- Question audio ---
      const fileName = `${std.standard_id}-q${qNum}.mp3`;
      const file = path.join(OUTPUT_DIR, fileName);

      fileNum++;
      console.log(`[${fileNum}/${totalFiles}] ${std.standard_id} q${qNum}...`);

      const didGenerate = await synthesize(script, file);

      if (didGenerate) {
        console.log(`       GENERATED (${script.length} chars)`);
        generated++;
        await delay(200);
      } else {
        console.log(`       SKIP (exists)`);
        skipped++;
      }

      // --- Hint audio ---
      if (q.hint) {
        const hintFileName = `${std.standard_id}-q${qNum}-hint.mp3`;
        const hintFile = path.join(OUTPUT_DIR, hintFileName);

        if (!forceRegenerate && fs.existsSync(hintFile)) {
          console.log(`       hint: SKIP (exists)`);
        } else {
          const hintText = cleanText(q.hint);
          console.log(`       hint: GEN "${hintText}"`);
          await synthesize(hintText, hintFile);
          generated++;
          await delay(200);
        }
      }
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped (existing): ${skipped}, Total questions: ${fileNum}`);

  // --- Phase 2: Update JSON with audio_url ---
  console.log("\nUpdating JSON with audio_url fields...");

  for (const std of standards) {
    for (let qIdx = 0; qIdx < std.questions.length; qIdx++) {
      const q = std.questions[qIdx];
      const qNum = qIdx + 1;
      q.audio_url = `/audio/kindergarten/${std.standard_id}-q${qNum}.mp3`;

      // Set hint audio URL if hint exists
      if (q.hint) {
        q.hint_audio_url = `/audio/kindergarten/${std.standard_id}-q${qNum}-hint.mp3`;
      }

      // Clean up old separate fields if they exist
      delete q.passage_audio_url;
      delete q.prompt_audio_url;
      delete q.choices_audio_urls;
    }
  }

  fs.writeFileSync(INPUT_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log("JSON updated successfully.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
