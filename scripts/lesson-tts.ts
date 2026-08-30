/**
 * Lesson TTS pipeline — Autonoe narration + per-word tile clips for ANY lesson.
 * Reads the lesson from the manifest (app/data/lessons-v2/index.ts): scene
 * narration scripts + every word referenced by listen/sort/transform items.
 *
 *   npx tsx scripts/lesson-tts.ts --lesson=silent-e
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";
import { LESSONS } from "../app/data/lessons-v2";

const VOICE = "Autonoe";
const id = (process.argv.find((a) => a.startsWith("--lesson=")) ?? "").split("=")[1];
if (!id || !LESSONS[id]) {
  console.error(`Usage: npx tsx scripts/lesson-tts.ts --lesson=<id>  (known: ${Object.keys(LESSONS).join(", ")})`);
  process.exit(1);
}
const { lesson } = LESSONS[id];
const OUT = path.resolve(process.cwd(), `public/audio/lessons-v2/${id}`);

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
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ltts-"));
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
  await fs.mkdir(path.join(OUT, "words"), { recursive: true });

  const scenes = lesson.scenes.filter((s) => s.narration);
  // read-along sentence clips → <sceneId>-sentence.mp3 (whisper keys them the same)
  const sentences: { file: string; text: string }[] = [];
  for (const s of lesson.scenes) {
    if (s.interaction?.type === "read-along") sentences.push({ file: `${s.id}-sentence`, text: s.interaction.text });
  }
  const words = new Set<string>();
  for (const s of lesson.scenes) {
    const i = s.interaction;
    if (!i) continue;
    if (i.type === "listen") for (const it of i.items) words.add(it.label.toLowerCase());
    if (i.type === "sort") {
      for (const it of i.items) words.add(it.label.toLowerCase());
      for (const b of i.buckets) if (!/\s/.test(b)) words.add(b.toLowerCase());
    }
    if (i.type === "choose") for (const o of i.options) words.add(o.label.toLowerCase());
    if (i.type === "sequence") for (const it of i.items) words.add(it.label.toLowerCase());
    if (i.type === "transform") {
      words.add(i.base.toLowerCase());
      words.add(i.result.toLowerCase());
    }
  }

  console.log(`\n${id} · Autonoe TTS · ${scenes.length} narration + ${words.size} word clips\n`);
  let ok = 0;
  for (const s of scenes) {
    process.stdout.write(`  ${s.id.padEnd(14)} `);
    const buf = await synth(s.narration!.script);
    if (!buf) { console.log("SKIP"); continue; }
    await fs.writeFile(path.join(OUT, `${s.id}.mp3`), buf);
    console.log(`ok  ${(buf.length / 1024).toFixed(0)}kb`);
    ok++;
  }
  if (lesson.completion) {
    process.stdout.write(`  complete       `);
    const buf = await synth(lesson.completion.script);
    if (buf) {
      await fs.writeFile(path.join(OUT, "complete.mp3"), buf);
      console.log(`ok  ${(buf.length / 1024).toFixed(0)}kb`);
      ok++;
    } else console.log("SKIP");
  }
  for (const sn of sentences) {
    process.stdout.write(`  ${sn.file.padEnd(14)} `);
    const buf = await synth(sn.text);
    if (!buf) { console.log("SKIP"); continue; }
    await fs.writeFile(path.join(OUT, `${sn.file}.mp3`), buf);
    console.log(`ok  ${(buf.length / 1024).toFixed(0)}kb`);
    ok++;
  }
  for (const w of words) {
    process.stdout.write(`  word:${w.padEnd(9)} `);
    const buf = await synth(w);
    if (!buf) { console.log("SKIP"); continue; }
    await fs.writeFile(path.join(OUT, "words", `${w}.mp3`), buf);
    console.log(`ok  ${(buf.length / 1024).toFixed(0)}kb`);
    ok++;
  }
  console.log(`\nDone: ${ok}/${scenes.length + words.size} clips. Now run: python3 scripts/lesson-timings.py ${id}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
