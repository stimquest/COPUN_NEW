-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'instructor', -- 'instructor', 'admin', 'student'
  full_name TEXT,
  avatar_url TEXT,
  club_id UUID, -- Can be linked to a clubs table later if needed
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Turn on RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see all profiles (for leaderboard) but only edit their own
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create user_validations table
CREATE TABLE IF NOT EXISTS public.user_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id TEXT, -- References pedagogical_content(id) which uses TEXT ID currently based on SQL seed
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id, session_id) -- Prevent double validation for a session
);

-- RLS for validations
ALTER TABLE public.user_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own validations." 
ON public.user_validations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own validations." 
ON public.user_validations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own validations." 
ON public.user_validations FOR DELETE USING (auth.uid() = user_id);
