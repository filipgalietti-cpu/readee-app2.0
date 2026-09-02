/**
 * Placement audio pipeline: every clip Luna plays during the placement, in
 * Autonoe, loudness-normalized like lesson audio, Whisper-verified, recorded
 * in a manifest the runner reads. Standardized content, so clips are
 * generated once and only regenerated when their script changes.
 *
 *   npx tsx scripts/placement-tts.ts            # synth missing/changed, verify all
 *   npx tsx scripts/placement-tts.ts --dry      # list the clips, no synth
 *   npx tsx scripts/placement-tts.ts --force    # resynth everything
 *   npx tsx scripts/placement-tts.ts --only=q-  # id prefix filter
 *   npx tsx scripts/placement-tts.ts --verify-only  # re-score existing files, no synthesis
 *
 * Clips:
 *   narr-<key>            Luna's narration lines (app/data/placement-bank/narration.ts)
 *   title-<band>          "This story is called <title>."
 *   q-<questionId>        the question prompt Luna reads
 *   opt-<questionId>-<id> each option, read in order by the Choose interaction
 *   story-listen          the K listening story
 * Letter-sound and blending items reuse public/audio/phonemes/<id>.mp3 (no new audio).
 * Word lists, nonsense words and passages are READ BY THE CHILD: no audio on purpose.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawnSync } from "node:child_process";
import { generateSpeechVertex } from "../lib/ai/vertex-tts";
import { PLACEMENT_BANK } from "../app/data/placement-bank";
import { PLACEMENT_NARRATION, titleLine } from "../app/data/placement-bank/narration";
import type { Band } from "../lib/placement/ladder";

const VOICE = "Autonoe";
const OUT = path.resolve(process.cwd(), "public/audio/placement");
const MANIFEST = path.resolve(process.cwd(), "app/data/placement-bank/audio-manifest.json");
const URL_BASE = "/audio/placement";
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const FORCE = args.includes("--force");
const ONLY = (args.find((a) => a.startsWith("--only=")) ?? "").split("=")[1] || "";
const VERIFY_ONLY = args.includes("--verify-only");
const MAX_ATTEMPTS = 3;
/** Word-error tolerance for Whisper vs script (short clips get one free miss). */
const WER_MAX = 0.2;

type Clip = { id: string; text: string; kind: "narration" | "title" | "question" | "option" | "story" };
type ManifestEntry = { url: string; script: string; verified: boolean; transcript: string; attempts: number };
type Manifest = { generatedAt: string; voice: string; clips: Record<string, ManifestEntry> };

function collectClips(): Clip[] {
  const clips: Clip[] = [];
  for (const [key, text] of Object.entries(PLACEMENT_NARRATION)) clips.push({ id: `narr-${key}`, text, kind: "narration" });
  for (const band of [1, 2, 3, 4, 5] as Band[]) {
    const b = PLACEMENT_BANK.bands[band];
    if (!b.passage) continue;
    clips.push({ id: `title-${band}`, text: titleLine(b.passage.title), kind: "title" });
    for (const q of b.passage.questions) {
      clips.push({ id: `q-${q.id}`, text: q.prompt, kind: "question" });
      for (const o of q.options) clips.push({ id: `opt-${q.id}-${o.id}`, text: o.label, kind: "option" });
    }
  }
  const f = PLACEMENT_BANK.foundations;
  clips.push({ id: "story-listen", text: f.listening.text, kind: "story" });
  for (const q of f.listening.questions) {
    clips.push({ id: `q-${q.id}`, text: q.prompt, kind: "question" });
    for (const o of q.options) clips.push({ id: `opt-${q.id}-${o.id}`, text: o.label, kind: "option" });
  }
  const ids = new Set<string>();
  for (const c of clips) {
    if (ids.has(c.id)) throw new Error(`duplicate clip id ${c.id}`);
    ids.add(c.id);
    if (!/^[a-z0-9-]+$/.test(c.id)) throw new Error(`clip id must be kebab-case: ${c.id}`);
  }
  return ONLY ? clips.filter((c) => c.id.startsWith(ONLY)) : clips;
}

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
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ptts-"));
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

/** Whisper transcripts for a batch of files via the shared python helper. */
function transcribe(files: string[], model = "base"): Record<string, string> {
  if (!files.length) return {};
  const list = path.join(os.tmpdir(), `ptts-whisper-${Date.now()}.json`);
  require("node:fs").writeFileSync(list, JSON.stringify(files));
  const py = spawnSync("python3", ["scripts/warmup-whisper.py", model, list], { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  if (py.status !== 0) throw new Error(`whisper failed: ${py.stderr.slice(0, 400)}`);
  return JSON.parse(py.stdout);
}

/** Whisper writes numbers as digits and hears homophones on one-word clips; fold both before comparing. */
const NUMBER_WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18",
  nineteen: "19", twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70", eighty: "80", ninety: "90", hundred: "100",
  // homophones Whisper picks for bare number words
  to: "2", too: "2", for: "4", fore: "4", won: "1", ate: "8",
};
const norm = (s: string): string[] =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean)
    .map((w) => NUMBER_WORDS[w] ?? w);

/** Word error rate: Levenshtein over word tokens divided by script length. */
function wer(script: string, transcript: string): number {
  const a = norm(script);
  const b = norm(transcript);
  if (!a.length) return b.length ? 1 : 0;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length] / a.length;
}

