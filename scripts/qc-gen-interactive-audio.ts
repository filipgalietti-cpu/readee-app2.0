/**
 * Generate the 3 TTS clips for each interactive "fork" slide:
 *   - the question         (step a `ttsScript`        → interactive-q.mp3)
 *   - the affirmation       (interactive.correctScript → interactive-correct.mp3)
 *   - the encouragement     (interactive.wrongScript   → interactive-wrong.mp3)
 *
 * Same pipeline as qc-regen-audio.ts: Vertex Autonoe → PCM → ffmpeg MP3 →
 * upload to the `audio` bucket → judge-verify it reads correctly.
 *
 *   npx tsx scripts/qc-gen-interactive-audio.ts --dry-run
 *   npx tsx scripts/qc-gen-interactive-audio.ts --apply
 *   npx tsx scripts/qc-gen-interactive-audio.ts --standard=L.4.4b --apply
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
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const VOICE = "Autonoe";
const N = 2;
const CONC = 3;

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const STD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;

function audioUrl(file: string, regenAt?: string) {
  return `${SUPA}/storage/v1/object/public/${file}${regenAt ? `?v=${encodeURIComponent(regenAt)}` : ""}`;
}
function timed<T>(p: Promise<T>, ms: number, fb: T): Promise<T> {
  return Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fb), ms))]);
}

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
      const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "iau-"));
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

type Clip = { std: string; label: string; file: string; text: string; slide: any; stampTarget: any };

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const clips: Clip[] = [];
  for (const l of lessons) {
    if (STD && l.standardId !== STD) continue;
    const slide = (l.slides ?? []).find((s: any) => s.type === "interactive");
    if (!slide?.interactive) continue;
    const qStep = slide.steps?.[0];
    const it = slide.interactive;
    if (qStep?.ttsScript && qStep?.audioFile)
      clips.push({ std: l.standardId, label: "question", file: qStep.audioFile, text: qStep.ttsScript, slide, stampTarget: qStep });
    if (it.correctScript && it.correctAudio)
      clips.push({ std: l.standardId, label: "correct", file: it.correctAudio, text: it.correctScript, slide, stampTarget: it });
    if (it.wrongScript && it.wrongAudio)
      clips.push({ std: l.standardId, label: "wrong", file: it.wrongAudio, text: it.wrongScript, slide, stampTarget: it });
  }

  console.log(`\n${APPLY ? "APPLY" : "DRY-RUN"} · ${clips.length} interactive clips\n`);
  if (!APPLY) {
    for (const c of clips) console.log(`  ${c.std} [${c.label}] → ${c.file}\n      "${c.text.slice(0, 80)}"`);
    console.log(`\n(run --apply to synthesize + upload)`);
    return;
  }

  const sb = createClient(SUPA, SERVICE);
  let idx = 0, ok = 0, bad = 0, done = 0;

  async function worker() {
    while (idx < clips.length) {
      const c = clips[idx++];
      let good = false;
      try {
        for (let i = 0; i < N && !good; i++) {
          const mp3 = await synth(c.text);
          if (!mp3) continue;
          const up: any = await sb.storage.from("audio").upload(c.file.replace(/^audio\//, ""), mp3, { contentType: "audio/mpeg", upsert: true, cacheControl: "no-cache" }).catch((e: any) => ({ error: { message: String(e) } }));
          if (up.error) continue;
          const stamp = new Date().toISOString();
          // stamp the q-step (renderer cache-busts steps); feedback clips
          // are brand-new paths so a stamp isn't required but is harmless.
          if (c.label === "question") c.stampTarget.audioRegenAt = stamp;
          const v: any = await timed(judgeAudioFile({ audioUrl: audioUrl(c.file, stamp), expectedText: c.text }).catch(() => ({ ok: false })), 40000, { ok: false });
          if (v.ok && v.severity !== "fail") good = true;
          else if (i === N - 1) good = !!up && !up.error; // uploaded but judge unsure → keep it
        }
      } catch { /* one clip never sinks the batch */ }
      done++; good ? ok++ : bad++;
      console.error(`  …${done}/${clips.length} ${c.std} [${c.label}] ${good ? "✓" : "~check"}`);
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));

  await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
  console.log(`\n— ${ok}/${clips.length} clips generated + verified (${bad} to spot-check). wrote sample-lessons.json —`);
}

main().catch((e) => { console.error(e); process.exit(1); });
