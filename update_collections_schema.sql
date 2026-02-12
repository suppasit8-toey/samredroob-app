-- Add columns for detailed calculation constraints to product_collections table

ALTER TABLE product_collections 
ADD COLUMN IF NOT EXISTS min_width DECIMAL(10,2) DEFAULT 0.45,
ADD COLUMN IF NOT EXISTS max_width DECIMAL(10,2) DEFAULT 2.40,
ADD COLUMN IF NOT EXISTS max_height DECIMAL(10,2) DEFAULT 3.00,
ADD COLUMN IF NOT EXISTS min_area DECIMAL(10,2) DEFAULT 1.20,
ADD COLUMN IF NOT EXISTS area_factor DECIMAL(10,2) DEFAULT 1.20,
ADD COLUMN IF NOT EXISTS min_billable_width DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS min_billable_height DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS width_step DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS height_step DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS area_rounding DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS catalog_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT DEFAULT NULL;

COMMENT ON COLUMN product_collections.min_width IS 'Minimum physical width in meters';
COMMENT ON COLUMN product_collections.max_width IS 'Maximum physical width in meters';
COMMENT ON COLUMN product_collections.max_height IS 'Maximum physical height in meters';
COMMENT ON COLUMN product_collections.min_area IS 'Minimum billable area';
COMMENT ON COLUMN product_collections.area_factor IS 'Conversion factor';
COMMENT ON COLUMN product_collections.min_billable_width IS 'Minimum width used for billing calculation';
COMMENT ON COLUMN product_collections.min_billable_height IS 'Minimum height used for billing calculation';
