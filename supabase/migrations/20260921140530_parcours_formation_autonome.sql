-- Parcours de formation autonomes : la lecture, les acquis et le retour de terrain
-- sont volontairement distincts. Une validation théorique ne prétend pas mesurer
-- l'aisance réelle devant un groupe.

CREATE TABLE IF NOT EXISTS public.formation_sequence_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sequence_id TEXT NOT NULL,
    parcouru_le TIMESTAMPTZ NULL,
    acquis_verifie_le TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT formation_sequence_progress_unique UNIQUE (user_id, sequence_id)
);

CREATE INDEX IF NOT EXISTS idx_formation_sequence_progress_user
    ON public.formation_sequence_progress(user_id);

ALTER TABLE public.formation_sequence_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formation_sequence_progress_select_own" ON public.formation_sequence_progress
    FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "formation_sequence_progress_insert_own" ON public.formation_sequence_progress
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "formation_sequence_progress_update_own" ON public.formation_sequence_progress
    FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS public.formation_practice_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sequence_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    note TEXT NOT NULL CHECK (char_length(btrim(note)) BETWEEN 3 AND 1200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_formation_practice_notes_user_created
    ON public.formation_practice_notes(user_id, created_at DESC);

ALTER TABLE public.formation_practice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formation_practice_notes_select_own" ON public.formation_practice_notes
    FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "formation_practice_notes_insert_own" ON public.formation_practice_notes
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE ON public.formation_sequence_progress TO authenticated;
GRANT SELECT, INSERT ON public.formation_practice_notes TO authenticated;

CREATE OR REPLACE FUNCTION public.set_formation_sequence_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS formation_sequence_progress_updated_at ON public.formation_sequence_progress;
CREATE TRIGGER formation_sequence_progress_updated_at
    BEFORE UPDATE ON public.formation_sequence_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_formation_sequence_progress_updated_at();
