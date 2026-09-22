-- D'où vient un résultat de vote : la caméra, ou le moniteur lui-même.
--
-- C'est ce qui sépare une preuve d'une déclaration. Quand la caméra lit les cartons, la
-- réponse vient des enfants et le moniteur ne peut pas la fabriquer ; quand il saisit à la
-- main, il affirme simplement ce qui s'est passé. Les deux sont utiles — la saisie manuelle
-- reste nécessaire quand la caméra échoue, et le moniteur garde son suivi — mais seule la
-- première peut compter pour le club, qui s'en sert pour justifier son activité.
--
-- La distinction vit donc en base, pas dans l'interface : un décompte saisi à la main et un
-- décompte mesuré sont deux natures de données, et rien ne permettrait de les démêler après
-- coup sans cette colonne (un groupe de huit enfants peut très bien produire « 1 / 0 / 0 »).
ALTER TABLE public.stage_vote_results
    ADD COLUMN IF NOT EXISTS origine TEXT NOT NULL DEFAULT 'manuel'
    CHECK (origine IN ('camera', 'manuel'));

COMMENT ON COLUMN public.stage_vote_results.origine IS
  'camera = cartons lus par la caméra, seule origine opposable au club ; manuel = déclaré par le moniteur, conservé pour son suivi mais non validant.';

-- Les lignes existantes sont antérieures à la caméra : elles ont toutes été saisies.
-- Le DEFAULT les couvre, ce commentaire dit pourquoi on ne les a pas reclassées.

-- Le décompte des actions validées ne porte que sur la caméra : l'index reflète la requête
-- réelle plutôt que de laisser filtrer après coup.
DROP INDEX IF EXISTS stage_vote_results_action_idx;
CREATE INDEX IF NOT EXISTS stage_vote_results_action_idx
    ON public.stage_vote_results (action_id)
    WHERE action_id IS NOT NULL AND origine = 'camera';
