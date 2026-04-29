import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";
import { draftInterventionPlan } from "@/lib/ai/build-intervention-plan";
import { loadIepDataBundle } from "@/lib/ai/iep-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await checkTeacherTier({ min: "school" });
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  const profileId = gate.profileId;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }

  const childId = String(body.childId ?? "");
  const goalIdRaw = typeof body.goalId === "string" ? body.goalId : "";
  const annualGoalRaw = String(body.annualGoal ?? "").slice(0, 4000);
  const persist = body.persist !== false;
  if (!childId) {
    return NextResponse.json({ ok: false, error: "childId required." }, { status: 400 });
  }

  const supabase = await createClient();

  let goal: {
    id: string;
    text: string;
    baseline: string | null;
    targetCriterion: string | null;
    targetDate: string | null;
  } | null = null;
  if (goalIdRaw) {
    const { data: g } = await supabase
      .from("student_iep_goals")
      .select("id, goal_text, baseline, target_criterion, target_date, child_id")
      .eq("id", goalIdRaw)
      .maybeSingle();
    if (g && (g as any).child_id === childId) {
      goal = {
        id: (g as any).id,
        text: (g as any).goal_text,
        baseline: (g as any).baseline ?? null,
        targetCriterion: (g as any).target_criterion ?? null,
        targetDate: (g as any).target_date ?? null,
      };
    }
  }
  const annualGoal = (goal?.text ?? annualGoalRaw).trim();
  if (!annualGoal) {
    return NextResponse.json(
      { ok: false, error: "Annual goal required." },
      { status: 400 },
    );
  }

  const data = await loadIepDataBundle(childId);
  if (!data.ok) {
    return NextResponse.json({ ok: false, error: data.error }, { status: 404 });
  }
  const b = data.bundle;

  // Best-recent progress note summary feeds the planner so it doesn't
  // re-diagnose the same gap. If none exists, the planner falls back
  // to the raw data.
  let recentNoteSummary: string | null = null;
  const { data: recentNote } = await supabase
    .from("iep_progress_notes")
    .select("one_line_summary, plop, progress_status")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recentNote) {
    const r = recentNote as any;
    const s = r.one_line_summary || r.plop;
    if (s) recentNoteSummary = `Status: ${r.progress_status}. ${s}`;
  }

  const res = await draftInterventionPlan({
    teacherId: profileId,
    studentFirstName: b.child.firstName,
    gradeLevel: b.child.readingLevel ?? "K-4",
    annualGoal,
    goalBaseline: goal?.baseline ?? null,
    goalTargetCriterion: goal?.targetCriterion ?? null,
    goalTargetDate: goal?.targetDate ?? null,
    metricsBlock: b.metricsBlock,
    baselineVsCurrent: b.baselineVsCurrent,
    recentMastery: b.recentMastery,
    runningRecords: b.runningRecords,
    recentNoteSummary,
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  }

  let persistedId: string | null = null;
  if (persist) {
    const today = new Date();
    const twoWeeksOut = new Date(today.getTime() + 14 * 86400_000);
    const { data: inserted, error: insErr } = await supabase
      .from("intervention_plans")
      .insert({
        child_id: childId,
        teacher_id: profileId,
        goal_id: goal?.id ?? null,
        plan_json: res.plan,
        status: "draft",
        start_date: today.toISOString().slice(0, 10),
        end_date: twoWeeksOut.toISOString().slice(0, 10),
      })
      .select("id")
      .single();
    if (!insErr && inserted) persistedId = (inserted as any).id;
  }

  return NextResponse.json({ ok: true, plan: res.plan, persistedId });
}
