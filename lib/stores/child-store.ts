import { create } from "zustand";
import type { Child } from "@/lib/db/types";

interface ChildState {
  currentChildId: string | null;
  childData: Child | null;
  children: Child[];
  setCurrentChild: (id: string | null) => void;
  setChildData: (child: Child | null) => void;
  setChildren: (children: Child[]) => void;
}

export const useChildStore = create<ChildState>((set) => ({
  currentChildId: null,
  childData: null,
  children: [],

  setCurrentChild: (id) => set({ currentChildId: id }),
  setChildData: (child) => set({ childData: child }),
  setChildren: (children) => set({ children }),
}));
