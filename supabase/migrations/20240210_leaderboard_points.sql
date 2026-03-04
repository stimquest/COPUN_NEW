-- =============================================
-- LEADERBOARD POINTS TABLE
-- Tracks points earned by monitors for défis
-- =============================================

-- Points earned for each défi completion
CREATE TABLE IF NOT EXISTS leaderboard_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
    defi_id TEXT REFERENCES defis(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_points_monitor ON leaderboard_points(monitor_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points_club ON leaderboard_points(club_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points_created ON leaderboard_points(created_at);

-- RLS Policies
ALTER TABLE leaderboard_points ENABLE ROW LEVEL SECURITY;

-- Anyone can read leaderboard (public info)
CREATE POLICY "leaderboard_select" ON leaderboard_points
    FOR SELECT USING (true);

-- Only authenticated users can insert their own points
CREATE POLICY "leaderboard_insert" ON leaderboard_points
    FOR INSERT WITH CHECK (auth.uid() = monitor_id);

-- =============================================
-- POINTS VALUES PER DEFI TYPE
-- =============================================
-- Photo proof défis: 2 points (more effort)
-- Checkbox défis: 1 point
-- Quiz défis: 1 point
-- Action défis: 1 point
