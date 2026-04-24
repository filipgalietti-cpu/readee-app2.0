/**
 * View-mode store for hybrid users (both teacher and parent capabilities).
 *
 * A user who owns a classroom AND has children under their care can flip
 * their app experience between "Teacher view" and "Parent view" using a
 * toggle in the sidebar header. Preference persists in localStorage so
 * it sticks between sessions.
 *
 * Non-hybrid users never see the toggle — their view mode is inferred
 * from capabilities and this store is effectively inert.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ViewMode = "teacher" | "parent";

interface ViewModeState {
  mode: ViewMode | null;   // null = use default derivation
  setMode: (m: ViewMode) => void;
  clear: () => void;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      mode: null,
      setMode: (mode) => set({ mode }),
      clear: () => set({ mode: null }),
    }),
    {
      name: "readee-view-mode",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * Decide effective view given capabilities + user preference.
 * - Hybrid users: respect their saved preference, else default to teacher
 *   when they own a classroom
 * - Non-hybrid users: capability-determined, preference ignored
 */
export function resolveViewMode(input: {
  ownsClassroom: boolean;
  hasChildren: boolean;
  saved: ViewMode | null;
}): ViewMode {
  const isHybrid = input.ownsClassroom && input.hasChildren;
  if (!input.ownsClassroom) return "parent";
  if (!input.hasChildren) return "teacher";
  // Hybrid — user preference wins.
  if (isHybrid && input.saved) return input.saved;
  return "teacher";
}
