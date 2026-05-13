/**
 * Adaptive production caps. Each content type's daily target adjusts
 * based on rolling QC health.
 *
 * Read path (used by crons):
 *   const { target } = await getCap("animal_of_the_day");
 *   for (let i = 0; i < target; i++) buildOne(...);
 *
 * Review path (called nightly by /api/cron/qc-cap-review):
 *   runAdaptiveReview() computes a suggestion per content type from
 *   qc_runs. If auto_apply is on, applies it. Otherwise writes the
 *   suggestion to the row for the operator to one-click apply from
 *   the /owner/qc-health dashboard.
 *
 * Adjustment math:
 *   - 14d all-green → suggest min(target * 2, daily_max)
 *   - 7d  all-green → suggest target + 1
 *   - any yellow    → suggest target - 1 (defensive)
 *   - quarantine    → freeze (suggest current target, alert)
 *   - too little data (< 5 pieces) → hold
 *
 * "Green" = first_pass >= 70%, heal_success >= 90%, quarantined = 0.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export type Trend = "green" | "yellow" | "red";

export type WindowMetrics = {
  windowDays: number;
  pieces: number;
  passedFirstTry: number;
  healed: number;
  quarantined: number;
  firstPassPct: number;
  healSuccessPct: number;
  /**
   * Kid thumbs-down auto-archives in this window (CONTENT_SPEC §5.5).
   * Count comes from content_audit_findings where finding_type =
   * 'kid_feedback' and target_kind = the content type. Above 10% of
   * recent production → forced step DOWN; above 5% → yellow.
   */
  kidArchives: number;
  kidArchivesPct: number;
  trend: Trend;
};

export type CapRow = {
  content_type: string;
  daily_target: number;
  daily_max: number;
  auto_apply: boolean;
  last_adjusted_by: string | null;
  last_adjusted_at: string | null;
  suggested_target: number | null;
  suggested_reason: string | null;
  suggested_at: string | null;
};

export async function getCap(
  contentType: string,
): Promise<{ target: number; max: number; autoApply: boolean }> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("content_production_caps")
    .select("daily_target, daily_max, auto_apply")
    .eq("content_type", contentType)
    .maybeSingle();
  if (!data) {
    // First-time content type — seed a sensible default. Returns the
    // seed values so the caller can proceed without a separate insert.
    const seed = { target: 1, max: 5, autoApply: false };
    await admin.from("content_production_caps").insert({
      content_type: contentType,
      daily_target: seed.target,
      daily_max: seed.max,
      auto_apply: seed.autoApply,
      last_adjusted_by: "auto-seed",
      last_adjusted_at: new Date().toISOString(),
    });
    return seed;
  }
  return {
    target: (data as any).daily_target ?? 1,
    max: (data as any).daily_max ?? 10,
    autoApply: !!(data as any).auto_apply,
  };
}

/**
 * caps.content_type uses the same string as the post-publish asset
 * kind, except for a few heal/asset-fill specialties that aren't
 * themselves content kinds. Map the cap row's content_type to the
 * target_kind used by kid_feedback findings, returning null when
 * there's no mapping (e.g. *_heal / *_fill caps don't have direct
 * kid-feedback channels).
 */
function capToFeedbackTargetKind(contentType: string): string | null {
  if (contentType.endsWith("_heal") || contentType.endsWith("_fill")) {
    return null;
  }
  return contentType;
}

