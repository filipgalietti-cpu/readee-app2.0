import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface PlanState {
  plan: string | null;      // null = loading, "free" | "premium"
  role: string | null;      // null = loading, "parent" | "child" | "student" | "educator"
  hasAdminScope: boolean;   // true if user has any admin_memberships row
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
        displayName: null,
        email: null,
        loaded: true,
      });
      return;
    }
    const [{ data: profile }, { count: adminCount }] = await Promise.all([
      supabase
        .from("profiles")
        .select("plan, role, display_name")
        .eq("id", user.id)
        .single(),
      supabase
        .from("admin_memberships")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id),
    ]);
    set({
      plan: (profile as any)?.plan || "free",
      role: (profile as any)?.role || null,
      hasAdminScope: (adminCount ?? 0) > 0,
      displayName: (profile as any)?.display_name ?? null,
      email: user.email ?? null,
      loaded: true,
    });
  },

  setPlan: (plan) => set({ plan, loaded: true }),
}));
