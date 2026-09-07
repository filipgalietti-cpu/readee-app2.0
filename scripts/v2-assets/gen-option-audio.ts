/**
 * Give every tappable answer a real voice.
 *
 * Only 17% of the catalogue's answer tiles had an Autonoe clip. The other 3,212
 * fell through to `speechSynthesis` - the browser's robot - which is what Filip
 * heard on almost every choice in the two lessons he reviewed.
 *
 * ‼️ NOT EVERY TILE SHOULD BE READ ALOUD, which is why this is not a blind loop
 * over all 3,212. Two exclusions, both because speaking them teaches nothing:
 *
 *   VISUAL-ONLY (58 items). Scenes whose options differ only by capitalisation,
 *   comma position, spacing or syllable split - "Tap the word that could START a
 *   sentence", "Tap the date with the comma in the right spot", "Where does
 *   pencil break?". Every option is pronounced identically, so reading them
 *   hands the child no information and quietly implies all of them are right.
 *
 *   PUNCTUATION GLYPHS (7 items). Reading "?" as a sound is meaningless; the
 *   name is what teaches, so those are synthesised as "question mark" and
 *   friends rather than skipped.
 *
 * Matches scripts/lesson-tts.ts exactly - same Autonoe voice, same 24 kHz mono
 * pipeline, same loudnorm - so a generated tile sits in the same lesson as an
 * existing clip without a level jump.
 *
 * ‼️ AND IT SHIP-GATES ITS OWN OUTPUT. Every other V2 pipeline script prints a
 * byte count and calls it proof ("size printed = proof the file downloaded"),
 * which is exactly how seven clips of Gemini answering conversationally reached
 * production - a Kindergartener tapping "M" hears ten seconds about shades of
 * green. A clip whose duration is impossible for its text is rejected and never
 * written.
 *
 *   npx tsx scripts/v2-assets/gen-option-audio.ts --dry-run
 *   npx tsx scripts/v2-assets/gen-option-audio.ts [--lesson=<slug>] [--limit=N]
 */
import { LESSONS } from "../../app/data/lessons-v2";
import { generateSpeechVertex } from "../../lib/ai/vertex-tts";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";

const VOICE = "Autonoe";
const DRY = process.argv.includes("--dry-run");
const ONLY = (process.argv.find((a) => a.startsWith("--lesson=")) ?? "").split("=")[1] ?? "";
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) ?? "").split("=")[1] ?? 0);

/** Punctuation is taught by name, never by glyph. */
const PUNCT_NAME: Record<string, string> = {
  ".": "period",
  "?": "question mark",
  "!": "exclamation mark",
  ",": "comma",
  ";": "semicolon",
  ":": "colon",
  "'": "apostrophe",
  '"': "quotation mark",
};
const PUNCT = /^[.,!?;:"']+$/;

/** What two labels sound like. Equal here means a child cannot tell them apart. */
const spoken = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

type Job = { slug: string; scene: string; label: string; say: string; out: string };

function plan(): { jobs: Job[]; skippedVisual: number; skippedPunct: number; have: number } {
  const jobs: Job[] = [];
  let skippedVisual = 0,
    skippedPunct = 0,
    have = 0;

  for (const [slug, entry] of Object.entries(LESSONS)) {
    if (ONLY && slug !== ONLY) continue;
    for (const scene of (entry.lesson as unknown as { scenes: Record<string, any>[] }).scenes) {
      const it = scene.interaction as Record<string, any> | undefined;
      if (!it) continue;
      const opts: Record<string, any>[] = it.options ?? it.items ?? [];
      const labels = opts.map((o) => String(o.label ?? o.word ?? "")).filter(Boolean);
      const norm = labels.map(spoken);
      // Any collision means the SET is distinguished visually, not audibly.
      const visualOnly = labels.length > 1 && norm.length !== new Set(norm).size;

      for (const o of opts) {
        const label = String(o.label ?? o.word ?? "");
        if (!label) continue;
        const out = path.join("public/audio/lessons-v2", slug, "words", `${label.toLowerCase()}.mp3`);
        if (o.audio || fsSync.existsSync(out)) {
          have++;
          continue;
        }
        if (visualOnly) {
          skippedVisual++;
          continue;
        }
        if (PUNCT.test(label.trim())) {
          const say = label
            .trim()
            .split("")
            .map((c) => PUNCT_NAME[c] ?? c)
            .join(" ");
          skippedPunct++;
          jobs.push({ slug, scene: scene.id, label, say, out });
          continue;
        }
        jobs.push({ slug, scene: scene.id, label, say: label, out });
      }
    }
  }
  return { jobs, skippedVisual, skippedPunct, have };
}

/** Why the last synthesis failed. A script that swallows this is unfixable. */
let lastError = "";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Vertex enforces a per-MINUTE quota on the TTS model
 * (generate_content_requests_per_minute_per_project_per_base_model). Six at a
 * time burned through it instantly: 764 of 800 clips came back 429, which the
 * first version of this script recorded as a bare "failed" with no reason - the
 * same silent-failure shape it exists to fix.
 *
 * A 429 is not a failure, it is "later", and the window is a minute long, so
 * short retries just re-hit the same wall. Note the limit can arrive EITHER as a
 * thrown error or as a resolved {ok:false}; missing the second path means the
 * retry silently never fires.
 */
const isRateLimit = (msg: string) => /429|RESOURCE_EXHAUSTED|Quota exceeded/i.test(msg);

/** Same encode as scripts/lesson-tts.ts, so levels match inside a lesson. */
async function synthOnce(text: string): Promise<Buffer | null | "rate-limited"> {
  lastError = "";
  const res = await generateSpeechVertex({ text, voice: VOICE }).catch((e) => {
    lastError = e instanceof Error ? e.message : String(e);
    return null;
  });
  if (!res) return isRateLimit(lastError) ? "rate-limited" : null;
  if (!res.ok) {
    lastError = res.error ?? "generateSpeechVertex returned ok:false";
    return isRateLimit(lastError) ? "rate-limited" : null;
  }
  if (!res.pcmBase64) {
    lastError = "no audio in a successful response";
    return null;
  }

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "opt-tts-"));
  try {
    const pcm = path.join(tmp, "a.pcm");
    const mp3 = path.join(tmp, "a.mp3");
    await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
    const r = spawnSync("ffmpeg", [
      "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm,
      "-af", "loudnorm=I=-18:TP=-2:LRA=7", "-codec:a", "libmp3lame", "-qscale:a", "2", mp3,
    ]);
    if (r.status !== 0) {
      lastError = `ffmpeg exited ${r.status}`;
      return null;
    }
    return await fs.readFile(mp3);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}