const passes = (script: string, transcript: string): boolean => {
  const n = norm(script).length;
  const w = wer(script, transcript);
  if (n <= 3 ? w <= 0.34 : w <= WER_MAX) return true; // one free miss on very short clips ("Okay.", "Next one.")
  // Compounds: "Crossbeams" vs "Cross beams" are the same sounds.
  return norm(script).join("") === norm(transcript).join("");
};

async function loadManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf-8")) as Manifest;
  } catch {
    return { generatedAt: "", voice: VOICE, clips: {} };
  }
}

async function main() {
  const clips = collectClips();
  console.log(`${clips.length} clips (${clips.filter((c) => c.kind === "narration").length} narration, ${clips.filter((c) => c.kind === "question").length} questions, ${clips.filter((c) => c.kind === "option").length} options, ${clips.filter((c) => c.kind === "title").length} titles, ${clips.filter((c) => c.kind === "story").length} story)`);
  if (DRY) {
    for (const c of clips) console.log(`  ${c.id.padEnd(28)} ${c.text.slice(0, 90)}`);
    return;
  }
  await fs.mkdir(OUT, { recursive: true });
  const manifest = await loadManifest();
  const pending = new Map<string, Clip>();

  if (VERIFY_ONLY) {
    const files = clips.map((c) => path.join(OUT, `${c.id}.mp3`));
    console.log(`verify-only: whisper (base) on ${files.length} existing clips...`);
    const base = transcribe(files);
    const failed = clips.filter((c) => !passes(c.text, base[path.join(OUT, `${c.id}.mp3`)] ?? ""));
    let medium: Record<string, string> = {};
    if (failed.length) {
      console.log(`  ${failed.length} failed on base; arbitrating with medium...`);
      medium = transcribe(failed.map((c) => path.join(OUT, `${c.id}.mp3`)), "medium");
    }
    let ok = 0;
    for (const c of clips) {
      const f = path.join(OUT, `${c.id}.mp3`);
      const t1 = base[f] ?? "";
      const t2 = medium[f];
      const verified = passes(c.text, t1) || (t2 !== undefined && passes(c.text, t2));
      const prev = manifest.clips[c.id];
      manifest.clips[c.id] = { url: `${URL_BASE}/${c.id}.mp3`, script: c.text, verified, transcript: verified && !passes(c.text, t1) ? t2! : t1, attempts: prev?.attempts ?? 1 };
      if (verified) ok++;
      else console.log(`  STILL UNVERIFIED ${c.id} | ${c.text} | base: ${t1} | medium: ${t2 ?? ""}`);
    }
    manifest.generatedAt = new Date().toISOString();
    await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`verified ${ok}/${clips.length}`);
    process.exit(ok === clips.length ? 0 : 1);
  }

  // 1. Decide what needs synthesis: missing file, changed script, unverified, or --force.
  for (const c of clips) {
    const file = path.join(OUT, `${c.id}.mp3`);
    const prev = manifest.clips[c.id];
    const exists = await fs.stat(file).then(() => true).catch(() => false);
    if (FORCE || !exists || !prev || prev.script !== c.text || !prev.verified) pending.set(c.id, c);
  }
  console.log(`${pending.size} to synthesize, ${clips.length - pending.size} already verified`);

  // 2. Synthesize + verify in rounds; failures retry with a fresh synthesis.
  const attempts = new Map<string, number>();
  for (let round = 1; round <= MAX_ATTEMPTS && pending.size; round++) {
    console.log(`\nround ${round}: ${pending.size} clips`);
    const done: string[] = [];
    for (const c of pending.values()) {
      process.stdout.write(`  ${c.id.padEnd(28)} `);
      const buf = await synth(c.text);
      attempts.set(c.id, (attempts.get(c.id) ?? 0) + 1);
      if (!buf) {
        console.log("synth failed");
        continue;
      }
      await fs.writeFile(path.join(OUT, `${c.id}.mp3`), buf);
      console.log(`${(buf.length / 1024).toFixed(0)} KB`);
      done.push(c.id);
    }
    const files = done.map((id) => path.join(OUT, `${id}.mp3`));
    console.log(`  whisper (base) on ${files.length} clips...`);
    const tx = transcribe(files);
    for (const id of done) {
      const c = pending.get(id)!;
      const transcript = tx[path.join(OUT, `${id}.mp3`)] ?? "";
      const ok = passes(c.text, transcript);
      manifest.clips[id] = { url: `${URL_BASE}/${id}.mp3`, script: c.text, verified: ok, transcript, attempts: attempts.get(id) ?? 1 };
      if (ok) pending.delete(id);
      else console.log(`  MISMATCH ${id}\n     script:     ${c.text}\n     transcript: ${transcript}`);
    }
    manifest.generatedAt = new Date().toISOString();
    await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  }

  // 3. Arbitrate stubborn mismatches with the larger model before giving up.
  if (pending.size) {
    console.log(`\narbitrating ${pending.size} clips with whisper medium...`);
    const files = [...pending.keys()].map((id) => path.join(OUT, `${id}.mp3`));
    const tx = transcribe(files, "medium");
    for (const id of [...pending.keys()]) {
      const c = pending.get(id)!;
      const transcript = tx[path.join(OUT, `${id}.mp3`)] ?? "";
      const ok = passes(c.text, transcript);
      manifest.clips[id] = { ...manifest.clips[id], transcript, verified: ok };
      if (ok) pending.delete(id);
    }
    await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  }

  const verified = Object.values(manifest.clips).filter((m) => m.verified).length;
  console.log(`\nmanifest: ${MANIFEST}`);
  console.log(`verified ${verified}/${clips.length}; unverified: ${[...pending.keys()].join(", ") || "none"}`);
  process.exit(pending.size ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
