-- =============================================
-- STORAGE BUCKET FOR DEFIS
-- =============================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('defis', 'defis', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'defis');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'defis' 
        AND auth.role() = 'authenticated'
    );
