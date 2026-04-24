"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/helpers";
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
