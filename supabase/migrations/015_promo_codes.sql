-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  max_uses INTEGER, -- NULL = unlimited
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ, -- NULL = never expires
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive unique index on code
CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_code_unique ON promo_codes (LOWER(code));

-- Promo redemptions table
CREATE TABLE IF NOT EXISTS promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, promo_code_id)
);

-- RLS policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read promo codes (needed for validation)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read promo_codes' AND tablename = 'promo_codes'
  ) THEN
    CREATE POLICY "Authenticated users can read promo_codes"
      ON promo_codes FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Users can read their own redemptions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own promo_redemptions' AND tablename = 'promo_redemptions'
  ) THEN
    CREATE POLICY "Users can read own promo_redemptions"
      ON promo_redemptions FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;
