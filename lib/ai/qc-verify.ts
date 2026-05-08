/**
 * Same-night verify pass for the QC cron.
 *
 * After a worker regenerates an image / audio / step-audio asset,
 * we re-run the same judge against the new asset RIGHT THEN. The
 * three outcomes:
 *
 *   pass  → close the finding for real, log a verify_* event
 *   warn  → keep finding closed but log the warning
 *   fail  → re-open the finding so tomorrow's cron retries; log
 *           a verify_* fail event so the dashboard shows a stuck
 *           target
 *
 * Without this, regen happened Monday but the verify pass didn't
 * run until next Sunday's audit — a 7-day gap. With this, the
 * loop closes within ONE cron run.
 *
 * The standalone qc:verify script (scripts/qc-verify-regens.ts)
 * remains for the on-demand "did the workers actually fix things"
 * sweep. This module is the inline path the cron + factory use.
 */
import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { judgeAudioFile, judgeImageQuality } from "@/lib/ai/qc-media";

export type VerifyOutcome = {
  verdict: "pass" | "warn" | "fail" | "skipped";
  reason: string;
};

/**
 * Verify an image regen by re-running the image judge against the
 * current URL. Persists a content_qc_log row + reopens the finding
 * on fail. Returns the outcome so the caller can update its counters.
 */
export async function verifyImageRegen(input: {
  findingId: string;
  targetId: string;
  imageUrl: string;
  expectedScene: string;
  agent?: string;
}): Promise<VerifyOutcome> {
  const v = await judgeImageQuality({
    imageUrl: input.imageUrl,
    expectedScene: input.expectedScene.slice(0, 400),
  });
  if (!v.ok) {
    return { verdict: "skipped", reason: v.error ?? "judge errored" };
  }
  return persistVerdict({
    findingId: input.findingId,
    targetKind: "question",
    targetId: input.targetId,
    kind: "image",
    severity: v.severity,
    reason: v.reason,
    agent: input.agent ?? "qc-bot/cron",
  });
}

/**
 * Verify an audio regen. Same shape as verifyImageRegen — re-runs
 * the audio judge against the URL and persists.
 */
export async function verifyAudioRegen(input: {
  findingId: string;
  targetKind: "question" | "lesson_slide";
  targetId: string;
  audioUrl: string;
  expectedText: string;
  agent?: string;
}): Promise<VerifyOutcome> {
  if (!input.expectedText.trim()) {
    return { verdict: "skipped", reason: "no expected text in snapshot" };
  }
  const v = await judgeAudioFile({
    audioUrl: input.audioUrl,
    expectedText: input.expectedText.slice(0, 1500),
  });
  if (!v.ok) {
    return { verdict: "skipped", reason: v.error ?? "judge errored" };
  }
  return persistVerdict({
    findingId: input.findingId,
    targetKind: input.targetKind,
    targetId: input.targetId,
    kind: "audio",
    severity: v.severity,
    reason: v.reason,
    agent: input.agent ?? "qc-bot/cron",
  });
}

async function persistVerdict(input: {
  findingId: string;
  targetKind: "question" | "lesson_slide";
  targetId: string;
  kind: "image" | "audio";
  severity: "pass" | "warn" | "fail";
  reason: string;
  agent: string;
}): Promise<VerifyOutcome> {
  const admin = supabaseAdmin();
  const change_type = `verify_${input.kind}`;

  if (input.severity === "pass" || input.severity === "warn") {
    // Leave the finding fixed (the regen worker already did that).
    // Just log the verify event for the dashboard timeline.
    await admin.from("content_qc_log").insert({
      target_kind: input.targetKind,
      target_id: input.targetId,
      change_type,
      before: null,
      after: { verdict: input.severity, reason: input.reason },
      reason:
        input.severity === "pass"
          ? `Same-night verify: judge confirmed the regen passes.`
          : `Same-night verify: regen has a warning, leaving fixed but flagged.`,
      finding_id: input.findingId,
      agent: input.agent,
    });
    return { verdict: input.severity, reason: input.reason };
  }

  // FAIL — reopen the finding for tomorrow's cron retry. The
  // existing 3-attempts-max logic on question_qc_status takes
  // over from here.
  await admin
    .from("content_audit_findings")
    .update({
      status: "open",
      resolved_at: null,
      resolver_note: `Same-night verify reopened — judge re-flagged: ${input.reason.slice(0, 240)}`,
    })
    .eq("id", input.findingId);

  await admin.from("content_qc_log").insert({
    target_kind: input.targetKind,
    target_id: input.targetId,
    change_type,
    before: null,
    after: { verdict: "fail", reason: input.reason },
    reason: `Same-night verify: regen STILL fails. Finding re-opened for next cron run.`,
    finding_id: input.findingId,
    agent: input.agent,
  });

  return { verdict: "fail", reason: input.reason };
}
