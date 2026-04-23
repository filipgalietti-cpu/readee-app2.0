"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
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
 */
export async function createAssignment(input: {
  classroomId: string;
  kind: "readee_lesson" | "custom_quiz";
  sourceId: string;
  title: string;
  note?: string | null;
  dueAt?: string | null;
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
