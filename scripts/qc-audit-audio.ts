/**
 * Audio audit (rulebook #18) — runs the existing audio judge
 * (judgeAudioFile) over lesson-step TTS clips and flags mispronunciations
 * / garbled speech / the clap-SFX leak / reading the wrong words.
 *
 * The catalog has ~thousands of clips, so this is SCOPED by default —
 * run it in batches (by grade / standard / limit) to avoid hammering the
 * Gemini API while other jobs run. Concurrency 4 + per-call timeout.
 *
 *   npx tsx scripts/qc-audit-audio.ts --standard=L.4.4b      # one lesson
 *   npx tsx scripts/qc-audit-audio.ts --grade="4th Grade"
 *   npx tsx scripts/qc-audit-audio.ts --limit=200            # first 200 clips
 *
 * Writes scripts/audio-audit.json. Read-only on lesson data.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { judgeAudioFile } from "../lib/ai/qc-media";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const CONC = 8; // Gemini Flash high-quota — push throughput on the 2.4k clips

const args = process.argv.slice(2);
const STD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;
const GRADE = args.find((a) => a.startsWith("--grade="))?.split("=")[1] ?? null;
const LIMIT = args.find((a) => a.startsWith("--limit="))?.split("=")[1];

function audioUrl(file: string, regenAt?: string): string {
  const v = regenAt ? `?v=${encodeURIComponent(regenAt)}` : "";
  return `${SUPA}/storage/v1/object/public/${file}${v}`;
}
function timed<T>(p: Promise<T>, ms: number, fb: T): Promise<T> {
  return Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fb), ms))]);
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  let targets = lessons.filter((l) => l.standardId);
  if (STD) targets = targets.filter((l) => l.standardId === STD);
  if (GRADE) targets = targets.filter((l) => l.grade === GRADE);

  // Flatten every step clip into a work list.
  let work: { std: string; slide: number; sub: string; url: string; text: string }[] = [];
  for (const l of targets) {
    for (const s of l.slides ?? []) {
      if (s.type === "mcq") continue;
      for (const st of s.steps ?? []) {
        if (!st.audioFile || !st.ttsScript) continue;
        work.push({
          std: l.standardId, slide: s.slide, sub: st.sub,
          url: audioUrl(st.audioFile, st.audioRegenAt),
          text: String(st.ttsScript),
        });
      }
    }
  }
  if (LIMIT) work = work.slice(0, Number(LIMIT));
  console.log(`${work.length} audio clips to judge, concurrency ${CONC}…`);

  const fails: any[] = [];
  const warns: any[] = [];
  let passed = 0, judged = 0, idx = 0;

  async function worker() {
    while (idx < work.length) {
      const w = work[idx++];
      const r: any = await timed(
        judgeAudioFile({ audioUrl: w.url, expectedText: w.text }),
        40000, { ok: false, error: "timeout" },
      );
      judged++;
      if (judged % 25 === 0) console.error(`  …${judged}/${work.length} (${fails.length} fail, ${warns.length} warn)`);
      if (!r.ok) continue;
      const rec = { std: w.std, slide: w.slide, sub: w.sub, reason: r.reason };
      if (r.severity === "fail") fails.push(rec);
      else if (r.severity === "warn") warns.push(rec);
      else passed++;
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));

  console.log(`\n═══ AUDIO AUDIT ═══`);
  console.log(`judged ${judged}: ${passed} pass · ${warns.length} warn · ${fails.length} FAIL\n`);
  for (const f of fails.slice(0, 20)) console.log(`  ✗ ${f.std} S${f.slide}${f.sub}: ${f.reason?.slice(0, 80)}`);
  await fs.writeFile(
    path.resolve(process.cwd(), "scripts/audio-audit.json"),
    JSON.stringify({ fails, warns, passed, judged }, null, 2),
  );
  console.log(`\n(full list → scripts/audio-audit.json)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
