import { createClient } from "@/lib/supabase/server";

/**
 * Server-side plan check.
 * Returns the user's plan ("free" | "premium") or null if not authenticated.
 */
export async function getUserPlan(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  return profile?.plan ?? "free";
}
