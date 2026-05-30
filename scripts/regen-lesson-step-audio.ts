/**
 * Regenerate a single lesson-step audio file (Vertex Gemini TTS).
 *
 * Reads the (already-rewritten) ttsScript from
 * app/data/sample-lessons.json, calls Vertex TTS, transcodes the
 * raw 24kHz mono PCM to MP3 via ffmpeg, and uploads to the SAME
 * Supabase Storage path so the lesson JSON's audioFile reference
 * stays valid.
 *
 * Usage:
 *   npx tsx scripts/regen-lesson-step-audio.ts --standard=L.3.4b --slide=2 --sub=a
 *   npx tsx scripts/regen-lesson-step-audio.ts --standard=L.3.4b --slide=2 --sub=a --voice=Autonoe
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, plus valid Vertex / Google auth via
 * ADC. ffmpeg must be on PATH.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";

const SAMPLE_LESSONS = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function arg(name: string): string | null {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : null;
}

async function main() {
  const standardId = arg("standard");
  const slideStr = arg("slide");
  const sub = arg("sub");
  const voice = arg("voice") ?? "Autonoe";

  if (!standardId || !slideStr || !sub) {
    console.error(
      "Usage: tsx scripts/regen-lesson-step-audio.ts --standard=<id> --slide=<n> --sub=<a|b|c|...> [--voice=Autonoe]",
    );
    process.exit(1);
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error(
      "Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const slideNum = Number(slideStr);
  const lessons = JSON.parse(await fs.readFile(SAMPLE_LESSONS, "utf-8"));
  const lesson = lessons.find((l: any) => l.standardId === standardId);
  if (!lesson) {
    console.error(`Lesson ${standardId} not found`);
    process.exit(1);
  }
  const slide = (lesson.slides ?? []).find(
    (s: any) => s.slide === slideNum,
  );
  if (!slide) {
    console.error(`Slide ${slideNum} not found in ${standardId}`);
    process.exit(1);
  }
  const step = (slide.steps ?? []).find((st: any) => st.sub === sub);
  if (!step) {
    console.error(`Step ${sub} not found in slide ${slideNum}`);
    process.exit(1);
  }
  const text = step.ttsScript as string | undefined;
  const audioFile = step.audioFile as string | undefined;
  if (!text || !audioFile) {
    console.error("Step missing ttsScript or audioFile");
    process.exit(1);
  }

  console.log(`\n═══ ${standardId} slide ${slideNum}.${sub} ═══`);
  console.log(`Voice: ${voice}`);
  console.log(`Script: "${text}"`);
  console.log(`Target: ${audioFile}`);
  console.log(`\nGenerating speech…`);

  const res = await generateSpeechVertex({ text, voice });
  if (!res.ok) {
    console.error(`TTS failed: ${res.error}`);
    process.exit(1);
  }

  // Vertex Gemini TTS returns raw signed 16-bit PCM at 24kHz mono.
  // Write to temp file, convert to MP3 with ffmpeg, upload.
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "lesson-tts-"));
  const pcmPath = path.join(tmp, "audio.pcm");
  const mp3Path = path.join(tmp, "audio.mp3");
  await fs.writeFile(pcmPath, Buffer.from(res.pcmBase64, "base64"));

  console.log(`Transcoding PCM → MP3…`);
  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-f", "s16le",
      "-ar", "24000",
      "-ac", "1",
      "-i", pcmPath,
      "-codec:a", "libmp3lame",
      "-qscale:a", "2",
      mp3Path,
    ],
    { encoding: "utf-8" },
  );
  if (ff.status !== 0) {
    console.error("ffmpeg failed:", ff.stderr);
    process.exit(1);
  }

  console.log(`Uploading to Supabase…`);
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  let bucket = "audio";
  let storagePath = audioFile;
  if (storagePath.startsWith("audio/")) {
    storagePath = storagePath.slice("audio/".length);
  }
  const mp3Bytes = await fs.readFile(mp3Path);
  const up = await sb.storage
    .from(bucket)
    .upload(storagePath, mp3Bytes, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "no-cache",
    });
  if (up.error) {
    console.error(`Upload failed: ${up.error.message}`);
    process.exit(1);
  }

  // Bump audioRegenAt so downstream cache invalidation knows.
  step.audioRegenAt = new Date().toISOString();
  await fs.writeFile(SAMPLE_LESSONS, JSON.stringify(lessons, null, 2));

  console.log(`\n✓ Done`);
  console.log(`  ${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`);
  console.log(`\nNext: re-run aligner to refresh Whisper-derived delays.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
