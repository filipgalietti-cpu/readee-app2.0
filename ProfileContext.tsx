"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ───────────────────────── TYPES ───────────────────────── */

export interface ReadeeProfile {
  name: string;
  favoriteColor: string;
  favoriteColorHex: string;
  interests: string[];
  onboardingComplete: boolean;
  createdAt: string;
}

interface ProfileContextType {
  profile: ReadeeProfile | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<ReadeeProfile>) => void;
  clearProfile: () => void;
}

/* ───────────────────────── CONTEXT ───────────────────────── */

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: true,
  updateProfile: () => {},
  clearProfile: () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

/* ───────────────────────── PROVIDER ───────────────────────── */

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ReadeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("readee-profile");
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
    setIsLoading(false);
  }, []);

  const updateProfile = (updates: Partial<ReadeeProfile>) => {
    setProfile((prev) => {
      const updated = prev ? { ...prev, ...updates } : null;
      if (updated) {
        localStorage.setItem("readee-profile", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearProfile = () => {
    localStorage.removeItem("readee-profile");
    setProfile(null);
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoading, updateProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
