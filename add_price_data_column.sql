ALTER TABLE product_collections 
ADD COLUMN IF NOT EXISTS price_data JSONB DEFAULT '[]'::jsonb;
