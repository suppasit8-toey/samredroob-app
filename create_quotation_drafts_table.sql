-- Create quotation_drafts table
CREATE TABLE IF NOT EXISTS public.quotation_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    items JSONB NOT NULL,
    customer_name TEXT,
    reference_code TEXT UNIQUE,
    status TEXT DEFAULT 'draft'
);

-- Add RLS policies if needed (for now open for read by anon to load shared links)
ALTER TABLE public.quotation_drafts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read drafts (needed for shared links)
CREATE POLICY "Allow public read access" ON public.quotation_drafts
    FOR SELECT USING (true);

-- Allow authenticated users (admins) to insert/update
CREATE POLICY "Allow authenticated insert" ON public.quotation_drafts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.quotation_drafts
    FOR UPDATE USING (auth.role() = 'authenticated');
