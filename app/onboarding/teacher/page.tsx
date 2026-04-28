import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TeacherOnboardingWizard from "./_components/TeacherOnboardingWizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Welcome to Readee" };

export default async function TeacherOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding/teacher");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, default_grade, school_hint, class_setting, intent, role, email")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/login");
  if ((profile as any).role !== "educator") redirect("/dashboard");

  // If they already completed identity capture, skip straight to the
  // classroom — the demo-class seeder (phase C) will land them in a
  // populated workspace rather than this wizard.
  if ((profile as any).display_name) redirect("/classroom");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-900 text-white">
      {/* Soft brand glows so the canvas reads alive, not flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-fuchsia-400/40 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-indigo-400/30 blur-[140px]"
      />
      <TeacherOnboardingWizard
        emailHint={(profile as any).email ?? null}
        initial={{
          displayName: (profile as any).display_name ?? "",
          defaultGrade: (profile as any).default_grade ?? null,
          schoolHint: (profile as any).school_hint ?? "",
          classSetting: (profile as any).class_setting ?? null,
          intent: (profile as any).intent ?? null,
        }}
      />
    </div>
  );
}
