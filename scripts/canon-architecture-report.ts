/**
 * Canon-architecture detector report. Runs the terse-anchor checks
 * (slide.text_is_transcript / slide.crammed_pill / slide.qa_not_terse)
 * across the catalog and quantifies the "not alike to golden" disease.
 *
 *   npx tsx scripts/canon-architecture-report.ts                # catalog summary
 *   npx tsx scripts/canon-architecture-report.ts --standard=RL.1.3   # one lesson, detailed
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { runLessonSpecChecks } from "../lib/qc/spec-checks";
import { isCanonLesson } from "../lib/qc/lesson-canon";

const CANON_FINDINGS = new Set([
  "slide.text_is_transcript",
  "slide.crammed_pill",
  "slide.qa_not_terse",
]);

const args = process.argv.slice(2);
const STD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;

async function main() {
  const lessons: any[] = JSON.parse(
    await fs.readFile(path.resolve(process.cwd(), "app/data/sample-lessons.json"), "utf-8"),
  );

  if (STD) {
    const l = lessons.find((x) => x.standardId === STD);
    if (!l) return console.log(`${STD} not found`);
    const findings = runLessonSpecChecks(l).filter((f) => CANON_FINDINGS.has(f.findingType));
    console.log(`\n${STD} — ${l.title} (${l.grade})  ${isCanonLesson(STD) ? "[CANON]" : ""}`);
    console.log(`canon-architecture flags: ${findings.length}\n`);
    for (const f of findings) {
      console.log(`  ⚑ ${f.targetSubId}  ${f.findingType}`);
      console.log(`     ${f.message}\n`);
    }
    return;
  }

  // Catalog summary
  const byType: Record<string, number> = {};
  const byGrade: Record<string, { lessons: number; flags: number }> = {};
  let dirtyLessons = 0;
  let canonFlags = 0;
  const worst: { std: string; n: number }[] = [];

  for (const l of lessons) {
    if (!l.standardId) continue;
    const findings = runLessonSpecChecks(l).filter((f) => CANON_FINDINGS.has(f.findingType));
    const g = l.grade ?? "?";
    byGrade[g] ??= { lessons: 0, flags: 0 };
    if (findings.length) {
      dirtyLessons++;
      byGrade[g].lessons++;
      byGrade[g].flags += findings.length;
      worst.push({ std: l.standardId, n: findings.length });
      if (isCanonLesson(l.standardId)) canonFlags += findings.length;
      for (const f of findings) byType[f.findingType] = (byType[f.findingType] ?? 0) + 1;
    }
  }

  console.log(`\n═══ Canon-architecture detector — catalog scan ═══`);
  console.log(`lessons with ≥1 flag: ${dirtyLessons} / ${lessons.length}`);
  console.log(`\nBy finding type:`);
  for (const [t, n] of Object.entries(byType).sort((a, b) => b[1] - a[1])) console.log(`  ${t}: ${n}`);
  console.log(`\nBy grade (lessons flagged / total flags):`);
  const order = ["Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade"];
  for (const g of order) if (byGrade[g]) console.log(`  ${g}: ${byGrade[g].lessons} lessons, ${byGrade[g].flags} flags`);
  console.log(`\n⚠ CANON lessons should have ZERO flags. Canon flags found: ${canonFlags}` +
    (canonFlags === 0 ? "  ✓ calibrated" : "  ✗ check the detector — it's flagging the golden set"));
  console.log(`\nWorst 15 offenders:`);
  for (const w of worst.sort((a, b) => b.n - a.n).slice(0, 15)) console.log(`  ${w.std}: ${w.n} flags`);
  console.log("");
}

main().catch((e) => { console.error(e); process.exit(1); });
