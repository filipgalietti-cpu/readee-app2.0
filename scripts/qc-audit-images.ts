/**
 * Image audit — runs the existing vision judge (judgeImageQuality) over
 * every lesson slide image and flags slop / hallucinated text / scene
 * mismatch (rulebook #19). Read-only; writes the verdict list to
 * scripts/image-audit.json.
 *
 *   npx tsx scripts/qc-audit-images.ts --standard=L.3.4   # one lesson
 *   npx tsx scripts/qc-audit-images.ts --grade="3rd Grade"
 *   npx tsx scripts/qc-audit-images.ts                     # whole catalog
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { judgeImageQuality } from "../lib/ai/qc-media";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const args = process.argv.slice(2);
const STD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;
const GRADE = args.find((a) => a.startsWith("--grade="))?.split("=")[1] ?? null;
const LIMIT = args.find((a) => a.startsWith("--limit="))?.split("=")[1];

function imageUrl(imageFile: string, regenAt?: string): string {
  const v = regenAt ? `?v=${encodeURIComponent(regenAt)}` : "";
  return `${SUPA}/storage/v1/object/public/${imageFile}${v}`;
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  let targets = lessons.filter((l) => l.standardId);
  if (STD) targets = targets.filter((l) => l.standardId === STD);
  if (GRADE) targets = targets.filter((l) => l.grade === GRADE);
  if (LIMIT) targets = targets.slice(0, Number(LIMIT));

  // Flatten every image into a work list, then judge with a concurrency
  // pool + per-call timeout (one slow/bad URL can't stall the whole run).
  const work: { std: string; slide: number; file: string; url: string; scene: string }[] = [];
  for (const l of targets) {
    for (const s of l.slides ?? []) {
      if (!s.imageFile) continue;
      work.push({
        std: l.standardId, slide: s.slide, file: s.imageFile,
        url: imageUrl(s.imageFile, s.imageRegenAt),
        scene: String(s.imagePrompt ?? s.heading ?? "").slice(0, 400),
      });
    }
  }
  console.log(`${work.length} images to judge, concurrency 6…`);

  const fails: any[] = [];
  const warns: any[] = [];
  let passed = 0;
  let judged = 0;
  const CONC = 6;
  let idx = 0;

  async function worker() {
    while (idx < work.length) {
      const w = work[idx++];
      const r: any = await Promise.race([
        judgeImageQuality({ imageUrl: w.url, expectedScene: w.scene }),
        new Promise((res) => setTimeout(() => res({ ok: false, error: "timeout" }), 40000)),
      ]);
      judged++;
      if (judged % 25 === 0) console.error(`  …${judged}/${work.length} (${fails.length} fail, ${warns.length} warn)`);
      if (!r.ok) continue;
      if (r.severity === "fail") fails.push({ std: w.std, slide: w.slide, file: w.file, reason: r.reason });
      else if (r.severity === "warn") warns.push({ std: w.std, slide: w.slide, file: w.file, reason: r.reason });
      else passed++;
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()));
  console.log(`\n\n═══ IMAGE AUDIT ═══`);
  console.log(`judged ${judged} images: ${passed} pass · ${warns.length} warn · ${fails.length} FAIL\n`);
  for (const f of fails) console.log(`  ✗ ${f.std} S${f.slide}: ${f.reason}`);
  await fs.writeFile(
    path.resolve(process.cwd(), "scripts/image-audit.json"),
    JSON.stringify({ fails, warns, passed, judged }, null, 2),
  );
  console.log(`\n(full list → scripts/image-audit.json)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
