"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import {
  buildParentContent,
  type ParentAiBrief,
  MONTHLY_PARENT_CREDIT_LIMIT,
} from "@/lib/ai/build-parent-content";

/**
 * Parent-only. Gated on plan === "premium" — free parents get bounced
 * to /upgrade?reason=ask_readee before this ever runs.
 */
export async function askReadee(input: {
  brief: ParentAiBrief;
}): Promise<
  | { ok: true; contentId: string; warnings: string[]; creditsUsed: number }
  | { ok: false; error: string; paywall?: boolean }
> {
  const profile = await requireProfile();
  if (profile.plan !== "premium") {
    return {
      ok: false,
      error: "Ask Readee is a Readee+ feature. Upgrade to unlock.",
      paywall: true,
    };
  }

  const res = await buildParentContent({
    parentId: profile.id,
    brief: input.brief,
  });
  if (res.ok) {
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/ask-readee`);
  }
  return res;
}

export async function deleteChildAiContent(input: { contentId: string }): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("child_ai_content")
    .delete()
    .eq("id", input.contentId)
    .eq("parent_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/ask-readee`);
  return { ok: true };
}

export async function toggleShareContent(input: {
  contentId: string;
  shared: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("child_ai_content")
    .update({
      shared: input.shared,
      shared_at: input.shared ? new Date().toISOString() : null,
    })
    .eq("id", input.contentId)
    .eq("parent_id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/ask-readee`);
  return { ok: true };
}

export { MONTHLY_PARENT_CREDIT_LIMIT };
