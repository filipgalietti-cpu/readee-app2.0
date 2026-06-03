/**
 * Regenerate the audio clips the audio audit flagged (wrong words /
 * mispronunciation / truncated). Re-synthesizes each step's TTS from its
 * ttsScript (Vertex, Autonoe voice) → MP3 → uploads to the canonical
 * path → bumps audioRegenAt → RE-JUDGES to confirm it now passes.
 *
 *   npx tsx scripts/qc-regen-audio.ts --dry-run
 *   npx tsx scripts/qc-regen-audio.ts --standard=RL.K.5 --apply
 *   npx tsx scripts/qc-regen-audio.ts --apply            # all audio-audit fails
 *
 * Reads scripts/audio-audit.json. Low concurrency (Vertex TTS is touchy
 * under load) + backoff.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";
import { judgeAudioFile } from "../lib/ai/qc-media";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const AUDIT = path.resolve(process.cwd(), "scripts/audio-audit.json");
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const VOICE = "Autonoe";
const N = 2; // re-gen attempts (TTS is fairly deterministic)
const CONC = 3; // gentle on Vertex TTS

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const STD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;

function audioUrl(file: string, regenAt?: string) {
  return `${SUPA}/storage/v1/object/public/${file}${regenAt ? `?v=${encodeURIComponent(regenAt)}` : ""}`;
}
function timed<T>(p: Promise<T>, ms: number, fb: T): Promise<T> {
  return Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fb), ms))]);
}

/** Synth one clip → mp3 buffer (Vertex PCM → ffmpeg). Bulletproof: a
 *  transient network error (ECONNRESET / fetch failed) backs off + retries,
 *  never throws out. */
async function synth(text: string): Promise<Buffer | null> {
  for (let a = 0; a < 5; a++) {
    try {
      const res: any = await timed(
        generateSpeechVertex({ text, voice: VOICE }).catch((e: any) => ({ ok: false, error: String(e?.message ?? e) })),
        60000, { ok: false, error: "timeout" },
      );
      if (!res.ok) {
        if (/429|quota|rate|exhaust|econnreset|fetch failed|timeout|socket|network/i.test(String(res.error ?? ""))) {
          await new Promise((r) => setTimeout(r, 3000 * (a + 1)));
          continue;
        }
        return null;
      }
      const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "au-"));
      const pcm = path.join(tmp, "a.pcm"), mp3 = path.join(tmp, "a.mp3");
      await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
      const ff = spawnSync("ffmpeg", ["-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm, "-codec:a", "libmp3lame", "-qscale:a", "2", mp3], { encoding: "utf-8" });
      if (ff.status !== 0) return null;
      return await fs.readFile(mp3);
    } catch {
      await new Promise((r) => setTimeout(r, 3000 * (a + 1)));
    }
  }
  return null;
}

async function main() {
  const audit = JSON.parse(await fs.readFile(AUDIT, "utf-8"));
  let fails: any[] = audit.fails ?? [];
  if (STD) fails = fails.filter((f) => f.std === STD);

  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const findStep = (f: any) => {
    const slide = (lessons.find((l) => l.standardId === f.std)?.slides ?? []).find((s: any) => s.slide === f.slide);
    return slide?.steps?.find((st: any) => st.sub === f.sub);
  };

  const work = fails.map((f) => ({ ...f, step: findStep(f) })).filter((w) => w.step?.ttsScript && w.step?.audioFile);
  console.log(`\n${APPLY ? "APPLY" : "DRY-RUN"} · ${work.length} clips to regenerate\n`);
  if (!APPLY) {
    for (const w of work.slice(0, 15)) console.log(`  ${w.std} S${w.slide}${w.sub}: "${String(w.step.ttsScript).slice(0, 60)}"`);
    console.log(`\n(${work.length} total. Run --apply.)`);
    return;
  }

  const sb = createClient(SUPA, SERVICE);
  let idx = 0, fixed = 0, stillBad = 0, done = 0;

  async function worker() {
    while (idx < work.length) {
      const w = work[idx++];
      let ok = false;
      try {
        for (let i = 0; i < N && !ok; i++) {
          const mp3 = await synth(String(w.step.ttsScript));
          if (!mp3) continue;
          const up: any = await sb.storage.from("audio").upload(String(w.step.audioFile).replace(/^audio\//, ""), mp3, { contentType: "audio/mpeg", upsert: true, cacheControl: "no-cache" }).catch((e: any) => ({ error: { message: String(e) } }));
          if (up.error) continue;
          const stamp = new Date().toISOString();
          w.step.audioRegenAt = stamp;
          // verify it now reads correctly
          const v: any = await timed(judgeAudioFile({ audioUrl: audioUrl(w.step.audioFile, stamp), expectedText: String(w.step.ttsScript) }).catch(() => ({ ok: false })), 40000, { ok: false });
          if (v.ok && v.severity !== "fail") ok = true;
        }
      } catch { /* swallow — one clip's error never sinks the batch */ }
      done++;
      if (ok) fixed++; else stillBad++;
      console.error(`  …${done}/${work.length} ${w.std} S${w.slide}${w.sub} ${ok ? "✓" : "~still-flagged"}`);
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));

  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  console.log(`\n— regenerated ${fixed}/${work.length} now passing (${stillBad} still flagged). wrote sample-lessons.json —`);
}

main().catch((e) => { console.error(e); process.exit(1); });
