"use client";

import { createContext, useContext, useEffect } from "react";
import { useThemeStore } from "@/lib/stores/theme-store";

interface ThemeCtx {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ darkMode: false, toggleDarkMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useThemeStore((s) => s.darkMode);
  const mounted = useThemeStore((s) => s.mounted);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Prevent flash of wrong theme
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
