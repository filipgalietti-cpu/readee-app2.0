import { create } from "zustand";
import { writeSidebarOpenCookie } from "@/lib/sidebar/cookie";

interface SidebarState {
  open: boolean;
  mobileOpen: boolean;
  /** True when the fixed desktop sidebar is actually on screen (protected
   *  routes, not the immersive HIDDEN_PAGES). Published by SidebarShell so
   *  the root-layout footer can offset itself past the fixed rail instead
   *  of being covered by it. */
  desktopSidebarVisible: boolean;
  setOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  setDesktopSidebarVisible: (visible: boolean) => void;
  toggle: () => void;
  /** Hydrate the store with the server-read cookie value. Called once
   *  by SidebarShell on mount so client + server agree on the initial
   *  layout (no margin reflow → no CLS). */
  hydrateFromServer: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  mobileOpen: false,
  desktopSidebarVisible: false,
  setDesktopSidebarVisible: (visible) => set({ desktopSidebarVisible: visible }),
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
