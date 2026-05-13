"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { applyCap, setAutoApply, runAdaptiveReview } from "@/lib/content/caps";

async function gate(): Promise<{ ok: true; profileId: string } | { ok: false; error: string }> {
  let profile;
  try {
    profile = await requireProfile();
  } catch {
    return { ok: false, error: "Not authenticated." };
  }
  if (!(await isPlatformAdmin(profile.id))) {
    return { ok: false, error: "Owner access required." };
  }
  return { ok: true, profileId: profile.id };
}

export async function applySuggestedCapAction(input: {
  contentType: string;
  target: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await gate();
  if (!g.ok) return g;
  const r = await applyCap({
    contentType: input.contentType,
    newTarget: input.target,
    by: "human",
  });
  if (!r.ok) return { ok: false, error: r.error ?? "Failed to apply." };
  revalidatePath("/owner/qc-health");
  return { ok: true };
}

export async function toggleAutoApplyAction(input: {
  contentType: string;
  autoApply: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const g = await gate();
  if (!g.ok) return g;
  await setAutoApply(input.contentType, input.autoApply);
  revalidatePath("/owner/qc-health");
  return { ok: true };
}

export async function runAdaptiveReviewNowAction(): Promise<
  { ok: true; reviewed: number } | { ok: false; error: string }
> {
  const g = await gate();
  if (!g.ok) return g;
  const r = await runAdaptiveReview();
  revalidatePath("/owner/qc-health");
  return { ok: true, reviewed: r.reviewed };
}
