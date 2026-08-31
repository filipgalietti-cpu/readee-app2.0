#!/usr/bin/env node
/** 5-second TikTok ad VO options (Autonoe), upbeat/punchy. WAV + MP3. */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { GoogleAuth } = require("google-auth-library");

const env = fs.readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf8");
const m = env.match(/^GOOGLE_APPLICATION_CREDENTIALS=(.*)$/m);
if (m) process.env.GOOGLE_APPLICATION_CREDENTIALS = m[1].trim().replace(/^["']|["']$/g, "");

const PROJECT_ID = "readee-487403", LOCATION = "us-central1";
const MODEL = "gemini-2.5-pro-preview-tts", VOICE = "Autonoe", SAMPLE_RATE = 22050;
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:streamGenerateContent`;
const OUT = process.argv[2] || path.resolve(__dirname, "ad-out");
fs.mkdirSync(OUT, { recursive: true });

// TikTok energy: upbeat, quick. Copy rules: no em-dashes, "child" not "kid", no emojis.
const DIR = "Read this in an upbeat, energetic, punchy tone. Fast and lively, bright and friendly, like a fun TikTok ad.";
const CLIPS = [
  { file: "tiktok-1-falling-behind", text: "Worried your child is falling behind in reading? Readee can help. Join today." },
  { file: "tiktok-2-make-it-fun", text: "Reading, but make it fun. Built by teachers. Join Readee today." },
  { file: "tiktok-3-love-reading", text: "Give your child a love of reading. Join Readee today." },
  { file: "tiktok-4-take-off", text: "A few minutes a day, and watch your child's reading take off. Join Readee." },
];

async function token() {
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  return (await (await auth.getClient()).getAccessToken()).token;
}
async function tts(text, accessToken) {
  const body = {
    contents: [{ role: "user", parts: [{ text: `${DIR} ${text}` }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
  };
  const res = await fetch(ENDPOINT, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  const chunks = Array.isArray(json) ? json : [json];
  const bufs = [];
  for (const ch of chunks) for (const p of (ch?.candidates?.[0]?.content?.parts || [])) if (p.inlineData?.data) bufs.push(Buffer.from(p.inlineData.data, "base64"));
  if (!bufs.length) throw new Error("No audio data");
  return Buffer.concat(bufs);
}
(async () => {
  const tok = await token();
  console.log(`Voice: ${VOICE}  |  out: ${OUT}\n`);
  for (const clip of CLIPS) {
    process.stdout.write(`  ${clip.file} ... `);
    const pcm = await tts(clip.text, tok);
    const raw = path.join(OUT, clip.file + ".raw"), wav = path.join(OUT, clip.file + ".wav"), mp3 = path.join(OUT, clip.file + ".mp3");
    fs.writeFileSync(raw, pcm);
    execSync(`ffmpeg -y -f s16le -ar ${SAMPLE_RATE} -ac 1 -i "${raw}" "${wav}"`, { stdio: "pipe" });
    execSync(`ffmpeg -y -f s16le -ar ${SAMPLE_RATE} -ac 1 -i "${raw}" -codec:a libmp3lame -qscale:a 2 "${mp3}"`, { stdio: "pipe" });
    fs.unlinkSync(raw);
    console.log(`${(fs.statSync(wav).size / (SAMPLE_RATE * 2)).toFixed(1)}s`);
  }
  console.log("\nDone.");
})().catch((e) => { console.error("\nFAILED:", e.message); process.exit(1); });
