"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const ONBOARDING_TABLE_MISSING_CACHE_KEY = "readee-onboarding-table-missing";

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

type DbProfileRow = {
  display_name: string;
  onboarding_complete: boolean;
  created_at: string;
  favorite_color?: string | null;
  favorite_color_hex?: string | null;
  interests?: string[] | null;
};

type DbOnboardingPreferencesRow = {
  favorite_color: string | null;
  favorite_color_hex: string | null;
  interests: string[] | null;
};

function readStoredProfile(): ReadeeProfile | null {
  try {
    const stored = localStorage.getItem("readee-profile");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function isMissingRelationError(error: unknown, relationName: string): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  if (err.code === "PGRST205" || err.code === "42P01") return true;
  return Boolean(err.message && err.message.includes(relationName));
}

function normalizeInterests(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ReadeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Not logged in, try localStorage as fallback
        setProfile(readStoredProfile());
        setIsLoading(false);
        return;
      }

      // Fetch profile from Supabase
      const { data: rawProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile row:', profileError);
        setProfile(readStoredProfile());
        setIsLoading(false);
        return;
      }

      if (rawProfile) {
        const dbProfile = rawProfile as DbProfileRow;
        let favoriteColor = typeof dbProfile.favorite_color === "string" ? dbProfile.favorite_color : "";
        let favoriteColorHex = typeof dbProfile.favorite_color_hex === "string" ? dbProfile.favorite_color_hex : "#10b981";
        let interests = normalizeInterests(dbProfile.interests);

        const profileHasPreferenceFields =
          "favorite_color" in dbProfile || "favorite_color_hex" in dbProfile || "interests" in dbProfile;

        // Older schema stores preferences in onboarding_preferences; newer schema may store them on profiles.
        const shouldQueryPreferencesTable =
          !profileHasPreferenceFields && localStorage.getItem(ONBOARDING_TABLE_MISSING_CACHE_KEY) !== "1";

        if (shouldQueryPreferencesTable) {
          const { data: prefData, error: prefError } = await supabase
            .from('onboarding_preferences')
            .select('favorite_color, favorite_color_hex, interests')
            .eq('user_id', user.id)
            .maybeSingle<DbOnboardingPreferencesRow>();

          if (!prefError && prefData) {
            favoriteColor = prefData.favorite_color ?? favoriteColor;
            favoriteColorHex = prefData.favorite_color_hex ?? favoriteColorHex;
            interests = normalizeInterests(prefData.interests);
          } else if (prefError && isMissingRelationError(prefError, "onboarding_preferences")) {
            localStorage.setItem(ONBOARDING_TABLE_MISSING_CACHE_KEY, "1");
          } else if (prefError && prefError.code !== "PGRST116") {
            console.error("Error fetching onboarding preferences:", prefError);
          }
        }

        const readeeProfile: ReadeeProfile = {
          name: dbProfile.display_name,
          favoriteColor,
          favoriteColorHex,
          interests,
          onboardingComplete: dbProfile.onboarding_complete,
          createdAt: dbProfile.created_at,
        };
        
        setProfile(readeeProfile);
        // Also save to localStorage for backward compatibility
        localStorage.setItem("readee-profile", JSON.stringify(readeeProfile));
      } else {
        // No profile in DB, check localStorage
        setProfile(readStoredProfile());
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage
      setProfile(readStoredProfile());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void refreshProfile();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [refreshProfile]);

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
