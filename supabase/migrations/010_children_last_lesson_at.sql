-- Add last_lesson_at column to track streak logic
ALTER TABLE children ADD COLUMN IF NOT EXISTS last_lesson_at TIMESTAMPTZ;

-- Also add reading_level column if not present (used by dashboard)
ALTER TABLE children ADD COLUMN IF NOT EXISTS reading_level TEXT;
