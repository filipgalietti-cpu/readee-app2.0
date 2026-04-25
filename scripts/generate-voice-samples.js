#!/usr/bin/env node

/**
 * Generate one short sample clip per voice in lib/ai/voices.ts and
 * upload to Supabase Storage at audio/voice-samples/{id}.wav.
 *
 * Run once when the voice catalog changes. Wired to the VoiceSelector
 * component which plays these clips when teachers/parents click the
 * preview button.
 *
 * Usage:
 *   GEMINI_API_KEY=... \
 *   SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/generate-voice-samples.js
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY required");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const VOICES = [
  { id: "sage", geminiVoice: "Autonoe", line: "Hi! I'm Sage. I love reading stories together." },
  { id: "rio", geminiVoice: "Puck", line: "Hey, I'm Rio! Ready for an adventure?" },
  { id: "riley", geminiVoice: "Kore", line: "Hello, I'm Riley. Let's read calmly and clearly." },
  { id: "marcus", geminiVoice: "Charon", line: "Greetings. I'm Marcus, and I love a good story." },
  { id: "kai", geminiVoice: "Fenrir", line: "Yo, I'm Kai! Reading is way more fun than you think." },
  { id: "lily", geminiVoice: "Aoede", line: "Hi friends! I'm Lily. Let's read together." },
];

const MODEL = "gemini-2.5-flash-preview-tts";
const TTS_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const SAMPLE_RATE = 24000;

function pcmToWav(pcm) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (SAMPLE_RATE * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  pcm.copy(buf, 44);
  return buf;
}

async function genVoice(voiceName, text) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `Say warmly: ${text}` }],
      },
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  };
  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini ${res.status}: ${t.slice(0, 300)}`);
  }
  const j = await res.json();
  const parts = j?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    if (p.inlineData?.data) {
      return Buffer.from(p.inlineData.data, "base64");
    }
  }
  throw new Error("No audio in response");
}

async function uploadToSupabase(filePath, wav) {
  const url = `${SUPABASE_URL}/storage/v1/object/audio/${filePath}?upsert=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "audio/wav",
      "x-upsert": "true",
    },
    body: wav,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase upload ${res.status}: ${t.slice(0, 300)}`);
  }
}

async function main() {
  for (const v of VOICES) {
    console.log(`→ ${v.id} (${v.geminiVoice})`);
    try {
      const pcm = await genVoice(v.geminiVoice, v.line);
      const wav = pcmToWav(pcm);
      const dest = `voice-samples/${v.id}.wav`;
      await uploadToSupabase(dest, wav);
      console.log(`  ✓ uploaded ${dest} (${wav.length} bytes)`);
    } catch (e) {
      console.error(`  ! ${v.id}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  console.log("\nDone. Voices live at /storage/v1/object/public/audio/voice-samples/{id}.wav");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
