import { createClient } from "@/lib/supabase/server";
import { effectivePlan, resolveAccess, type Access } from "@/lib/plan/access";

/**
 * Server-side plan check. Returns the EFFECTIVE plan — a reader inside the
 * reverse trial resolves to "premium" so server gates unlock too.
 * null if not authenticated.
 */
export async function getUserPlan(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, created_at")
    .eq("id", user.id)
    .single();

  return effectivePlan(profile?.plan ?? "free", (profile as any)?.created_at ?? null);
}

/** Full server-side access (tier + hasFullAccess + trialDaysLeft) for a user. */
export async function getServerAccess(): Promise<Access | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, created_at, had_subscription")
    .eq("id", user.id)
    .single();
  return resolveAccess({
    plan: (profile as any)?.plan ?? "free",
    signupAt: (profile as any)?.created_at ?? null,
    everSubscribed: !!(profile as any)?.had_subscription,
  });
}
