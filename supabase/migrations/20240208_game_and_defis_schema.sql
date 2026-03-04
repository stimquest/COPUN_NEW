-- Create Enum Types for Games and Defis
CREATE TYPE game_type AS ENUM ('quizz', 'triage', 'mots', 'dilemme');
CREATE TYPE defi_preuve_type AS ENUM ('photo', 'checkbox', 'action', 'quiz');

-- Create Game Cards Table (Polymorphic storage for different game types)
CREATE TABLE IF NOT EXISTS game_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type game_type NOT NULL,
    theme TEXT,
    related_objective_id TEXT REFERENCES pedagogical_content(id), -- Optional link to specific content
    data JSONB NOT NULL, -- Stores specific game data (question, options, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Defis Table
CREATE TABLE IF NOT EXISTS defis (
    id TEXT PRIMARY KEY, -- Using text ID (e.g., 'defi_littoral_1')
    description TEXT NOT NULL,
    instruction TEXT NOT NULL,
    type_preuve defi_preuve_type NOT NULL,
    icon TEXT NOT NULL,
    tags_theme TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Progress: Games
CREATE TABLE IF NOT EXISTS user_game_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    game_card_id UUID REFERENCES game_cards(id) ON DELETE CASCADE NOT NULL,
    result JSONB, -- Store score, success status, or specific answers
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Progress: Defis
CREATE TABLE IF NOT EXISTS user_defi_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    defi_id TEXT REFERENCES defis(id) ON DELETE CASCADE NOT NULL,
    proof_url TEXT, -- URL for photo proof if applicable
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, defi_id) -- Prevent duplicate validations for now
);

-- RLS Policies (Row Level Security)
ALTER TABLE game_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE defis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_defi_validations ENABLE ROW LEVEL SECURITY;

-- Public Read Access for Games and Defis
CREATE POLICY "Enable read access for all users" ON game_cards FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON defis FOR SELECT USING (true);

-- User Specific Access for Progress
CREATE POLICY "Users can insert their own game progress" ON user_game_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own game progress" ON user_game_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own defi validations" ON user_defi_validations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own defi validations" ON user_defi_validations FOR SELECT USING (auth.uid() = user_id);
