"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkTeacherTier } from "@/lib/plan/teacher-gate";

/**
 * FERPA / IEP confidentiality gate. Verifies the teacher actually
 * teaches the named child via classroom_memberships before letting
 * any of these reads return a SPED record.
 *
 * Without this, school-tier teachers could pass an arbitrary
 * child_id and read goals/notes/plans for kids on someone else's
 * roster — same school OR a different school. The plan check
 * (checkTeacherTier) only confirms the caller is on a school plan,
 * not that the kid belongs to them.
 */
async function teacherHasChildOnRoster(
  teacherId: string,
  childId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("classroom_memberships")
    .select("classroom_id, classrooms!inner(teacher_id)")
    .eq("child_id", childId)
    .eq("classrooms.teacher_id", teacherId)
    .limit(1);
  return !!data && data.length > 0;
}

export type GoalType =
  | "reading_fluency"
  | "comprehension"
  | "phonics"
  | "vocabulary"
  | "writing"
  | "speaking"
  | "behavioral"
  | "other";

export type GoalStatus = "active" | "mastered" | "archived" | "superseded";

export type IepGoal = {
  id: string;
  childId: string;
  teacherId: string;
  goalText: string;
  goalType: GoalType | null;
  baseline: string | null;
  targetCriterion: string | null;
  targetDate: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
};

function rowToGoal(r: any): IepGoal {
  return {
    id: r.id,
    childId: r.child_id,
    teacherId: r.teacher_id,
    goalText: r.goal_text,
    goalType: (r.goal_type ?? null) as GoalType | null,
    baseline: r.baseline ?? null,
    targetCriterion: r.target_criterion ?? null,
    targetDate: r.target_date ?? null,
    status: r.status as GoalStatus,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listGoalsForChild(
  childId: string,
): Promise<{ ok: true; goals: IepGoal[] } | { ok: false; error: string }> {
  const gate = await checkTeacherTier({ min: "school" });
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!(await teacherHasChildOnRoster(gate.profileId, childId))) {
    return { ok: false, error: "Student not found on your roster." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_iep_goals")
    .select(
      "id, child_id, teacher_id, goal_text, goal_type, baseline, target_criterion, target_date, status, created_at, updated_at",
    )
    .eq("child_id", childId)
    .order("created_at", { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, goals: ((data ?? []) as any[]).map(rowToGoal) };
}

export async function createGoal(input: {
  childId: string;
  goalText: string;
  goalType?: GoalType | null;
  baseline?: string | null;
  targetCriterion?: string | null;
  targetDate?: string | null;
}): Promise<{ ok: true; goal: IepGoal } | { ok: false; error: string }> {
  const gate = await checkTeacherTier({ min: "school" });
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!(await teacherHasChildOnRoster(gate.profileId, input.childId))) {
    return { ok: false, error: "Student not found on your roster." };
  }
  const goalText = input.goalText.trim();
  if (!goalText) return { ok: false, error: "Goal text is required." };
  if (goalText.length > 4000) {
    return { ok: false, error: "Goal text is capped at 4,000 characters." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_iep_goals")
    .insert({
      child_id: input.childId,
      teacher_id: gate.profileId,
      goal_text: goalText,
      goal_type: input.goalType ?? null,
      baseline: input.baseline?.trim() || null,
      target_criterion: input.targetCriterion?.trim() || null,
      target_date: input.targetDate || null,
    })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/tools/iep-note");
  return { ok: true, goal: rowToGoal(data) };
}

export async function updateGoal(input: {
  goalId: string;
  goalText?: string;
  goalType?: GoalType | null;
  baseline?: string | null;
  targetCriterion?: string | null;
  targetDate?: string | null;
  status?: GoalStatus;
}): Promise<{ ok: true; goal: IepGoal } | { ok: false; error: string }> {
  const gate = await checkTeacherTier({ min: "school" });
  if (!gate.ok) return { ok: false, error: gate.error };
  const patch: Record<string, unknown> = {};
  if (typeof input.goalText === "string") {
    const t = input.goalText.trim();
    if (!t) return { ok: false, error: "Goal text cannot be empty." };
    patch.goal_text = t;
  }
  if (input.goalType !== undefined) patch.goal_type = input.goalType;
  if (input.baseline !== undefined) patch.baseline = input.baseline?.trim() || null;
  if (input.targetCriterion !== undefined)
    patch.target_criterion = input.targetCriterion?.trim() || null;
  if (input.targetDate !== undefined) patch.target_date = input.targetDate || null;
  if (input.status !== undefined) patch.status = input.status;
  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_iep_goals")
    .update(patch)
    .eq("id", input.goalId)
    .eq("teacher_id", gate.profileId)
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom/tools/iep-note");
  return { ok: true, goal: rowToGoal(data) };
}

export async function archiveGoal(
  goalId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return updateGoal({ goalId, status: "archived" }) as any;
}

export async function listRecentNotesForChild(input: {
  childId: string;
  limit?: number;
}): Promise<
  | {
      ok: true;
      notes: {
        id: string;
        reportingPeriod: string;
        progressStatus: string;
        oneLineSummary: string | null;
        createdAt: string;
      }[];
    }
  | { ok: false; error: string }
> {
  const gate = await checkTeacherTier({ min: "school" });
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!(await teacherHasChildOnRoster(gate.profileId, input.childId))) {
    return { ok: false, error: "Student not found on your roster." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("iep_progress_notes")
    .select("id, reporting_period, progress_status, one_line_summary, created_at")
    .eq("child_id", input.childId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 6);
  if (error) return { ok: false, error: error.message };
  const notes = ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    reportingPeriod: r.reporting_period,
    progressStatus: r.progress_status,
    oneLineSummary: r.one_line_summary ?? null,
    createdAt: r.created_at,
  }));
  return { ok: true, notes };
}

export async function listRecentPlansForChild(input: {
  childId: string;
  limit?: number;
}): Promise<
  | {
      ok: true;
      plans: {
        id: string;
        status: string;
        startDate: string | null;
        endDate: string | null;
        generatedAt: string;
      }[];
    }
  | { ok: false; error: string }
> {
  const gate = await checkTeacherTier({ min: "school" });
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!(await teacherHasChildOnRoster(gate.profileId, input.childId))) {
    return { ok: false, error: "Student not found on your roster." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intervention_plans")
    .select("id, status, start_date, end_date, generated_at")
    .eq("child_id", input.childId)
    .order("generated_at", { ascending: false })
    .limit(input.limit ?? 6);
  if (error) return { ok: false, error: error.message };
  const plans = ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    status: r.status,
    startDate: r.start_date ?? null,
    endDate: r.end_date ?? null,
    generatedAt: r.generated_at,
  }));
  return { ok: true, plans };
}