async function synth(text: string): Promise<Buffer | null> {
  const waits = [8000, 20000, 45000, 90000];
  for (let attempt = 0; ; attempt++) {
    const r = await synthOnce(text);
    if (r !== "rate-limited") return r;
    if (attempt >= waits.length) {
      lastError = "rate limited after 4 backoffs";
      return null;
    }
    await sleep(waits[attempt]);
  }
}

function durationOf(file: string): number {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  return r.status === 0 ? parseFloat(r.stdout.toString().trim()) || 0 : 0;
}

/**
 * The ship gate. A single word takes about a second; ten seconds means the model
 * started a conversation instead of reading the label. Generous on purpose - it
 * exists to catch the absurd, not to police delivery.
 */
function plausible(say: string, seconds: number): { ok: boolean; why?: string } {
  if (!seconds) return { ok: false, why: "unreadable / zero duration" };
  const words = say.trim().split(/\s+/).length;
  const ceiling = 1.6 + 0.9 * words + 0.06 * say.length;
  if (seconds > ceiling) return { ok: false, why: `${seconds.toFixed(2)}s for "${say}" (ceiling ${ceiling.toFixed(1)}s)` };
  if (seconds < 0.25) return { ok: false, why: `${seconds.toFixed(2)}s is too short to contain speech` };
  return { ok: true };
}

async function main() {
  const { jobs, skippedVisual, skippedPunct, have } = plan();
  const todo = LIMIT ? jobs.slice(0, LIMIT) : jobs;

  console.log(`  already voiced        : ${have}`);
  console.log(`  to generate           : ${jobs.length}${LIMIT ? ` (limited to ${todo.length})` : ""}`);
  console.log(`  skipped, visual-only  : ${skippedVisual}`);
  console.log(`  punctuation, by name  : ${skippedPunct}`);
  if (DRY) {
    for (const j of todo.slice(0, 12)) console.log(`    ${j.slug}/${j.label}${j.say !== j.label ? ` -> "${j.say}"` : ""}`);
    if (todo.length > 12) console.log(`    … and ${todo.length - 12} more`);
    return;
  }
  if (!todo.length) return;

  let ok = 0,
    done = 0;
  const rejected: string[] = [];
  const failed: string[] = [];
  // Paced deliberately: the model has a per-minute request quota and exceeding
  // it fails the clip rather than queueing it.
  // Two at a time keeps inside the per-minute TTS quota with room for retries.
  const CONCURRENCY = 2;

  async function run(j: Job) {
    try {
      const buf = await synth(j.say);
      if (!buf) {
        failed.push(`${j.slug}/${j.label}: ${lastError || "unknown"}`);
        return;
      }
      await fs.mkdir(path.dirname(j.out), { recursive: true });
      // Write to a candidate name, gate it, and only then let it become the
      // real clip. A rejected generation must never be able to ship.
      const tmp = `${j.out}.candidate`;
      await fs.writeFile(tmp, buf);
      const verdict = plausible(j.say, durationOf(tmp));
      if (!verdict.ok) {
        await fs.rm(tmp, { force: true });
        rejected.push(`${j.slug}/${j.label}: ${verdict.why}`);
      } else {
        await fs.rename(tmp, j.out);
        ok++;
      }
    } catch (e) {
      failed.push(`${j.slug}/${j.label}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      if (++done % 100 === 0 || done === todo.length) {
        console.log(`  ${done}/${todo.length}  written ${ok}  rejected ${rejected.length}  failed ${failed.length}`);
      }
    }
  }

  const queue = [...todo];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (;;) {
        const j = queue.shift();
        if (!j) return;
        await run(j);
      }
    }),
  );

  console.log(`\n  wrote ${ok} clips`);
  if (rejected.length) {
    console.log(`\n  ${rejected.length} REJECTED by the ship gate (not written):`);
    rejected.slice(0, 20).forEach((r) => console.log(`    ${r}`));
  }
  if (failed.length) {
    console.log(`\n  ${failed.length} generation failures (re-run to retry):`);
    failed.slice(0, 10).forEach((f) => console.log(`    ${f}`));
  }
  console.log(`\n  Next: npx tsx scripts/v2-assets/upload-missing.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
