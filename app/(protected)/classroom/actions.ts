"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { redeemReferralOnSignup } from "@/lib/referrals/teacher-referrals";
import type { Classroom, GradeLevel } from "@/lib/db/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoid user confusion
const CODE_LEN = 6;

function randomCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/**
 * Create a new classroom. Retries on join-code collision.
 */
export async function createClassroom(input: {
  name: string;
  gradeLevel?: GradeLevel | null;
}): Promise<{ ok: true; classroom: Classroom } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can create classrooms." };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Classroom name is required." };
  if (name.length > 80) return { ok: false, error: "Name is too long." };

  const supabase = await createClient();

  // Up to 5 retries in case of a code collision (extremely rare at our scale).
  for (let attempt = 0; attempt < 5; attempt++) {
    const join_code = randomCode();
    const { data, error } = await supabase
      .from("classrooms")
      .insert({
        teacher_id: profile.id,
        name,
        grade_level: input.gradeLevel ?? null,
        join_code,
      })
      .select()
      .single();

    if (!error && data) {
      // First-classroom milestone redeems a referral cookie if present.
      // Safe to call unconditionally — redeemReferralOnSignup is
      // idempotent and a no-op when there's no cookie or the code is
      // already redeemed.
      const cookieStore = await cookies();
      const refCode = cookieStore.get("readee_referral_code")?.value;
      if (refCode) {
        const res = await redeemReferralOnSignup({
          inviteeId: profile.id,
          inviteeEmail: profile.email ?? null,
          code: refCode,
        });
        if (res.ok) {
          // Clear the cookie so it doesn't double-redeem on later
          // classroom creates.
          cookieStore.set({
            name: "readee_referral_code",
            value: "",
            path: "/",
            maxAge: 0,
          });
        }
      }
      revalidatePath("/classroom");
      return { ok: true, classroom: data as Classroom };
    }

    // Unique violation on join_code — try again with a fresh code
    if (error?.code === "23505" && error.message.includes("join_code")) continue;
    return { ok: false, error: error?.message ?? "Unknown error creating classroom." };
  }

  return { ok: false, error: "Could not allocate a unique join code. Try again." };
}

/**
 * Rotate a classroom's join code — useful if a teacher wants to stop new
 * joiners or if a code has been shared too widely.
 */
export async function rotateJoinCode(
  classroomId: string,
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { data, error } = await supabase
      .from("classrooms")
      .update({ join_code: code })
      .eq("id", classroomId)
      .eq("teacher_id", profile.id)
      .select("join_code")
      .maybeSingle();

    if (!error && data) {
      revalidatePath(`/classroom/${classroomId}`);
      return { ok: true, code: data.join_code };
    }
    if (error?.code === "23505") continue;
    return { ok: false, error: error?.message ?? "Could not rotate join code." };
  }
  return { ok: false, error: "Could not rotate join code." };
}

/**
 * Archive a classroom — soft delete, preserves submission history.
 */
export async function archiveClassroom(
  classroomId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("classrooms")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", classroomId)
    .eq("teacher_id", profile.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/classroom");
  return { ok: true };
}

/**
 * Update classroom metadata (name, grade level, student PIN). Teacher-only.
 *
 * studentPin: pass a 4-digit string to enable, empty string or null to
 * disable. Anything else is rejected.
 */
export async function updateClassroom(input: {
  classroomId: string;
  name?: string;
  gradeLevel?: GradeLevel | null;
  studentPin?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can edit classrooms." };
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) return { ok: false, error: "Name cannot be empty." };
    if (name.length > 80) return { ok: false, error: "Name is too long." };
    patch.name = name;
  }
  if (input.gradeLevel !== undefined) {
    patch.grade_level = input.gradeLevel;
  }
  if (input.studentPin !== undefined) {
    if (input.studentPin === null || input.studentPin === "") {
      patch.student_pin = null;
    } else if (/^[0-9]{4}$/.test(input.studentPin)) {
      patch.student_pin = input.studentPin;
    } else {
      return { ok: false, error: "PIN must be 4 digits." };
    }
  }
  if (Object.keys(patch).length === 0) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("classrooms")
    .update(patch)
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/classroom/${input.classroomId}`);
  revalidatePath("/classroom");
  return { ok: true };
}

/**
 * Teacher-side: link a classroom to a school using a 6-char school join
 * code. Bypasses the "must be admin of that school" restriction in
 * setClassroomSchool() — the code itself is the authorization.
 */
export async function joinSchoolWithCode(input: {
  classroomId: string;
  code: string;
}): Promise<
  { ok: true; schoolId: string; schoolName: string } | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can link a classroom to a school." };
  }

  const code = input.code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return { ok: false, error: "School codes are 6 letters/numbers." };
  }

  const supabase = await createClient();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id")
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) return { ok: false, error: "Classroom not found." };

  const { data: lookup, error: lookupErr } = await supabase
    .rpc("find_school_by_join_code", { p_code: code })
    .maybeSingle();
  if (lookupErr) return { ok: false, error: lookupErr.message };
  if (!lookup) return { ok: false, error: "No school matches that code." };

  const school = lookup as { id: string; name: string };

  const { error } = await supabase
    .from("classrooms")
    .update({ school_id: school.id })
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/classroom/${input.classroomId}`);
  return { ok: true, schoolId: school.id, schoolName: school.name };
}

