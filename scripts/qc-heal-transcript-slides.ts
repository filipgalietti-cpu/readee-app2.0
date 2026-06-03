/**
 * Heal handler: transcript slides → terse anchors (the root-cause FIX).
 *
 * Finds intro/teach/tip slides flagged by the canon-architecture detector
 * (slide.text_is_transcript / slide.crammed_pill) and rewrites each pill
 * into a terse anchor, KEEPING the ttsScript + audio untouched (data-only,
 * no asset regen). Re-runs the detector after to prove the flags drop.
 *
 *   npx tsx scripts/qc-heal-transcript-slides.ts --dry-run --standard=RL.1.3
 *   npx tsx scripts/qc-heal-transcript-slides.ts --apply  --standard=RL.1.3
 *   npx tsx scripts/qc-heal-transcript-slides.ts --dry-run --grade="1st Grade" --limit=5
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { rewriteSlide } from "../lib/qc/slide-rewriter";
import { isCanonLesson } from "../lib/qc/lesson-canon";
import {
  checkTranscriptPill,
  checkCrammedPill,
  checkFragmentedPill,
} from "../lib/qc/spec-checks";

const SAMPLE = path.resolve(process.cwd(), "app/data/sample-lessons.json");
const REWRITABLE = new Set(["intro", "teach", "tip", "practice-intro", "example"]);

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : null;
const STANDARD = args.find((a) => a.startsWith("--standard="))?.split("=")[1] ?? null;
const GRADE = args.find((a) => a.startsWith("--grade="))?.split("=")[1] ?? null;

const GRADE_FILE: Record<string, string> = {
  Kindergarten: "kindergarten-standards-questions.json",
  "1st Grade": "1st-grade-standards-questions.json",
  "2nd Grade": "2nd-grade-standards-questions.json",
  "3rd Grade": "3rd-grade-standards-questions.json",
  "4th Grade": "4th-grade-standards-questions.json",
};

async function standardText(grade: string, standardId: string): Promise<string> {
  const file = GRADE_FILE[grade];
  if (!file) return standardId;
  try {
    const data = JSON.parse(await fs.readFile(path.resolve(process.cwd(), "app/data", file), "utf-8"));
    const list = Array.isArray(data) ? data : data.standards ?? [];
    return list.find((s: any) => s.standard_id === standardId)?.standard_description ?? standardId;
  } catch {
    return standardId;
  }
}

/** A slide is "dirty" if any step trips the transcript/crammed detector. */
function slideIsDirty(slide: any): boolean {
  if (!REWRITABLE.has(slide.type)) return false;
  if ((slide.steps ?? []).some((s: any) => s.displayTableRow)) return false; // tables are canon
  for (const st of slide.steps ?? []) {
    if (!checkTranscriptPill(st, slide.type).ok) return true;
    if (!checkCrammedPill(st, slide.type).ok) return true;
    if (!checkFragmentedPill(st).ok) return true;
  }
  return false;
}

function onscreen(st: any): string {
  if (typeof st.displayText === "string") return st.displayText;
  if (Array.isArray(st.displayParts)) return st.displayParts.map((p: any) => p?.text ?? "").join(" ");
  return "(none)";
}

async function main() {
  const lessons: any[] = JSON.parse(await fs.readFile(SAMPLE, "utf-8"));

  // Cleanest anchor-style exemplar per slide type (content is irrelevant —
  // the rewriter copies the STYLE; the new text comes from each slide's
  // own ttsScript). RL.K.1 teach = pure short anchors; RL.1.1 intro/tip.
  const canon: Record<string, any> = {};
  const rlk1 = lessons.find((l) => l.standardId === "RL.K.1");
  const rl11 = lessons.find((l) => l.standardId === "RL.1.1");
  canon.intro = (rl11?.slides ?? []).find((s: any) => s.type === "intro");
  canon.teach = (rlk1?.slides ?? []).find((s: any) => s.type === "teach");
  canon.tip = (rl11?.slides ?? []).find((s: any) => s.type === "tip");
  canon.example = (rl11?.slides ?? []).find((s: any) => s.type === "example");
  canon["practice-intro"] = (rl11?.slides ?? []).find((s: any) => s.type === "practice-intro");

  let targets = lessons.filter((l) => l.standardId && !isCanonLesson(l.standardId));
  if (STANDARD) targets = targets.filter((l) => l.standardId === STANDARD);
  if (GRADE) targets = targets.filter((l) => l.grade === GRADE);
  // Only lessons that actually have dirty slides.
  targets = targets.filter((l) => (l.slides ?? []).some(slideIsDirty));
  if (LIMIT) targets = targets.slice(0, LIMIT);

  console.log(`\n${APPLY ? "APPLY" : "DRY-RUN"} · ${targets.length} lesson(s) with transcript slides` +
    `${STANDARD ? ` · ${STANDARD}` : ""}${GRADE ? ` · ${GRADE}` : ""}\n`);

  let rewroteSlides = 0;
  let failed = 0;
  let wrote = false;

  for (const lesson of targets) {
    const dirty = (lesson.slides ?? []).filter(slideIsDirty);
    console.log(`\n${"=".repeat(68)}`);
    console.log(`${lesson.standardId} — ${lesson.title} (${lesson.grade}) · ${dirty.length} dirty slide(s)`);

    const stdText = await standardText(lesson.grade, lesson.standardId);
    for (const slide of dirty) {
      const ref = canon[slide.type];
      if (!ref) { console.log(`  ✗ slide ${slide.slide} (${slide.type}) — no canon reference`); failed++; continue; }

      const result = await rewriteSlide({
        standardId: lesson.standardId,
        standardText: stdText,
        grade: lesson.grade,
        slide,
        referenceSlide: ref,
      });
      if (!result.ok) { console.log(`  ✗ slide ${slide.slide} (${slide.type}) — ${result.error}`); failed++; continue; }

      console.log(`  ✓ slide ${slide.slide} (${slide.type}) "${slide.heading ?? ""}"`);
      for (const oldStep of slide.steps ?? []) {
        const newStep = result.slide.steps.find((s: any) => s.sub === oldStep.sub);
        const before = onscreen(oldStep);
        const after =
          typeof newStep?.displayText === "string"
            ? `"${newStep.displayText}"`
            : Array.isArray(newStep?.displayParts)
              ? `[${newStep.displayParts.map((p: any) => p.text).join(" | ")}]`
              : "(audio-only)";
        console.log(`      ${oldStep.sub}: "${before.slice(0, 44)}"  →  ${after}`);
      }
      rewroteSlides++;

      if (APPLY) {
        // Replace the slide's steps in place (keep slide identity/order).
        slide.steps = result.slide.steps;
        wrote = true;
      }
    }

    // Show the detector verdict for this lesson after rewrite.
    if (APPLY) {
      const remaining = (lesson.slides ?? []).filter(slideIsDirty).length;
      console.log(`  → after rewrite: ${remaining} dirty slide(s) remaining`);
    }
  }

  if (APPLY && wrote) {
    await fs.writeFile(SAMPLE, JSON.stringify(lessons, null, 2));
    console.log(`\n  wrote app/data/sample-lessons.json`);
  }
  console.log(`\n— ${APPLY ? "rewrote" : "would rewrite"} ${rewroteSlides} slide(s), ${failed} failed —\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
