/**
 * Factory cron: calibrated multiple-choice questions.
 *
 * Each batch generates N items spread across CCS standards × 5
 * difficulty bands so the calibrated_items library grows balanced.
 * Reuses lib/ai/build-calibrated-items.generateCalibratedItem.
 *
 * Pipeline per item:
 *   pick (standard, grade, theme, difficulty)
 *   → generateCalibratedItem (text only, no passage anchor in v1)
 *   → runFullQuizQc on the question alone
 *   → standards-fidelity judge ($0.001/call)
 *   → MCQ length-cheat check
 *   → enqueueGeneratedAsset (decides ready / rejected)
 *   → if ready: persist to calibrated_items table
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateCalibratedItem } from "@/lib/ai/build-calibrated-items";
import { runFullQuizQc } from "@/lib/ai/qc";
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

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ASSET_KIND = "calibrated_mcq";
const PROMPT_VERSION = "calibrated_mcq_v1";
// 6 standards × 5 difficulty bands = 30 items per batch at full volume.
// Start conservative for first nights; bump after May 7 review.
const DEFAULT_BATCH_SIZE = 10;

function systemTeacherId(): string {
  const id = process.env.DAILY_QUESTION_TEACHER_ID;
  if (!id) {
    throw new Error("DAILY_QUESTION_TEACHER_ID env var required.");
  }
  return id;
}

async function run(req: NextRequest) {
  const provided = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const batchSize = Math.max(
    1,
    Math.min(50, parseInt(url.searchParams.get("count") ?? `${DEFAULT_BATCH_SIZE}`, 10) || DEFAULT_BATCH_SIZE),
  );

  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    trackFactoryError(e, { assetKind: ASSET_KIND });
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }

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
        message: "Today's calibrated-mcq run already happened.",
      });
    }
    return NextResponse.json(
      { ok: false, error: startResult.error ?? "Could not start run." },
      { status: 500 },
    );
  }
  const runId = startResult.runId;

  const todaySpend = await todayCreditSpend();
  const guard = preflight({
    assetKind: ASSET_KIND,
    requestedCount: batchSize,
    creditsAlreadySpentToday: todaySpend,
  });
  if (!guard.ok) {
    await finishFactoryRun({ runId, status: "aborted", error: guard.reason });
    return NextResponse.json({ ok: false, error: guard.reason }, { status: 400 });
  }

  // Pick standards. Each gets all 5 difficulty bands so the library
  // grows uniformly.
  const standardCount = Math.max(1, Math.ceil(batchSize / 5));
  const picks = await pickRotation({
    assetKind: ASSET_KIND,
    count: standardCount,
  });

  let generatedCount = 0;
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;
  let creditsUsed = 0;
  const itemSummaries: any[] = [];
  let itemsBuilt = 0;

  outer: for (const pick of picks) {
    for (const difficulty of [1, 2, 3, 4, 5] as const) {
      if (itemsBuilt >= batchSize) break outer;

      const proposedTitle = `${pick.standardId} d${difficulty} — ${pick.theme}`;
      const dedupe = await checkTopicNotDuplicate({
        assetKind: ASSET_KIND,
        proposedTitle,
        proposedSummary: pick.theme,
      });
      if (!dedupe.ok) {
        itemSummaries.push({ pick, difficulty, skipped: true, reason: dedupe.reason });
        continue;
      }

      let gen;
      try {
        gen = await generateCalibratedItem({
          teacherId,
          standardId: pick.standardId,
          standardDescription: pick.standardDescription,
          gradeLevel: pick.grade,
          targetDifficulty: difficulty,
          passageContext: null,
        });
      } catch (e: any) {
        trackFactoryError(e, {
          assetKind: ASSET_KIND,
          runId,
          extra: { stage: "generate", standardId: pick.standardId, difficulty },
        });
        failCount++;
        itemsBuilt++;
        itemSummaries.push({ pick, difficulty, error: e?.message ?? "gen threw" });
        continue;
      }
      if (!gen.ok) {
        failCount++;
        itemsBuilt++;
        itemSummaries.push({ pick, difficulty, error: gen.error });
        continue;
      }
      generatedCount++;
      itemsBuilt++;
      // ~2 credits per item per estimation table
      creditsUsed += 2;

      const item = gen.item;

      // QC the question alone (no passage to check).
      let qcReport: any = null;
      let qcOverall: "pass" | "warn" | "fail" = "warn";
      try {
        qcReport = await runFullQuizQc({
          teacherId,
          passageTitle: null,
          passageBody: null,
          gradeLevel: pick.grade,
          questions: [
            {
              kind: "multiple_choice",
              prompt: item.prompt,
              choices: item.choices,
              correct: item.correct,
              hint: item.hint ?? null,
            },
          ],
          imageUrl: null,
          imageScene: null,
        });
        qcOverall = qcReport.overall;
        creditsUsed += qcReport.creditsUsed ?? 0;
      } catch (e) {
        trackFactoryError(e, {
          assetKind: ASSET_KIND,
          runId,
          extra: { stage: "qc", standardId: pick.standardId, difficulty },
        });
      }

      const enqueue = await enqueueGeneratedAsset({
        assetKind: ASSET_KIND,
        // We persist below; queue row's asset_ref will be backfilled
        // after we have the calibrated_items.id.
        assetRef: { table: "calibrated_items", id: "pending" },
        generationRunId: runId,
        promptVersion: PROMPT_VERSION,
        standardId: pick.standardId,
        title: item.prompt.slice(0, 120),
        thumbnailUrl: null,
        qcOverall,
        qcReport,
        mcq: { choices: item.choices, correct: item.correct },
        fidelityInput: {
          standardId: pick.standardId,
          standardDescription: pick.standardDescription,
          questionPrompt: item.prompt,
          choices: item.choices,
          correctAnswer: item.correct,
          passageBody: null,
        },
      });
      if (!enqueue.ok) {
        trackFactoryError(new Error(enqueue.error), {
          assetKind: ASSET_KIND,
          runId,
          extra: { stage: "enqueue" },
        });
        itemSummaries.push({ pick, difficulty, enqueueError: enqueue.error });
        continue;
      }

      // Only persist to the live calibrated_items table when the
      // verdict is `ready` — `rejected` items stay in the queue's
      // shadow row only. (`needs_review` is now reserved for cautious
      // mode.)
      if (enqueue.verdict.status === "ready") {
        const { data: itemRow } = await supabase
          .from("calibrated_items")
          .insert({
            standard_id: pick.standardId,
            grade_level: pick.grade,
            target_difficulty: difficulty,
            difficulty_actual: item.difficultyActual,
            prompt: item.prompt,
            choices: item.choices,
            correct: item.correct,
            hint: item.hint,
            blooms_level: item.bloomsLevel,
            skill_microlabel: item.skillMicrolabel,
            passage_anchor_id: null,
            source: "batch_v1",
            prompt_version: PROMPT_VERSION,
            qc_overall: qcOverall,
            qc_report: qcReport,
            visible_to_students: true,
          })
          .select("id")
          .single();
        if (itemRow) {
          // Backfill the queue row's asset_ref so the dashboard can
          // deep-link to the right calibrated_items.id.
          await supabase
            .from("content_review_queue")
            .update({
              asset_ref: { table: "calibrated_items", id: (itemRow as { id: string }).id },
            })
            .eq("id", enqueue.queueId);
        }
        passCount++;
      } else if (enqueue.verdict.status === "rejected") {
        failCount++;
      } else {
        warnCount++;
      }

      itemSummaries.push({
        pick,
        difficulty,
        verdict: enqueue.verdict,
        qcOverall,
        fidelity: enqueue.fidelity?.verdict ?? null,
      });
    }
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
