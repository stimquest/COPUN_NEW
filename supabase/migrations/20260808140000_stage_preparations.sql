-- Préparation mémorisée d'un sujet, par semaine.
--
-- Trace ce que le moniteur a préparé et surtout ce qu'il s'est approprié : l'accroche
-- qu'il a choisie (son geste actif) et le fait qu'il ait su restituer l'idée clé sans
-- l'avoir sous les yeux. C'est cette dernière information qui compte — préparer n'est
-- pas retenir, et l'app n'aura fait son travail que si le moniteur se souvient une fois
-- le téléphone rangé.
CREATE TABLE IF NOT EXISTS public.stage_preparations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    pedagogical_content_id TEXT NOT NULL REFERENCES public.pedagogical_content(id) ON DELETE CASCADE,
    -- Texte de l'accroche retenue, pas son index : les variantes peuvent être réécrites
    -- côté contenu, et le moniteur doit retrouver exactement la phrase qu'il a choisie.
    accroche_choisie TEXT,
    -- Auto-évaluation au test de rappel. NULL = pas encore testé.
    rappel_reussi BOOLEAN,
    -- Nombre de passages sur ce sujet : un rappel espacé ancre mieux qu'une seule lecture.
    revisions INTEGER NOT NULL DEFAULT 0,
    derniere_revision_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT stage_preparations_unique UNIQUE(stage_id, pedagogical_content_id)
);

CREATE INDEX IF NOT EXISTS idx_stage_preparations_stage ON public.stage_preparations(stage_id);

ALTER TABLE public.stage_preparations ENABLE ROW LEVEL SECURITY;

-- Accès réservé au propriétaire de la semaine. auth.uid() est encapsulé dans un
-- (select ...) pour être évalué une fois par requête et non par ligne (advisor
-- Supabase "auth_rls_initplan").
DROP POLICY IF EXISTS "stage_preparations_all" ON public.stage_preparations;
CREATE POLICY "stage_preparations_all" ON public.stage_preparations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.stages
            WHERE stages.id = stage_preparations.stage_id
              AND stages.owner_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stages
            WHERE stages.id = stage_preparations.stage_id
              AND stages.owner_id = (select auth.uid())
        )
    );
