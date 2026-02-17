-- Fix missing columns in product_collections table
-- This script ensures all necessary columns for new pricing features are present

-- 1. Add Platform Pricing
ALTER TABLE product_collections 
ADD COLUMN IF NOT EXISTS price_per_unit_platform DECIMAL(10,2) DEFAULT NULL;

-- 2. Add Calculation Method Constraints
ALTER TABLE product_collections 
ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'area',
ADD COLUMN IF NOT EXISTS min_width DECIMAL(10,2) DEFAULT 0.45,
ADD COLUMN IF NOT EXISTS max_width DECIMAL(10,2) DEFAULT 2.40,
ADD COLUMN IF NOT EXISTS max_height DECIMAL(10,2) DEFAULT 3.00,
ADD COLUMN IF NOT EXISTS min_area DECIMAL(10,2) DEFAULT 1.20,
ADD COLUMN IF NOT EXISTS area_factor DECIMAL(10,2) DEFAULT 1.20,
ADD COLUMN IF NOT EXISTS min_billable_width DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS min_billable_height DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS width_step DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS height_step DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS area_rounding DECIMAL(10,2) DEFAULT NULL;

-- 3. Add Advanced Price Data (for step pricing)
ALTER TABLE product_collections 
ADD COLUMN IF NOT EXISTS price_data JSONB DEFAULT '[]'::jsonb;

-- 4. Add URL Fields
ALTER TABLE product_collections 
ADD COLUMN IF NOT EXISTS catalog_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT DEFAULT NULL;

-- 5. Add Comments for clarity
COMMENT ON COLUMN product_collections.price_data IS 'JSONB array for storing step pricing rules';
COMMENT ON COLUMN product_collections.min_width IS 'Minimum physical width in meters';
COMMENT ON COLUMN product_collections.max_width IS 'Maximum physical width in meters';