/**
 * Attach a classroom to a school (or detach). Admins wire this up so
 * school/district dashboards can roll up the classroom's data.
 */
export async function setClassroomSchool(input: {
  classroomId: string;
  schoolId: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can change this." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("classrooms")
    .update({ school_id: input.schoolId })
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/classroom/${input.classroomId}`);
  return { ok: true };
}

/**
 * Edit a classroom-owned student's first name or grade. Parent-owned
 * students are managed by parents; this action is scoped to
 * owner_type='classroom'.
 */
export async function updateClassroomStudent(input: {
  studentId: string;
  firstName?: string;
  grade?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can edit students." };
  }

  const supabase = await createClient();

  const { data: student } = await supabase
    .from("children")
    .select("id, owner_type, owner_classroom_id")
    .eq("id", input.studentId)
    .maybeSingle();
  if (!student) return { ok: false, error: "Student not found." };
  if ((student as any).owner_type !== "classroom") {
    return { ok: false, error: "This student is managed by a parent." };
  }

  const patch: Record<string, unknown> = {};
  if (input.firstName !== undefined) {
    const n = input.firstName.trim();
    if (!n) return { ok: false, error: "First name cannot be empty." };
    patch.first_name = n.slice(0, 60);
  }
  if (input.grade !== undefined) patch.grade = input.grade;
  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await supabase
    .from("children")
    .update(patch)
    .eq("id", input.studentId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/classroom/${(student as any).owner_classroom_id}`);
  return { ok: true };
}

/**
 * Remove a student from a classroom. Preserves their submission history
 * (assignment_submissions are not cascaded).
 */
export async function removeStudent(input: {
  classroomId: string;
  childId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can remove students." };
  }

  const supabase = await createClient();

  // Verify teacher owns this classroom (RLS enforces too).
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id")
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) return { ok: false, error: "Classroom not found." };

  const { error } = await supabase
    .from("classroom_memberships")
    .delete()
    .eq("classroom_id", input.classroomId)
    .eq("child_id", input.childId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/classroom/${input.classroomId}`);
  return { ok: true };
}

/**
 * Update an existing assignment (title, note, due date).
 */
export async function updateAssignment(input: {
  assignmentId: string;
  title?: string;
  note?: string | null;
  dueAt?: string | null;
  passThreshold?: number | null;
  questionIds?: string[] | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can edit assignments." };
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) {
    const t = input.title.trim();
    if (!t) return { ok: false, error: "Title cannot be empty." };
    patch.title = t;
  }
  if (input.note !== undefined) patch.note = input.note;
  if (input.dueAt !== undefined) patch.due_at = input.dueAt;
  if (input.passThreshold !== undefined) {
    if (input.passThreshold === null) {
      patch.pass_threshold = null;
    } else if (
      typeof input.passThreshold === "number" &&
      input.passThreshold >= 0 &&
      input.passThreshold <= 100
    ) {
      patch.pass_threshold = Math.round(input.passThreshold);
    } else {
      return { ok: false, error: "Pass threshold must be 0-100 or null." };
    }
  }
  if (input.questionIds !== undefined) {
    if (input.questionIds === null || input.questionIds.length === 0) {
      patch.question_ids = null;
    } else {
      patch.question_ids = input.questionIds
        .filter((q) => typeof q === "string")
        .slice(0, 200);
    }
  }
  if (Object.keys(patch).length === 0) return { ok: true };

  const supabase = await createClient();

  // Verify teacher owns this assignment's classroom via RLS on assignments.
  const { data: existing } = await supabase
    .from("assignments")
    .select("classroom_id")
    .eq("id", input.assignmentId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Assignment not found." };

  const { error } = await supabase
    .from("assignments")
    .update(patch)
    .eq("id", input.assignmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/classroom/${existing.classroom_id}`);
  return { ok: true };
}

