/**
 * Demo classroom seeder.
 *
 * Runs at the end of teacher onboarding so a fresh teacher lands in
 * a populated workspace instead of an empty roster. Creates:
 *
 *   - 1 classroom (is_demo=true, name = "{TeacherName}'s {Grade} class")
 *   - 3 demo children (Lily / Marcus / Aisha, varied progress data,
 *     is_demo=true, owner_classroom_id pinned, parent_id = teacher
 *     so RLS lets the teacher manage them)
 *   - 3 classroom_memberships
 *   - 1 starter assignment (Readee sample lesson tuned to the
 *     teacher's grade + intent)
 *
 * Idempotent: if the teacher already has a demo classroom, returns it.
 *
 * The "remove demo data on first real student" trigger is Phase D
 * (teacher onboarding D); this file only handles the seed.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LEN = 6;

function randomCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/** Realistic demo cohort. Variety in level, accuracy, streak so the
 *  Reports page actually has shape on first load. */
const DEMO_KIDS = [
  {
    first_name: "Lily Demo",
    grade: "2nd",
    reading_level: "2nd",
    carrots: 240,
    streak_days: 5,
    stories_read: 12,
  },
  {
    first_name: "Marcus Demo",
    grade: "2nd",
    reading_level: "1st",
    carrots: 160,
    streak_days: 2,
    stories_read: 6,
  },
  {
    first_name: "Aisha Demo",
    grade: "2nd",
    reading_level: "3rd",
    carrots: 410,
    streak_days: 9,
    stories_read: 21,
  },
];

/** Pick a starter standard from the kid's grade + the teacher's intent. */
function pickStarterStandard(grade: string, intent: string | null): {
  standardId: string;
  title: string;
} {
  const g = grade === "K" ? "K" : grade.replace("st", "").replace("nd", "").replace("rd", "").replace("th", "");
  switch (intent) {
    case "phonics_gaps":
      return {
        standardId: g === "K" ? "RF.K.3a" : `RF.${g}.3`,
        title: "Phonics review",
      };
    case "below_grade":
      return {
        standardId: g === "K" ? "RL.K.1" : `RL.${Math.max(0, Number(g) - 1) || "K"}.1`,
        title: "Key details warm-up",
      };
    case "above_grade":
      return {
        standardId: `RL.${Number(g) + 1 || "1"}.1`,
        title: "Stretch read",
      };
    case "ell":
      return { standardId: g === "K" ? "K.L.4" : `L.${g}.4`, title: "Vocabulary in context" };
    case "parent_comm":
    case "exploring":
    default:
      return {
        standardId: g === "K" ? "RL.K.1" : `RL.${g}.1`,
        title: "Welcome lesson — Key details",
      };
  }
}

export type SeedResult =
  | { ok: true; classroomId: string; created: boolean }
  | { ok: false; error: string };

export async function seedDemoClassroom(input: {
  teacherId: string;
  displayName: string | null;
  defaultGrade: string | null;
  intent: string | null;
}): Promise<SeedResult> {
  const admin = supabaseAdmin();

  // Idempotency: if the teacher already has a demo classroom, no-op.
  const { data: existing } = await admin
    .from("classrooms")
    .select("id")
    .eq("teacher_id", input.teacherId)
    .eq("is_demo", true)
    .limit(1)
    .maybeSingle();
  if (existing) {
    return { ok: true, classroomId: (existing as any).id, created: false };
  }

  const grade = input.defaultGrade && input.defaultGrade !== "Mixed"
    ? input.defaultGrade
    : "2nd";
  const teacherFirst = (input.displayName ?? "").split(/\s+/).slice(-1)[0] || "Your";
  const className = `${teacherFirst}'s ${grade} class`;

  // 1) classroom — retry on join-code collision (rare but possible).
  let classroomId: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await admin
      .from("classrooms")
      .insert({
        teacher_id: input.teacherId,
        name: className,
        grade_level: grade,
        join_code: randomCode(),
        is_demo: true,
      })
      .select("id")
      .single();
    if (data) {
      classroomId = (data as any).id;
      break;
    }
    if (error?.code !== "23505") {
      return { ok: false, error: `Could not create demo class: ${error?.message}` };
    }
    // 23505 = unique violation, almost certainly join_code; retry.
  }
  if (!classroomId) {
    return { ok: false, error: "Could not generate a unique join code." };
  }

  // 2) demo children. owner_type=classroom + owner_classroom_id pins
  //    The children_owner_exclusive CHECK requires:
  //      owner_type='classroom' → parent_id NULL, owner_classroom_id SET
  //      owner_type='parent'    → parent_id SET,  owner_classroom_id NULL
  //    Demo students belong to the classroom (not the teacher's family),
  //    so parent_id stays null. created_by_teacher gives a cleanup handle.
  //    language is NOT NULL with CHECK ('en'|'es') — must default it.
  const childRows = DEMO_KIDS.map((k) => ({
    parent_id: null,
    created_by_teacher: input.teacherId,
    owner_type: "classroom",
    owner_classroom_id: classroomId,
    first_name: k.first_name,
    grade: grade,
    reading_level: k.reading_level,
    carrots: k.carrots,
    streak_days: k.streak_days,
    stories_read: k.stories_read,
    language: "en",
    is_demo: true,
  }));
  const { data: insertedKids, error: kidsErr } = await admin
    .from("children")
    .insert(childRows)
    .select("id");
  if (kidsErr || !insertedKids) {
    console.error("[demo-seeder] children insert failed:", kidsErr);
    return { ok: false, error: `Demo students: ${kidsErr?.message}` };
  }

  // 3) memberships
  const memberships = (insertedKids as any[]).map((k) => ({
    classroom_id: classroomId,
    child_id: k.id,
  }));
  const { error: memErr } = await admin
    .from("classroom_memberships")
    .insert(memberships);
  if (memErr) {
    return { ok: false, error: `Demo memberships: ${memErr.message}` };
  }

  // 4) starter assignment based on grade + intent.
  const starter = pickStarterStandard(grade, input.intent);
  await admin.from("assignments").insert({
    classroom_id: classroomId,
    assigned_by: input.teacherId,
    kind: "readee_lesson",
    source_id: starter.standardId,
    title: starter.title,
    note: "Demo assignment — feel free to delete or assign to your real students.",
    audio_prompt_enabled: true,
    audio_choices_enabled: false,
    shuffle_questions: false,
    shuffle_choices: false,
    reveal_correct_immediately: true,
  });

  return { ok: true, classroomId, created: true };
}

/**
 * Clear all demo data for a teacher. Called after the teacher takes a
 * "real" action (creates a non-demo classroom, adds a non-demo student,
 * etc.). Idempotent — does nothing if no demos exist.
 */
export async function clearDemoDataIfPresent(teacherId: string): Promise<{
  cleared: boolean;
  reason?: string;
}> {
  const admin = supabaseAdmin();

  const { data: demoClassrooms } = await admin
    .from("classrooms")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("is_demo", true);
  const demoIds = ((demoClassrooms ?? []) as any[]).map((c) => c.id);
  if (demoIds.length === 0) return { cleared: false, reason: "no_demo" };

  // Order matters: drop dependent rows first.
  await admin.from("classroom_memberships").delete().in("classroom_id", demoIds);
  await admin.from("assignments").delete().in("classroom_id", demoIds);
  await admin
    .from("children")
    .delete()
    .eq("created_by_teacher", teacherId)
    .eq("is_demo", true);
  await admin.from("classrooms").delete().in("id", demoIds);

  return { cleared: true };
}
