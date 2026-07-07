/**
 * Generate audio for ONLY the slides marked `_new:true` (the Pass-3
 * examples + teach beats merged by merge-content-add.ts). Vertex Autonoe
 * -> mp3 -> upload -> stamp audioRegenAt -> clear the _new flag. Existing
 * audio is never touched.
 *
 *   npx tsx scripts/gen-new-slide-audio.ts --dry
 *   npx tsx scripts/gen-new-slide-audio.ts --apply
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

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const VOICE = "Autonoe";
const CONC = 4;
const APPLY = process.argv.includes("--apply");

function timed<T>(p: Promise<T>, ms: number, fb: T): Promise<T> {
  return Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fb), ms))]);
}
async function synth(text: string): Promise<Buffer | null> {
  for (let a = 0; a < 5; a++) {
    try {
      const res: any = await timed(generateSpeechVertex({ text, voice: VOICE }).catch((e: any) => ({ ok: false, error: String(e?.message ?? e) })), 60000, { ok: false, error: "timeout" });
      if (!res.ok) {
        if (/429|quota|rate|exhaust|econnreset|fetch failed|timeout|socket|network/i.test(String(res.error ?? ""))) { await new Promise((r) => setTimeout(r, 3000 * (a + 1))); continue; }
        return null;
      }
      const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ns-"));
      const pcm = path.join(tmp, "a.pcm"), mp3 = path.join(tmp, "a.mp3");
      await fs.writeFile(pcm, Buffer.from(res.pcmBase64, "base64"));
      const ff = spawnSync("ffmpeg", ["-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm, "-codec:a", "libmp3lame", "-qscale:a", "2", mp3], { encoding: "utf-8" });
      if (ff.status !== 0) return null;
      return await fs.readFile(mp3);
    } catch { await new Promise((r) => setTimeout(r, 3000 * (a + 1))); }
  }
  return null;
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const work: { std: string; slide: any; step: any }[] = [];
  for (const l of lessons) for (const s of l.slides ?? []) if (s._new) for (const st of s.steps ?? []) if (st.ttsScript && st.audioFile) work.push({ std: l.standardId, slide: s, step: st });

  console.log(`\n${APPLY ? "APPLY" : "DRY"} · ${work.length} new-slide clips (${lessons.filter((l) => (l.slides ?? []).some((s: any) => s._new)).length} lessons)\n`);
  if (!APPLY) { for (const w of work.slice(0, 12)) console.log(`  ${w.std} ${w.step.audioFile}: "${String(w.step.ttsScript).slice(0, 55)}"`); return; }

  const sb = createClient(SUPA, SERVICE);
  let idx = 0, ok = 0, bad = 0, done = 0;
  const failed = new Set<string>(); // audioFiles that did not generate+upload
  async function worker() {
    while (idx < work.length) {
      const w = work[idx++];
      try {
        const mp3 = await synth(String(w.step.ttsScript));
        if (mp3) {
          const up: any = await sb.storage.from("audio").upload(String(w.step.audioFile).replace(/^audio\//, ""), mp3, { contentType: "audio/mpeg", upsert: true, cacheControl: "no-cache" }).catch((e: any) => ({ error: { message: String(e) } }));
          if (!up.error) { w.step.audioRegenAt = new Date().toISOString(); ok++; } else { bad++; failed.add(String(w.step.audioFile)); }
        } else { bad++; failed.add(String(w.step.audioFile)); }
      } catch { bad++; failed.add(String(w.step.audioFile)); }
      done++;
      if (done % 20 === 0) console.error(`  …${done}/${work.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));

  // clear _new ONLY on slides where every step's clip succeeded; leave failed slides flagged so a re-run picks them up
  const stuck: string[] = [];
  for (const l of lessons) for (const s of l.slides ?? []) if (s._new) {
    const anyFailed = (s.steps ?? []).some((st: any) => st.audioFile && failed.has(String(st.audioFile)));
    if (anyFailed) stuck.push(l.standardId); else delete s._new;
  }
  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  console.log(`\n— ${ok}/${work.length} new clips generated (${bad} failed). ${stuck.length ? `kept _new on: ${[...new Set(stuck)].join(", ")} (re-run to retry)` : "all clear"}. wrote sample-lessons.json —`);
}

main().catch((e) => { console.error(e); process.exit(1); });
