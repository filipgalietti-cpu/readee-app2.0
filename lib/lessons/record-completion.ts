import { safeValidate } from "@/lib/validate";
import { PracticeResultSchema } from "@/lib/schemas";
import { awardCarrots } from "@/lib/levels/award-carrots";
import { savedOk } from "@/lib/db/checked-write";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { clearActiveMultiplierFields } from "@/lib/carrots/active-multiplier";

/**
 * What finishing a lesson means, in one place.
 *
 * The V2 runner (app/components/lesson-v2/LessonRunner) is a pure renderer - it
 * draws scenes and reports events, and persists nothing. That is the right shape
 * for it, but it means whoever mounts it owns the consequences of a finish, and
 * those consequences are not obvious: a lesson counts as done for the Journey
 * only because a `practice_results` row exists with at least 3 correct, and
 * carrots only reach the reader-level ladder if they go through awardCarrots.
 *
 * Getting either wrong is silent. The child sees a celebration screen, and the
 * dashboard forgets they were ever there.
 *
 * So this module states the contract once and both lesson engines can hold it.
 * It writes exactly what the legacy runner writes, in the same order:
 *
 *   1. `practice_results` - the row the Journey and dashboard read to decide a
 *      standard is complete (>= 3 correct, per lib/journey/next-lesson).
 *   2. carrots via awardCarrots - the single choke point that also moves the
 *      reader level, rather than a bare balance update that skips the ladder.
 *   3. `children.last_lesson_at`, plus consuming a mystery-box boost if one was
 *      active, since the boost is single-use.
 *   4. funnel.first_lesson_complete, exactly once per child.
 *
 * Every write is guarded by savedOk, because supabase-js RESOLVES on an RLS
 * denial rather than throwing - the failure mode that once dropped a week of
 * completions app-wide.
 */

type Supa = Parameters<typeof awardCarrots>[0] & {
  from: (t: string) => any;
};

export type LessonCompletion = {
  childId: string;
  standardId: string;
  /** Questions the child actually answered. */
  attempted: number;
  /** Of those, how many were right. >= 3 is what marks the standard done. */
  correct: number;
  /** Final carrots, already multiplied. 0 is legitimate - a child can finish badly. */
  carrots: number;
  /** Active mystery-box multiplier, if any. > 1 means consume it on save. */
  boost?: number;
};

export type CompletionResult = {
  /** False if the progress row did not land - the child's work is at risk. */
  saved: boolean;
  /** True when this was the child's first ever finished lesson. */
  wasFirstLesson: boolean;
};

export async function recordLessonCompletion(
  supabase: Supa,
  c: LessonCompletion,
): Promise<CompletionResult> {
  // Read before writing, so "first lesson" is still answerable afterwards.
  const { data: prior } = await supabase
    .from("children")
    .select("last_lesson_at")
    .eq("id", c.childId)
    .single();
  const wasFirstLesson = !prior?.last_lesson_at;

  const payload = safeValidate(PracticeResultSchema, {
    child_id: c.childId,
    standard_id: c.standardId,
    questions_attempted: c.attempted,
    questions_correct: c.correct,
    carrots_earned: c.carrots,
  });

  // No retry: practice_results has no unique constraint, so re-issuing an insert
  // whose response was merely lost would double-count the child's work.
  const saved = await savedOk("lesson-v2:practice_results", supabase.from("practice_results").insert(payload));

  if (c.carrots > 0) {
    await awardCarrots(supabase, c.childId, c.carrots);
  }

  // Absolute values only, so this one is safe to retry.
  await savedOk(
    "lesson-v2:children.last_lesson_at",
    () =>
      supabase
        .from("children")
        .update({
          last_lesson_at: new Date().toISOString(),
          ...(c.boost && c.boost > 1 ? clearActiveMultiplierFields() : {}),
        })
        .eq("id", c.childId),
    { retries: 2 },
  );

  if (wasFirstLesson) {
    trackFunnelClient("funnel.first_lesson_complete", {
      standard_id: c.standardId,
      score_percent: c.attempted > 0 ? Math.round((c.correct / c.attempted) * 100) : 0,
    });
  }

  return { saved, wasFirstLesson };
}
