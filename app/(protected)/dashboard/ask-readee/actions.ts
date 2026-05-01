"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import {
  buildParentContent,
  type ParentAiBrief,
} from "@/lib/ai/build-parent-content";
import {
  submitForCommunityReview,
  withdrawCommunitySubmission,
} from "@/lib/ai/community";

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

  // Persist the intent on the source row first.
  const { error } = await supabase
    .from("child_ai_content")
    .update({
      shared: input.shared,
      shared_at: input.shared ? new Date().toISOString() : null,
    })
    .eq("id", input.contentId)
    .eq("parent_id", profile.id);
  if (error) return { ok: false, error: error.message };

  // If opting in, run the content through anonymization + enqueue for
  // admin review. If opting out, withdraw any pending/approved copy.
  if (input.shared) {
    const submit = await submitForCommunityReview({
      parentId: profile.id,
      contentId: input.contentId,
    });
    if (!submit.ok) {
      // Roll back the intent flag so the UI doesn't lie.
      await supabase
        .from("child_ai_content")
        .update({ shared: false, shared_at: null })
        .eq("id", input.contentId)
        .eq("parent_id", profile.id);
      return { ok: false, error: submit.error };
    }
  } else {
    await withdrawCommunitySubmission({
      parentId: profile.id,
      sourceContentId: input.contentId,
    });
  }

  revalidatePath(`/dashboard/ask-readee`);
  return { ok: true };
}

/**
 * One-time byline consent recorded the first time a parent shares.
 * - consent=true + displayName="Erin S." → byline appears on shares
 * - consent=false → kept anonymous, no byline ever
 * Either choice satisfies the consent gate so we only ask once.
 */
export async function setCommunityByline(input: {
  consent: boolean;
  displayName: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const cleanName = input.consent
    ? (input.displayName ?? "").trim().slice(0, 40) || null
    : null;
  const { error } = await supabase
    .from("profiles")
    .update({
      community_byline_consent: input.consent,
      community_display_name: cleanName,
    })
    .eq("id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/ask-readee");
  return { ok: true };
}
