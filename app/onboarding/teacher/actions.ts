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
const VALID_GRADES = ["K", "1st", "2nd", "3rd", "4th", "Mixed"] as const;

export async function saveTeacherIdentity(input: {
  displayName: string;
  defaultGrades?: string[] | null;
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

  const grades = (input.defaultGrades ?? [])
    .map((g) => g.trim())
    .filter((g): g is (typeof VALID_GRADES)[number] => (VALID_GRADES as readonly string[]).includes(g));
  const primaryGrade = grades[0] ?? null;
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
  const primaryIntent = intents[0] ?? null;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      default_grade: primaryGrade,
      default_grades: grades.length > 0 ? grades : null,
      school_hint: input.schoolHint?.trim() || null,
      class_setting: setting,
      intent: primaryIntent,
      intents: intents.length > 0 ? intents : null,
      onboarding_complete: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  let demoClassroomId: string | null = null;
  try {
    const seed = await seedDemoClassroom({
      teacherId: user.id,
      displayName,
      defaultGrade: primaryGrade,
      intent: primaryIntent,
    });
    if (seed.ok) {
      demoClassroomId = seed.classroomId;
    } else {
      console.error("[onboarding] demo seed failed:", seed.error);
    }
  } catch (e: any) {
    console.error("[onboarding] demo seed threw:", e?.message ?? e);
  }

  revalidatePath("/classroom");
  revalidatePath("/dashboard");
  return { ok: true, demoClassroomId };
}
