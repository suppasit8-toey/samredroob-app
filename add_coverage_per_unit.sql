-- Add coverage_per_unit column for box/roll calculation
-- This stores how many sq.m. each roll/box covers
ALTER TABLE product_collections ADD COLUMN IF NOT EXISTS coverage_per_unit NUMERIC;

-- Add roll dimensions for wallpaper
-- roll_width_cm: width of the roll in cm (e.g., 50 or 100)
-- roll_length_cm: length of the roll in cm (e.g., 1000 or 1500)
ALTER TABLE product_collections ADD COLUMN IF NOT EXISTS roll_width_cm NUMERIC;
ALTER TABLE product_collections ADD COLUMN IF NOT EXISTS roll_length_cm NUMERIC;
