import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

/**
 * Plan-tier hierarchy for teacher-side Readee.ai tools.
 *
 *  free            — no AI tool access (redirected to /upgrade)
 *  premium         — Readee+ ($9.99/mo) — basic AI tools
 *  teacher_solo    — Teacher Solo ($19/mo) — all individual tools
 *  classroom       — Classroom — same as teacher_solo + classroom seats
 *  school          — School plan — adds SPED/admin tools
 *  district        — District plan — everything
 */

export type TeacherTier = "free" | "premium" | "teacher_solo" | "classroom" | "school" | "district";

const TIER_RANK: Record<TeacherTier, number> = {
  free: 0,
  premium: 1,
  teacher_solo: 2,
  classroom: 3,
  school: 4,
  district: 5,
};

function rankOf(plan: string | null | undefined): number {
  return TIER_RANK[(plan as TeacherTier) ?? "free"] ?? 0;
}

/** Has the user paid in any tier? */
export function hasAnyPaidTier(plan: string | null | undefined): boolean {
  return rankOf(plan) >= 1;
}

/** Does the user's plan meet the minimum required tier? */
export function hasMinTier(plan: string | null | undefined, min: TeacherTier): boolean {
  return rankOf(plan) >= TIER_RANK[min];
}

/**
 * Server-side guard for tool pages. If the educator doesn't meet the
 * minimum tier, redirects to /upgrade?reason=<reason>. Pass `min: "premium"`
 * to allow ANY paid plan (the most permissive useful gate).
 *
 * Returns the profile so callers don't need to fetch it again.
 */
export async function requireTeacherTier(input: {
  min: TeacherTier;
  reason: string;
}): Promise<{ id: string; plan: TeacherTier } & Record<string, unknown>> {
  const profile = await requireProfile();
  if (profile.role !== "educator") {
    redirect("/upgrade?reason=" + encodeURIComponent(input.reason));
  }
  const plan = ((profile as any).plan ?? "free") as TeacherTier;
  if (!hasMinTier(plan, input.min)) {
    redirect("/upgrade?reason=" + encodeURIComponent(input.reason));
  }
  return { ...(profile as any), plan };
}

/**
 * Gate variant for API routes. Returns { ok, profile } or { ok: false }
 * with a 402-shaped error the route can return as JSON.
 */
export async function checkTeacherTier(input: {
  min: TeacherTier;
}): Promise<
  | { ok: true; profileId: string; plan: TeacherTier }
  | { ok: false; status: number; error: string; reason: "auth" | "role" | "plan" }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, status: 401, error: "Sign in first.", reason: "auth" };
  }
  const { data: row } = await supabase
    .from("profiles")
    .select("id, role, plan")
    .eq("id", user.id)
    .maybeSingle();
  const r = row as { id: string; role: string; plan: string } | null;
  if (!r) {
    return { ok: false, status: 401, error: "Profile not found.", reason: "auth" };
  }
  if (r.role !== "educator") {
    return { ok: false, status: 403, error: "Educators only.", reason: "role" };
  }
  const plan = (r.plan ?? "free") as TeacherTier;
  if (!hasMinTier(plan, input.min)) {
    return {
      ok: false,
      status: 402,
      error: "This tool requires a paid plan. Upgrade to unlock.",
      reason: "plan",
    };
  }
  return { ok: true, profileId: r.id, plan };
}

/**
 * Parent-side gate (for /dashboard/homework-scan etc.). Allows any
 * Readee+ subscriber.
 */
export async function checkParentReadeePlus(): Promise<
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "Sign in first." };
  const { data: row } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = ((row as any)?.plan ?? "free") as string;
  if (!hasAnyPaidTier(plan)) {
    return {
      ok: false,
      status: 402,
      error: "Readee+ required. Upgrade to unlock.",
    };
  }
  return { ok: true, userId: user.id };
}
