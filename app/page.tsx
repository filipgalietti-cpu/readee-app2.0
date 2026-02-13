import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Not logged in → /login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Logged in but not onboarded → /welcome
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single();

  // If profile row doesn't exist yet, treat as not onboarded
  const onboardingComplete = !error && profile?.onboarding_complete === true;

  if (!onboardingComplete) {
    redirect("/welcome");
  }

  // Logged in and onboarded → /dashboard
  redirect("/dashboard");
}