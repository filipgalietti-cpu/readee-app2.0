#!/usr/bin/env node
/**
 * Re-record RF.K.2e Q1-Q5 MCQ audio using REAL phoneme audio from
 * the library (spliced in via ffmpeg) rather than letting Gemini
 * guess how to pronounce "/k/" or "the K sound".
 *
 * Each question is a manifest of segments — TTS pieces + phoneme
 * file refs. Generates each TTS piece, concatenates with brief
 * silence between, uploads to Supabase.
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

const PHONEME_DIR = path.resolve(__dirname, "..", "public/audio/phonemes");
const TMP = path.resolve(__dirname, "..", ".tmp-splice");
fs.mkdirSync(TMP, { recursive: true });

const VOICE_DIR = "Warm calm kindergarten teacher voice. Read the whole sentence with natural pacing. Do not stretch or exaggerate any sounds.";

// Manifest: each item is either { tts: string } or { phoneme: id }
const QUESTIONS = {
  "RF.K.2e-Q1": [
    { tts: "Start with 'cat.' Change the" },
    { phoneme: "c_hard" },
    { tts: "to the" },
    { phoneme: "b" },
    { tts: "sound. What new word do you get? Sat. Bat. Mat. Hat. What do you think?" },
  ],
  "RF.K.2e-Q2": [
    { tts: "Start with 'hop.' Change the" },
    { phoneme: "h" },
    { tts: "to the" },
    { phoneme: "t" },
    { tts: "sound. What word do you get? Mop. Top. Hop. Pop. What do you think?" },
  ],
  "RF.K.2e-Q3": [
    { tts: "Start with 'man.' Change the" },
    { phoneme: "short_a" },
    { tts: "to the" },
    { phoneme: "short_e" },
    { tts: "sound. What word do you get? Mat. Mit. Met. Min. What do you think?" },
  ],
  "RF.K.2e-Q4": [
    { tts: "Start with 'sit.' Change the" },
    { phoneme: "t" },
    { tts: "to the" },
    { phoneme: "p" },
    { tts: "sound. What word do you get? Sip. Set. Sat. Sap. What do you think?" },
  ],
  "RF.K.2e-Q5": [
    { tts: "Add the" },
    { phoneme: "s" },
    { tts: "sound to the beginning of 'top.' What word do you get? Spot. Stop. Step. Tops. What do you think?" },
  ],
};

let _token = null;
async function getToken() {
  if (_token) return _token;
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const client = await auth.getClient();
  const t = await client.getAccessToken();
  _token = t.token;
  return _token;
}

async function generateTTS(text, outPath) {
  const fullText = `${VOICE_DIR} ${text}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: fullText }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
    },
  };
  const token = await getToken();
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`TTS API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const chunks = Array.isArray(json) ? json : [json];
  const audioBuffers = [];
  for (const chunk of chunks) {
    const parts = chunk?.candidates?.[0]?.content?.parts;
    if (!parts) continue;
    for (const part of parts) {
      if (part.inlineData?.data) audioBuffers.push(Buffer.from(part.inlineData.data, "base64"));
    }
  }
  if (!audioBuffers.length) throw new Error("No audio in response");
  const pcm = Buffer.concat(audioBuffers);
  const tmpRaw = outPath.replace(/\.mp3$/, ".raw");
  fs.writeFileSync(tmpRaw, pcm);
  execSync(`ffmpeg -y -f s16le -ar ${SAMPLE_RATE} -ac 1 -i "${tmpRaw}" -codec:a libmp3lame -qscale:a 2 "${outPath}"`, { stdio: "pipe" });
  fs.unlinkSync(tmpRaw);
}

function makeSilence(durationSec, outPath) {
  execSync(`ffmpeg -y -f lavfi -i anullsrc=r=${SAMPLE_RATE}:cl=mono -t ${durationSec} -codec:a libmp3lame -qscale:a 2 "${outPath}"`, { stdio: "pipe" });
}

async function buildQuestion(qid, segments) {
  console.log(`\n=== ${qid} ===`);
  const pieces = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.tts) {
      const file = path.join(TMP, `${qid}-${i}-tts.mp3`);
      console.log(`  [tts] ${seg.tts.slice(0, 60)}...`);
      await generateTTS(seg.tts, file);
      pieces.push(file);
    } else if (seg.phoneme) {
      const file = path.join(PHONEME_DIR, `${seg.phoneme}.mp3`);
      if (!fs.existsSync(file)) throw new Error(`missing phoneme ${seg.phoneme}`);
      console.log(`  [phoneme] ${seg.phoneme}`);
      pieces.push(file);
    }
    // brief silence after each piece (except the last)
    if (i < segments.length - 1) {
      const silenceFile = path.join(TMP, `${qid}-${i}-silence.mp3`);
      makeSilence(0.35, silenceFile);
      pieces.push(silenceFile);
    }
  }

  // Concat list
  const listFile = path.join(TMP, `${qid}-list.txt`);
  fs.writeFileSync(listFile, pieces.map((p) => `file '${p}'`).join("\n"));
  const outPath = path.resolve(__dirname, "..", `public/audio/kindergarten/RF.K.2e/${qid}.mp3`);
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -codec:a libmp3lame -qscale:a 2 "${outPath}"`, { stdio: "pipe" });
  console.log(`  -> ${outPath}`);
}

(async () => {
  for (const [qid, segments] of Object.entries(QUESTIONS)) {
    await buildQuestion(qid, segments);
  }
  console.log("\nDone. Run upload step next.");
})().catch((e) => { console.error(e); process.exit(1); });
