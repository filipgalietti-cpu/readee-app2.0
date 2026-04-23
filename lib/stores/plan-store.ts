import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface PlanState {
  plan: string | null;      // null = loading, "free" | "premium"
  role: string | null;      // null = loading, "parent" | "child" | "student" | "educator"
  loaded: boolean;
  fetch: () => Promise<void>;
  setPlan: (plan: string) => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: null,
  role: null,
  loaded: false,

  fetch: async () => {
    if (get().loaded) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ plan: "free", role: null, loaded: true });
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("plan, role")
      .eq("id", user.id)
      .single();
    set({
      plan: (data as any)?.plan || "free",
      role: (data as any)?.role || null,
      loaded: true,
    });
  },

  setPlan: (plan) => set({ plan, loaded: true }),
}));