/**
 * Delete an assignment. Cascades to assignment_submissions per the FK.
 */
export async function deleteAssignment(input: {
  assignmentId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can delete assignments." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("assignments")
    .select("classroom_id")
    .eq("id", input.assignmentId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Assignment not found." };

  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", input.assignmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/classroom/${existing.classroom_id}`);
  return { ok: true };
}

/**
 * Parent-side: add one of their children to a classroom using a join code.
 * Called from /classroom-join.
 */
export async function joinClassroom(input: {
  code: string;
  childId: string;
}): Promise<{ ok: true; classroomId: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  const code = input.code.trim().toUpperCase();

  if (code.length !== CODE_LEN) return { ok: false, error: "Invalid code format." };

  const supabase = await createClient();

  // Verify the child belongs to this parent (RLS should also enforce this).
  const { data: child, error: childErr } = await supabase
    .from("children")
    .select("id, parent_id")
    .eq("id", input.childId)
    .eq("parent_id", profile.id)
    .maybeSingle();

  if (childErr || !child) return { ok: false, error: "Child not found." };

  const { data: classroom, error: classroomErr } = await supabase
    .from("classrooms")
    .select("id, archived_at")
    .eq("join_code", code)
    .maybeSingle();

  if (classroomErr || !classroom) {
    return { ok: false, error: "That code does not match any classroom." };
  }
  if (classroom.archived_at) {
    return { ok: false, error: "That classroom has been archived." };
  }

  const { error: insertErr } = await supabase
    .from("classroom_memberships")
    .insert({ classroom_id: classroom.id, child_id: child.id });

  if (insertErr && insertErr.code !== "23505") {
    // 23505 = unique violation = already a member, which is fine
    return { ok: false, error: insertErr.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, classroomId: classroom.id };
}

/**
 * Create an assignment against a classroom the caller owns.
 *
 * passThreshold: 0-100, null = no threshold (any completion counts as done)
 * questionIds:   array of specific Q ids to include (e.g. "RL.K.1-Q2"),
 *                null/empty = all questions in the standard
 */
export async function createAssignment(input: {
  classroomId: string;
  kind: "readee_lesson" | "custom_quiz";
  sourceId: string;
  title: string;
  note?: string | null;
  dueAt?: string | null;
  passThreshold?: number | null;
  questionIds?: string[] | null;
  audioPromptEnabled?: boolean;
  audioChoicesEnabled?: boolean;
  shuffleQuestions?: boolean;
  shuffleChoices?: boolean;
  revealCorrectImmediately?: boolean;
  attemptsAllowed?: number | null;
}): Promise<{ ok: true; assignmentId: string } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only educators can assign work." };
  }

  const supabase = await createClient();

  // Verify teacher owns the classroom (RLS enforces too, belt + suspenders).
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id")
    .eq("id", input.classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) return { ok: false, error: "Classroom not found." };

  const passThreshold =
    typeof input.passThreshold === "number" && input.passThreshold >= 0 && input.passThreshold <= 100
      ? Math.round(input.passThreshold)
      : null;
  const questionIds =
    Array.isArray(input.questionIds) && input.questionIds.length > 0
      ? input.questionIds.filter((q) => typeof q === "string").slice(0, 200)
      : null;

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      classroom_id: input.classroomId,
      assigned_by: profile.id,
      kind: input.kind,
      source_id: input.sourceId,
      title: input.title,
      note: input.note ?? null,
      due_at: input.dueAt ?? null,
      pass_threshold: passThreshold,
      question_ids: questionIds,
      audio_prompt_enabled: input.audioPromptEnabled ?? true,
      audio_choices_enabled: input.audioChoicesEnabled ?? false,
      shuffle_questions: input.shuffleQuestions ?? false,
      shuffle_choices: input.shuffleChoices ?? true,
      reveal_correct_immediately: input.revealCorrectImmediately ?? true,
      attempts_allowed:
        typeof input.attemptsAllowed === "number" && input.attemptsAllowed > 0
          ? input.attemptsAllowed
          : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create assignment." };
  }

  revalidatePath(`/classroom/${input.classroomId}`);
  return { ok: true, assignmentId: data.id };
}

