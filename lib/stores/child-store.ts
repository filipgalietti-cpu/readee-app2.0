import { create } from "zustand";
import type { Child } from "@/lib/db/types";

interface ChildState {
  currentChildId: string | null;
  childData: Child | null;
  children: Child[];
  loaded: boolean;
  /** The user this store's children belong to. Lets us auto-reset
   *  when the logged-in user changes (e.g. switching from parent
   *  gmail to +test2@readee.app teacher) so kid persona doesn't
   *  leak across accounts. */
  ownerProfileId: string | null;
  setCurrentChild: (id: string | null) => void;
  setChildData: (child: Child | null) => void;
  setChildren: (children: Child[]) => void;
  setLoaded: (v: boolean) => void;
  setOwnerProfileId: (id: string | null) => void;
  reset: () => void;
  getChildById: (id: string) => Child | undefined;
}

export const useChildStore = create<ChildState>((set, get) => ({
  currentChildId: null,
  childData: null,
  children: [],
  loaded: false,
  ownerProfileId: null,

  setCurrentChild: (id) => set({ currentChildId: id }),
  setChildData: (child) => set({ childData: child }),
  setChildren: (children) => set({ children }),
  setLoaded: (v) => set({ loaded: v }),
  setOwnerProfileId: (id) => set({ ownerProfileId: id }),
  reset: () =>
    set({
      currentChildId: null,
      childData: null,
      children: [],
      loaded: false,
      ownerProfileId: null,
    }),
  getChildById: (id) => get().children.find((c) => c.id === id),
}));