async function computeWindowMetrics(
  contentType: string,
  windowDays: number,
): Promise<WindowMetrics> {
  const admin = supabaseAdmin();
  const since = new Date(
    Date.now() - windowDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Pre-publish health (qc_runs)
  const { data: rows } = await admin
    .from("qc_runs")
    .select("outcome")
    .eq("content_type", contentType)
    .gte("created_at", since);
  const list = (rows ?? []) as Array<{ outcome: string }>;
  const pieces = list.length;
  const passedFirstTry = list.filter(
    (r) => r.outcome === "passed_first_try",
  ).length;
  const healed = list.filter((r) => r.outcome === "healed").length;
  const quarantined = list.filter((r) => r.outcome === "quarantined").length;
  const firstPassPct =
    pieces > 0 ? Math.round((passedFirstTry / pieces) * 100) : 0;
  const failed = pieces - passedFirstTry;
  const healSuccessPct =
    failed > 0 ? Math.round((healed / failed) * 100) : 100;

  // Post-publish health (kid_feedback auto-archives)
  let kidArchives = 0;
  const targetKind = capToFeedbackTargetKind(contentType);
  if (targetKind) {
    const { count } = await admin
      .from("content_audit_findings")
      .select("id", { count: "exact", head: true })
      .eq("target_kind", targetKind)
      .eq("finding_type", "kid_feedback")
      .gte("created_at", since);
    kidArchives = count ?? 0;
  }
  // Rate is kid-archives relative to pieces produced in the same
  // window. When pieces is 0 we can't meaningfully compute a rate;
  // treat absent kid-archives as 0% and present as 100% (forces red).
  const kidArchivesPct =
    pieces > 0
      ? Math.round((kidArchives / pieces) * 100)
      : kidArchives > 0
        ? 100
        : 0;

  let trend: Trend = "green";
  if (quarantined > 0) trend = "red";
  else if (firstPassPct < 55 || healSuccessPct < 80) trend = "red";
  else if (kidArchivesPct > 10) trend = "red";
  else if (firstPassPct < 70 || healSuccessPct < 90) trend = "yellow";
  else if (kidArchivesPct > 5) trend = "yellow";

  return {
    windowDays,
    pieces,
    passedFirstTry,
    healed,
    quarantined,
    firstPassPct,
    healSuccessPct,
    kidArchives,
    kidArchivesPct,
    trend,
  };
}

export type Suggestion = {
  contentType: string;
  current: number;
  suggested: number;
  max: number;
  reason: string;
  trend: Trend;
  metrics: { d7: WindowMetrics; d14: WindowMetrics };
};

export async function suggestForContentType(
  cap: CapRow,
): Promise<Suggestion> {
  const d7 = await computeWindowMetrics(cap.content_type, 7);
  const d14 = await computeWindowMetrics(cap.content_type, 14);
  const current = cap.daily_target;
  const max = cap.daily_max;

  // Too little data — hold steady.
  if (d7.pieces < 5) {
    return {
      contentType: cap.content_type,
      current,
      suggested: current,
      max,
      reason: `Only ${d7.pieces} pieces in last 7 days — need more data before adjusting.`,
      trend: d7.trend,
      metrics: { d7, d14 },
    };
  }

  // Hard freeze on any quarantine — investigate before scaling.
  if (d14.quarantined > 0) {
    return {
      contentType: cap.content_type,
      current,
      suggested: current,
      max,
      reason: `${d14.quarantined} piece(s) quarantined in last 14d — frozen pending review.`,
      trend: "red",
      metrics: { d7, d14 },
    };
  }

  // Red on kid-archives — kids are actively rejecting this content. Step
  // down hard regardless of pre-publish health.
  if (d7.kidArchivesPct > 10 || d14.kidArchivesPct > 10) {
    const proposed = Math.max(1, current - 1);
    return {
      contentType: cap.content_type,
      current,
      suggested: proposed,
      max,
      reason: `Kid signal: ${d7.kidArchives} thumbs-down auto-archive(s) in 7d (${d7.kidArchivesPct}% of production). Stepping cap down to ${proposed}/day until kids stop rejecting.`,
      trend: "red",
      metrics: { d7, d14 },
    };
  }

  // Yellow → defensive cut.
  if (d7.trend === "yellow" || d14.trend === "yellow") {
    const proposed = Math.max(1, current - 1);
    const kidNote =
      d7.kidArchivesPct > 5
        ? ` Kid thumbs-down rate ${d7.kidArchivesPct}% (>5% threshold).`
        : "";
    return {
      contentType: cap.content_type,
      current,
      suggested: proposed,
      max,
      reason: `Metric slipped (7d: ${d7.firstPassPct}% first-pass, ${d7.healSuccessPct}% heal).${kidNote} Easing back to ${proposed}/day.`,
      trend: "yellow",
      metrics: { d7, d14 },
    };
  }

  // 14d green AND under max → 2x ramp.
  if (d14.trend === "green" && d14.pieces >= 14 && current < max) {
    const proposed = Math.min(current * 2, max);
    if (proposed > current) {
      return {
        contentType: cap.content_type,
        current,
        suggested: proposed,
        max,
        reason: `14d green (${d14.firstPassPct}% first-pass, ${d14.healSuccessPct}% heal, 0 quarantined). Double to ${proposed}/day.`,
        trend: "green",
        metrics: { d7, d14 },
      };
    }
  }

  // 7d green AND under max → +1.
  if (d7.trend === "green" && current < max) {
    const proposed = Math.min(current + 1, max);
    if (proposed > current) {
      return {
        contentType: cap.content_type,
        current,
        suggested: proposed,
        max,
        reason: `7d green (${d7.firstPassPct}% first-pass, ${d7.healSuccessPct}% heal). +1 to ${proposed}/day.`,
        trend: "green",
        metrics: { d7, d14 },
      };
    }
  }

  // At cap or just steady.
  return {
    contentType: cap.content_type,
    current,
    suggested: current,
    max,
    reason:
      current >= max
        ? `At daily_max (${max}). Bump the ceiling manually to keep ramping.`
        : "Holding steady.",
    trend: "green",
    metrics: { d7, d14 },
  };
}

export async function getAllCaps(): Promise<CapRow[]> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("content_production_caps")
    .select("*")
    .order("content_type");
  return ((data ?? []) as CapRow[]) || [];
}

