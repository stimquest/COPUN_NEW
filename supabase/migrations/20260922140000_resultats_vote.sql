-- Ce que le groupe a répondu au vote de fin de stage.
--
-- Une ligne par affirmation posée, pas un score agrégé : une action n'est validée que par
-- SA propre confirmation, et le club doit pouvoir justifier chaque action déclarée. Un
-- total ne le permettrait pas.
--
-- `action_id` distingue les deux natures d'affirmation :
--   renseigné  -> confirmation d'action ; c'est la ligne qui vaut preuve.
--   NULL       -> affirmation de savoir ; sert au moniteur, jamais au décompte.
--
-- On enregistre le dépouillement (combien de VRAI, combien de FAUX, combien d'enfants
-- présents), pas une réponse binaire : un groupe partagé est une information — 7 « oui »
-- sur 8 valide l'action, 3 sur 8 la laisse en doute. Le seuil est une décision applicative,
-- donc il n'est pas figé ici.
CREATE TABLE IF NOT EXISTS public.stage_vote_results (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id      UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    affirmation_id TEXT NOT NULL,
    content_id    TEXT NOT NULL,
    -- NULL pour une affirmation de savoir ; l'identifiant de l'action sinon.
    action_id     TEXT,
    -- Ce que la carte attendait, pour les affirmations de savoir (NULL pour une action).
    attendu       BOOLEAN,
    votes_vrai    INT NOT NULL DEFAULT 0 CHECK (votes_vrai >= 0),
    votes_faux    INT NOT NULL DEFAULT 0 CHECK (votes_faux >= 0),
    -- Sans cette troisième voie, l'enfant qui ne se souvient pas lève VRAI par mimétisme et
    -- valide une action jamais menée : l'hésitation doit rester visible, pas se fondre dans
    -- un camp. Elle ne compte ni pour ni contre.
    votes_incertain INT NOT NULL DEFAULT 0 CHECK (votes_incertain >= 0),
    -- Combien d'enfants participaient : sans ça, « 6 oui » ne se lit pas.
    participants  INT CHECK (participants IS NULL OR participants >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Rejouer le vote corrige la saisie au lieu d'empiler des lignes contradictoires.
    UNIQUE (stage_id, affirmation_id)
);

COMMENT ON TABLE public.stage_vote_results IS
  'Dépouillement du vote de fin de stage, une ligne par affirmation posée au groupe.';
COMMENT ON COLUMN public.stage_vote_results.action_id IS
  'Identifiant de l''action confirmée (pedagogical_content.actions[].id), ou NULL pour une affirmation de savoir.';

CREATE INDEX IF NOT EXISTS stage_vote_results_stage_idx ON public.stage_vote_results (stage_id);
-- Le décompte des actions menées par période interroge cet axe ; les lignes de savoir
-- n'y figurent pas, d'où l'index partiel.
CREATE INDEX IF NOT EXISTS stage_vote_results_action_idx ON public.stage_vote_results (action_id) WHERE action_id IS NOT NULL;

ALTER TABLE public.stage_vote_results ENABLE ROW LEVEL SECURITY;

-- Le vote appartient à la semaine, donc à son propriétaire : la politique passe par
-- `stages.owner_id` plutôt que de dupliquer un `monitor_id` qui pourrait diverger.
DROP POLICY IF EXISTS "vote_results_select_own" ON public.stage_vote_results;
CREATE POLICY "vote_results_select_own" ON public.stage_vote_results
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.stages s WHERE s.id = stage_id AND s.owner_id = auth.uid()));

DROP POLICY IF EXISTS "vote_results_insert_own" ON public.stage_vote_results;
CREATE POLICY "vote_results_insert_own" ON public.stage_vote_results
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.stages s WHERE s.id = stage_id AND s.owner_id = auth.uid()));

DROP POLICY IF EXISTS "vote_results_update_own" ON public.stage_vote_results;
CREATE POLICY "vote_results_update_own" ON public.stage_vote_results
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.stages s WHERE s.id = stage_id AND s.owner_id = auth.uid()));

DROP POLICY IF EXISTS "vote_results_delete_own" ON public.stage_vote_results;
CREATE POLICY "vote_results_delete_own" ON public.stage_vote_results
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.stages s WHERE s.id = stage_id AND s.owner_id = auth.uid()));
