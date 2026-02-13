/**
 * Profile repository - handles all profile-related database operations
 */

import { createClient } from '@/lib/supabase/server';
import { Profile, UserRole } from '@/lib/db/types';

export interface CreateProfileParams {
  userId: string;
  displayName: string;
  role: UserRole;
}

export interface UpdateProfileParams {
  displayName?: string;
  role?: UserRole;
}

/**
 * Create a new user profile
 */
export async function createProfile(params: CreateProfileParams): Promise<Profile> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: params.userId,
      display_name: params.displayName,
      role: params.role,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }
  
  return data;
}

/**
 * Get a profile by user ID
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get profile: ${error.message}`);
  }
  
  return data;
}

/**
 * Update a user profile
 */
export async function updateProfile(
  userId: string,
  params: UpdateProfileParams
): Promise<Profile> {
  const supabase = await createClient();
  
  // Convert camelCase to snake_case for database
  const updateData: any = {};
  if (params.displayName !== undefined) {
    updateData.display_name = params.displayName;
  }
  if (params.role !== undefined) {
    updateData.role = params.role;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
  
  return data;
}

/**
 * Check if a profile exists for a user
 */
export async function profileExists(userId: string): Promise<boolean> {
  const profile = await getProfileById(userId);
  return profile !== null;
}
