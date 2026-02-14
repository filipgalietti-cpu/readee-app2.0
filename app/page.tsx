import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in -> go to login (or marketing/home if you want)
  if (!user) {
    redirect("/login");
  }

  // Logged in -> check onboarding status in profiles
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single();

  // If profile missing or query error, treat as not onboarded
  const onboarded = !error && !!profile?.onboarding_complete;

  if (!onboarded) redirect("/welcome");

  redirect("/dashboard");
}