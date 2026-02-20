-- Add categories array column
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Migrate existing category to categories array
UPDATE portfolio_items 
SET categories = ARRAY[category] 
WHERE category IS NOT NULL AND categories IS NULL;

-- Make category column nullable (or keep it for backward compat if needed, but eventually drop)
ALTER TABLE portfolio_items ALTER COLUMN category DROP NOT NULL;
