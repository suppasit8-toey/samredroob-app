-- Add reference_code column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotation_requests' AND column_name = 'reference_code') THEN
        ALTER TABLE quotation_requests ADD COLUMN reference_code TEXT UNIQUE;
    END IF;
END $$;

-- Create index for faster lookup by reference_code
CREATE INDEX IF NOT EXISTS idx_quotation_requests_reference_code ON quotation_requests(reference_code);
