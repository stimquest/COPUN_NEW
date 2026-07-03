-- =============================================
-- INTÉGRITÉ DU SCORING (leaderboard_points)
-- =============================================
-- 1. Supprimer une semaine supprime ses points (CASCADE au lieu de SET NULL,
--    qui laissait des points orphelins gonfler les totaux pour toujours).
-- 2. Un moniteur peut supprimer ses propres lignes de points : nécessaire pour
--    reprendre les points d'un défi dévalidé ou d'un retour terrain supprimé.
-- 3. Nettoyage des points orphelins de semaines déjà supprimées.
-- 4. Backfill du club_id manquant depuis le profil du moniteur (les stages
--    n'ont pas de club_id, donc les lignes historiques n'en avaient pas).

-- 1. FK stage_id → CASCADE
ALTER TABLE leaderboard_points DROP CONSTRAINT IF EXISTS leaderboard_points_stage_id_fkey;
ALTER TABLE leaderboard_points
    ADD CONSTRAINT leaderboard_points_stage_id_fkey
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE;

-- 2. Policy DELETE (ses propres points uniquement)
DROP POLICY IF EXISTS "leaderboard_delete" ON leaderboard_points;
CREATE POLICY "leaderboard_delete" ON leaderboard_points
    FOR DELETE USING (auth.uid() = monitor_id);

-- 3. Points orphelins (leur semaine a déjà été supprimée avant le CASCADE)
DELETE FROM leaderboard_points WHERE stage_id IS NULL;

-- 4. Backfill club_id depuis le profil
UPDATE leaderboard_points lp
SET club_id = p.club_id
FROM profiles p
WHERE lp.monitor_id = p.id
  AND lp.club_id IS NULL
  AND p.club_id IS NOT NULL;
