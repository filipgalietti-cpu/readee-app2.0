-- Ensure onboarding_preferences exists for environments that started
-- from a reduced schema and never created this table.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS onboarding_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_color TEXT,
  favorite_color_hex TEXT,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_preferences_user_id
  ON onboarding_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_preferences_interests
  ON onboarding_preferences USING GIN(interests);

ALTER TABLE onboarding_preferences ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_onboarding_preferences_updated_at ON onboarding_preferences;
CREATE TRIGGER update_onboarding_preferences_updated_at
  BEFORE UPDATE ON onboarding_preferences
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view own preferences'
      AND tablename = 'onboarding_preferences'
  ) THEN
    CREATE POLICY "Users can view own preferences"
      ON onboarding_preferences FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert own preferences'
      AND tablename = 'onboarding_preferences'
  ) THEN
    CREATE POLICY "Users can insert own preferences"
      ON onboarding_preferences FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can update own preferences'
      AND tablename = 'onboarding_preferences'
  ) THEN
    CREATE POLICY "Users can update own preferences"
      ON onboarding_preferences FOR UPDATE
      USING (user_id = auth.uid());
  END IF;
END $$;
