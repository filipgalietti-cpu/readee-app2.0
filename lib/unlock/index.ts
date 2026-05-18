/**
 * Bunny outfit unlock engine.
 *
 * Three paths to ownership beyond the shop:
 *
 *   1. FREE — owned at signup. Classic Readee. No grant call needed.
 *   2. MILESTONE — granted automatically when a behaviour signal fires
 *      (first lesson complete, 3-day streak, 10 in a row, etc.).
 *      Drives the "earn it" excitement Fortnite-style drops give kids,
 *      but tied to learning behaviour we actually want to reinforce.
 *   3. SEASONAL — granted automatically during a specific month
 *      (Vampire = October, Jester = April, Chef = November).
 *      Re-grant fires every year; once owned the kid keeps it.
 *
 * Both grant types insert into the same `shop_purchases` table the shop
 * uses, so downstream code (equipped_items checks, "owned" badges, etc.)
 * doesn't need to know how a kid got an outfit.
 *
 * Idempotency: `shop_purchases` should have a UNIQUE (child_id, item_id)
 * constraint OR we duplicate-check before insert. We do both — check first
 * and rely on the constraint as a backstop — so milestone re-fires
 * (e.g. completing lesson #2 after lesson #1) don't insert dupes.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { OUTFITS, type MilestoneTrigger, type Outfit } from "@/app/_components/Bunny/outfits";
import { BADGES, type Badge } from "@/app/_components/Badge/badges";

export type UnlockResult = {
  /** Outfits that were newly granted on this call (drives the celebration toast). */
  newlyGranted: Outfit[];
};

/**
 * Insert a purchase row for an outfit the kid didn't pay carrots for.
 * Idempotent — safe to call repeatedly for the same outfit.
 */
async function grantOutfit(
  supabase: SupabaseClient,
  childId: string,
  outfitId: string,
  ownedIds: Set<string>,
): Promise<boolean> {
  if (ownedIds.has(outfitId)) return false;
  const { error } = await supabase
    .from("shop_purchases")
    .insert({ child_id: childId, item_id: outfitId });
  if (error) {
    // 23505 = unique_violation. Race with another tab/page that granted
    // the same outfit first — not a real failure, kid is already owner.
    if ((error as { code?: string }).code === "23505") return false;
    console.error(`[unlock] failed to grant ${outfitId}:`, error);
    return false;
  }
  ownedIds.add(outfitId);
  return true;
}

/**
 * Signals the unlock engine can react to. Pass whichever ones you know;
 * the engine evaluates each milestone trigger against the relevant signal.
 *
 * Call sites typically only know about ONE signal at a time (lesson page
 * after completion → `lesson_completed`; practice page after answer →
 * `consecutive_correct` + `total_correct`). Pass the rest as undefined.
 */
export type UnlockSignals = {
  /** Set when a lesson was just marked complete. */
  lesson_completed?: { passed: boolean };
  /** Current consecutive-correct streak in this practice session. */
  consecutive_correct?: number;
  /** Lifetime total correct answers across all practice. */
  total_correct?: number;
  /** Current day-streak from `children.streak_days`. */
  streak_days?: number;
  /** Set when a kid finished every lesson in their current grade. */
  grade_finished?: boolean;
  /** Grade key the kid just finished (when `grade_finished` is true).
   *  e.g. "kindergarten" | "1st" | "2nd" | "3rd" | "4th". Lets per-grade
   *  badges (Grade-1 Complete, Grade-2 Complete, etc.) fire on the right
   *  milestone. */
  finished_grade?: string;
  /** Lifetime count of lessons the kid has completed (passed) across all
   *  grades — drives the "10 books / 50 books / 100 books" badges. */
  lessons_completed?: number;
  /** Lifetime count of perfect practice sessions (correctCount === total). */
  perfect_sessions?: number;
};

/**
 * Check every milestone trigger against the provided signals + the kid's
 * current ownership, grant any that just earned, return the list for
 * the UI to celebrate.
 *
 * Call this after the upstream event (lesson save, practice_results
 * insert, streak update) has been persisted, NOT before — we don't want
 * to grant an outfit then have the underlying event fail.
 */
