import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Self-serve onboarding reset. The user can hit this route to wipe
 * their own onboarding state + demo classroom and re-run the wizard.
 * Strictly self-only — never touches another user's data.
 *
 * Visit GET /onboarding/teacher/reset → redirects to the wizard.
 */
export async function GET() {
  return doReset();
}
export async function POST() {
  return doReset();
}

async function doReset() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect("https://learn.readee.app/login?next=/onboarding/teacher");
  }

  const admin = supabaseAdmin();

  // 1. Drop demo classroom + dependents.
  const { data: demoClassrooms } = await admin
    .from("classrooms")
    .select("id")
    .eq("teacher_id", user.id)
    .eq("is_demo", true);
  const demoIds = ((demoClassrooms ?? []) as any[]).map((c) => c.id);
  if (demoIds.length > 0) {
    await admin.from("classroom_memberships").delete().in("classroom_id", demoIds);
    await admin.from("assignments").delete().in("classroom_id", demoIds);
    await admin.from("classrooms").delete().in("id", demoIds);
  }
  await admin
    .from("children")
    .delete()
    .eq("created_by_teacher", user.id)
    .eq("is_demo", true);

  // 2. Null the onboarding fields on profile.
  await admin
    .from("profiles")
    .update({
      display_name: null,
      default_grade: null,
      school_hint: null,
      class_setting: null,
      intent: null,
      intents: null,
      onboarding_complete: false,
      onboarding_completed_at: null,
    })
    .eq("id", user.id);

  return NextResponse.redirect("https://learn.readee.app/onboarding/teacher");
}
