/**
 * Calibration examples for AI-judged QC checks.
 *
 * The "soft" judges (passage.judge, lesson.learning_objective) used
 * to score vibes with no anchor — "is this question pedagogically
 * strong?" → AI guesses. Reliability ~55-65%.
 *
 * Fix: hand the judge the CCS standard text + 3 hand-audited
 * reference questions for that standard. The judge stops guessing
 * and starts COMPARING. Same anchor humans calibrate against, so
 * the judge converges to the same answer humans would give.
 *
 * Reference questions come from the canonical grade-question JSONs
 * which are themselves the hand-audited K-G4 catalog. They are the
 * ground truth.
 */

import { getAllStandards } from "@/lib/data/all-standards";
import kStandards from "@/app/data/kindergarten-standards-questions.json";
import g1Standards from "@/app/data/1st-grade-standards-questions.json";
import g2Standards from "@/app/data/2nd-grade-standards-questions.json";
import g3Standards from "@/app/data/3rd-grade-standards-questions.json";
import g4Standards from "@/app/data/4th-grade-standards-questions.json";

const ALL_GRADE_FILES: Array<{ standards: any[] }> = [
  kStandards as any,
  g1Standards as any,
  g2Standards as any,
  g3Standards as any,
  g4Standards as any,
];

export type CalibrationExample = {
  prompt: string;
  choices?: string[];
  correct?: string;
};

export type CalibrationBundle = {
  standardId: string;
  standardDescription: string;
  /** Up to N audited reference questions for this standard. */
  examples: CalibrationExample[];
};

/**
 * Pull the standard's description + up to `count` reference questions
 * from the hand-audited catalog. Returns null when the standard isn't
 * in the K-G4 canon (e.g., AI-generated content tagged with a
 * non-standard skill label). Callers should fall back to no-anchor
 * mode in that case.
 */
export function getCalibrationBundle(
  standardId: string,
  count = 3,
): CalibrationBundle | null {
  if (!standardId) return null;

  const allStandards = getAllStandards();
  const std = allStandards.find((s) => s.standard_id === standardId);
  if (!std) return null;

  // Pull questions for this standard from every grade file (a standard
  // exists in exactly one grade file, but the search is cheap).
  let examples: CalibrationExample[] = [];
  for (const file of ALL_GRADE_FILES) {
    const standards = (file?.standards ?? []) as any[];
    const match = standards.find((s) => s.standard_id === standardId);
    if (!match) continue;
    const qs = Array.isArray(match.questions) ? match.questions : [];
    for (const q of qs) {
      if (!q?.prompt) continue;
      examples.push({
        prompt: q.prompt,
        choices: Array.isArray(q.choices) ? q.choices : undefined,
        correct: typeof q.correct === "string" ? q.correct : undefined,
      });
      if (examples.length >= count * 2) break;
    }
    if (examples.length > 0) break;
  }

  // Shuffle + pick — gives the judge diverse examples instead of the
  // same 3 every time (which would let it pattern-match too narrowly).
  examples = examples
    .map((e) => ({ e, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .slice(0, count)
    .map(({ e }) => e);

  return {
    standardId,
    standardDescription: std.standard_description,
    examples,
  };
}

/** Render the bundle as a prompt block for a judge. */
export function renderCalibrationForJudge(b: CalibrationBundle): string {
  const exampleLines = b.examples
    .map((ex, i) => {
      const choices = ex.choices?.length
        ? `\n   Choices: ${ex.choices.join(" | ")}`
        : "";
      const correct = ex.correct ? `\n   Correct: ${ex.correct}` : "";
      return `Example ${i + 1}: ${ex.prompt}${choices}${correct}`;
    })
    .join("\n\n");
  return [
    `CCS Standard ${b.standardId}: ${b.standardDescription}`,
    "",
    "Hand-audited reference questions for this standard (these are",
    "the calibration baseline — judge the candidate against these):",
    "",
    exampleLines,
  ].join("\n");
}