export async function applyCap(input: {
  contentType: string;
  newTarget: number;
  by: "human" | "auto";
}): Promise<{ ok: boolean; error?: string }> {
  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("content_production_caps")
    .select("daily_max")
    .eq("content_type", input.contentType)
    .maybeSingle();
  if (!row) return { ok: false, error: "Unknown content_type" };
  const max = (row as any).daily_max as number;
  const next = Math.max(1, Math.min(input.newTarget, max));
  const { error } = await admin
    .from("content_production_caps")
    .update({
      daily_target: next,
      last_adjusted_by: input.by,
      last_adjusted_at: new Date().toISOString(),
      // Clear the suggestion once it's applied.
      suggested_target: null,
      suggested_reason: null,
      suggested_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("content_type", input.contentType);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setAutoApply(
  contentType: string,
  autoApply: boolean,
): Promise<void> {
  const admin = supabaseAdmin();
  await admin
    .from("content_production_caps")
    .update({ auto_apply: autoApply, updated_at: new Date().toISOString() })
    .eq("content_type", contentType);
}

/**
 * Nightly review: compute suggestions for every content type, write
 * them to the row, and auto-apply where the operator has opted in.
 * Called by /api/cron/qc-cap-review.
 */
export async function runAdaptiveReview(): Promise<{
  reviewed: number;
  applied: string[];
  suggested: string[];
  noChange: string[];
}> {
  const admin = supabaseAdmin();
  const caps = await getAllCaps();
  const applied: string[] = [];
  const suggested: string[] = [];
  const noChange: string[] = [];

  for (const cap of caps) {
    const s = await suggestForContentType(cap);
    if (s.suggested === s.current) {
      // Still write the metric snapshot so the dashboard shows
      // current health even when no change is proposed.
      await admin
        .from("content_production_caps")
        .update({
          suggested_target: null,
          suggested_reason: s.reason,
          suggested_at: new Date().toISOString(),
        })
        .eq("content_type", cap.content_type);
      noChange.push(cap.content_type);
      continue;
    }

    if (cap.auto_apply) {
      await applyCap({
        contentType: cap.content_type,
        newTarget: s.suggested,
        by: "auto",
      });
      applied.push(`${cap.content_type}: ${s.current}→${s.suggested}`);
    } else {
      await admin
        .from("content_production_caps")
        .update({
          suggested_target: s.suggested,
          suggested_reason: s.reason,
          suggested_at: new Date().toISOString(),
        })
        .eq("content_type", cap.content_type);
      suggested.push(`${cap.content_type}: ${s.current}→${s.suggested}`);
    }
  }

  return {
    reviewed: caps.length,
    applied,
    suggested,
    noChange,
  };
}
