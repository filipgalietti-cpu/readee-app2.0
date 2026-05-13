import { create } from "zustand";
import { writeSidebarOpenCookie } from "@/lib/sidebar/cookie";

interface SidebarState {
  open: boolean;
  mobileOpen: boolean;
  setOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  toggle: () => void;
  /** Hydrate the store with the server-read cookie value. Called once
   *  by SidebarShell on mount so client + server agree on the initial
   *  layout (no margin reflow → no CLS). */
  hydrateFromServer: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  mobileOpen: false,
  setOpen: (open) => {
    writeSidebarOpenCookie(open);
    set({ open });
  },
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  toggle: () =>
    set((s) => {
      const next = !s.open;
      writeSidebarOpenCookie(next);
      return { open: next };
    }),
  hydrateFromServer: (open) => set({ open }),
}));
