-- Add plan column to profiles (free or premium)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

-- Create waitlist table for premium upgrade interest
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  plan_interest TEXT NOT NULL, -- 'monthly' or 'annual'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow any authenticated user to insert into waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert waitlist"
  ON waitlist FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow service_role full access (admin client bypasses RLS by default)
