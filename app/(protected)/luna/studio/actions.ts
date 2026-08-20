"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { submitForCommunityReview } from "@/lib/ai/community";
import { STORY_CARROTS } from "@/lib/luna/story-rewards";

/**
 * Publish a kid's Story Studio creation to the community. The story is
 * submitted for review with the child's first-name byline and always waits
 * for a Readee admin's yes (no trusted-parent fast lane for kid content).
 *
 * The kid earns "post" carrots the first time a given story is submitted
 * (re-submitting the same story never re-awards). Per-view carrots are
 * awarded separately once the per-read RPC ships.
 */
export async function publishKidStory({
  contentId,
}: {
  contentId: string;
}): Promise<
  { ok: true; carrotsAwarded: number } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  // Ownership + the child behind the story (for the byline + carrots).
  const { data: content } = await supabase
    .from("child_ai_content")
    .select("id, parent_id, child_id, kind")
    .eq("id", contentId)
    .maybeSingle();
  if (!content || (content as any).parent_id !== user.id) {
    return { ok: false, error: "Story not found." };
  }
  const childId = (content as any).child_id as string;

  const admin = supabaseAdmin();
  const { data: childRow } = await admin
    .from("children")
    .select("id, first_name, carrots")
    .eq("id", childId)
    .maybeSingle();
  const firstName = ((childRow as any)?.first_name as string | null) ?? null;

  // Has this exact story been submitted before? If so, don't re-award.
  const { count: priorCount } = await admin
    .from("community_passages")
    .select("id", { count: "exact", head: true })
    .eq("source_content_id", contentId);
  const firstTime = (priorCount ?? 0) === 0;

  const res = await submitForCommunityReview({
    parentId: user.id,
    contentId,
    bylineOverride: firstName,
    forceReview: true,
    // Keep publish fast: skip the ~40-60s TTS + LLM-QC chain (it timed the
    // request out). Kid content is already moderated + scanned and a human
    // reviews it before it's public; narration + deep QC happen at approval.
    deferHeavyMedia: true,
  });
  if (!res.ok) return { ok: false, error: res.error };

  // Reward the post — once per story. Best-effort: a carrot hiccup never
  // fails a successful publish.
  let carrotsAwarded = 0;
  if (firstTime && childRow) {
    try {
      const next = ((childRow as any).carrots ?? 0) + STORY_CARROTS.post;
      await admin.from("children").update({ carrots: next }).eq("id", childId);
      carrotsAwarded = STORY_CARROTS.post;
    } catch {
      /* keep the publish even if the award write hiccups */
    }
  }

  return { ok: true, carrotsAwarded };
}
