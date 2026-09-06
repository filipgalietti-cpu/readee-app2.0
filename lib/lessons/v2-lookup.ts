import "server-only";
import { LESSONS } from "@/app/data/lessons-v2";
import type { LessonDef } from "@/lib/lesson-engine/types";

/**
 * Find the V2 lesson that teaches a standard.
 *
 * ‼️ SERVER ONLY, and the `server-only` import is load-bearing rather than
 * decorative. `LESSONS` pulls in all 184 authored lessons - 7.9 MB of scenes,
 * asset paths and narration - because the registry imports every lesson module
 * to build itself. A client component that touched this would ship the whole
 * catalogue to a child's browser in order to render one lesson.
 *
 * So the server resolves the standard to a single LessonDef (median 36 KB) and
 * passes that one object down as a prop. Lessons are plain data - no functions,
 * no Dates - so they cross the server/client boundary as-is.
 *
 * V2 covers 181 of the 201 catalogue standards today: all of grades 1-3, most of
 * K, half of grade 4. The rest return undefined and keep the legacy runner,
 * which is why /learn checks rather than assumes.
 */

/**
 * Hand-built engine exemplars, kept because /demo still shows them off.
 *
 * They are real lessons and are served when nothing else teaches their
 * standard - silent-e is still the only RF.K.3b lesson. But where the factory
 * has since authored the same standard, the factory lesson wins: a child should
 * get the curriculum lesson that was written and reviewed for the catalogue,
 * not the proof-of-concept that happened to be registered first.
 *
 * This is not hypothetical. reading-detective ("EXEMPLAR C - the zero-budget
 * proof") and key-details ("FACTORY-AUTHORED, human-reviewed") both claim
 * RL.K.1, and registry order put the exemplar first.
 */
const EXEMPLARS = new Set(["silent-e", "story-elements", "reading-detective"]);

let byStandard: Map<string, LessonDef> | null = null;

function index(): Map<string, LessonDef> {
  if (byStandard) return byStandard;
  const m = new Map<string, LessonDef>();
  const entries = Object.entries(LESSONS);
  // Factory lessons first, so an exemplar can only fill a genuine gap.
  for (const [slug, { lesson }] of entries) {
    if (EXEMPLARS.has(slug)) continue;
    if (!m.has(lesson.standard)) m.set(lesson.standard, lesson);
  }
  for (const [slug, { lesson }] of entries) {
    if (!EXEMPLARS.has(slug)) continue;
    if (!m.has(lesson.standard)) m.set(lesson.standard, lesson);
  }
  byStandard = m;
  return m;
}

/**
 * Kill switch, in the shape of lib/plan/classroom-gate's.
 *
 * This one defaults ON: V2 is the intended engine and the point of wiring it up.
 * The switch exists because flipping the lesson experience for every child is
 * the kind of change you want to be able to undo in the time it takes to edit a
 * Vercel env var, rather than a revert and a redeploy. Set LESSON_V2_ENABLED to
 * "false" and every standard falls back to the legacy runner, which still works
 * and still teaches all 201.
 */
export const LESSON_V2_ENABLED = process.env.LESSON_V2_ENABLED !== "false";

/** The V2 lesson for this standard, or undefined if it has not been authored yet. */
export function v2LessonForStandard(standardId: string): LessonDef | undefined {
  if (!LESSON_V2_ENABLED) return undefined;
  return index().get(standardId);
}

/** Every standard V2 can teach. Used by the coverage test. */
export function v2CoveredStandards(): string[] {
  return [...index().keys()];
}
