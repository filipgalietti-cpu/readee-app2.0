import { create } from "zustand";
import type { Child } from "@/lib/db/types";

interface ChildState {
  currentChildId: string | null;
  childData: Child | null;
  children: Child[];
  loaded: boolean;
  setCurrentChild: (id: string | null) => void;
  setChildData: (child: Child | null) => void;
  setChildren: (children: Child[]) => void;
  setLoaded: (v: boolean) => void;
  getChildById: (id: string) => Child | undefined;
}

export const useChildStore = create<ChildState>((set, get) => ({
  currentChildId: null,
  childData: null,
  children: [],
  loaded: false,

  setCurrentChild: (id) => set({ currentChildId: id }),
  setChildData: (child) => set({ childData: child }),
  setChildren: (children) => set({ children }),
  setLoaded: (v) => set({ loaded: v }),
  getChildById: (id) => get().children.find((c) => c.id === id),
}));
