/**
 * Push assignable sessions of an intervention plan to the assignments
 * table. Each session emits one assignment row targeted at the kid
 * (per-student via assigned_child_ids), kicking off in the order the
 * plan lays out the days.
 *
 * Skipped sessions (teacher_led, fluency_probe, unmatched material)
 * are returned in the response so the UI can show what's pending
 * teacher action.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";
import { resolvePlanMaterials, type ResolvedMaterial } from "@/lib/iep/material-resolver";
import type {
  InterventionPlan,
  InterventionSession,
} from "@/lib/ai/build-intervention-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  planId: string;
  classroomId: string;
  startDate?: string | null;
};

export async function POST(req: Request) {
  const gate = await checkTeacherTier({ min: "school" });
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  const profileId = gate.profileId;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON." }, { status: 400 });
  }
  const planId = String(body.planId ?? "");
  const classroomId = String(body.classroomId ?? "");
  if (!planId || !classroomId) {
    return NextResponse.json(
      { ok: false, error: "planId and classroomId required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("intervention_plans")
    .select("id, child_id, teacher_id, plan_json, start_date, end_date")
    .eq("id", planId)
    .maybeSingle();
  if (!plan || (plan as any).teacher_id !== profileId) {
    return NextResponse.json({ ok: false, error: "Plan not found." }, { status: 404 });
  }
  const p = plan as any;

  // Gate the classroom: must be the teacher's, and the kid must be in it.
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, teacher_id")
    .eq("id", classroomId)
    .maybeSingle();
  if (!classroom || (classroom as any).teacher_id !== profileId) {
    return NextResponse.json(
      { ok: false, error: "You don't own that classroom." },
      { status: 403 },
    );
  }
  const { data: membership } = await supabase
    .from("classroom_memberships")
    .select("child_id")
    .eq("classroom_id", classroomId)
    .eq("child_id", p.child_id)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json(
      { ok: false, error: "That student isn't in that classroom." },
      { status: 400 },
    );
  }

  const planJson = p.plan_json as InterventionPlan;
  const flatSessions: InterventionSession[] = (planJson?.weeklyBlocks ?? []).flatMap(
    (w) => w.sessions,
  );
  const resolutions = await resolvePlanMaterials({
    sessions: flatSessions,
    teacherId: profileId,
  });

  // Stagger due dates across the 2-week window so the kid sees them in
  // order. Day-1 of week-1 due 1 day in; day-2 due 2 days in; etc.
  const startDate = body.startDate
    ? new Date(body.startDate + "T00:00:00")
    : new Date();
  const dueDates: string[] = flatSessions.map((_, i) => {
    const d = new Date(startDate.getTime() + (i + 1) * 86400_000);
    d.setHours(23, 59, 0, 0);
    return d.toISOString();
  });

  type AssignmentRow = {
    classroom_id: string;
    assigned_by: string;
    kind: string;
    source_id: string;
    title: string;
    note: string | null;
    due_at: string;
    pass_threshold: number | null;
    audio_prompt_enabled: boolean;
    audio_choices_enabled: boolean;
    shuffle_questions: boolean;
    shuffle_choices: boolean;
    reveal_correct_immediately: boolean;
    attempts_allowed: number | null;
    source_passage_id: string | null;
    source_level: string | null;
    assigned_child_ids: string[];
  };
  const rowsToInsert: AssignmentRow[] = [];
  const skipped: { index: number; reason: string }[] = [];
  resolutions.forEach((r: ResolvedMaterial, i) => {
    if (!r.assignable) {
      skipped.push({ index: i, reason: r.reason });
      return;
    }
    rowsToInsert.push({
      classroom_id: classroomId,
      assigned_by: profileId,
      kind: r.assignmentKind,
      source_id: r.sourceId,
      title: r.title,
      note: `IEP plan · ${flatSessions[i].dayLabel} · ${flatSessions[i].activity}`,
      due_at: dueDates[i],
      pass_threshold: null,
      audio_prompt_enabled: true,
      audio_choices_enabled: false,
      shuffle_questions: false,
      shuffle_choices: true,
      reveal_correct_immediately: true,
      attempts_allowed: null,
      source_passage_id: r.sourcePassageId ?? null,
      source_level: r.sourceLevel ?? null,
      assigned_child_ids: [p.child_id],
    });
  });

  let createdIds: string[] = [];
  if (rowsToInsert.length > 0) {
    const { data: inserted, error } = await supabase
      .from("assignments")
      .insert(rowsToInsert)
      .select("id");
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    createdIds = ((inserted ?? []) as any[]).map((r) => r.id as string);
  }

  // Flip plan to active and stamp the assignment IDs onto plan_json
  // so the UI can show "12 sessions pushed" later.
  const updatedPlan = {
    ...planJson,
    pushed: {
      classroomId,
      childId: p.child_id,
      pushedAt: new Date().toISOString(),
      assignmentIds: createdIds,
      skippedSessionIndexes: skipped.map((s) => s.index),
    },
  };
  await supabase
    .from("intervention_plans")
    .update({ status: "active", plan_json: updatedPlan })
    .eq("id", planId);

  return NextResponse.json({
    ok: true,
    pushedCount: createdIds.length,
    skipped,
    assignmentIds: createdIds,
  });
}
