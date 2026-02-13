-- Add onboarding_complete column to profiles table
-- This migration is idempotent (safe to run multiple times)

-- Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'onboarding_complete'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN onboarding_complete BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add index for faster onboarding status queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_complete 
ON profiles(onboarding_complete);
