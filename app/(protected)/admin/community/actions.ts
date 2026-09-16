"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { moderateCommunityContent } from "@/lib/ai/community";

export async function approveCommunity(input: {
  communityId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const res = await moderateCommunityContent({
    reviewerId: profile.id,
    communityId: input.communityId,
    decision: "approved",
  });
  if (res.ok) revalidatePath("/admin/community");
  return res;
}

/** Close a flag once a person has looked at it. The story itself is handled from its own queue. */
export async function resolveReport(input: {
  reportId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const admin = supabaseAdmin();
  const { count } = await admin
    .from("admin_memberships")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);
  if ((count ?? 0) === 0) return { ok: false, error: "Not an admin." };
  const { error } = await admin
    .from("community_reports")
    .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: profile.id })
    .eq("id", input.reportId)
    .eq("status", "open");
  if (error) return { ok: false, error: "Could not resolve the report." };
  revalidatePath("/admin/community");
  return { ok: true };
}

export async function rejectCommunity(input: {
  communityId: string;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const res = await moderateCommunityContent({
    reviewerId: profile.id,
    communityId: input.communityId,
    decision: "rejected",
    rejectionReason: input.reason,
  });
  if (res.ok) revalidatePath("/admin/community");
  return res;
}
