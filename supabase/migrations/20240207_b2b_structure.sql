-- Create Clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure profiles has club_id and it's a foreign key
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'club_id') THEN
        ALTER TABLE public.profiles ADD COLUMN club_id UUID REFERENCES public.clubs(id);
    END IF;
END $$;

-- Enable RLS on clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Everyone can see clubs (for selection/info)
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs FOR SELECT USING (true);

-- Only admins (managed via a role in auth.users or profiles) can edit clubs
-- For now, let's keep it simple: view only for users.

-- Seed a demo club
INSERT INTO public.clubs (id, name, slug) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Club Nautique du Havre', 'cnh')
ON CONFLICT (id) DO NOTHING;

-- Link our demo monitor to this club
UPDATE public.profiles 
SET club_id = '11111111-1111-1111-1111-111111111111'
WHERE email = 'moniteur@copun.fr';
