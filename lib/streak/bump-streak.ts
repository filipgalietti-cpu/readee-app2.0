import { supabaseBrowser } from "@/lib/supabase/client";
import { savedOk } from "@/lib/db/checked-write";

/**
 * Advance a child's day-streak on a lesson/quiz completion, tracking the
 * all-time best. Single source of truth so every completion path (the /lesson
 * route AND the journey's /learn→/practice flow) updates the streak the same
 * way — before this, only /lesson touched it, so journey lessons never counted.
 *
 *   same calendar day again → unchanged
 *   next calendar day       → +1
 *   a gap (or first ever)   → reset to 1
 *
 * Bumps streak_days, best_streak (= max seen), and last_lesson_at. Returns the
 * new streak + best so the caller can update local UI.
 */
export async function bumpStreak(childId: string): Promise<{ streak: number; best: number }> {
  const supabase = supabaseBrowser();
  const { data } = await supabase
    .from("children")
    .select("streak_days, last_lesson_at, best_streak")
    .eq("id", childId)
    .single();
  const cur = data as { streak_days?: number; last_lesson_at?: string | null; best_streak?: number } | null;
  const prevStreak = cur?.streak_days ?? 0;
  const prevBest = cur?.best_streak ?? 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let streak = 1;
  if (cur?.last_lesson_at) {
    const last = new Date(cur.last_lesson_at);
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / 86_400_000);
    if (diffDays === 0) streak = prevStreak || 1;     // already counted today
    else if (diffDays === 1) streak = prevStreak + 1; // consecutive day
    // else: gap → reset to 1
  }
  const best = Math.max(prevBest, streak);

  await savedOk(
    "streak:bump",
    supabase
      .from("children")
      .update({ streak_days: streak, best_streak: best, last_lesson_at: now.toISOString() })
      .eq("id", childId),
  );
  return { streak, best };
}
