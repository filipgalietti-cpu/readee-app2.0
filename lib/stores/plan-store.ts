import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface PlanState {
  plan: string | null;      // null = loading, "free" | "premium"
  loaded: boolean;
  fetch: () => Promise<void>;
  setPlan: (plan: string) => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: null,
  loaded: false,

  fetch: async () => {
    if (get().loaded) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ plan: "free", loaded: true });
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    set({ plan: (data as any)?.plan || "free", loaded: true });
  },

  setPlan: (plan) => set({ plan, loaded: true }),
}));
