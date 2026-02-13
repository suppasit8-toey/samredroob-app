-- Add 'tags' column to 'product_collections' table
ALTER TABLE product_collections 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN product_collections.tags IS 'Array of tags for filtering';

-- Add 'tags' column to 'products' table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN products.tags IS 'Array of tags for filtering';
