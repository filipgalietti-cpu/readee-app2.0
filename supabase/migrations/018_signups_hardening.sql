-- Add metadata fields to support abuse detection and rate limiting
-- on the public signups endpoint.

ALTER TABLE signups
  ADD COLUMN IF NOT EXISTS source_ip TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_signups_created_at ON signups(created_at);
CREATE INDEX IF NOT EXISTS idx_signups_source_ip_created_at ON signups(source_ip, created_at);
CREATE INDEX IF NOT EXISTS idx_signups_email_created_at ON signups(email, created_at);
