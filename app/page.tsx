<<<<<<< Updated upstream
export default function Home() {
  // This page is intentionally minimal
  // The middleware (proxy.ts) handles all redirects:
  // - Not logged in → /login
  // - Logged in but not onboarded → /welcome  
  // - Logged in and onboarded → /dashboard
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" aria-hidden="true"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
        <span className="sr-only">Loading content</span>
      </div>
    </div>
  );
=======
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ✅ important: prevent Next from caching this route result
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single();

  // If profile lookup fails or profile missing, send to onboarding
  if (error || !profile) {
    redirect("/welcome");
  }

  if (!profile.onboarding_complete) {
    redirect("/welcome");
  }

  redirect("/dashboard");
>>>>>>> Stashed changes
}