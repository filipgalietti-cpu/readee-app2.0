"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface ReadeeProfile {
  name: string;
  favoriteColor: string;
  favoriteColorHex: string;
  interests: string[];
  onboardingComplete: boolean;
  createdAt: string;
}

type ProfileContextType = {
  profile: ReadeeProfile | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<ReadeeProfile>) => void;
  clearProfile: () => void;
};

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: true,
  updateProfile: () => {},
  clearProfile: () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ReadeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("readee-profile");
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
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
