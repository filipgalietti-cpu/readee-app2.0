/**
 * Authentication helpers for server-side use
 * These helpers should only be used in Server Components, API Routes, and Server Actions
 */

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Profile } from '@/lib/db/types';
import type { User } from '@supabase/supabase-js';

/**
 * Get the currently authenticated user
 * Returns null if not authenticated
 * 
 * Usage:
 * ```ts
 * const user = await getCurrentUser();
 * if (!user) {
 *   return Response.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Get the profile for the currently authenticated user
 * Returns null if not authenticated or profile doesn't exist
 * 
 * Usage:
 * ```ts
 * const profile = await getUserProfile();
 * if (!profile) {
 *   return Response.json({ error: 'Profile not found' }, { status: 404 });
 * }
 * ```
 */
export async function getUserProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error || !profile) {
    return null;
  }
  
  return profile;
}

/**
 * Require authentication - throws error if not authenticated
 * Use this for API routes that must have an authenticated user
 * 
 * Usage:
 * ```ts
 * const user = await requireAuth();
 * // user is guaranteed to be defined here
 * ```
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Require profile - throws error if not authenticated or no profile
 * Use this for API routes that must have a user profile
 * 
 * Usage:
 * ```ts
 * const profile = await requireProfile();
 * // profile is guaranteed to be defined here
 * ```
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getUserProfile();
  if (profile) return profile;

  // No profile row for an authenticated user — a trigger miss, replica lag, or
  // an RLS read edge. Self-heal (mirroring the handle_new_user trigger + the
  // protected layout) via the admin client instead of throwing a 500 that
  // Sentry catches as "Profile not found" on every requireProfile() surface.
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const metaRole = (user.user_metadata?.role as string | undefined) ?? 'parent';
  const role = metaRole === 'educator' ? 'educator' : 'parent';
  const admin = supabaseAdmin();
  await admin
    .from('profiles')
    .upsert(
      { id: user.id, email: user.email, role, onboarding_complete: false },
      { onConflict: 'id', ignoreDuplicates: true },
    );

  // Re-read via the admin client (bypasses RLS) so a genuine row is always found.
  const { data: healed } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (healed) return healed as Profile;

  throw new Error('Profile not found');
}
