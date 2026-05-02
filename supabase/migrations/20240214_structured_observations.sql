-- Structured observation data on stage exploits
ALTER TABLE stage_exploits ADD COLUMN IF NOT EXISTS structured_data JSONB;

-- Club-specific observation targets for the faune défi
CREATE TABLE IF NOT EXISTS club_observation_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    name TEXT NOT NULL,
    categorie TEXT NOT NULL DEFAULT 'autre',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE club_observation_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "targets_select" ON club_observation_targets FOR SELECT USING (true);
CREATE POLICY "targets_insert" ON club_observation_targets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "targets_update" ON club_observation_targets FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "targets_delete" ON club_observation_targets FOR DELETE USING (auth.uid() IS NOT NULL);
