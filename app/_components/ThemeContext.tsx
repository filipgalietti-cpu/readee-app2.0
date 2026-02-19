"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeCtx {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ darkMode: false, toggleDarkMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read initial value from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("readee_prefs");
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.darkMode === true) {
          setDarkMode(true);
          document.documentElement.classList.add("dark");
        }
      }
    } catch {}
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      // Persist to localStorage (merge with existing prefs)
      try {
        const stored = localStorage.getItem("readee_prefs");
        const prefs = stored ? JSON.parse(stored) : {};
        prefs.darkMode = next;
        localStorage.setItem("readee_prefs", JSON.stringify(prefs));
      } catch {}
      // Toggle class on <html>
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

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
