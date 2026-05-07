"use server";

import { createClient } from "@/lib/supabase/server";
import {
  recordKidFeedback,
  type KidAssetKind,
  type KidVerdict,
} from "@/lib/feedback/kid-thumbs";

/**
 * Server action wrapper around recordKidFeedback. Resolves the
 * authenticated parent from the Supabase session and verifies the
 * child belongs to them. Kids don't have direct Supabase auth — they
 * sign in through the parent's session.
 */
export async function recordKidFeedbackAction(input: {
  childId: string;
  assetKind: KidAssetKind;
  assetId: string;
  verdict: KidVerdict;
  reason?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Not signed in" };

  // Verify the child belongs to this parent. Without this any signed-in
  // user could spam votes on any kid's behalf.
  const { data: child } = await supabase
    .from("children")
    .select("id, parent_id")
    .eq("id", input.childId)
    .maybeSingle();
  if (!child || (child as any).parent_id !== auth.user.id) {
    return { ok: false, error: "Child not found" };
  }

  return recordKidFeedback({
    childId: input.childId,
    parentId: auth.user.id,
    assetKind: input.assetKind,
    assetId: input.assetId,
    verdict: input.verdict,
    reason: input.reason ?? null,
  });
}
