import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { resolveAccess, effectivePlan, type Access } from "@/lib/plan/access";
import { isPaidPlan } from "@/lib/plan/limits";

interface PlanState {
  /** EFFECTIVE plan for entitlement gates — a reader inside the 7-day reverse
   *  trial resolves to "premium" so every `plan === "premium"` check unlocks.
   *  null = loading. For billing/conversion UI use `rawPlan`. */
  plan: string | null;
  /** Actual profiles.plan ("free" | "premium" | ...). Billing/conversion
   *  surfaces (settings, upgrade, billing, the dashboard's own trial logic,
   *  the nav upgrade CTA) MUST read this — a trial user is not paying. */
  rawPlan: string | null;
  /** profiles.created_at — the reverse-trial anchor. */
  signupAt: string | null;
  /** Ever started a paid subscription (profiles.had_subscription) — drives
   *  lapsed/win-back messaging vs never-paid free. */
  everSubscribed: boolean;
  /** Resolved access: tier + hasFullAccess + trialDaysLeft. */
  access: Access;
  /**
   * Primary intent hint from profiles.role. Do NOT use for UI gating —
   * use the capability flags below. Kept for backwards compatibility
   * and telemetry only.
   */
  role: string | null;
  /** True iff user has any row in admin_memberships. */
  hasAdminScope: boolean;
  /** True iff user is teacher_id on any classroom. */
  ownsClassroom: boolean;
  /** True iff user is parent_id on any children row. */
  hasChildren: boolean;
  displayName: string | null;
  email: string | null;
  loaded: boolean;
  fetch: () => Promise<void>;
  /**
   * Re-fetch even if `loaded` is true. Call this after any server-side
   * mutation the store can't observe locally — most importantly the
   * Stripe webhook flipping `profiles.plan` after checkout. `fetch()`
   * early-returns on cached state, so post-checkout it would never
   * surface the new premium plan without this.
   */
  refresh: () => Promise<void>;
  setPlan: (plan: string) => void;
}

const FREE_ACCESS: Access = { tier: "free", hasFullAccess: false, trialDaysLeft: 0 };

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: null,
  rawPlan: null,
  signupAt: null,
  everSubscribed: false,
  access: FREE_ACCESS,
  role: null,
  hasAdminScope: false,
  ownsClassroom: false,
  hasChildren: false,
  displayName: null,
  email: null,
  loaded: false,

  fetch: async () => {
    if (get().loaded) return;
    await loadFromSupabase(set);
  },

  refresh: async () => {
    await loadFromSupabase(set);
  },

  setPlan: (plan) => {
    const s = get();
    const everSubscribed = s.everSubscribed || isPaidPlan(plan);
    set({
      plan: effectivePlan(plan, s.signupAt),
      rawPlan: plan,
      everSubscribed,
      access: resolveAccess({ plan, signupAt: s.signupAt, everSubscribed }),
      loaded: true,
    });
  },
}));

// Shared loader used by both first-time fetch() and the bypass-cache
// refresh(). Lives outside the store factory so we don't have to
// duplicate the query graph in two places.
async function loadFromSupabase(
  set: (state: Partial<PlanState>) => void,
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    set({
      plan: "free",
      rawPlan: "free",
      signupAt: null,
      everSubscribed: false,
      access: FREE_ACCESS,
      role: null,
      hasAdminScope: false,
      ownsClassroom: false,
      hasChildren: false,
      displayName: null,
      email: null,
      loaded: true,
    });
    return;
  }
  const [
    { data: profile },
    { count: adminCount },
    { count: classroomCount },
    { count: childCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, role, email, display_name, created_at, had_subscription")
      .eq("id", user.id)
      .single(),
    supabase
      .from("admin_memberships")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id),
    supabase
      .from("classrooms")
      .select("id", { count: "exact", head: true })
      .eq("teacher_id", user.id),
    supabase
      .from("children")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", user.id),
  ]);
  const rawPlan = (profile as any)?.plan || "free";
  const signupAt = (profile as any)?.created_at ?? null;
  const everSubscribed = !!(profile as any)?.had_subscription;
  set({
    plan: effectivePlan(rawPlan, signupAt),
    rawPlan,
    signupAt,
    everSubscribed,
    access: resolveAccess({ plan: rawPlan, signupAt, everSubscribed }),
    role: (profile as any)?.role || null,
    hasAdminScope: (adminCount ?? 0) > 0,
    ownsClassroom: (classroomCount ?? 0) > 0,
    hasChildren: (childCount ?? 0) > 0,
    displayName:
      (profile as any)?.display_name ??
      (profile as any)?.email?.split("@")[0] ??
      user.email?.split("@")[0] ??
      null,
    email: user.email ?? null,
    loaded: true,
  });
}
