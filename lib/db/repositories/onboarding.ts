/**
 * Onboarding repository - handles onboarding preferences
 */

import { createClient } from '@/lib/supabase/server';
import { OnboardingPreferences } from '@/lib/db/types';

export interface SaveOnboardingParams {
  userId: string;
  favoriteColor?: string;
  favoriteColorHex?: string;
  interests?: string[];
}

/**
 * Save or update onboarding preferences for a user
 */
export async function saveOnboardingPreferences(
  params: SaveOnboardingParams
): Promise<OnboardingPreferences> {
  const supabase = await createClient();
  
  // Try to upsert (insert or update if exists)
  const { data, error } = await supabase
    .from('onboarding_preferences')
    .upsert({
      user_id: params.userId,
      favorite_color: params.favoriteColor || null,
      favorite_color_hex: params.favoriteColorHex || null,
      interests: params.interests || [],
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to save onboarding preferences: ${error.message}`);
  }
  
  return data;
}

/**
 * Get onboarding preferences for a user
 */
export async function getOnboardingPreferences(
  userId: string
): Promise<OnboardingPreferences | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('onboarding_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get onboarding preferences: ${error.message}`);
  }
  
  return data;
}

/**
 * Update interests for a user
 */
export async function updateInterests(
  userId: string,
  interests: string[]
): Promise<OnboardingPreferences> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('onboarding_preferences')
    .update({ interests })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update interests: ${error.message}`);
  }
  
  return data;
}
