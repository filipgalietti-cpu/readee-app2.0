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
        .select("plan, role, display_name")
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
      displayName: (profile as any)?.display_name ?? null,
      email: user.email ?? null,
      loaded: true,
    });
  },

  setPlan: (plan) => set({ plan, loaded: true }),
}));
