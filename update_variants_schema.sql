-- Add status column to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN product_variants.in_stock IS 'Availability status of the product variant';
