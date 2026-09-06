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
 * Kill switch. Defaults ON now that V2's assets actually exist in production.
 *
 * It defaulted off for a few hours today because the assets did not: every
 * lesson reads narration from /audio/lessons-v2 and art from /images/lessons-v2,
 * both gitignored, both 404. They are in Supabase storage now - 3,778 audio and
 * 1,195 images - and lib/lesson-engine/asset-url rewrites the paths. Verified by
 * pulling every asset path referenced by all 183 lessons and fetching each one:
 * 4,202 of 4,203 return content. (The one miss,
 * there-or-told-about-it/guided-choose-witness-only.mp3, is a clip that lesson's
 * TTS run never generated - it is absent locally too, and re-running
 * scripts/lesson-tts.ts for that lesson fixes it.)
 *
 * Set LESSON_V2_ENABLED=false in Vercel to fall every standard back to the
 * legacy runner, which still teaches all 201 and whose assets ship with the app.
 * Flipping the lesson experience for every child should be undoable by editing
 * an env var, not by reverting and redeploying.
 */
export const LESSON_V2_ENABLED = process.env.LESSON_V2_ENABLED !== "false";

/**
 * What V2 has AUTHORED for this standard, regardless of rollout.
 *
 * Separate from the routing question below on purpose: "has the factory written
 * this lesson?" and "should /learn serve it today?" are different, and
 * collapsing them makes coverage impossible to measure while the switch is off.
 */
export function authoredLessonForStandard(standardId: string): LessonDef | undefined {
  return index().get(standardId);
}

/** Every standard V2 has a lesson for. Rollout-independent. */
export function v2CoveredStandards(): string[] {
  return [...index().keys()];
}

/**
 * What /learn should serve for this standard right now - undefined means the
 * legacy runner. Respects the switch above, so this is the one routing calls.
 */
export function v2LessonForStandard(standardId: string): LessonDef | undefined {
  if (!LESSON_V2_ENABLED) return undefined;
  return authoredLessonForStandard(standardId);
}
