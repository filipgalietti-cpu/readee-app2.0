/**
 * Preview which sessions in a plan resolve to assignable Readee
 * material before the teacher commits to creating the assignments.
 * Reads classrooms the teacher owns AND that the kid is enrolled in
 * so the modal can show a sensible classroom picker.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";
import { resolvePlanMaterials } from "@/lib/iep/material-resolver";
import { computeSessionSchedule } from "@/lib/iep/schedule";
import type {
  InterventionPlan,
  InterventionSession,
} from "@/lib/ai/build-intervention-plan";

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

  const planId = String(body.planId ?? "");
  // Optional override start date so the modal can re-preview when the
  // teacher changes the date picker.
  const startDateOverrideRaw = typeof body.startDate === "string" ? body.startDate : "";
  if (!planId) {
    return NextResponse.json({ ok: false, error: "planId required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("intervention_plans")
    .select("id, child_id, teacher_id, plan_json, start_date, end_date")
    .eq("id", planId)
    .maybeSingle();
  if (!plan) {
    return NextResponse.json({ ok: false, error: "Plan not found." }, { status: 404 });
  }
  const p = plan as any;
  if (p.teacher_id !== profileId) {
    return NextResponse.json({ ok: false, error: "Not your plan." }, { status: 403 });
  }

  const { data: childRow } = await supabase
    .from("children")
    .select("first_name")
    .eq("id", p.child_id)
    .maybeSingle();
  const childFirstName = (childRow as any)?.first_name ?? "Student";

  const planJson = p.plan_json as InterventionPlan;
  // Carry weekLabel through the flatten so the UI can group by week
  // and the kid's assignment note can name the week (Week 1 Day 1 vs
  // Week 2 Day 1 — without this the labels collide).
  const flatSessions: (InterventionSession & { weekLabel: string })[] = (
    planJson?.weeklyBlocks ?? []
  ).flatMap((w) => w.sessions.map((s) => ({ ...s, weekLabel: w.weekLabel })));

  const resolutions = await resolvePlanMaterials({
    sessions: flatSessions,
    teacherId: profileId,
  });

  // Eligible classrooms — taught by this teacher AND containing the kid.
  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("classroom_id, classrooms!inner(id, name, teacher_id)")
    .eq("child_id", p.child_id);
  const eligibleClassrooms = ((memberships ?? []) as any[])
    .map((m) => {
      const c = Array.isArray(m.classrooms) ? m.classrooms[0] : m.classrooms;
      return c && c.teacher_id === profileId
        ? { id: c.id as string, name: c.name as string }
        : null;
    })
    .filter(Boolean) as { id: string; name: string }[];

  // Compute the schedule the kid would actually see — one weekday per
  // session, weekends skipped. The teacher overrides the start date
  // by re-POSTing this endpoint with `startDate`.
  const startDate = startDateOverrideRaw
    ? new Date(startDateOverrideRaw + "T00:00:00")
    : p.start_date
    ? new Date(String(p.start_date) + "T00:00:00")
    : new Date();
  const sessionDates = computeSessionSchedule(startDate, flatSessions.length);

  return NextResponse.json({
    ok: true,
    planId,
    childId: p.child_id,
    childFirstName,
    sessions: flatSessions.map((s, i) => ({
      index: i,
      session: s,
      resolution: resolutions[i],
      scheduledDate: sessionDates[i]?.toISOString().slice(0, 10) ?? null,
    })),
    eligibleClassrooms,
    startDate: sessionDates[0]?.toISOString().slice(0, 10) ?? null,
    endDate: sessionDates[sessionDates.length - 1]?.toISOString().slice(0, 10) ?? null,
  });
}
