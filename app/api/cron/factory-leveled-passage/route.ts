/**
 * Factory cron: leveled passages.
 *
 * Nightly (default ~3 UTC), generates a small batch of differentiated
 * passages tagged to CCS comprehension standards and a curated theme.
 * Each passage gets the full QC pipeline + auto-promotion, with rejects
 * and warns landing in /owner/batch-qc for human review.
 *
 * Idempotent: factory_runs has a unique constraint on (run_date,
 * asset_kind), so re-running the same day returns early without
 * spending credits.
 *
 * Manual trigger: POST with `?force=1` to bypass the daily idempotency
 * check (deletes any existing run row first). Useful for testing the
 * pipeline.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildLeveledPassage } from "@/lib/ai/build-leveled";
import {
  preflight,
  startFactoryRun,
  finishFactoryRun,
  todayCreditSpend,
  trackFactoryError,
  enqueueGeneratedAsset,
  checkTopicNotDuplicate,
} from "@/lib/factory";
import { pickRotation } from "@/lib/factory/topic-rotation";
import { brandVoicePromptBlock } from "@/lib/factory/brand-voice";

export const dynamic = "force-dynamic";
// Per-run can take 5+ minutes — 10 leveled passages × ~30s each plus
// QC + image. Keep at the Vercel max for now.
export const maxDuration = 300;

const ASSET_KIND = "leveled_passage";
const PROMPT_VERSION = "leveled_v1";
// Conservative volume for first nights. Once we trust the QC outputs,
// we can bump toward FACTORY_BATCH_CAPS.leveled_passage = 15.
const DEFAULT_BATCH_SIZE = 5;

function systemTeacherId(): string {
  const id = process.env.DAILY_QUESTION_TEACHER_ID;
  if (!id) {
    throw new Error(
      "DAILY_QUESTION_TEACHER_ID env var is required (factory uses the same system teacher).",
    );
  }
  return id;
}

async function run(req: NextRequest) {
  // Auth — same CRON_SECRET pattern as daily-question.
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const batchSize = Math.max(
    1,
    Math.min(15, parseInt(url.searchParams.get("count") ?? `${DEFAULT_BATCH_SIZE}`, 10) || DEFAULT_BATCH_SIZE),
  );

  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    trackFactoryError(e, { assetKind: ASSET_KIND });
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 },
    );
  }

  // Idempotency: bail if today's run already exists, unless ?force=1.
  // On force, blow away the existing row so we can re-run.
  const supabase = supabaseAdmin();
  if (force) {
    const today = new Date().toISOString().slice(0, 10);
    await supabase
      .from("factory_runs")
      .delete()
      .eq("run_date", today)
      .eq("asset_kind", ASSET_KIND);
  }

  const startResult = await startFactoryRun({
    assetKind: ASSET_KIND,
    requestedCount: batchSize,
    promptVersion: PROMPT_VERSION,
  });
  if (!startResult.ok) {
    if (startResult.reason === "already_ran") {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Today's leveled-passage run already happened.",
      });
    }
    return NextResponse.json(
      { ok: false, error: startResult.error ?? "Could not start run." },
      { status: 500 },
    );
  }
  const runId = startResult.runId;

  // Pre-flight — credit budget check.
  const todaySpend = await todayCreditSpend();
  const guard = preflight({
    assetKind: ASSET_KIND,
    requestedCount: batchSize,
    creditsAlreadySpentToday: todaySpend,
  });
  if (!guard.ok) {
    await finishFactoryRun({
      runId,
      status: "aborted",
      error: guard.reason,
    });
    return NextResponse.json(
      { ok: false, error: guard.reason },
      { status: 400 },
    );
  }

  // Pick the rotation: N (standard, grade, theme) tuples.
  const picks = await pickRotation({
    assetKind: ASSET_KIND,
    count: batchSize,
  });

  let generatedCount = 0;
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;
  let creditsUsed = 0;
  const itemSummaries: any[] = [];

  for (const pick of picks) {
    const proposedTitle = `${pick.theme} — ${pick.standardDescription.slice(0, 60)}`;
    const proposedTopic = `Write a passage about ${pick.theme}. The passage should give kids practice with: "${pick.standardDescription}" (${pick.standardId}). ${brandVoicePromptBlock(pick.grade) ? "\n\n" + brandVoicePromptBlock(pick.grade) : ""}`;

    // Skip near-duplicates of recent topics.
    const dedupe = await checkTopicNotDuplicate({
      assetKind: ASSET_KIND,
      proposedTitle,
      proposedSummary: pick.theme,
    });
    if (!dedupe.ok) {
      itemSummaries.push({
        pick,
        skipped: true,
        reason: dedupe.reason,
      });
      continue;
    }

    let built;
    try {
      built = await buildLeveledPassage({
        teacherId,
        brief: {
          title: "",
          topic: proposedTopic,
          baseGrade: pick.grade,
          perVersionAudio: false, // audio gen skipped on factory v1 to save credits
          sharedImage: true,
          questionsPerLevel: 3,
        },
      });
    } catch (e: any) {
      trackFactoryError(e, {
        assetKind: ASSET_KIND,
        runId,
        extra: { stage: "build", standardId: pick.standardId },
      });
      failCount++;
      itemSummaries.push({ pick, error: e?.message ?? "build threw" });
      continue;
    }
    if (!built.ok) {
      failCount++;
      itemSummaries.push({ pick, error: built.error });
      continue;
    }

    generatedCount++;
    creditsUsed += built.creditsUsed;

    // Pull the persisted row so we can read qc_overall + qc_report
    // without re-running QC.
    const { data: row } = await supabase
      .from("differentiated_passages")
      .select("title, shared_image_url, qc_overall, qc_report, body, audio_url")
      .eq("id", built.passageId)
      .maybeSingle();
    const r = (row ?? {}) as any;

    const enqueue = await enqueueGeneratedAsset({
      assetKind: ASSET_KIND,
      assetRef: { table: "differentiated_passages", id: built.passageId },
      generationRunId: runId,
      promptVersion: PROMPT_VERSION,
      standardId: pick.standardId,
      title: r.title ?? proposedTitle,
      thumbnailUrl: r.shared_image_url ?? null,
      qcOverall: (r.qc_overall ?? "warn") as "pass" | "warn" | "fail",
      qcReport: r.qc_report ?? null,
      mcq: null, // leveled passages don't surface a single canonical MCQ
      fidelityInput: null, // skipped for v1 — fidelity judge is per-MCQ
      contentPreview: {
        passageTitle: r.title ?? null,
        passageBody: r.body ?? null,
        imageUrl: r.shared_image_url ?? null,
        audioUrl: r.audio_url ?? null,
      },
    });
    if (!enqueue.ok) {
      trackFactoryError(new Error(enqueue.error), {
        assetKind: ASSET_KIND,
        runId,
        extra: { stage: "enqueue", passageId: built.passageId },
      });
      itemSummaries.push({ pick, passageId: built.passageId, enqueueError: enqueue.error });
      continue;
    }

    if (enqueue.verdict.status === "ready") passCount++;
    else if (enqueue.verdict.status === "needs_review") warnCount++;
    else if (enqueue.verdict.status === "rejected") failCount++;

    itemSummaries.push({
      pick,
      passageId: built.passageId,
      verdict: enqueue.verdict,
      qcOverall: r.qc_overall,
    });
  }

  await finishFactoryRun({
    runId,
    status: "completed",
    generatedCount,
    passCount,
    warnCount,
    failCount,
    creditsUsed,
  });

  return NextResponse.json({
    ok: true,
    runId,
    requested: batchSize,
    generated: generatedCount,
    pass: passCount,
    warn: warnCount,
    fail: failCount,
    creditsUsed,
    items: itemSummaries,
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
