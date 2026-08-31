/**
 * The *display* value of a day-streak.
 *
 * bumpStreak (the writer) only recomputes a streak when the child does an
 * activity — it never decays a streak when a day is missed. So
 * `children.streak_days` stays frozen/inflated during a lapse (a kid who
 * dropped a 7-day streak still reads "7" until they come back). Compute the
 * honest value at read time: the stored streak counts only if the last lesson
 * was today or yesterday; a gap of 2+ days means the streak is broken.
 *
 * `best_streak` still preserves the all-time record separately, so nothing is
 * lost — this only governs the *live* streak shown to the child/parent.
 */
export function effectiveStreak(
  streakDays: number | null | undefined,
  lastLessonAt: string | null | undefined,
): number {
  const streak = streakDays ?? 0;
  if (streak <= 0 || !lastLessonAt) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = new Date(lastLessonAt);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / 86_400_000);
  return diffDays <= 1 ? streak : 0; // today or yesterday = alive; else broken
}
