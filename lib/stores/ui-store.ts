import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  activePage: string;
  modalOpen: string | null;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  setActivePage: (page: string) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activePage: "dashboard",
  modalOpen: null,

  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActivePage: (page) => set({ activePage: page }),
  openModal: (id) => set({ modalOpen: id }),
  closeModal: () => set({ modalOpen: null }),
}));
