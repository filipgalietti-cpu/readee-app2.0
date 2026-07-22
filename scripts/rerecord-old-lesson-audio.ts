/**
 * Bulk re-record old-batch lesson audio with the Autonoe voice.
 *
 * The 349 lesson-step audio files that were never re-recorded
 * (audioRegenAt === undefined) are from the original generation and sound
 * off (the "obnoxious K voice"). This regenerates each with Autonoe (same
 * pipeline as scripts/regen-lesson-step-audio.ts), re-uploads to the same
 * Storage path, and bumps audioRegenAt so the app serves it fresh.
 *
 * Voice/script is unchanged — only the recording. AFTER running this for a
 * lesson/grade, re-run the Whisper timing aligner so the karaoke re-syncs:
 *   npx tsx scripts/derive-slide-timing.ts --standard=<id>   (writes slide-timings.json)
 *   npx tsx scripts/align-slide-timings.ts --standard=<id> --apply
 *
 *   npx tsx scripts/rerecord-old-lesson-audio.ts --standard=RL.K.1   # one lesson
 *   npx tsx scripts/rerecord-old-lesson-audio.ts --grade=K           # a grade
 *   npx tsx scripts/rerecord-old-lesson-audio.ts --dry-run           # list only
 *
 * Requires .env.local (SUPABASE) + Vertex/Google ADC + ffmpeg.
 */
import { config as loadEnv } from "dotenv";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { generateSpeechVertex } from "@/lib/ai/vertex-tts";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing SUPABASE env in .env.local");
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const DATA = "app/data/sample-lessons.json";
const VOICE = "Autonoe";

const args = process.argv.slice(2);
const onlyStd = args.find((a) => a.startsWith("--standard="))?.split("=")[1];
const onlyGrade = args.find((a) => a.startsWith("--grade="))?.split("=")[1];
const dry = args.includes("--dry-run");
const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0");
const CONC = 2;

// Vertex TTS (gemini-2.5-pro-preview-tts) has a per-minute per-model quota.
// Retry 429s with backoff so the run self-throttles instead of dropping files.
async function ttsWithRetry(text: string): Promise<{ ok: true; pcmBase64: string } | { ok: false; error: string }> {
  for (let attempt = 0; ; attempt++) {
    const res = await generateSpeechVertex({ text, voice: VOICE });
    if (res.ok) return res;
    const is429 = /429|RESOURCE_EXHAUSTED|Quota/i.test(res.error || "");
    if (is429 && attempt < 8) {
      await new Promise((r) => setTimeout(r, 15000 + attempt * 8000));
      continue;
    }
    return res;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const lessons = JSON.parse(fs.readFileSync(DATA, "utf8")) as any[];

type Ref = { obj: any; std: string; text: string; file: string };
const refs: Ref[] = [];
for (const l of lessons) {
  const g = (l.standardId || "").match(/\.(K|1|2|3|4)\./)?.[1] || "?";
  if (onlyStd && l.standardId !== onlyStd) continue;
  if (onlyGrade && g !== onlyGrade) continue;
  for (const sl of l.slides ?? []) {
    for (const st of sl.steps ?? []) {
      if (st.audioFile && st.ttsScript && st.audioRegenAt === undefined) {
        refs.push({ obj: st, std: l.standardId, text: st.ttsScript, file: st.audioFile });
      }
    }
  }
}
const list = limit > 0 ? refs.slice(0, limit) : refs;
console.log(`${list.length} old-batch steps to re-record${onlyStd ? ` (${onlyStd})` : onlyGrade ? ` (grade ${onlyGrade})` : ""}${dry ? " [DRY RUN]" : ""}`);
if (dry) {
  list.slice(0, 40).forEach((r) => console.log(`  ${r.std} ${r.file} :: "${r.text.slice(0, 50)}"`));
  process.exit(0);
}

let done = 0, err = 0;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rerec-"));
const errors: string[] = [];

async function recordOne(r: Ref, worker: number) {
  try {
    const res = await ttsWithRetry(r.text);
    if (!res.ok) { err++; errors.push(`${r.file}: TTS ${res.error?.slice(0, 60)}`); return; }
    const pcm = path.join(tmp, `w${worker}.pcm`);
    const mp3 = path.join(tmp, `w${worker}.mp3`);
    fs.writeFileSync(pcm, Buffer.from(res.pcmBase64, "base64"));
    const ff = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm, "-codec:a", "libmp3lame", "-qscale:a", "2", mp3], { encoding: "utf-8" });
    if (ff.status !== 0) { err++; errors.push(`${r.file}: ffmpeg ${ff.stderr?.slice(0, 80)}`); return; }
    const storagePath = r.file.replace(/^audio\//, "");
    const up = await sb.storage.from("audio").upload(storagePath, fs.readFileSync(mp3), { contentType: "audio/mpeg", upsert: true, cacheControl: "no-cache" });
    if (up.error) { err++; errors.push(`${r.file}: upload ${up.error.message}`); return; }
    r.obj.audioRegenAt = new Date().toISOString();
    done++;
    if (done % 10 === 0) console.log(`  …${done}/${list.length} re-recorded`);
  } catch (e) {
    err++; errors.push(`${r.file}: ${(e as Error).message}`);
  }
}

let idx = 0;
async function pump(worker: number) {
  for (;;) {
    const i = idx++;
    if (i >= list.length) return;
    await recordOne(list[i], worker);
  }
}

(async () => {
  await Promise.all(Array.from({ length: CONC }, (_, w) => pump(w)));
  fs.rmSync(tmp, { recursive: true, force: true });
  if (done > 0) fs.writeFileSync(DATA, JSON.stringify(lessons, null, 2) + "\n");
  console.log(`\nDONE. re-recorded:${done}  errors:${err}`);
  if (errors.length) { console.log("Errors:"); errors.slice(0, 30).forEach((e) => console.log("  " + e)); }
  console.log("\nNext: re-align timing for the affected lessons (derive-slide-timing + align-slide-timings --apply).");
})();
