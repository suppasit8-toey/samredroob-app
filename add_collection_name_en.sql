ALTER TABLE product_collections 
ADD COLUMN name_en TEXT;

COMMENT ON COLUMN product_collections.name_en IS 'English name of the collection';
