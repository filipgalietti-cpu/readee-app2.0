/**
 * Re-record specific narration clips after their script changed.
 *
 * Editing a lesson's wording silently desynchronises it from the audio: the file
 * still plays the OLD sentence while the data claims the new one, and nothing in
 * the pipeline notices. Whole-lesson regeneration is the blunt alternative, and
 * it re-rolls every clip in the lesson including ones that were fine - which is
 * how a heal run once made things worse.
 *
 * Ship-gated the same way as gen-option-audio: a clip whose duration is
 * impossible for its script is rejected and never replaces the existing file.
 *
 *   npx tsx scripts/v2-assets/regen-narration.ts <lesson/sceneId> [...]
 */
import { LESSONS } from "../../app/data/lessons-v2";
import { generateSpeechVertex } from "../../lib/ai/vertex-tts";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const VOICE = "Autonoe";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isRateLimit = (m: string) => /429|RESOURCE_EXHAUSTED|Quota exceeded/i.test(m);

async function synth(text: string): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    let err = "";
    const res = await generateSpeechVertex({ text, voice: VOICE }).catch((e) => {
      err = e instanceof Error ? e.message : String(e);
      return null;
    });
    if (!res || !res.ok || !res.pcmBase64) {
      const msg = err || (res && !res.ok ? res.error : "") || "";
      if (isRateLimit(msg) && attempt < 4) {
        await sleep([8000, 20000, 45000, 90000][attempt]);
        continue;
      }
      console.log(`    synth failed: ${msg || "unknown"}`);
      return null;
    }
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "renarr-"));
    try {
      const pcm = path.join(tmp, "a.pcm");
      const mp3 = path.join(tmp, "a.mp3");
      await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
      const r = spawnSync("ffmpeg", [
        "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm,
        "-af", "loudnorm=I=-18:TP=-2:LRA=7", "-codec:a", "libmp3lame", "-qscale:a", "2", mp3,
      ]);
      if (r.status !== 0) return null;
      return await fs.readFile(mp3);
    } finally {
      await fs.rm(tmp, { recursive: true, force: true });
    }
  }
  return null;
}

const durationOf = (f: string) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]);
  return r.status === 0 ? parseFloat(r.stdout.toString().trim()) || 0 : 0;
};

async function main() {
  const targets = process.argv.slice(2);
  if (!targets.length) {
    console.error("Usage: npx tsx scripts/v2-assets/regen-narration.ts <lesson/sceneId> [...]");
    process.exit(1);
  }
  for (const t of targets) {
    const [slug, ...rest] = t.split("/");
    const sceneId = rest.join("/");
    const lesson = (LESSONS as Record<string, { lesson: { scenes: Record<string, any>[] } }>)[slug]?.lesson;
    const scene = lesson?.scenes.find((s) => s.id === sceneId);
    const script = scene?.narration?.script;
    if (!script) {
      console.log(`  ✗ ${t}: no narration script found`);
      continue;
    }
    process.stdout.write(`  ${t} … `);
    const buf = await synth(script);
    if (!buf) {
      console.log("FAILED");
      continue;
    }
    const out = path.join("public/audio/lessons-v2", slug, `${sceneId}.mp3`);
    const cand = `${out}.candidate`;
    await fs.writeFile(cand, buf);
    const secs = durationOf(cand);
    // Narration runs about 2 words a second; a clip far outside that never
    // matched the script it claims to read.
    const words = script.trim().split(/\s+/).length;
    const lo = words / 3.4;
    const hi = words / 1.05 + 3;
    if (secs < lo || secs > hi) {
      await fs.rm(cand, { force: true });
      console.log(`REJECTED ${secs.toFixed(1)}s for ${words} words (expected ${lo.toFixed(0)}-${hi.toFixed(0)}s)`);
      continue;
    }
    await fs.rename(cand, out);
    console.log(`ok ${secs.toFixed(1)}s / ${words} words`);
  }
  console.log("\n  ‼️ Timings are now stale for these scenes. Re-run:");
  console.log("     python3 scripts/lesson-timings.py <lesson>");
}

main().catch((e) => { console.error(e); process.exit(1); });
