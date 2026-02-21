-- Add catalog_name column to product_variants
-- Links each variant to a specific catalog entry in its collection
ALTER TABLE product_variants ADD COLUMN catalog_name text;
