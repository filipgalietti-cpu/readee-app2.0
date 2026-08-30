/**
 * Server-side free-taste gates for Luna's cost endpoints (speech grading, TTS,
 * Azure token mints, Story Studio generation). Mirrors the pattern in
 * /api/luna/passage: full-access readers (paid or inside the 7-day reverse
 * trial) always pass; a genuinely-free reader gets the FREE_LIMITS taste
 * (3 completed Luna reads, 3 Story Studio stories), then the route returns a
 * 402 the client turns into the Readee+ wall.
 *
 * The read/studio PAGES enforce the same counts for UX; these helpers are the
 * enforcement a client can't skip.
 */
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasFullAccessFromProfile } from "@/lib/plan/access";
import { FREE_LIMITS } from "@/lib/plan/limits";

export type LunaGuardResult = { ok: true } | { ok: false; reason: string };

/** Paid or in-trial, straight off the profiles row (same as /api/luna/passage). */
async function userHasFullAccess(userId: string): Promise<boolean> {
  const admin = supabaseAdmin();
  const { data: prof } = await admin
    .from("profiles")
    .select("plan, created_at, had_subscription")
    .eq("id", userId)
    .maybeSingle();
  return hasFullAccessFromProfile(
    prof as { plan?: string | null; created_at?: string | null; had_subscription?: boolean | null } | null,
  );
}

/**
 * Read-with-Luna allowance: free readers get FREE_LIMITS.lunaReadsFree
 * completed reads (one fluency_readings row per completed session — the same
 * counter /luna/read uses). Pass childId when the route has one; routes
 * without it (speak, speech-token) count across all the parent's readers,
 * which is identical for free accounts (reader cap = 1).
 */
export async function checkLunaReadAllowance(
  userId: string,
  childId?: string | null,
): Promise<LunaGuardResult> {
  if (await userHasFullAccess(userId)) return { ok: true };

  const admin = supabaseAdmin();
  let count = 0;
  if (childId) {
    const { count: c } = await admin
      .from("fluency_readings")
      .select("id", { count: "exact", head: true })
      .eq("child_id", childId);
    count = c ?? 0;
  } else {
    const { data: kids } = await admin
      .from("children")
      .select("id")
      .eq("parent_id", userId);
    const ids = ((kids ?? []) as { id: string }[]).map((k) => k.id);
    if (ids.length > 0) {
      const { count: c } = await admin
        .from("fluency_readings")
        .select("id", { count: "exact", head: true })
        .in("child_id", ids);
      count = c ?? 0;
    }
  }
  if (count >= FREE_LIMITS.lunaReadsFree) return { ok: false, reason: "luna" };
  return { ok: true };
}

/**
 * Story Studio allowance: free readers get FREE_LIMITS.personalizedStoriesFree
 * creations, counted the same way the studio saves them — child_ai_content
 * rows with kind "luna_story".
 */
export async function checkLunaStoryAllowance(
  userId: string,
  childId: string,
): Promise<LunaGuardResult> {
  if (await userHasFullAccess(userId)) return { ok: true };

  const admin = supabaseAdmin();
  const { count } = await admin
    .from("child_ai_content")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId)
    .eq("kind", "luna_story");
  if ((count ?? 0) >= FREE_LIMITS.personalizedStoriesFree) {
    return { ok: false, reason: "luna" };
  }
  return { ok: true };
}
