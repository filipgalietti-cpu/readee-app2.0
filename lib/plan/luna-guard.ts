/**
 * Server-side free-taste gates for Luna's cost endpoints (speech grading, TTS,
 * Azure token mints, Story Studio generation). Mirrors the pattern in
 * /api/luna/passage: full-access readers (paid or inside the reverse
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

  // ‼️ The check above counts COMPLETED reads, and every cost in a Luna session
  // is incurred before one completes: an Azure token per ~10 minutes, a TTS clip
  // and a grading call per sentence. A free reader who never taps finish stays
  // at zero forever. On 2026-09-07 every free account that had ever touched Luna
  // had 0 completed reads and between 1 and 5 token mints, so this wall had
  // never been shown to anybody - the gate was not leaky, it was absent.
  //
  // Counting mints meters the thing that actually costs money, and because
  // speak, grade and speech-token all call this helper, capping here closes all
  // three at once. Scoped to the luna context so placement and lesson Speak
  // steps, which are free on purpose, are unaffected. The 60/hour cap in
  // /api/luna/speech-token is still the hard abuse bound; this is the
  // entitlement.
  const mintFloor = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { count: mints } = await admin
    .from("speech_token_mints")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("context", "luna")
    .gte("created_at", mintFloor);
  if ((mints ?? 0) >= FREE_LIMITS.lunaMintsFree) return { ok: false, reason: "luna" };

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
