"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildLearningPath, type WeakStrand } from "@/lib/ai/build-path";

/**
 * Build (or rebuild) the AI learning path for a specific child.
 *
 * Auth: caller must be the child's parent OR a teacher whose
 * classroom contains the child. The orchestrator runs server-side
 * with the admin client because we touch RLS-protected rows.
 */
export async function buildPathForChild(input: {
  childId: string;
}): Promise<
  { ok: true; itemCount: number } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const admin = supabaseAdmin();

  // 1) Auth — parent owns or teacher teaches the kid.
  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, parent_id, grade")
    .eq("id", input.childId)
    .maybeSingle();
  if (!child) return { ok: false, error: "Child not found." };

  const isParent = (child as any).parent_id === profile.id;

  let isTeacher = false;
  if (!isParent) {
    const { data: membership } = await supabase
      .from("classroom_memberships")
      .select("classroom_id, classrooms!inner(teacher_id)")
      .eq("child_id", input.childId)
      .limit(1);
    isTeacher = ((membership ?? []) as any[]).some(
      (m) => m.classrooms?.teacher_id === profile.id,
    );
  }

  if (!isParent && !isTeacher) {
    return { ok: false, error: "Not authorized for this child." };
  }

  // 2) Pull the most recent assessment.
  const { data: assessment } = await admin
    .from("assessments")
    .select(
      "id, grade_tested, score_percent, reading_level_placed, answers, completed_at",
    )
    .eq("child_id", input.childId)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!assessment) {
    return {
      ok: false,
      error:
        "No placement test on file yet. The child needs to take the assessment first.",
    };
  }
  const a = assessment as any;

  // 3) Derive weak strands from the answers blob. Each answer should
  //    have { standardId, correct: bool } (or similar). Group by
  //    standardId and surface ones below 50% accuracy with at least 1 attempt.
  const answers: any[] = Array.isArray(a.answers) ? a.answers : [];
  const byStrand = new Map<
    string,
    { standardId: string; domain: string; attempted: number; correct: number }
  >();
  for (const ans of answers) {
    const sid = ans.standardId ?? ans.standard_id ?? null;
    if (!sid) continue;
    const correct = !!(ans.correct ?? ans.isCorrect);
    const domain = ans.domain ?? "";
    const cur = byStrand.get(sid) ?? {
      standardId: sid,
      domain,
      attempted: 0,
      correct: 0,
    };
    cur.attempted += 1;
    if (correct) cur.correct += 1;
    byStrand.set(sid, cur);
  }
  const weakStrands: WeakStrand[] = Array.from(byStrand.values())
    .filter((s) => s.attempted > 0 && s.correct / s.attempted < 0.5)
    .map((s) => ({
      ...s,
      accuracy: Math.round((s.correct / s.attempted) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // 4) Run the orchestrator.
  const res = await buildLearningPath({
    childId: input.childId,
    childFirstName: (child as any).first_name ?? null,
    gradeTested: a.grade_tested ?? (child as any).grade ?? "K",
    readingLevelPlaced: a.reading_level_placed ?? null,
    weakStrands,
    assessmentId: a.id,
  });

  if (res.ok) {
    revalidatePath("/dashboard");
    revalidatePath(`/classroom/[classroomId]/students/[childId]`, "page");
  }
  return res;
}

/**
 * Bump the cursor when the kid completes the current item.
 * Called from the practice + lesson completion handlers (or by the
 * teacher manually marking an item done).
 */
export async function advanceLearningPath(input: {
  childId: string;
}): Promise<{ ok: true; nextIndex: number } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: path } = await supabase
    .from("learning_paths")
    .select("child_id, items, next_index")
    .eq("child_id", input.childId)
    .maybeSingle();
  if (!path) return { ok: false, error: "No path on file." };

  const items = Array.isArray((path as any).items) ? (path as any).items : [];
  const nextIndex = Math.min(items.length, ((path as any).next_index ?? 0) + 1);

  // RLS handles auth (kid's parent / classroom teacher).
  const { error } = await supabase
    .from("learning_paths")
    .update({ next_index: nextIndex })
    .eq("child_id", input.childId);
  if (error) return { ok: false, error: error.message };

  return { ok: true, nextIndex };
}

/**
 * Generate parent-conference notes for a student. Auth: caller must
 * be a teacher whose classroom contains the kid.
 */
export async function generateConferenceNotes(input: {
  childId: string;
}): Promise<
  | { ok: true; notes: { summary: string; next_steps: string } }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only teachers can generate conference notes." };
  }
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("classroom_memberships")
    .select("classrooms!inner(teacher_id)")
    .eq("child_id", input.childId)
    .limit(1);
  const ok = ((membership ?? []) as any[]).some(
    (m) => m.classrooms?.teacher_id === profile.id,
  );
  if (!ok) return { ok: false, error: "Student not in your classroom." };

  const { buildConferenceNotes } = await import("@/lib/ai/build-conference-notes");
  return buildConferenceNotes({ childId: input.childId, teacherId: profile.id });
}

/**
 * Generate small-group rotations for a classroom. Auth: caller must
 * be the classroom's teacher.
 */
export async function generateSmallGroups(input: {
  classroomId: string;
}): Promise<
  | {
      ok: true;
      groups: import("@/lib/ai/build-small-groups").SmallGroup[];
      roster: { id: string; first_name: string }[];
    }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only teachers can build small groups." };
  }
  const supabase = await createClient();
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id")
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) return { ok: false, error: "Classroom not found." };

  const { buildSmallGroups } = await import("@/lib/ai/build-small-groups");
  const res = await buildSmallGroups({
    classroomId: input.classroomId,
    teacherId: profile.id,
  });
  if (!res.ok) return res;

  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("children(id, first_name)")
    .eq("classroom_id", input.classroomId);
  const roster = ((memberships ?? []) as any[])
    .map((m) => m.children)
    .filter(Boolean) as { id: string; first_name: string }[];

  return { ok: true, groups: res.groups, roster };
}
