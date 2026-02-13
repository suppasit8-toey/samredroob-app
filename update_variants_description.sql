-- Add description column to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN product_variants.description IS 'Optional details or description for the variant';
