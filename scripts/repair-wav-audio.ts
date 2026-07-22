/**
 * Repair lesson audio files that a bad regen run uploaded as raw WAV under
 * an .mp3 name (~115/201 lessons), so browsers can't decode them.
 *
 * For every object in sample-lessons.json that has an `audioFile`, we check
 * the URL the APP actually requests (path + ?v=audioRegenAt cache-buster):
 *   - already MP3 there → skip
 *   - WAV / not-audio → transcode the origin bytes WAV→MP3, re-upload in
 *     place, AND bump that step's `audioRegenAt` so the app requests a fresh
 *     URL (the CDN has the old ?v= cached as WAV — re-upload alone isn't
 *     enough, the cache-buster must change).
 *
 * The narration is identical; only the container changes. No TTS spend.
 * Writes the updated sample-lessons.json (bumped timestamps) — commit + deploy
 * so the app serves the new cache-buster.
 *
 *   npx tsx scripts/repair-wav-audio.ts --standard=RF.2.3b   # one lesson
 *   npx tsx scripts/repair-wav-audio.ts --dry-run            # scan only
 *   npx tsx scripts/repair-wav-audio.ts                      # whole catalog
 *
 * Requires .env.local (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 * and ffmpeg on PATH.
 */
import { config as loadEnv } from "dotenv";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing SUPABASE env in .env.local");
const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const PUBLIC = `${SUPABASE_URL}/storage/v1/object/public`;

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--standard="))?.split("=")[1];
const dry = args.includes("--dry-run");
const CONC = 8;
const DATA = "app/data/sample-lessons.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
const lessons = JSON.parse(fs.readFileSync(DATA, "utf8")) as any[];

// Deep-walk to every object that carries an audioFile (steps, examples, forks…).
type Ref = { obj: any; std: string };
const refs: Ref[] = [];
function walk(node: any, std: string) {
  if (Array.isArray(node)) { for (const n of node) walk(n, std); return; }
  if (node && typeof node === "object") {
    if (typeof node.audioFile === "string") refs.push({ obj: node, std });
    for (const k of Object.keys(node)) walk(node[k], std);
  }
}
for (const l of lessons) {
  if (only && l.standardId !== only) continue;
  walk(l, l.standardId);
}
console.log(`${refs.length} audio refs to check${only ? ` (standard ${only})` : ""}${dry ? " [DRY RUN]" : ""}`);

const isMp3 = (hex: string) => hex.startsWith("4944") || hex.startsWith("fffb") || hex.startsWith("fff3") || hex.startsWith("fff2");
const isWav = (hex: string) => hex.startsWith("5249");

async function magicOf(url: string): Promise<string> {
  const res = await fetch(url, { headers: { Range: "bytes=0-3" } });
  if (!res.ok) return `HTTP${res.status}`;
  return Buffer.from(await res.arrayBuffer()).subarray(0, 4).toString("hex");
}

let okMp3 = 0, fixed = 0, wavFound = 0, notAudio = 0, err = 0;
const attn: string[] = [];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wavfix-"));

async function handleRef(ref: Ref, worker: number) {
  const af: string = ref.obj.audioFile;
  const ts: string | undefined = ref.obj.audioRegenAt;
  const appUrl = `${PUBLIC}/${encodeURI(af)}${ts ? `?v=${encodeURIComponent(ts)}` : ""}`;
  try {
    const appMagic = await magicOf(appUrl);
    if (isMp3(appMagic)) { okMp3++; return; }            // app already gets MP3
    // Broken for the app. Check the true origin (cache-buster bypasses CDN).
    const originUrl = `${PUBLIC}/${encodeURI(af)}?cb=${worker}-${okMp3 + fixed + wavFound}`;
    const originMagic = await magicOf(originUrl);
    if (!isWav(originMagic) && !isMp3(originMagic)) { notAudio++; attn.push(`${af} (${originMagic})`); return; }
    wavFound++;
    if (dry) return;

    if (isWav(originMagic)) {
      // Origin still WAV → transcode + re-upload.
      const full = await fetch(originUrl);
      const buf = Buffer.from(await full.arrayBuffer());
      const wavPath = path.join(tmp, `in-${worker}.wav`);
      const mp3Path = path.join(tmp, `out-${worker}.mp3`);
      fs.writeFileSync(wavPath, buf);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wavPath, "-codec:a", "libmp3lame", "-qscale:a", "4", mp3Path]);
      const mp3buf = fs.readFileSync(mp3Path);
      const { error } = await sb.storage.from("audio").upload(af.replace(/^audio\//, ""), mp3buf, { contentType: "audio/mpeg", upsert: true });
      if (error) { err++; attn.push(`${af} (upload: ${error.message})`); return; }
    }
    // Origin is MP3 now (either already, or just fixed) but the app's cached
    // ?v= is stale WAV → bump the cache-buster so the app fetches fresh.
    ref.obj.audioRegenAt = new Date().toISOString();
    fixed++;
  } catch (e) {
    err++; attn.push(`${af} (${(e as Error).message})`);
  }
}

let idx = 0;
async function pump(worker: number) {
  for (;;) {
    const i = idx++;
    if (i >= refs.length) return;
    await handleRef(refs[i], worker);
    if (i > 0 && i % 150 === 0) console.log(`  ${i}/${refs.length} — mp3:${okMp3} fixed:${fixed} notAudio:${notAudio} err:${err}`);
  }
}

(async () => {
  await Promise.all(Array.from({ length: CONC }, (_, w) => pump(w)));
  fs.rmSync(tmp, { recursive: true, force: true });
  if (!dry && fixed > 0) {
    fs.writeFileSync(DATA, JSON.stringify(lessons, null, 2) + "\n");
    console.log(`\nWrote ${DATA} with ${fixed} bumped cache-busters.`);
  }
  console.log(`\nDONE. already-mp3:${okMp3}  ${dry ? "wav-found" : "fixed"}:${dry ? wavFound : fixed}  not-audio:${notAudio}  errors:${err}`);
  if (attn.length) {
    console.log(`\nNeeds manual attention (${attn.length}):`);
    attn.slice(0, 50).forEach((a) => console.log("  " + a));
    if (attn.length > 50) console.log(`  …and ${attn.length - 50} more`);
  }
})();
