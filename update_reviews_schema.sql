-- Add images column to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migrate existing image_url to images array
UPDATE reviews 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_url != '' AND (images IS NULL OR images = '{}');

-- Optional: Drop image_url column later, but for now keep it for backward compatibility or as a fallback
-- ALTER TABLE reviews DROP COLUMN image_url;
