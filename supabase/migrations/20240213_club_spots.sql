-- Add spot_fixe flag to defis
ALTER TABLE defis ADD COLUMN IF NOT EXISTS spot_fixe BOOLEAN NOT NULL DEFAULT false;

-- Club observation spots: stores the GPS reference for recurring defis
CREATE TABLE IF NOT EXISTS club_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    defi_id TEXT NOT NULL REFERENCES defis(id) ON DELETE CASCADE,
    gps_lat DOUBLE PRECISION NOT NULL,
    gps_lng DOUBLE PRECISION NOT NULL,
    bearing DOUBLE PRECISION, -- compass degrees 0-360, nullable if device doesn't support it
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(club_id, defi_id)
);

ALTER TABLE club_spots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "club_spots_select" ON club_spots FOR SELECT USING (true);
CREATE POLICY "club_spots_insert" ON club_spots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "club_spots_update" ON club_spots FOR UPDATE USING (auth.uid() IS NOT NULL);
