"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { seedDemoClassroom } from "@/lib/onboarding/demo-class-seeder";

type Result =
  | { ok: true; demoClassroomId: string | null }
  | { ok: false; error: string };

const VALID_INTENTS = [
  "phonics_gaps",
  "below_grade",
  "above_grade",
  "ell",
  "parent_comm",
  "exploring",
] as const;

export async function saveTeacherIdentity(input: {
  displayName: string;
  defaultGrade?: string | null;
  schoolHint?: string | null;
  classSetting?: string | null;
  intents?: string[] | null;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const displayName = input.displayName.trim();
  if (!displayName) return { ok: false, error: "Tell us what kids should call you." };
  if (displayName.length > 80) {
    return { ok: false, error: "That's a long name — keep it under 80 characters." };
  }

  // Validation against the migration's CHECK constraints.
  const grade = input.defaultGrade?.trim() || null;
  if (grade && !["K", "1st", "2nd", "3rd", "4th", "Mixed"].includes(grade)) {
    return { ok: false, error: "Pick a grade from the list." };
  }
  const setting = input.classSetting?.trim() || null;
  if (
    setting &&
    !["classroom", "resource_room", "tutoring", "homeschool", "after_school"].includes(setting)
  ) {
    return { ok: false, error: "Pick a setting from the list." };
  }
  const intents = (input.intents ?? [])
    .map((i) => i.trim())
    .filter((i): i is (typeof VALID_INTENTS)[number] => (VALID_INTENTS as readonly string[]).includes(i));
  // Backward-compat: the old `intent` column holds the primary pick.
  const primaryIntent = intents[0] ?? null;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      default_grade: grade,
      school_hint: input.schoolHint?.trim() || null,
      class_setting: setting,
      intent: primaryIntent,
      intents: intents.length > 0 ? intents : null,
      onboarding_complete: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  // Seed a demo classroom + 3 demo students + 1 starter assignment so
  // the teacher lands in a working dashboard. Failure here doesn't
  // block onboarding — they'll just see the empty-state UI.
  let demoClassroomId: string | null = null;
  try {
    const seed = await seedDemoClassroom({
      teacherId: user.id,
      displayName,
      defaultGrade: grade,
      intent: primaryIntent,
    });
    if (seed.ok) demoClassroomId = seed.classroomId;
  } catch {
    // Silent — onboarding still completes.
  }

  revalidatePath("/classroom");
  revalidatePath("/dashboard");
  return { ok: true, demoClassroomId };
}
