/**
 * Promote human-recorded phoneme takes to the LIVE clips.
 *
 * For each staged take at audio/phoneme-takes/{id}.wav:
 *   1. Back up the current live clip → audio/phonemes-tts-backup/{id}.mp3
 *      (first run only — never overwrites an existing backup).
 *   2. ffmpeg: trim leading/trailing silence, loudness-normalize, encode mp3.
 *   3. Upload → audio/phonemes/{id}.mp3 (upsert) — instantly live in Luna and
 *      every lesson.
 *
 * Usage: npx tsx scripts/finalize-phoneme-takes.ts        (all staged takes)
 *        npx tsx scripts/finalize-phoneme-takes.ts b sh   (just these ids)
 * Requires .env.local (SUPABASE) + ffmpeg.
 */
import { config as loadEnv } from "dotenv";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import phonemeDb from "../scripts/phoneme-database.json";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing SUPABASE env in .env.local");
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const IDS: string[] = (phonemeDb as { id: string }[]).map((p) => p.id);
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));

async function download(pathInBucket: string): Promise<Buffer | null> {
  const { data, error } = await sb.storage.from("audio").download(pathInBucket);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "phoneme-final-"));
  const targets = only.length ? IDS.filter((i) => only.includes(i)) : IDS;
  let done = 0, missing = 0;
  for (const id of targets) {
    const wav = await download(`phoneme-takes/${id}.wav`);
    if (!wav) { missing++; continue; }

    // 1. Backup the current live clip once.
    const backup = await download(`phonemes-tts-backup/${id}.mp3`);
    if (!backup) {
      const live = await download(`phonemes/${id}.mp3`);
      if (live) {
        await sb.storage.from("audio").upload(`phonemes-tts-backup/${id}.mp3`, live, { contentType: "audio/mpeg", upsert: false });
      }
    }

    // 2. Trim silence (head + tail), normalize loudness, encode mp3.
    const inWav = path.join(tmp, `${id}.wav`);
    const outMp3 = path.join(tmp, `${id}.mp3`);
    fs.writeFileSync(inWav, wav);
    const ff = spawnSync("ffmpeg", [
      "-y", "-loglevel", "error", "-i", inWav,
      "-af",
      // strip head silence, reverse, strip (new) head silence = tail, reverse back, then normalize
      "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,loudnorm=I=-18:TP=-2:LRA=7",
      "-ar", "24000", "-ac", "1", "-codec:a", "libmp3lame", "-qscale:a", "2", outMp3,
    ], { encoding: "utf-8" });
    if (ff.status !== 0) { console.error(`✗ ${id}: ffmpeg ${ff.stderr?.slice(0, 160)}`); continue; }

    // 3. Go live.
    const up = await sb.storage.from("audio").upload(`phonemes/${id}.mp3`, fs.readFileSync(outMp3), { contentType: "audio/mpeg", upsert: true });
    if (up.error) { console.error(`✗ ${id}: upload ${up.error.message}`); continue; }
    console.log(`✓ ${id} live`);
    done++;
  }
  console.log(`\n${done} promoted, ${missing} not staged. Backups in audio/phonemes-tts-backup/.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
