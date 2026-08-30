/**
 * Warm-Up Arcade TTS — Autonoe clips for a warm-up's intro, calls, celebrate.
 *
 *   npx tsx scripts/warmup-tts.ts --warmup=sound-switch-hunt
 *   npx tsx scripts/warmup-tts.ts --warmup=rhyme-rain --only=w-hat,celebrate
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";
import { WARMUPS } from "../app/data/warmups-v2";

const VOICE = "Autonoe";
const id = (process.argv.find((a) => a.startsWith("--warmup=")) ?? "").split("=")[1];
if (!id || !WARMUPS[id]) {
  console.error(`Usage: npx tsx scripts/warmup-tts.ts --warmup=<id> (known: ${Object.keys(WARMUPS).join(", ")})`);
  process.exit(1);
}
const w = WARMUPS[id];
const OUT = path.resolve(process.cwd(), `public/audio/warmups-v2/${id}`);
// Targeted re-records ("--only=w-hat,celebrate") skip the rest of the set.
const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "").split("=")[1]?.split(",").filter(Boolean);

async function synth(text: string): Promise<Buffer | null> {
  for (let a = 0; a < 5; a++) {
    const res = await generateSpeechVertex({ text, voice: VOICE }).catch(
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

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const base = (p: string) => path.basename(p).replace(/\.mp3$/, "");
  const jobs: Array<{ file: string; script: string }> = [
    { file: "intro", script: w.intro.script },
    { file: "celebrate", script: w.celebrate.script },
  ];
  if (w.celebrateZero) jobs.push({ file: "celebrate-zero", script: w.celebrateZero.script });
  for (const wave of w.waves) {
    if (wave.call) jobs.push({ file: base(wave.call.audio), script: wave.call.script });
    // Per-tile catch call-outs ("Thunder!") — only tiles that declare audio.
    for (const t of wave.tiles) {
      if (t.audio) jobs.push({ file: base(t.audio), script: `${t.word[0].toUpperCase()}${t.word.slice(1)}!` });
    }
  }
  // Builder rounds: per-build call ("Now build sunset! Sun. Set.") and
  // per-word completion clip ("Sunset!") played as the parts fuse.
  for (const b of w.builds ?? []) {
    if (b.call) jobs.push({ file: base(b.call.audio), script: b.call.script });
    jobs.push({ file: base(b.wordAudio), script: `${b.word[0].toUpperCase()}${b.word.slice(1)}!` });
  }
  for (const j of jobs) {
    if (only?.length && !only.includes(j.file)) continue;
    const out = path.join(OUT, `${j.file}.mp3`);
    process.stdout.write(`  ${j.file} ... `);
    const buf = await synth(j.script);
    if (!buf) {
      console.log("FAILED");
      process.exitCode = 1;
      continue;
    }
    await fs.writeFile(out, buf);
    console.log("ok");
    // Pace the shared Vertex quota (factory jobs run alongside warm-up TTS).
    await new Promise((r) => setTimeout(r, 1500));
  }
}

main();
