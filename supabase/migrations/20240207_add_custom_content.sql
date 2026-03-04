-- Add owner_id and visibility fields to pedagogical_content
ALTER TABLE pedagogical_content 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS club_id UUID;

-- Policy to allow users to see their own content + public content
-- Note: Assuming RLS is enabled or will be handled. For now, just adding columns.
