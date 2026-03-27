import { create } from "zustand";

interface SidebarState {
  open: boolean;
  mobileOpen: boolean;
  setOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  mobileOpen: false,
  setOpen: (open) => set({ open }),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
