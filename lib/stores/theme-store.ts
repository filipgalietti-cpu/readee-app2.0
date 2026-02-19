import { create } from "zustand";

interface ThemeState {
  darkMode: boolean;
  mounted: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;
  hydrate: () => void;
}

function mergePrefs(patch: Record<string, unknown>) {
  try {
    const stored = localStorage.getItem("readee_prefs");
    const prefs = stored ? JSON.parse(stored) : {};
    Object.assign(prefs, patch);
    localStorage.setItem("readee_prefs", JSON.stringify(prefs));
  } catch {}
}

function applyClass(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: false,
  mounted: false,

  toggleDarkMode: () => {
    set((state) => {
      const next = !state.darkMode;
      applyClass(next);
      mergePrefs({ darkMode: next });
      return { darkMode: next };
    });
  },

  setDarkMode: (v) => {
    applyClass(v);
    mergePrefs({ darkMode: v });
    set({ darkMode: v });
  },

  hydrate: () => {
    try {
      const stored = localStorage.getItem("readee_prefs");
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.darkMode === true) {
          applyClass(true);
          set({ darkMode: true, mounted: true });
          return;
        }
      }
    } catch {}
    set({ mounted: true });
  },
}));
