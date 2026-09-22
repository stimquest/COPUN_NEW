-- Une mise en pratique relie une action de parcours, les cartes choisies et une semaine.
CREATE TABLE public.formation_practice_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sequence_id TEXT NOT NULL,
    stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    action_id TEXT NOT NULL,
    card_ids UUID[] NOT NULL CHECK (cardinality(card_ids) BETWEEN 1 AND 3),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL,
    CONSTRAINT formation_practice_missions_one_per_sequence UNIQUE (user_id, sequence_id)
);

CREATE INDEX formation_practice_missions_user_sequence_idx
    ON public.formation_practice_missions(user_id, sequence_id);
CREATE INDEX formation_practice_missions_stage_idx
    ON public.formation_practice_missions(stage_id);

ALTER TABLE public.formation_practice_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formation_practice_missions_select_own" ON public.formation_practice_missions
    FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "formation_practice_missions_insert_own" ON public.formation_practice_missions
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "formation_practice_missions_update_own" ON public.formation_practice_missions
    FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE ON public.formation_practice_missions TO authenticated;

ALTER TABLE public.formation_sequence_progress
    ADD COLUMN IF NOT EXISTS mise_en_pratique_le TIMESTAMPTZ NULL;