export async function checkMilestones(
  supabase: SupabaseClient,
  childId: string,
  ownedIds: Set<string>,
  signals: UnlockSignals,
): Promise<UnlockResult> {
  const newlyGranted: Outfit[] = [];

  for (const outfit of OUTFITS) {
    if (outfit.unlock.type !== "milestone") continue;
    if (ownedIds.has(outfit.id)) continue;
    if (!fires(outfit.unlock.trigger, signals)) continue;

    const ok = await grantOutfit(supabase, childId, outfit.id, ownedIds);
    if (ok) newlyGranted.push(outfit);
  }

  return { newlyGranted };
}

function fires(trigger: MilestoneTrigger, s: UnlockSignals): boolean {
  switch (trigger) {
    case "first_lesson_complete":
      return s.lesson_completed?.passed === true;
    case "ten_in_a_row_correct":
      return (s.consecutive_correct ?? 0) >= 10;
    case "hundred_correct_total":
      return (s.total_correct ?? 0) >= 100;
    case "streak_3_days":
      return (s.streak_days ?? 0) >= 3;
    case "streak_365_days":
      return (s.streak_days ?? 0) >= 365;
    case "first_grade_finished":
      return s.grade_finished === true;
  }
}

/**
 * Grant any seasonal outfit whose month === current month, for outfits
 * the kid doesn't already own. Safe to call on every shop page load —
 * idempotent, ~O(seasonal-count) per call.
 *
 * The grant fires the FIRST time the kid visits any unlock-aware surface
 * during the seasonal month. We don't pre-seed via a cron because that
 * would mean kids who never log in still "own" the outfit silently —
 * the moment of receipt should pair with a visible celebration.
 */
export async function checkSeasonalGrants(
  supabase: SupabaseClient,
  childId: string,
  ownedIds: Set<string>,
  now: Date = new Date(),
): Promise<UnlockResult> {
  const month = now.getMonth() + 1; // 1-12
  const newlyGranted: Outfit[] = [];

  for (const outfit of OUTFITS) {
    if (outfit.unlock.type !== "seasonal") continue;
    if (outfit.unlock.month !== month) continue;
    if (ownedIds.has(outfit.id)) continue;

    const ok = await grantOutfit(supabase, childId, outfit.id, ownedIds);
    if (ok) newlyGranted.push(outfit);
  }

  return { newlyGranted };
}

/**
 * UI helper — is this seasonal outfit available to grant right now?
 * Used for shop badges ("Free this October" vs "Back next October").
 */
export function isSeasonalActive(outfit: Outfit, now: Date = new Date()): boolean {
  return outfit.unlock.type === "seasonal" && outfit.unlock.month === now.getMonth() + 1;
}

/**
 * Month index (1-12) → display name. Used in shop badge copy.
 */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export function monthName(n: number): string {
  return MONTH_NAMES[(n - 1 + 12) % 12];
}

// ─────────────────────────────────────────────────────────────────────
// Achievement badges (parallel to outfits — same `shop_purchases` table
// as the ownership ledger so any `item_id` starting with `badge_*` is
// just another owned item. Lets us reuse handleEquip, ownedIds checks,
// etc. without a separate table or join.)
// ─────────────────────────────────────────────────────────────────────

export type BadgeUnlockResult = {
  newlyGranted: Badge[];
};

/**
 * Iterate every badge whose `earns(signals)` predicate returns true and
 * grant any the kid doesn't already own. Returns the list of newly-
 * earned badges so the UI can celebrate.
 *
 * Badges without an `earns` predicate are "future" — designed but not
 * yet wired to a behavior signal (e.g. Phonics Pro, Library Master).
 * Those are skipped here and currently unreachable from the kid side;
 * they'll come online as we add the underlying tracking.
 */
export async function checkBadgeMilestones(
  supabase: SupabaseClient,
  childId: string,
  ownedIds: Set<string>,
  signals: UnlockSignals,
): Promise<BadgeUnlockResult> {
  const newlyGranted: Badge[] = [];

  for (const badge of BADGES) {
    if (!badge.earns) continue;
    if (ownedIds.has(badge.id)) continue;
    if (!badge.earns(signals)) continue;

    const ok = await grantOutfit(supabase, childId, badge.id, ownedIds);
    if (ok) newlyGranted.push(badge);
  }

  return { newlyGranted };
}
