-- Field constraint for défis:
-- TRUE  → must be done on-site in real time (smartphone needed on the water:
--         live GPS, immediate geolocated photo). The instructor chooses these
--         knowing the constraint.
-- FALSE → can be noted on paper during the session and recorded calmly afterwards
--         (deferred data entry / a-posteriori photo).
ALTER TABLE defis ADD COLUMN IF NOT EXISTS terrain_temps_reel BOOLEAN NOT NULL DEFAULT false;

-- All spot_fixe défis require live GPS on-site → real-time field constraint.
UPDATE defis SET terrain_temps_reel = true WHERE spot_fixe = true;
