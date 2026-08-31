/**
 * Warm-Up Arcade TTS machinery — shared by scripts/warmup-tts.ts (hand-built
 * pilots, targeted re-records) and scripts/warmup-generate.ts (generated
 * warmups at volume). One synth path so loudnorm/pacing/retry behavior can
 * never drift between the two.
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";
import type { WarmupDef } from "../lib/warmup-engine/types";

export const WARMUP_VOICE = "Autonoe";

/** Pace the shared Vertex quota (factory jobs run alongside warm-up TTS). */
export const TTS_PACE_MS = 1750;

export async function synthClip(text: string): Promise<Buffer | null> {
  for (let a = 0; a < 5; a++) {
    const res = await generateSpeechVertex({ text, voice: WARMUP_VOICE }).catch(
      (e: unknown) => ({ ok: false as const, error: String((e as Error)?.message ?? e) }),
    );
    if (!res.ok) {
      if (/429|quota|rate|exhaust|timeout|network|fetch|socket|econnreset/i.test(res.error)) {
        await new Promise((r) => setTimeout(r, 3000 * (a + 1)));
        continue;
      }
      console.log("   error:", res.error);
      return null;
    }
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "wtts-"));
    const pcm = path.join(tmp, "a.pcm");
    const mp3 = path.join(tmp, "a.mp3");
    await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
    const ff = spawnSync(
      "ffmpeg",
      ["-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm, "-af", "loudnorm=I=-18:TP=-2:LRA=7", "-codec:a", "libmp3lame", "-qscale:a", "2", mp3],
      { encoding: "utf-8" },
    );
    if (ff.status !== 0) return null;
    return fs.readFile(mp3);
  }
  return null;
}

export type TtsJob = { file: string; script: string };

/** Every clip a warm-up def needs, in record order. File names match the
 *  audio paths the def references (basename sans .mp3). */
export function jobsForWarmup(w: WarmupDef): TtsJob[] {
  const base = (p: string) => path.basename(p).replace(/\.mp3$/, "");
  const say = (word: string) => `${word[0].toUpperCase()}${word.slice(1)}!`;
  const jobs: TtsJob[] = [
    { file: "intro", script: w.intro.script },
    { file: "celebrate", script: w.celebrate.script },
  ];
  if (w.celebrateZero) jobs.push({ file: "celebrate-zero", script: w.celebrateZero.script });
  for (const wave of w.waves) {
    if (wave.call) jobs.push({ file: base(wave.call.audio), script: wave.call.script });
    // Per-tile catch call-outs ("Thunder!") — only tiles that declare audio.
    for (const t of wave.tiles) {
      if (t.audio) jobs.push({ file: base(t.audio), script: say(t.word) });
    }
  }
  // Builder rounds: per-build call ("Now build sunset! Sun. Set.") and
  // per-word completion clip ("Sunset!") played as the parts fuse.
  for (const b of w.builds ?? []) {
    if (b.call) jobs.push({ file: base(b.call.audio), script: b.call.script });
    jobs.push({ file: base(b.wordAudio), script: say(b.word) });
  }
  return jobs;
}

/** Record a warm-up's clips into public/audio/warmups-v2/<id>/.
 *  `only` filters to specific file names; `skipExisting` leaves files on disk
 *  alone (resumable). Returns per-file success. */
export async function recordWarmup(
  w: WarmupDef,
  opts: { only?: string[]; skipExisting?: boolean } = {},
): Promise<{ ok: string[]; failed: string[]; skipped: string[] }> {
  const outDir = path.resolve(process.cwd(), `public/audio/warmups-v2/${w.id}`);
  await fs.mkdir(outDir, { recursive: true });
  const ok: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];
  for (const j of jobsForWarmup(w)) {
    if (opts.only?.length && !opts.only.includes(j.file)) continue;
    const out = path.join(outDir, `${j.file}.mp3`);
    if (opts.skipExisting && (await fs.stat(out).catch(() => null))) {
      skipped.push(j.file);
      continue;
    }
    process.stdout.write(`  ${j.file} ... `);
    const buf = await synthClip(j.script);
    if (!buf) {
      console.log("FAILED");
      failed.push(j.file);
      continue;
    }
    await fs.writeFile(out, buf);
    console.log("ok");
    ok.push(j.file);
    await new Promise((r) => setTimeout(r, TTS_PACE_MS));
  }
  return { ok, failed, skipped };
}
