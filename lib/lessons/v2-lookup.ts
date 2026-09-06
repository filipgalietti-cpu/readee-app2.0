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
 * ‼️ DEFAULTS OFF, because V2's assets are not deployed.
 *
 * Every V2 lesson reads its narration from /audio/lessons-v2/<id>/*.mp3 and its
 * pictures from /images/lessons-v2/<id>/*.png. Both directories are gitignored
 * (.gitignore lines 37 and 51) and hold zero tracked files, so all 2.2 GB of it
 * - 3,778 audio files, 1,195 images - exists only on the authoring machine.
 * Those URLs are 404 in production, which is also why /demo has never worked
 * there. A narration-driven reading lesson with no narration and no pictures is
 * not a lesson.
 *
 * The routing, the completion writes and the tests are all real and stay wired.
 * The only thing missing is the assets. Once they are served from somewhere
 * public - Supabase storage or a CDN, since 2.2 GB does not belong in git or in
 * a Vercel deployment - set LESSON_V2_ENABLED=true and 181 standards switch
 * over with no code change.
 *
 * Until then every standard uses the legacy runner, which still teaches all 201
 * and whose assets ARE deployed.
 */
export const LESSON_V2_ENABLED = process.env.LESSON_V2_ENABLED === "true";

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
