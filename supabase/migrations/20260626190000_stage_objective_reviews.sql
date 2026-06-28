CREATE TABLE IF NOT EXISTS public.stage_objective_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    pedagogical_content_id TEXT NOT NULL REFERENCES public.pedagogical_content(id) ON DELETE CASCADE,
    execution_status TEXT NOT NULL CHECK (execution_status IN ('not_done', 'partial', 'done')),
    impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT stage_objective_reviews_unique UNIQUE(stage_id, pedagogical_content_id),
    CONSTRAINT stage_objective_reviews_consistency CHECK (
        (execution_status = 'not_done' AND impact_level IS NULL)
        OR (execution_status IN ('partial', 'done') AND impact_level IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_stage_objective_reviews_stage ON public.stage_objective_reviews(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_objective_reviews_content ON public.stage_objective_reviews(pedagogical_content_id);

ALTER TABLE public.stage_objective_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stage_objective_reviews_select" ON public.stage_objective_reviews;
DROP POLICY IF EXISTS "stage_objective_reviews_insert" ON public.stage_objective_reviews;
DROP POLICY IF EXISTS "stage_objective_reviews_update" ON public.stage_objective_reviews;
DROP POLICY IF EXISTS "stage_objective_reviews_delete" ON public.stage_objective_reviews;

CREATE POLICY "stage_objective_reviews_select" ON public.stage_objective_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.stages
            WHERE stages.id = stage_objective_reviews.stage_id
              AND stages.owner_id = auth.uid()
        )
    );

CREATE POLICY "stage_objective_reviews_insert" ON public.stage_objective_reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.stages
            WHERE stages.id = stage_objective_reviews.stage_id
              AND stages.owner_id = auth.uid()
        )
    );

CREATE POLICY "stage_objective_reviews_update" ON public.stage_objective_reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.stages
            WHERE stages.id = stage_objective_reviews.stage_id
              AND stages.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.stages
            WHERE stages.id = stage_objective_reviews.stage_id
              AND stages.owner_id = auth.uid()
        )
    );

CREATE POLICY "stage_objective_reviews_delete" ON public.stage_objective_reviews
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM public.stages
            WHERE stages.id = stage_objective_reviews.stage_id
              AND stages.owner_id = auth.uid()
        )
    );

CREATE OR REPLACE FUNCTION public.set_stage_objective_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stage_objective_reviews_updated_at ON public.stage_objective_reviews;
CREATE TRIGGER stage_objective_reviews_updated_at
    BEFORE UPDATE ON public.stage_objective_reviews
    FOR EACH ROW EXECUTE FUNCTION public.set_stage_objective_reviews_updated_at();