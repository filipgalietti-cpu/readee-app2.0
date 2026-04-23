"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

type ClaimInput =
  | { token: string; mode: "existing"; existingChildId: string; newChildFirstName?: undefined }
  | { token: string; mode: "create"; existingChildId?: undefined; newChildFirstName: string };

/**
 * Parent-side: claim a roster invite and link one of their children to
 * the classroom. Either uses an existing child or creates a new one.
 * Calls the claim_roster_invite() SECURITY DEFINER function to enforce
 * that the claiming user owns the child.
 */
export async function claimInvite(
  input: ClaimInput,
): Promise<{ ok: true; childId: string; classroomId: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  let childId: string;

  if (input.mode === "existing") {
    const { data: child } = await supabase
      .from("children")
      .select("id")
      .eq("id", input.existingChildId)
      .eq("parent_id", profile.id)
      .maybeSingle();
    if (!child) return { ok: false, error: "Child not found." };
    childId = (child as any).id as string;
  } else {
    const name = input.newChildFirstName.trim();
    if (!name) return { ok: false, error: "First name is required." };
    if (name.length > 40) return { ok: false, error: "First name is too long." };

    const { data: created, error } = await supabase
      .from("children")
      .insert({ parent_id: profile.id, first_name: name })
      .select("id")
      .single();
    if (error || !created) {
      return { ok: false, error: error?.message ?? "Could not create child." };
    }
    childId = (created as any).id as string;
  }

  const { data: result, error: rpcErr } = await supabase
    .rpc("claim_roster_invite", { p_token: input.token, p_child_id: childId })
    .maybeSingle();

  if (rpcErr) return { ok: false, error: rpcErr.message };
  const row = result as { ok: boolean; classroom_id: string | null; error: string | null } | null;
  if (!row || !row.ok) {
    return { ok: false, error: row?.error ?? "Could not claim invite." };
  }

  return { ok: true, childId, classroomId: row.classroom_id! };
}
