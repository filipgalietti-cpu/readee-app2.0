import fs from "node:fs";
import { runLessonSpecChecks } from "../lib/qc/spec-checks";
import { CANON_STANDARDS, isCanonLesson, summarizeStructure } from "../lib/qc/lesson-canon";

const lessons = JSON.parse(fs.readFileSync("app/data/sample-lessons.json", "utf-8"));

console.log("=== Canon lessons (should produce ZERO canon_* findings) ===");
let canonFails = 0;
for (const l of lessons as any[]) {
  if (!isCanonLesson(l.standardId)) continue;
  const findings = runLessonSpecChecks(l);
  const canonOnly = findings.filter((f) => f.findingType.startsWith("lesson.canon_"));
  console.log(`  ${l.standardId.padEnd(10)} · ${summarizeStructure(l)}`);
  if (canonOnly.length === 0) {
    console.log(`    ✓ 0 canon findings`);
  } else {
    canonFails += canonOnly.length;
    console.log(`    ✗ ${canonOnly.length} canon findings:`);
    for (const f of canonOnly) console.log(`      - ${f.findingType}: ${f.message}`);
  }
}

const all = lessons as any[];
const nonCanon = all.filter((l) => !isCanonLesson(l.standardId));
let totalDrift = 0;
const countByType: Record<string, number> = {};
for (const l of nonCanon) {
  const findings = runLessonSpecChecks(l);
  for (const f of findings) {
    if (!f.findingType.startsWith("lesson.canon_")) continue;
    totalDrift++;
    countByType[f.findingType] = (countByType[f.findingType] ?? 0) + 1;
  }
}
console.log(`\n=== ${nonCanon.length} non-canon lessons → ${totalDrift} canon_drift findings ===`);
const sorted = Object.entries(countByType).sort((a, b) => b[1] - a[1]);
for (const [type, count] of sorted) console.log(`  ${count.toString().padStart(4)} · ${type}`);

console.log(`\n=== Sample 5 non-canon lessons (drift detail) ===`);
for (const l of nonCanon.slice(0, 5)) {
  const findings = runLessonSpecChecks(l).filter((f) => f.findingType.startsWith("lesson.canon_"));
  console.log(`\n  ${l.standardId.padEnd(10)} · ${summarizeStructure(l)}`);
  for (const f of findings) console.log(`    - ${f.findingType.padEnd(50)} ${f.message.slice(0, 80)}`);
}

if (canonFails > 0) {
  console.log(`\n✗ CANON BROKEN — ${canonFails} findings on the 5 reference lessons`);
  process.exit(1);
}
console.log(`\n✓ Canon clean. ${totalDrift} drift findings ready for heal pipeline.`);
