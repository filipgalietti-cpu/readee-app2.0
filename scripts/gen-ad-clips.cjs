#!/usr/bin/env node
/**
 * One-off: generate Facebook-ad voiceover clips with the app's Gemini TTS
 * (Autonoe). Writes WAV (for Adobe) + MP3 to the scratchpad out dir.
 * Reuses the exact endpoint/PCM handling from scripts/generate-audio.js.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { GoogleAuth } = require("google-auth-library");

// pull the service-account key path out of .env.local (same as the app scripts)
const env = fs.readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf8");
const m = env.match(/^GOOGLE_APPLICATION_CREDENTIALS=(.*)$/m);
if (m) process.env.GOOGLE_APPLICATION_CREDENTIALS = m[1].trim().replace(/^["']|["']$/g, "");

const PROJECT_ID = "readee-487403";
const LOCATION = "us-central1";
const MODEL = "gemini-2.5-pro-preview-tts";
const VOICE = "Autonoe";
const SAMPLE_RATE = 22050;
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:streamGenerateContent`;

const OUT = process.argv[2] || path.resolve(__dirname, "ad-out");
fs.mkdirSync(OUT, { recursive: true });

// Copy rules honored: no em-dashes, "child" not "kid", no emojis.
const CLIPS = [
  {
    file: "readee-ad-1-worried-parent",
    direction:
      "Read this in a warm, reassuring tone. Calm, caring, and unhurried, like you are gently speaking to a parent who is worried about their child.",
    text:
      "Every parent wonders: is my child keeping up with reading? Readee was built by a certified reading specialist to meet your child exactly where they are, with lessons that feel like play. Watch their confidence grow, one story at a time. Join Readee today.",
  },
  {
    file: "readee-ad-2-built-by-educators",
    direction:
      "Read this in a confident, credible, warm tone. Clear and grounded, trustworthy, at a steady pace.",
    text:
      "Readee is not just another app that hands your child a screen and hopes for the best. It is a complete reading program, built by educators, aligned to how children truly learn to read. Real skills, real progress, in a world your child will love. Join Readee today.",
  },
  {
    file: "readee-ad-3-joyful-outcome",
    direction:
      "Read this in a warm, uplifting, hopeful tone. Friendly and bright, with a gentle smile in the voice.",
    text:
      "What if reading practice became the part of the day your child asked for? At Readee, every lesson is an adventure, earning rewards and getting a little braver with every word. Give your child a love of reading. Join Readee today.",
  },
];

async function token() {
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

async function tts(text, direction, accessToken) {
  const fullText = [direction, text].filter(Boolean).join(" ");
  const body = {
    contents: [{ role: "user", parts: [{ text: fullText }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
    },
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  const chunks = Array.isArray(json) ? json : [json];
  const bufs = [];
  for (const ch of chunks) {
    const parts = ch?.candidates?.[0]?.content?.parts;
    if (!parts) continue;
    for (const p of parts) if (p.inlineData?.data) bufs.push(Buffer.from(p.inlineData.data, "base64"));
  }
  if (!bufs.length) throw new Error("No audio data in response");
  return Buffer.concat(bufs);
}

(async () => {
  const tok = await token();
  console.log(`Voice: ${VOICE}  |  out: ${OUT}\n`);
  for (const clip of CLIPS) {
    process.stdout.write(`  ${clip.file} ... `);
    const pcm = await tts(clip.text, clip.direction, tok);
    const raw = path.join(OUT, clip.file + ".raw");
    fs.writeFileSync(raw, pcm);
    const wav = path.join(OUT, clip.file + ".wav");
    const mp3 = path.join(OUT, clip.file + ".mp3");
    execSync(`ffmpeg -y -f s16le -ar ${SAMPLE_RATE} -ac 1 -i "${raw}" "${wav}"`, { stdio: "pipe" });
    execSync(`ffmpeg -y -f s16le -ar ${SAMPLE_RATE} -ac 1 -i "${raw}" -codec:a libmp3lame -qscale:a 2 "${mp3}"`, { stdio: "pipe" });
    fs.unlinkSync(raw);
    const secs = (fs.statSync(wav).size / (SAMPLE_RATE * 2)).toFixed(1);
    console.log(`ok (${secs}s)`);
  }
  console.log("\nDone.");
})().catch((e) => { console.error("\nFAILED:", e.message); process.exit(1); });
