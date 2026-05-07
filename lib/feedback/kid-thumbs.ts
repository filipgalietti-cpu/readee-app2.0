/**
 * Kid feedback ledger — thumbs up / thumbs down on any AI asset the
 * kid sees. Persists to public.kid_feedback (one row per child×asset),
 * surfaces aggregates to /owner/assets, and auto-quarantines content
 * once a confidence threshold is crossed.
 *
 * Quarantine math (intentionally conservative):
 *   - down_count    >= 2 distinct kids
 *   - AND up_count  <= down_count (no positive offset)
 *   - AND last_voted_at within 30 days
 *
 * Hitting that threshold inserts a content_audit_findings row of
 * kind 'kid_feedback' so the existing QC bot worker picks it up on
 * its nightly run. We do NOT directly mutate qc_status — the bot
 * decides whether to regen or dismiss.
 */
"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type KidAssetKind =
  // Built-in MCQ from app/data/*.json
  | "sample_question"
  // Built-in lesson slide (app/data/sample-lessons.json)
  | "sample_lesson"
  // 25 decodable stories
  | "story"
  // Daily question of the day
  | "daily_question"
  // Parent-generated Ask Readee passage
  | "ask_readee"
  // Factory or community-shared passage
  | "community_passage"
  // Teacher custom lesson
  | "custom_lesson"
  // Teacher custom book
  | "custom_book"
  // Personalized story
  | "personalized_story"
  // Leveled passage
  | "leveled_passage";

export type KidVerdict = "up" | "down";

const QUARANTINE_DOWN_THRESHOLD = 2; // distinct kids who voted down
const QUARANTINE_LOOKBACK_DAYS = 30;

export async function recordKidFeedback(input: {
  childId: string;
  parentId: string;
  assetKind: KidAssetKind;
  assetId: string;
  verdict: KidVerdict;
  reason?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.childId || !input.assetKind || !input.assetId) {
    return { ok: false, error: "Missing required fields" };
  }
  const admin = supabaseAdmin();

  // Upsert: one row per (child, asset). Re-voting overwrites.
  const { error } = await admin.from("kid_feedback").upsert(
    {
      child_id: input.childId,
      parent_id: input.parentId,
      asset_kind: input.assetKind,
      asset_id: input.assetId,
      verdict: input.verdict,
      reason: input.reason ?? null,
      // upserts on the unique (child, asset_kind, asset_id) constraint
    },
    { onConflict: "child_id,asset_kind,asset_id" },
  );
  if (error) return { ok: false, error: error.message };

  // Only check quarantine on a downvote — upvotes can't trigger it.
  if (input.verdict === "down") {
    await maybeQuarantine(input.assetKind, input.assetId);
  }
  return { ok: true };
}

async function maybeQuarantine(
  assetKind: KidAssetKind,
  assetId: string,
): Promise<void> {
  const admin = supabaseAdmin();

  // Read aggregate with a recency window. The view groups all-time;
  // we re-filter here to honor QUARANTINE_LOOKBACK_DAYS.
  const cutoff = new Date(
    Date.now() - QUARANTINE_LOOKBACK_DAYS * 86_400_000,
  ).toISOString();

  const { data: rows } = await admin
    .from("kid_feedback")
    .select("child_id, verdict")
    .eq("asset_kind", assetKind)
    .eq("asset_id", assetId)
    .gte("created_at", cutoff);

  const downKids = new Set<string>();
  let upCount = 0;
  let downCount = 0;
  for (const r of (rows ?? []) as { child_id: string; verdict: string }[]) {
    if (r.verdict === "down") {
      downKids.add(r.child_id);
      downCount += 1;
    } else if (r.verdict === "up") {
      upCount += 1;
    }
  }

  const tripped = downKids.size >= QUARANTINE_DOWN_THRESHOLD && upCount <= downCount;
  if (!tripped) return;

  // Open an audit finding the QC bot can pick up. Idempotent: if
  // there's already an open kid_feedback finding for this asset, we
  // bail to avoid spam.
  const { data: existing } = await admin
    .from("content_audit_findings")
    .select("id")
    .eq("target_kind", assetKind)
    .eq("target_id", assetId)
    .eq("finding_type", "kid_feedback")
    .eq("status", "open")
    .limit(1);
  if (existing && existing.length > 0) return;

  await admin.from("content_audit_findings").insert({
    target_kind: assetKind,
    target_id: assetId,
    finding_type: "kid_feedback",
    severity: "warn",
    status: "open",
    summary: `${downKids.size} distinct kids gave this content a thumbs-down (up: ${upCount}, down: ${downCount}).`,
    detail: {
      up_count: upCount,
      down_count: downCount,
      distinct_down_kids: downKids.size,
      window_days: QUARANTINE_LOOKBACK_DAYS,
    },
    suggested_fix: { action: "regen_or_dismiss", driver: "kid_feedback" },
  });
}

/**
 * Read aggregates for a list of (assetKind, assetId) pairs in one
 * query. Used by /owner/assets to show reception alongside the QC
 * verdict.
 */
export async function getFeedbackAggregates(
  pairs: { kind: KidAssetKind; id: string }[],
): Promise<
  Map<string, { up: number; down: number; distinctKids: number; lastAt: string }>
> {
  const out = new Map<string, { up: number; down: number; distinctKids: number; lastAt: string }>();
  if (pairs.length === 0) return out;

  const admin = supabaseAdmin();
  const ids = Array.from(new Set(pairs.map((p) => p.id)));
  const kinds = Array.from(new Set(pairs.map((p) => p.kind)));

  const { data } = await admin
    .from("kid_feedback_agg")
    .select("asset_kind, asset_id, up_count, down_count, distinct_kids, last_voted_at")
    .in("asset_id", ids)
    .in("asset_kind", kinds);

  for (const r of (data ?? []) as any[]) {
    out.set(`${r.asset_kind}:${r.asset_id}`, {
      up: Number(r.up_count ?? 0),
      down: Number(r.down_count ?? 0),
      distinctKids: Number(r.distinct_kids ?? 0),
      lastAt: r.last_voted_at,
    });
  }
  return out;
}
