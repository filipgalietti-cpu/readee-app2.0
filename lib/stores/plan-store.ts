import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface PlanState {
  plan: string | null;      // null = loading, "free" | "premium"
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

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: null,
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

  setPlan: (plan) => set({ plan, loaded: true }),
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
      .select("plan, role, email, display_name")
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
  set({
    plan: (profile as any)?.plan || "free",
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
