-- ═══════════════════════════════════════════════════════════
-- Readee Learning Content Tables
-- Run this in your Supabase SQL Editor to create all tables
-- for the learning path, lessons, items, stories, and progress
-- ═══════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- 1. CONTENT TABLES (Learning Path)
-- ────────────────────────────────────────────────────────────

-- Content Units (e.g., "Unit 1: Short Vowels")
CREATE TABLE IF NOT EXISTS content_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  icon_emoji TEXT DEFAULT '📚',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content Lessons (e.g., "Lesson 1: Letter A")
CREATE TABLE IF NOT EXISTS content_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES content_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content Items (Practice questions/activities within lessons)
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES content_lessons(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('phoneme-tap', 'word-build', 'multiple-choice', 'comprehension')),
  order_index INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB, -- For multiple-choice: array of options
  audio_url TEXT, -- Optional audio file URL
  image_url TEXT, -- Optional image URL
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. STORY TABLES (Library)
-- ────────────────────────────────────────────────────────────

-- Stories (Decodable reading stories)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  grade_level TEXT,
  unlock_after_unit_id UUID REFERENCES content_units(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Story Pages (Individual pages in a story)
CREATE TABLE IF NOT EXISTS story_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  word_timings JSONB, -- Array of {word, start, end} for highlighting
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, page_number)
);

-- ────────────────────────────────────────────────────────────
-- 3. USER PROGRESS TABLES
-- ────────────────────────────────────────────────────────────

-- User Progress (Overall progress through units/lessons)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES content_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER, -- Percentage score (0-100)
  attempts INTEGER DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- User Item History (Spaced repetition tracking)
CREATE TABLE IF NOT EXISTS user_item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  correct BOOLEAN NOT NULL,
  response TEXT,
  response_time_ms INTEGER,
  next_review_date TIMESTAMPTZ, -- For spaced repetition
  ease_factor DECIMAL(3,2) DEFAULT 2.5, -- For spaced repetition algorithm
  repetitions INTEGER DEFAULT 0,
  interval_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 4. INDEXES for Performance
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_content_lessons_unit_id ON content_lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_content_items_lesson_id ON content_items(lesson_id);
CREATE INDEX IF NOT EXISTS idx_story_pages_story_id ON story_pages(story_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_item_history_user_id ON user_item_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_item_history_item_id ON user_item_history(item_id);
CREATE INDEX IF NOT EXISTS idx_user_item_history_next_review ON user_item_history(next_review_date) WHERE next_review_date IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE content_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_item_history ENABLE ROW LEVEL SECURITY;

-- Content tables: Anyone authenticated can read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view content units' AND tablename = 'content_units') THEN
    CREATE POLICY "Anyone can view content units" ON content_units FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view content lessons' AND tablename = 'content_lessons') THEN
    CREATE POLICY "Anyone can view content lessons" ON content_lessons FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view content items' AND tablename = 'content_items') THEN
    CREATE POLICY "Anyone can view content items" ON content_items FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view stories' AND tablename = 'stories') THEN
    CREATE POLICY "Anyone can view stories" ON stories FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view story pages' AND tablename = 'story_pages') THEN
    CREATE POLICY "Anyone can view story pages" ON story_pages FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- User progress: Users can only see/modify their own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own progress' AND tablename = 'user_progress') THEN
    CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own progress' AND tablename = 'user_progress') THEN
    CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own progress' AND tablename = 'user_progress') THEN
    CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- User item history: Users can only see/modify their own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own item history' AND tablename = 'user_item_history') THEN
    CREATE POLICY "Users can view own item history" ON user_item_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own item history' AND tablename = 'user_item_history') THEN
    CREATE POLICY "Users can insert own item history" ON user_item_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- 6. AUTO-UPDATE TIMESTAMPS
-- ────────────────────────────────────────────────────────────

-- Note: The update_updated_at_column() function should already exist
-- from the profiles migration.

DROP TRIGGER IF EXISTS update_content_units_updated_at ON content_units;
CREATE TRIGGER update_content_units_updated_at
  BEFORE UPDATE ON content_units
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_lessons_updated_at ON content_lessons;
CREATE TRIGGER update_content_lessons_updated_at
  BEFORE UPDATE ON content_lessons
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_story_pages_updated_at ON story_pages;
CREATE TRIGGER update_story_pages_updated_at
  BEFORE UPDATE ON story_pages
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- Done! Your learning content tables are ready.
-- Next: Run the seed data migration to populate sample content
-- ═══════════════════════════════════════════════════════════
