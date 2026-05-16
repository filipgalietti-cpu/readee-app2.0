/**
 * Nightly content audit — runs deterministic spec checks across the
 * full questions_db + lessons_db catalog, writes findings to
 * content_audit_findings + content_audit_runs.
 *
 * Why "deterministic spec checks only" (no committee judges):
 * the multi-judge committee passes (slide.judge, q.should_be_asked,
 * q.better_format) take ~10s/item × ~1,200 items = ~3.5 hours. That
 * doesn't fit a Vercel function's 300s ceiling. Spec checks run
 * pure-function in milliseconds; the full 1,200-item catalog
 * comfortably finishes inside a 60-90s slot.
 *
 * The committee passes still run inside each regen handler at the
 * point of fix (the regen scripts in scripts/qc-bot-* invoke
 * judgeCommittee per-item before persisting). So we get continuous
 * structural surveillance here + targeted committee verification at
 * the regen boundary — same outcome as the manual script, just
 * spread across the cron + handler split.
 *
 * Schedule: daily 02:00 UTC (before the qc-bot remediation at 06:00
 * so fresh findings are ready for the regen workers).
 *
 * Manual trigger: GET ?force=1 to bypass per-day dedupe.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { loadQuestionBanks, loadLessons } from "@/lib/qc/audit-sources";
import {
  runQuestionSpecChecks,
  runLessonSpecChecks,
} from "@/lib/qc/spec-checks";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Summary = {
  questionsScanned: number;
  lessonsScanned: number;
  findingsPass: number;
  findingsWarn: number;
  findingsFail: number;
};

async function startRun(scope: string): Promise<string> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("content_audit_runs")
    .insert({ scope, status: "running" })
    .select("id")
    .single();
  if (error || !data) throw new Error("could not start audit run");
  return (data as { id: string }).id;
}

async function finishRun(runId: string, sum: Summary): Promise<void> {
  const sb = supabaseAdmin();
  await sb
    .from("content_audit_runs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      questions_scanned: sum.questionsScanned,
      lessons_scanned: sum.lessonsScanned,
      findings_pass: sum.findingsPass,
      findings_warn: sum.findingsWarn,
      findings_fail: sum.findingsFail,
    })
    .eq("id", runId);
}

async function upsertFinding(input: {
  runId: string;
  targetKind: "question" | "lesson" | "lesson_slide";
  targetId: string;
  grade: string | null;
  findingType: string;
  severity: "warn" | "fail";
  message: string;
  targetSnapshot?: any;
}): Promise<void> {
  const sb = supabaseAdmin();
  // ON CONFLICT (target_kind, target_id, finding_type): the cron
  // intentionally re-touches existing rows so the run_id + message
  // stay current. Closed-fixed rows that the underlying content has
  // since re-broken will flip back to open on conflict.
  await sb.from("content_audit_findings").upsert(
    {
      target_kind: input.targetKind,
      target_id: input.targetId,
      grade: input.grade,
      finding_type: input.findingType,
      severity: input.severity,
      message: input.message,
      target_snapshot: input.targetSnapshot ?? null,
      audit_run_id: input.runId,
      status: "open",
    },
    { onConflict: "target_kind,target_id,finding_type" },
  );
}

async function alreadyRanToday(): Promise<boolean> {
  const sb = supabaseAdmin();
  const since = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
  const { count } = await sb
    .from("content_audit_runs")
    .select("id", { count: "exact", head: true })
    .like("scope", "cron%")
    .gte("started_at", since);
  return (count ?? 0) > 0;
}

export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get("force") === "1";
  if (!force && (await alreadyRanToday())) {
    return NextResponse.json({ skipped: "already ran in the last 23h" });
  }

  const scope = `cron content-audit ${new Date().toISOString().slice(0, 10)} (spec-only)`;
  const runId = await startRun(scope);

  const sum: Summary = {
    questionsScanned: 0,
    lessonsScanned: 0,
    findingsPass: 0,
    findingsWarn: 0,
    findingsFail: 0,
  };

  // ── Questions ───────────────────────────────────────────────────
  const banks = await loadQuestionBanks("db");
  for (const gradeBank of banks) {
    for (const std of gradeBank.bank.standards) {
      for (const q of std.questions) {
        sum.questionsScanned++;
        const findings = runQuestionSpecChecks({
          type: q.type ?? "multiple_choice",
          grade: gradeBank.grade,
          prompt: q.prompt ?? "",
          choices: (q as any).choices,
          correct: (q as any).correct,
          audio_url: (q as any).audio_url ?? null,
          image_url: (q as any).image_url ?? null,
        });
        for (const r of findings) {
          if (r.severity === "fail") sum.findingsFail++;
          else sum.findingsWarn++;
          await upsertFinding({
            runId,
            targetKind: "question",
            targetId: q.id,
            grade: gradeBank.grade,
            findingType: r.findingType,
            severity: r.severity,
            message: r.message,
          });
        }
        if (findings.length === 0) sum.findingsPass++;
      }
    }
  }

  // ── Lessons ─────────────────────────────────────────────────────
  const lessons = await loadLessons("db");
  for (const lesson of lessons) {
    sum.lessonsScanned++;
    const lessonFindings = runLessonSpecChecks({
      grade: lesson.grade,
      slides: lesson.slides,
    });
    if (lessonFindings.length === 0) sum.findingsPass++;
    for (const r of lessonFindings) {
      if (r.severity === "fail") sum.findingsFail++;
      else sum.findingsWarn++;
      const targetKind = r.targetSubId ? "lesson_slide" : "lesson";
      const targetId = r.targetSubId
        ? `${lesson.standardId}#${r.targetSubId}`
        : lesson.standardId;
      await upsertFinding({
        runId,
        targetKind,
        targetId,
        grade: lesson.grade,
        findingType: r.findingType,
        severity: r.severity,
        message: r.message,
      });
    }
  }

  await finishRun(runId, sum);
  return NextResponse.json({ runId, ...sum });
}
