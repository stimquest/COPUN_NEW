-- =====================================================
-- Complete Games & Défis Schema (Correction)
-- Based on docs/quizz_defis.md specification
-- =====================================================

-- =====================================================
-- 1. GAMES TABLE (Session grouping)
-- Groups multiple game_cards into a playable session
-- =====================================================
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    theme TEXT,
    stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
    game_data JSONB NOT NULL, -- Contains: { triageCôtier: {...}, motsEnRafale: {...}, etc. }
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 2. QUIZ ATTEMPTS (User history per theme)
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    theme TEXT,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 3. STAGE GAME HISTORY (Results per stage)
-- =====================================================
CREATE TABLE IF NOT EXISTS stage_game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES stages(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    results JSONB, -- Detailed answers per card
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 4. STAGE EXPLOITS (Assigned défis to stages)
-- =====================================================
CREATE TABLE IF NOT EXISTS stage_exploits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES stages(id) ON DELETE CASCADE NOT NULL,
    exploit_id TEXT REFERENCES defis(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'complete')),
    completed_at TIMESTAMPTZ,
    preuves_url TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(stage_id, exploit_id)
);

-- =====================================================
-- 5. ADD stage_type TO DEFIS
-- =====================================================
ALTER TABLE defis ADD COLUMN IF NOT EXISTS stage_type TEXT[] DEFAULT '{}';

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

-- Games: Public read, authenticated create
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create games" ON games FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete their games" ON games FOR DELETE USING (auth.role() = 'authenticated');

-- Quiz Attempts: User-specific
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);

-- Stage Game History: Authenticated access (for instructors and students)
ALTER TABLE stage_game_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view stage history" ON stage_game_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert stage history" ON stage_game_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Stage Exploits: Authenticated access
ALTER TABLE stage_exploits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view stage exploits" ON stage_exploits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage stage exploits" ON stage_exploits FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update stage exploits" ON stage_exploits FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete stage exploits" ON stage_exploits FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_games_stage_id ON games(stage_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_game_history_stage_id ON stage_game_history(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_exploits_stage_id ON stage_exploits(stage_id);
