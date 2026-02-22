-- Migration: Rename XP to Carrots + Add Shop Tables
-- 1:1 conversion of existing XP values to Carrots

-- Rename XP columns
ALTER TABLE children RENAME COLUMN xp TO carrots;
ALTER TABLE practice_results RENAME COLUMN xp_earned TO carrots_earned;

-- Add equipped items to children
ALTER TABLE children ADD COLUMN equipped_items JSONB NOT NULL DEFAULT '{}';

-- Shop purchases table
CREATE TABLE IF NOT EXISTS shop_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_purchases_child ON shop_purchases(child_id);

ALTER TABLE shop_purchases ENABLE ROW LEVEL SECURITY;

-- RLS: Parents can manage their children's purchases
CREATE POLICY "Parents can view children purchases"
  ON shop_purchases FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can insert children purchases"
  ON shop_purchases FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can delete children purchases"
  ON shop_purchases FOR DELETE
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
