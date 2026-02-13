-- ═══════════════════════════════════════════════════════════
-- Readee Backend Foundation - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════
-- 1. PROFILES TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'educator')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ═══════════════════════════════════════════════════════════
-- 2. CHILDREN TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 3 AND age <= 12),
  reading_level INTEGER NOT NULL CHECK (reading_level >= 1 AND reading_level <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster parent lookups
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);

-- Index for reading level queries
CREATE INDEX IF NOT EXISTS idx_children_reading_level ON children(reading_level);

-- ═══════════════════════════════════════════════════════════
-- 3. ONBOARDING PREFERENCES TABLE
-- ═══════════════════════════════════════════════════════════

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

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_preferences_user_id ON onboarding_preferences(user_id);

-- GIN index for array searches on interests
CREATE INDEX IF NOT EXISTS idx_onboarding_preferences_interests ON onboarding_preferences USING GIN(interests);

-- ═══════════════════════════════════════════════════════════
-- 4. STORIES TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  reading_level INTEGER NOT NULL CHECK (reading_level >= 1 AND reading_level <= 10),
  interest_tags TEXT[] DEFAULT '{}',
  content JSONB, -- Store story pages/content as JSON
  thumbnail_url TEXT,
  total_pages INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for reading level queries
CREATE INDEX IF NOT EXISTS idx_stories_reading_level ON stories(reading_level);

-- GIN index for array searches on interest_tags
CREATE INDEX IF NOT EXISTS idx_stories_interest_tags ON stories USING GIN(interest_tags);

-- ═══════════════════════════════════════════════════════════
-- 5. READING PROGRESS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  last_page_read INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(child_id, story_id)
);

-- Index for child progress queries
CREATE INDEX IF NOT EXISTS idx_reading_progress_child_id ON reading_progress(child_id);

-- Index for story progress queries
CREATE INDEX IF NOT EXISTS idx_reading_progress_story_id ON reading_progress(story_id);

-- Composite index for completed stories
CREATE INDEX IF NOT EXISTS idx_reading_progress_child_completed ON reading_progress(child_id, completed);

-- ═══════════════════════════════════════════════════════════
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ═══════════════════════════════════════════════════════════

-- Reusable trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_onboarding_preferences_updated_at
  BEFORE UPDATE ON onboarding_preferences
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at
  BEFORE UPDATE ON reading_progress
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- PROFILES POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════
-- CHILDREN POLICIES
-- ═══════════════════════════════════════════════════════════

-- Parents can view their own children
CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  USING (parent_id = auth.uid());

-- Parents can insert children
CREATE POLICY "Parents can insert children"
  ON children FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- Parents can update their own children
CREATE POLICY "Parents can update own children"
  ON children FOR UPDATE
  USING (parent_id = auth.uid());

-- Parents can delete their own children
CREATE POLICY "Parents can delete own children"
  ON children FOR DELETE
  USING (parent_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- ONBOARDING PREFERENCES POLICIES
-- ═══════════════════════════════════════════════════════════

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON onboarding_preferences FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON onboarding_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON onboarding_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- STORIES POLICIES (Public Read-Only)
-- ═══════════════════════════════════════════════════════════

-- Anyone (authenticated) can view stories
CREATE POLICY "Authenticated users can view stories"
  ON stories FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete stories (via admin API)
-- No explicit policies needed - RLS will block by default

-- ═══════════════════════════════════════════════════════════
-- READING PROGRESS POLICIES
-- ═══════════════════════════════════════════════════════════

-- Parents can view progress for their children
CREATE POLICY "Parents can view children's progress"
  ON reading_progress FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Parents can insert progress for their children
CREATE POLICY "Parents can insert children's progress"
  ON reading_progress FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Parents can update progress for their children
CREATE POLICY "Parents can update children's progress"
  ON reading_progress FOR UPDATE
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Function to get recommended stories for a child
CREATE OR REPLACE FUNCTION get_recommended_stories(
  p_child_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  reading_level INTEGER,
  interest_tags TEXT[],
  thumbnail_url TEXT,
  is_completed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.reading_level,
    s.interest_tags,
    s.thumbnail_url,
    COALESCE(rp.completed, false) as is_completed
  FROM stories s
  LEFT JOIN reading_progress rp ON s.id = rp.story_id AND rp.child_id = p_child_id
  WHERE s.reading_level = (
    SELECT reading_level FROM children WHERE id = p_child_id
  )
  ORDER BY rp.completed IS NULL DESC, s.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- INITIAL SEED DATA (Optional - for testing)
-- ═══════════════════════════════════════════════════════════

-- Sample stories for testing
INSERT INTO stories (title, reading_level, interest_tags, content, total_pages) VALUES
  ('The Magic Garden', 1, ARRAY['nature', 'magic', 'animals'], '{"pages": [{"text": "Once upon a time..."}]}', 10),
  ('Space Adventure', 2, ARRAY['space', 'adventure', 'science'], '{"pages": [{"text": "In a galaxy far away..."}]}', 12),
  ('Dinosaur Friends', 1, ARRAY['dinosaurs', 'animals', 'friendship'], '{"pages": [{"text": "Long ago..."}]}', 8)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Done! Database schema is ready for production.
-- ═══════════════════════════════════════════════════════════
