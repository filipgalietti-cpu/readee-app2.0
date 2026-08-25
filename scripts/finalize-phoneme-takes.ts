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

    // 2. Trim + normalize — tuned for QUIET unvoiced phonemes. The first
    //    pipeline (-45dB trim + loudnorm) deleted /h/ entirely, cut /f/ to a
    //    90ms static click, and slammed /p/'s remnant to -2dB. Now:
    //    - gentle -58dB trim (breath sounds live around -36dB peaks)
    //    - minimum-duration guard: if the trim still eats the sound, keep it
    //      untrimmed rather than ship a stub
    //    - peak-normalize to -6dB (loudnorm misbehaves on sub-second clips)
    //    - 8ms fades so clip edges never click
    const inWav = path.join(tmp, `${id}.wav`);
    const trimWav = path.join(tmp, `${id}.trim.wav`);
    const outMp3 = path.join(tmp, `${id}.mp3`);
    fs.writeFileSync(inWav, wav);
    // Order matters: SHAPE first (trim → clamp/pad), THEN measure + normalize
    // — normalizing before the clamp left /f/ and /th/ nearly silent when
    // their loudest stretch fell past the cut.
    const STOPS = new Set(["p", "b", "t", "d", "k", "g", "j", "q", "x", "ch", "c_hard", "c_soft"]);
    const isStop = STOPS.has(id);
    const MAX_CONT = 0.75; // continuants: long enough to hear, short enough to echo
    const TRIM = "silenceremove=start_periods=1:start_threshold=-58dB:start_silence=0.1,areverse,silenceremove=start_periods=1:start_threshold=-58dB:start_silence=0.1,areverse";
    const t = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", inWav, "-af", TRIM, trimWav], { encoding: "utf-8" });
    if (t.status !== 0) { console.error(`✗ ${id}: trim ${t.stderr?.slice(0, 160)}`); continue; }
    const durOut = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", trimWav], { encoding: "utf-8" });
    const dur = parseFloat(durOut.stdout.trim() || "0");
    let src = dur >= 0.15 ? trimWav : inWav; // guard: never ship a stub
    // Shape: clamp long continuants ("/f/ too long"); pad stop tails so the
    // release isn't cut dead ("/p/ too short").
    const shaped = path.join(tmp, `${id}.shaped.wav`);
    const shapeFilters: string[] = [];
    if (!isStop && dur > MAX_CONT) {
      shapeFilters.push(`atrim=0:${MAX_CONT}`, `afade=t=out:st=${(MAX_CONT - 0.09).toFixed(2)}:d=0.09`);
    }
    if (isStop) shapeFilters.push("apad=pad_dur=0.12");
    if (shapeFilters.length) {
      const sh = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-af", shapeFilters.join(","), shaped], { encoding: "utf-8" });
      if (sh.status !== 0) { console.error(`✗ ${id}: shape ${sh.stderr?.slice(0, 160)}`); continue; }
      src = shaped;
    }
    // NOW measure peak on the final shape, gain to -6dBFS, edge-fade, encode.
    const vd = spawnSync("ffmpeg", ["-i", src, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf-8" });
    const maxMatch = /max_volume:\s*(-?[\d.]+) dB/.exec(vd.stderr || "");
    const maxDb = maxMatch ? parseFloat(maxMatch[1]) : 0;
    const gain = (-6 - maxDb).toFixed(1);
    const ff = spawnSync("ffmpeg", [
      "-y", "-loglevel", "error", "-i", src,
      "-af", `volume=${gain}dB,afade=t=in:d=0.008,areverse,afade=t=in:d=0.008,areverse`,
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
