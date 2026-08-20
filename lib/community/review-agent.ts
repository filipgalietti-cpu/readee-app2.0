/**
 * Community compliance-review agent. Kid Story Studio submissions land in the
 * community queue as `pending`; this agent reviews them one at a time and:
 *   - approves compliant stories -> generates read-aloud TTS, sets them LIVE,
 *   - rejects unsafe / low-effort ones with a reason,
 *   - leaves anything it can't judge (AI error) pending for a human.
 *
 * Layered on top of the input moderation + output scan that already ran at
 * create time, and the /admin/community human queue remains a manual override.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateSpeech, judgeCommunityCompliance } from "@/lib/ai/readee-ai";
import { containsUnsafeContent } from "@/lib/ai/safety";
import { trackError } from "@/lib/observability/track";

export type ReviewOutcome = "approved" | "rejected" | "skipped";

export async function reviewCommunityStory(
  communityId: string,
): Promise<ReviewOutcome> {
  const admin = supabaseAdmin();

  const { data: row } = await admin
    .from("community_passages")
    .select("id, title, passage_text, status, source_parent_id")
    .eq("id", communityId)
    .maybeSingle();
  if (!row || (row as any).status !== "pending") return "skipped";

  const title = ((row as any).title as string) ?? "";
  const passage = ((row as any).passage_text as string) ?? "";
  const reviewerFor = ((row as any).source_parent_id as string) ?? "system";

  // 1) Fast banlist recheck (obfuscation-hardened) — instant hard reject.
  const banned = containsUnsafeContent(`${title} ${passage}`);

  // 2) LLM compliance judge (throws on AI error -> leave pending for a human).
  let approve: boolean;
  let reason: string;
  if (banned) {
    approve = false;
    reason = `Contains disallowed language ("${banned}").`;
  } else {
    try {
      const v = await judgeCommunityCompliance({
        teacherId: reviewerFor,
        title,
        text: passage,
      });
      approve = v.approve;
      reason = v.reason;
    } catch (e) {
      trackError(e, { route: "community.review-agent", extra: { communityId } });
      return "skipped"; // don't guess — a human will see it in the queue
    }
  }

  if (!approve) {
    await admin
      .from("community_passages")
      .update({
        status: "rejected",
        rejection_reason: reason.slice(0, 300),
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", communityId)
      .eq("status", "pending");
    return "rejected";
  }

  // 3) Approved -> generate the read-aloud narration, then go live. TTS is
  //    best-effort: text + image are already valuable, so a TTS hiccup still
  //    publishes (a later pass can backfill audio).
  let audioUrl: string | null = null;
  try {
    const tts = await generateSpeech({
      teacherId: reviewerFor,
      text: passage.replace(/\s*\n+\s*/g, " ").trim().slice(0, 4000),
      style: "warmly, at a gentle storytime pace",
    });
    if (tts.ok) audioUrl = tts.audioUrl;
  } catch {
    /* keep the approval even if narration fails */
  }

  await admin
    .from("community_passages")
    .update({
      status: "approved",
      auto_approved: true,
      audio_url: audioUrl,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", communityId)
    .eq("status", "pending");
  return "approved";
}

/**
 * Process the oldest pending kid-story submissions, one at a time. Returns a
 * tally. Used by the cron.
 */
export async function runCommunityReviewQueue(
  limit = 8,
): Promise<{ processed: number; approved: number; rejected: number; skipped: number }> {
  const admin = supabaseAdmin();
  const { data: pending } = await admin
    .from("community_passages")
    .select("id")
    .eq("status", "pending")
    .eq("source_kind", "kid_story")
    .order("created_at", { ascending: true })
    .limit(limit);

  let approved = 0;
  let rejected = 0;
  let skipped = 0;
  for (const p of (pending ?? []) as { id: string }[]) {
    const outcome = await reviewCommunityStory(p.id);
    if (outcome === "approved") approved++;
    else if (outcome === "rejected") rejected++;
    else skipped++;
  }
  return { processed: (pending ?? []).length, approved, rejected, skipped };
}
