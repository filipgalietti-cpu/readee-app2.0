"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function saveTeacherIdentity(input: {
  displayName: string;
  defaultGrade?: string | null;
  schoolHint?: string | null;
  classSetting?: string | null;
  intent?: string | null;
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
  const intent = input.intent?.trim() || null;
  if (
    intent &&
    !["phonics_gaps", "below_grade", "above_grade", "ell", "parent_comm", "exploring"].includes(intent)
  ) {
    return { ok: false, error: "Pick an option from the list." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      default_grade: grade,
      school_hint: input.schoolHint?.trim() || null,
      class_setting: setting,
      intent,
      onboarding_complete: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/classroom");
  revalidatePath("/dashboard");
  return { ok: true };
}
