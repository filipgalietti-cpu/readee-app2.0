/**
 * POST /api/onboarding/complete
 * 
 * Complete user onboarding by creating profile and saving preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/helpers';
import { createProfile, profileExists, updateProfile } from '@/lib/db/repositories/profiles';
import { saveOnboardingPreferences } from '@/lib/db/repositories/onboarding';
import { OnboardingCompleteRequest, OnboardingCompleteResponse } from '@/lib/db/types';

function isMissingOnboardingPreferencesTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("onboarding_preferences") ||
    error.message.includes("PGRST205") ||
    error.message.includes("42P01")
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body: OnboardingCompleteRequest = await request.json();
    
    // Validate required fields
    if (!body.displayName || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: displayName and role' },
        { status: 400 }
      );
    }
    
    // Validate role
    if (!['parent', 'child', 'educator'].includes(body.role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be parent, child, or educator' },
        { status: 400 }
      );
    }
    
    // Check if profile already exists
    const exists = await profileExists(user.id);
    if (exists) {
      return NextResponse.json(
        { success: false, error: 'Profile already exists' },
        { status: 409 }
      );
    }
    
    // Create profile with onboarding_complete set to true
    await createProfile({
      userId: user.id,
      displayName: body.displayName,
      role: body.role,
    });
    
    // Update profile to mark onboarding as complete
    const updatedProfile = await updateProfile(user.id, {
      onboardingComplete: true,
    });
    
    // Save onboarding preferences if provided
    let preferences = undefined;
    if (body.favoriteColor || body.favoriteColorHex || body.interests) {
      try {
        preferences = await saveOnboardingPreferences({
          userId: user.id,
          favoriteColor: body.favoriteColor,
          favoriteColorHex: body.favoriteColorHex,
          interests: body.interests,
        });
      } catch (error) {
        // Keep onboarding flow unblocked even if a deployment is missing this table.
        if (isMissingOnboardingPreferencesTableError(error)) {
          console.warn('Skipping onboarding_preferences save: table is missing in current database schema');
        } else {
          throw error;
        }
      }
    }
    
    const response: OnboardingCompleteResponse = {
      success: true,
      profile: updatedProfile,
      preferences,
      message: 'Onboarding completed successfully',
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