/**
 * Dev-only: promote the current user to 'educator' so we can dogfood the
 * dashboard. Remove (or lock to admin) once we have a real teacher signup
 * flow.
 */
export async function devPromoteToEducator(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_ROLE_FLIP !== "1") {
    return { ok: false, error: "Disabled in production." };
  }
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: "educator" })
    .eq("id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom");
  return { ok: true };
}

/**
 * Dev-only: flip the current user's role to a target value. Mostly used
 * to hop between 'educator' and 'parent' while dogfooding both sides of
 * the flow on a single account.
 */
export async function devSetRole(
  role: "parent" | "educator",
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_ROLE_FLIP !== "1") {
    return { ok: false, error: "Disabled in production." };
  }
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/classroom");
  revalidatePath("/classroom-dev");
  return { ok: true };
}

/**
 * Materialize a daily question into a custom_quiz, then create
 * assignments for each selected classroom. The new quiz is owned by
 * the teacher (so the standard assignment flow works).
 */
export async function assignDailyQuestion(input: {
  date: string;
  classroomIds: string[];
  dueAt?: string | null;
  passThreshold?: number | null;
}): Promise<
  | { ok: true; quizId: string; assignedTo: number }
  | { ok: false; error: string }
> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    return { ok: false, error: "Only teachers can assign." };
  }
  if (!input.classroomIds || input.classroomIds.length === 0) {
    return { ok: false, error: "Pick at least one classroom." };
  }

  const supabase = await createClient();

  // 1) Fetch the daily.
  const { data: daily } = await supabase
    .from("daily_questions")
    .select(
      "date, theme, passage_title, passage_body, image_url, audio_url, question_prompt, choices, correct, hint, extra_questions",
    )
    .eq("date", input.date)
    .maybeSingle();
  if (!daily) return { ok: false, error: "Daily question not found." };
  const d = daily as any;

  // 2) Create the custom_quiz row.
  const description = `${d.passage_title}

${d.passage_body}`;
  const { data: quizRow, error: quizErr } = await supabase
    .from("custom_quizzes")
    .insert({
      teacher_id: profile.id,
      title: `Readee Daily — ${d.theme}: ${d.passage_title}`,
      description,
      grade_level: null,
    })
    .select("id")
    .single();
  if (quizErr || !quizRow)
    return { ok: false, error: quizErr?.message ?? "Could not create quiz." };
  const quizId = (quizRow as { id: string }).id;

  // 3) Materialize the main question + extras as custom_questions.
  const allQs = [
    {
      prompt: d.question_prompt,
      choices: d.choices,
      correct: d.correct,
      hint: d.hint,
    },
    ...((Array.isArray(d.extra_questions) ? d.extra_questions : []) as any[]),
  ];
  let position = 1;
  for (const q of allQs) {
    if (!q?.prompt || !Array.isArray(q.choices) || !q.correct) continue;
    const { data: qrow, error: qErr } = await supabase
      .from("custom_questions")
      .insert({
        teacher_id: profile.id,
        kind: "multiple_choice",
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint ?? null,
        // Attach the daily image + audio to the FIRST question (same
        // pattern as build-assignment for shared media).
        image_url: position === 1 ? d.image_url : null,
        audio_url: position === 1 ? d.audio_url : null,
      })
      .select("id")
      .single();
    if (qErr || !qrow) continue;
    await supabase.from("custom_quiz_questions").insert({
      quiz_id: quizId,
      question_id: (qrow as { id: string }).id,
      position,
    });
    position += 1;
  }

  // 4) For each classroom, create an assignment pointing at the quiz.
  let assigned = 0;
  for (const classroomId of input.classroomIds) {
    const passThreshold =
      typeof input.passThreshold === "number" &&
      input.passThreshold >= 0 &&
      input.passThreshold <= 100
        ? Math.round(input.passThreshold)
        : null;
    const { error } = await supabase.from("assignments").insert({
      classroom_id: classroomId,
      assigned_by: profile.id,
      kind: "custom_quiz",
      source_id: quizId,
      title: `Readee Daily — ${d.passage_title}`,
      due_at: input.dueAt ?? null,
      pass_threshold: passThreshold,
      audio_prompt_enabled: true,
      audio_choices_enabled: false,
      shuffle_questions: false,
      shuffle_choices: false,
      reveal_correct_immediately: true,
    });
    if (!error) assigned += 1;
    revalidatePath(`/classroom/${classroomId}`);
  }

  return { ok: true, quizId, assignedTo: assigned };
}

