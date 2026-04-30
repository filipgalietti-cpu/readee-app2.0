#!/usr/bin/env node
/**
 * fix-duplicate-choices — apply the 7 hand-approved fixes from
 * docs/HINT_FIX_REVIEW.md.
 *
 *   1. Patch master_manifest.json (text changes)
 *   2. Regenerate audio for each:
 *      - 6 of 7: prompt-only Gemini TTS (Autonoe)
 *      - RF.1.2b-Q3: prompt TTS + concatenated phoneme samples from
 *        scripts/phoneme-database.json (audio/phonemes/{id}.mp3 in Supabase)
 *   3. Upload audio to Supabase under audio/{grade-folder}/{standard}/{id}.mp3
 *   4. Rebuild per-grade data files (consumers in app/data)
 *
 * Usage: GEMINI_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/fix-duplicate-choices.js
 *
 * Env: reads .env.local automatically if present.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { GoogleGenAI } = require("@google/genai");

// Load .env.local if present
const envFile = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const apiKey = process.env.GEMINI_API_KEY;
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!apiKey) bail("GEMINI_API_KEY required");
if (!supaUrl || !supaKey) bail("SUPABASE_URL + SUPABASE_SERVICE_KEY required");

function bail(msg) {
  console.error("ERROR:", msg);
  process.exit(1);
}

// ───── The 7 fixes (mirrors docs/HINT_FIX_REVIEW.md) ────────────────

const FIXES = [
  {
    id: "K.L.2-Q1",
    grade: "Kindergarten",
    folder: "kindergarten",
    standard: "K.L.2",
    choices: ["i like pizza", "I LIKE PIZZA", "I Like Pizza", "I like pizza."],
    correct: "I like pizza.",
    hint: "A sentence starts with one capital letter and ends with a period.",
    audioMode: "prompt_only",
    promptForTts: "Which sentence has correct capitalization? Read each one carefully.",
  },
  {
    id: "K.L.2-Q4",
    grade: "Kindergarten",
    folder: "kindergarten",
    standard: "K.L.2",
    choices: ["SAm", "SaM", "sam", "Sam"],
    correct: "Sam",
    hint: "A name starts with one capital letter.",
    audioMode: "prompt_only",
    promptForTts: "Which name is written correctly? Look at the capital letters.",
  },
  {
    id: "K.L.2-Q5",
    grade: "Kindergarten",
    folder: "kindergarten",
    standard: "K.L.2",
    choices: ["The Dog is big.", "the dog is big.", "The dog is big", "The dog is big."],
    correct: "The dog is big.",
    hint: "Look at the first letter and the end of the sentence.",
    audioMode: "prompt_only",
    promptForTts: "Which sentence is correct? Look closely at the start and the end.",
  },
  {
    id: "RF.1.1a-Q3",
    grade: "1st Grade",
    folder: "1st-grade",
    standard: "RF.1.1a",
    choices: ["The dog ran fast", "the dog ran fast.", "The Dog Ran Fast", "The dog ran fast."],
    correct: "The dog ran fast.",
    hint: "A correct sentence has a capital first letter and ends with a period.",
    audioMode: "prompt_only",
    promptForTts: "Which is a correct sentence? Look for the capital letter and the period.",
  },
  {
    id: "RF.K.1d-Q1",
    grade: "Kindergarten",
    folder: "kindergarten",
    standard: "RF.K.1d",
    choices: ["a", "A", "b", "B"],
    correct: "A",
    hint: "Capital A is bigger and has a flat top.",
    audioMode: "prompt_only",
    promptForTts: "Which is the uppercase, capital, version of the letter a?",
  },
  {
    id: "RF.K.1d-Q2",
    grade: "Kindergarten",
    folder: "kindergarten",
    standard: "RF.K.1d",
    choices: ["G", "g", "j", "q"],
    correct: "g",
    hint: "Lowercase g has a tail that hangs down below the line.",
    audioMode: "prompt_only",
    promptForTts: "Which is the lowercase, small, version of the letter G?",
  },
  {
    id: "RF.1.2b-Q3",
    grade: "1st Grade",
    folder: "1st-grade",
    standard: "RF.1.2b",
    choices: ["Stomp", "Step", "Spot", "Stop"],
    correct: "Stop",
    hint: "Say each sound slowly, then slide them together.",
    audioMode: "phoneme_blend",
    promptForTts: "Blend these sounds.",
    phonemeIds: ["s", "t", "short_o", "p"],
    promptOutroForTts: "What word do you hear?",
  },
];

const VOICE = "Autonoe";
const MODEL = "gemini-2.5-flash-preview-tts";
const SAMPLE_RATE = 24000;

const client = new GoogleGenAI({ apiKey });

// ───── TTS one short prompt → mp3 buffer ────────────────────────────

async function ttsToMp3Buffer(text) {
  // Gemini TTS rejects "too plain" scripts as text-generation. The
  // existing audio pipeline prefixes a voice direction; mirror that.
  const direction =
    "Read this like a cheerful, clear elementary school teacher reading to a small child: ";
  const response = await client.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: direction + text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } },
      },
    },
  });
  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  let pcm = null;
  for (const p of parts) {
    if (p.inlineData?.data) {
      pcm = Buffer.from(p.inlineData.data, "base64");
      break;
    }
  }
  if (!pcm) throw new Error("No audio data in TTS response");

  // PCM → MP3 via ffmpeg (linear16 mono 24kHz)
  const tmpPcm = path.join(__dirname, `.tmp-${Date.now()}.raw`);
  const tmpMp3 = path.join(__dirname, `.tmp-${Date.now()}.mp3`);
  fs.writeFileSync(tmpPcm, pcm);
  execSync(
    `ffmpeg -y -f s16le -ar ${SAMPLE_RATE} -ac 1 -i "${tmpPcm}" -codec:a libmp3lame -qscale:a 2 "${tmpMp3}"`,
    { stdio: "pipe" },
  );
  const mp3 = fs.readFileSync(tmpMp3);
  fs.unlinkSync(tmpPcm);
  fs.unlinkSync(tmpMp3);
  return mp3;
}

// ───── Phoneme blend: prompt + each phoneme + outro, concatenated ──

async function downloadPhonemeMp3(phonemeId) {
  const url = `${supaUrl}/storage/v1/object/public/audio/phonemes/${phonemeId}.mp3`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Phoneme ${phonemeId} not found at ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

async function buildPhonemeBlendAudio(fix) {
  const promptMp3 = await ttsToMp3Buffer(fix.promptForTts);
  const phonemeMp3s = [];
  for (const pid of fix.phonemeIds) {
    phonemeMp3s.push(await downloadPhonemeMp3(pid));
  }
  const outroMp3 = await ttsToMp3Buffer(fix.promptOutroForTts);

  // Concat with ffmpeg + 350ms silence between sounds
  const tmpDir = path.join(__dirname, `.tmp-blend-${Date.now()}`);
  fs.mkdirSync(tmpDir);
  const parts = [];
  fs.writeFileSync(path.join(tmpDir, "0-prompt.mp3"), promptMp3);
  parts.push("0-prompt.mp3");
  for (let i = 0; i < phonemeMp3s.length; i++) {
    fs.writeFileSync(path.join(tmpDir, `${i + 1}-ph.mp3`), phonemeMp3s[i]);
    parts.push(`${i + 1}-ph.mp3`);
  }
  fs.writeFileSync(path.join(tmpDir, "z-outro.mp3"), outroMp3);
  parts.push("z-outro.mp3");

  // Generate 350ms silence
  const silencePath = path.join(tmpDir, "silence.mp3");
  execSync(
    `ffmpeg -y -f lavfi -i anullsrc=channel_layout=mono:sample_rate=${SAMPLE_RATE} -t 0.35 -codec:a libmp3lame -qscale:a 2 "${silencePath}"`,
    { stdio: "pipe" },
  );

  // Build concat list with silences inserted between every part
  const concatList = parts
    .flatMap((p, i) => (i === 0 ? [p] : ["silence.mp3", p]))
    .map((f) => `file '${f}'`)
    .join("\n");
  fs.writeFileSync(path.join(tmpDir, "list.txt"), concatList);

  const outPath = path.join(tmpDir, "out.mp3");
  execSync(`cd "${tmpDir}" && ffmpeg -y -f concat -safe 0 -i list.txt -c copy out.mp3`, {
    stdio: "pipe",
  });
  const finalMp3 = fs.readFileSync(outPath);

  // Cleanup
  for (const f of fs.readdirSync(tmpDir)) fs.unlinkSync(path.join(tmpDir, f));
  fs.rmdirSync(tmpDir);
  return finalMp3;
}

// ───── Supabase upload ──────────────────────────────────────────────

async function uploadToSupabase(folder, standard, id, mp3Buffer) {
  const dest = `${folder}/${standard}/${id}.mp3`;
  const url = `${supaUrl}/storage/v1/object/audio/${dest}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supaKey}`,
      "Content-Type": "audio/mpeg",
      "x-upsert": "true",
    },
    body: mp3Buffer,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Upload failed (${r.status}): ${t.slice(0, 300)}`);
  }
  return `${supaUrl}/storage/v1/object/public/audio/${dest}`;
}

// ───── Patch the manifest ───────────────────────────────────────────

function patchManifest() {
  const manifestPath = path.join(__dirname, "master_manifest.json");
  const backup = manifestPath + "." + Date.now() + ".bak";
  fs.copyFileSync(manifestPath, backup);
  console.log(`Backup: ${path.basename(backup)}`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const fix of FIXES) {
    const item = manifest.find((m) => m.id === fix.id);
    if (!item) {
      console.warn(`  WARN: ${fix.id} not in manifest`);
      continue;
    }
    item.choices = fix.choices;
    item.correct = fix.correct;
    item.hint = fix.hint;
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Patched ${FIXES.length} entries in master_manifest.json`);
}

// ───── Main ────────────────────────────────────────────────────────

(async () => {
  console.log("Step 1/3: patch manifest");
  patchManifest();

  console.log("\nStep 2/3: regenerate audio + upload");
  for (let i = 0; i < FIXES.length; i++) {
    const fix = FIXES[i];
    process.stdout.write(`  ${i + 1}/${FIXES.length} ${fix.id} (${fix.audioMode})... `);
    let mp3;
    if (fix.audioMode === "prompt_only") {
      mp3 = await ttsToMp3Buffer(fix.promptForTts);
    } else if (fix.audioMode === "phoneme_blend") {
      mp3 = await buildPhonemeBlendAudio(fix);
    } else {
      console.log("(skipped, unknown mode)");
      continue;
    }
    const url = await uploadToSupabase(fix.folder, fix.standard, fix.id, mp3);
    process.stdout.write(`✓ (${(mp3.length / 1024).toFixed(0)}KB)\n`);
  }

  console.log("\nStep 3/3: rebuild per-grade data files");
  try {
    execSync("node scripts/build-master-manifest.js", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });
  } catch (e) {
    console.warn("  (rebuild script failed — run manually if needed)");
  }

  console.log("\nDone. Re-run scripts/qc-content.js to verify the fail count drops.");
})();
