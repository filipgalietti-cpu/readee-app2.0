/**
 * Lesson grader — scores every lesson against Claude's rubric (derived
 * from the 25 golden bullet points) and flags ones that need work or
 * MORE CONTENT. Deterministic proxies for the measurable metrics; the
 * subjective read is layered on top by Claude for the flagged ones.
 *
 *   npx tsx scripts/qc-grade-lessons.ts            # full scorecard → scripts/lesson-grades.json
 *   npx tsx scripts/qc-grade-lessons.ts --worst    # just the ones needing work
 *
 * Metrics (1-5):
 *   Clarity   — terse anchors, no transcript/crammed/fragment (detector flags)
 *   Structure — full canon shape (intro→teach→example→tip→practice-intro→mcq) + a real Q→A example
 *   Content   — enough teaching substance; LOW = thin / needs more content
 *               (too few steps, or too much of the slide is audio-only with no visual anchor)
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { runLessonSpecChecks } from "../lib/qc/spec-checks";
import { isCanonLesson } from "../lib/qc/lesson-canon";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const ARCH = new Set(["slide.text_is_transcript", "slide.crammed_pill", "slide.qa_not_terse", "slide.fragmented_pill"]);
const WORST = process.argv.includes("--worst");

function hasVisual(st: any): boolean {
  return !!(st.displayText || st.displayParts || st.displayTableRow || st.displayDiagram || st.displayAlphabetGrid || st.displayDiagramSwap);
}
function hasQAExample(lesson: any): boolean {
  const ex = (lesson.slides ?? []).find((s: any) => s.type === "example");
  if (!ex) return false;
  return (ex.steps ?? []).some((st: any) => {
    const dp = st.displayParts;
    return Array.isArray(dp) && dp.length === 2 && typeof dp[0]?.text === "string" && dp[0].text.trim().endsWith("?");
  });
}

function grade(lesson: any) {
  const slides = (lesson.slides ?? []).filter((s: any) => s.type !== "mcq");
  const types = slides.map((s: any) => s.type);
  const steps = slides.flatMap((s: any) => s.steps ?? []);
  const issues: string[] = [];

  // CLARITY — detector flags
  const flags = runLessonSpecChecks(lesson).filter((f: any) => ARCH.has(f.findingType)).length;
  const clarity = flags === 0 ? 5 : flags <= 2 ? 4 : flags <= 4 ? 3 : flags <= 7 ? 2 : 1;
  if (flags) issues.push(`${flags} clarity flag(s)`);

  // STRUCTURE — canon shape + real Q→A example
  let structure = 5;
  for (const need of ["intro", "teach", "example", "tip", "practice-intro"]) {
    if (!types.includes(need)) { structure -= 1; issues.push(`missing ${need}`); }
  }
  const hasMcq = (lesson.slides ?? []).some((s: any) => s.type === "mcq");
  if (!hasMcq) { structure -= 1; issues.push("no mcq"); }
  if (types.includes("example") && !hasQAExample(lesson)) { structure -= 1; issues.push("example has no Q→A"); }
  structure = Math.max(1, structure);

  // CONTENT depth — thin if too few steps or too much audio-only
  const audioOnly = steps.filter((st: any) => !hasVisual(st)).length;
  const audioRatio = steps.length ? audioOnly / steps.length : 1;
  const teachBeats = slides.filter((s: any) => s.type === "teach").reduce((n: number, s: any) => n + (s.steps?.length ?? 0), 0);
  let content = 5;
  if (steps.length < 12) { content -= 1; }
  if (audioRatio > 0.55) { content -= 2; issues.push(`${Math.round(audioRatio * 100)}% audio-only (sparse)`); }
  else if (audioRatio > 0.4) { content -= 1; }
  if (teachBeats < 4) { content -= 1; issues.push(`only ${teachBeats} teach beats`); }
  content = Math.max(1, content);
  const needsContent = content <= 2;

  const overall = +((clarity + structure + content) / 3).toFixed(1);
  return { std: lesson.standardId, title: lesson.title, grade: lesson.grade, clarity, structure, content, overall, needsContent, issues };
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));
  const graded = lessons.filter((l) => l.standardId && !isCanonLesson(l.standardId)).map(grade).sort((a, b) => a.overall - b.overall);

  await fs.writeFile(path.resolve(process.cwd(), "scripts/lesson-grades.json"), JSON.stringify(graded, null, 2));

  const dist = { "≤2.5": 0, "2.6-3.5": 0, "3.6-4.4": 0, "4.5+": 0 };
  for (const g of graded) {
    if (g.overall <= 2.5) dist["≤2.5"]++; else if (g.overall <= 3.5) dist["2.6-3.5"]++; else if (g.overall < 4.5) dist["3.6-4.4"]++; else dist["4.5+"]++;
  }
  console.log(`\n═══ GRADED ${graded.length} non-canon lessons ═══`);
  console.log(`distribution:`, dist);
  console.log(`needs MORE CONTENT: ${graded.filter((g) => g.needsContent).length}\n`);

  const show = WORST ? graded.filter((g) => g.overall < 3.5 || g.needsContent) : graded.slice(0, 30);
  console.log(`── ${WORST ? "all needing work" : "worst 30"} (clarity/structure/content) ──`);
  for (const g of show) {
    console.log(`  ${g.overall}  C${g.clarity}/S${g.structure}/D${g.content}${g.needsContent ? " 📄+content" : ""}  ${g.std} — ${g.title}`);
    if (g.issues.length) console.log(`        ${g.issues.join(" · ")}`);
  }
  console.log(`\n(full scorecard → scripts/lesson-grades.json)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
