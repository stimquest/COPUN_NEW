-- Add owner_id to stages if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.stages'::regclass AND attname = 'owner_id') THEN
        ALTER TABLE public.stages ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS on stages
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own stages
CREATE POLICY "Users can see their own stages" 
ON public.stages FOR SELECT USING (auth.uid() = owner_id);

-- Policy: Users can insert their own stages
CREATE POLICY "Users can insert their own stages" 
ON public.stages FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own stages
CREATE POLICY "Users can update their own stages" 
ON public.stages FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Users can delete their own stages
CREATE POLICY "Users can delete their own stages" 
ON public.stages FOR DELETE USING (auth.uid() = owner_id);
