/**
 * Lesson judge runner — produces the EXCEPTION LIST a human reviews,
 * instead of auditing every lesson one-by-one.
 *
 * For each lesson, the AI judge scores it 1-5 against the nearest golden
 * canon lesson. Score 4-5 ships; ≤3 lands on the exception list.
 *
 *   npx tsx scripts/qc-judge-lessons.ts --grade="1st Grade"
 *   npx tsx scripts/qc-judge-lessons.ts --standard=RL.1.3
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { judgeLesson } from "../lib/qc/lesson-judge";
import { isCanonLesson } from "../lib/qc/lesson-canon";
import { skillTypeForStandard, type SkillType } from "../lib/qc/example-author";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const args = process.argv.slice(2);
const STANDARD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;
const GRADE = args.find((a) => a.startsWith("--grade="))?.split("=")[1] ?? null;
const LIMIT = args.find((a) => a.startsWith("--limit="))?.split("=")[1];

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));

  // Nearest golden canon per skill type.
  const canonBySkill: Record<SkillType, any> = {
    comprehension: lessons.find((l) => l.standardId === "RL.1.1"),
    phonics: lessons.find((l) => l.standardId === "RF.2.3b"),
    vocab: lessons.find((l) => l.standardId === "L.3.4b"),
  };

  let targets = lessons.filter((l) => l.standardId && !isCanonLesson(l.standardId));
  if (STANDARD) targets = targets.filter((l) => l.standardId === STANDARD);
  if (GRADE) targets = targets.filter((l) => l.grade === GRADE);
  if (LIMIT) targets = targets.slice(0, Number(LIMIT));

  console.log(`\nJudging ${targets.length} lesson(s)${GRADE ? ` · ${GRADE}` : ""}…\n`);

  const scored: Array<{ std: string; title: string; score: number; passes: boolean; summary: string; issues: any[] }> = [];
  for (const l of targets) {
    const canon = canonBySkill[skillTypeForStandard(l.standardId)] ?? canonBySkill.comprehension;
    const r = await judgeLesson(l, canon);
    if (!r.ok) { console.log(`  ? ${l.standardId} — judge error: ${r.error}`); continue; }
    scored.push({ std: l.standardId, title: l.title, score: r.score, passes: r.passes, summary: r.summary, issues: r.issues });
    process.stdout.write(r.passes ? "." : "x");
  }
  console.log("\n");

  const passed = scored.filter((s) => s.passes);
  const failed = scored.filter((s) => !s.passes).sort((a, b) => a.score - b.score);

  console.log(`═══ JUDGE RESULTS ═══`);
  console.log(`  ✓ ships (4-5): ${passed.length}`);
  console.log(`  ✗ needs review (≤3): ${failed.length}\n`);

  if (failed.length) {
    console.log(`── EXCEPTION LIST (review these only, worst first) ──\n`);
    for (const f of failed) {
      console.log(`  [${f.score}/5] ${f.std} — ${f.title}`);
      console.log(`        ${f.summary}`);
      for (const iss of f.issues.slice(0, 4)) console.log(`        · slide ${iss.slide}: ${iss.issue}`);
      console.log("");
    }
  }
  // Persist the exception list for the audit surface / next session.
  await fs.writeFile(
    path.resolve(process.cwd(), "scripts/judge-results.json"),
    JSON.stringify({ passed: passed.map((p) => ({ std: p.std, score: p.score })), failed }, null, 2),
  );
  console.log(`(full results → scripts/judge-results.json)\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
