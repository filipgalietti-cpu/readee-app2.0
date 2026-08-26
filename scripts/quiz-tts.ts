/** Quiz narration TTS: synths each question's narration script.
 *    npx tsx scripts/quiz-tts.ts --quiz=rhyme-time-quiz            */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";
import { QUIZZES } from "../app/data/quizzes-v2";

const id = (process.argv.find((a) => a.startsWith("--quiz=")) ?? "").split("=")[1];
if (!id || !QUIZZES[id]) { console.error(`Usage: --quiz=<id> (known: ${Object.keys(QUIZZES).join(", ")})`); process.exit(1); }
const quiz = QUIZZES[id];
const OUT = path.resolve(process.cwd(), `public/audio/quizzes-v2/${id}`);

async function synth(text: string): Promise<Buffer | null> {
  for (let a = 0; a < 5; a++) {
    const res = await generateSpeechVertex({ text, voice: "Autonoe" }).catch((e: unknown) => ({ ok: false as const, error: String(e) }));
    if (!res.ok) { if (/429|quota|rate|timeout|network|fetch/i.test(res.error)) { await new Promise((r) => setTimeout(r, 3000 * (a + 1))); continue; } return null; }
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "qt-"));
    const pcm = path.join(tmp, "a.pcm"), mp3 = path.join(tmp, "a.mp3");
    await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
    if (spawnSync("ffmpeg", ["-y","-f","s16le","-ar","24000","-ac","1","-i",pcm,"-af","loudnorm=I=-18:TP=-2:LRA=7","-codec:a","libmp3lame","-qscale:a","2",mp3]).status !== 0) return null;
    return fs.readFile(mp3);
  }
  return null;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  let ok = 0;
  for (const q of quiz.questions) {
    const clips: [string, string][] = [];
    if (q.narration) clips.push([q.id, q.narration.script]);
    if (q.hint) clips.push([`${q.id}-hint`, q.hint.script]);
    if (q.explain) clips.push([`${q.id}-explain`, q.explain.script]);
    for (const [file, text] of clips) {
      // skip clips that already exist — healing passes only fill gaps
      try { await fs.access(path.join(OUT, `${file}.mp3`)); continue; } catch { /* missing */ }
      process.stdout.write(`  ${file.padEnd(22)} `);
      const buf = await synth(text);
      if (!buf) { console.log("SKIP"); continue; }
      await fs.writeFile(path.join(OUT, `${file}.mp3`), buf);
      console.log("ok"); ok++;
    }
  }
  console.log(`Done: ${ok} narration clips.`);

  // MISSING-AUDIO pass: walk every audio path the quiz references; synth any
  // that don't exist (word tiles, bucket names) from the filename.
  const pub = path.resolve(process.cwd(), "public");
  const refs = new Set<string>();
  const walk = (v: unknown): void => {
    if (typeof v === "string" && v.startsWith("/audio/") && v.endsWith(".mp3")) refs.add(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(quiz);
  let fixed = 0;
  for (const ref of refs) {
    const abs = path.join(pub, ref.slice(1));
    try { await fs.access(abs); continue; } catch { /* missing */ }
    const base = path.basename(ref, ".mp3").replace(/^[wb]-/, "").replace(/-/g, " ");
    process.stdout.write(`  missing ${path.basename(ref).padEnd(24)} → "${base}" `);
    const buf = await synth(base);
    if (!buf) { console.log("SKIP"); continue; }
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, buf);
    console.log("ok"); fixed++;
  }
  if (fixed) console.log(`Synthesized ${fixed} missing clips.`);
}
main();
