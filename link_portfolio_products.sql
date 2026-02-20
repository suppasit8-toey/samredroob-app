-- Add columns to link portfolio to products
ALTER TABLE portfolio_items 
ADD COLUMN IF NOT EXISTS product_collection_id BIGINT REFERENCES product_collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS product_variant_ids BIGINT[];

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_collection ON portfolio_items(product_collection_id);
