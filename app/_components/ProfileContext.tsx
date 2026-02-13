"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

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
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: true,
  updateProfile: () => {},
  clearProfile: () => {},
  refreshProfile: async () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ReadeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Not logged in, try localStorage as fallback
        const stored = localStorage.getItem("readee-profile");
        if (stored) {
          setProfile(JSON.parse(stored));
        } else {
          setProfile(null);
        }
        setIsLoading(false);
        return;
      }

      // Fetch profile from Supabase
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch onboarding preferences
      const { data: preferences } = await supabase
        .from('onboarding_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (dbProfile) {
        const readeeProfile: ReadeeProfile = {
          name: dbProfile.display_name,
          favoriteColor: preferences?.favorite_color || '',
          favoriteColorHex: preferences?.favorite_color_hex || '#10b981',
          interests: preferences?.interests || [],
          onboardingComplete: dbProfile.onboarding_complete,
          createdAt: dbProfile.created_at,
        };
        
        setProfile(readeeProfile);
        // Also save to localStorage for backward compatibility
        localStorage.setItem("readee-profile", JSON.stringify(readeeProfile));
      } else {
        // No profile in DB, check localStorage
        const stored = localStorage.getItem("readee-profile");
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem("readee-profile");
        if (stored) setProfile(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshProfile();
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
    <ProfileContext.Provider value={{ profile, isLoading, updateProfile, clearProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
