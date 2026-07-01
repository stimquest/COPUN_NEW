-- Observations spontanées du moniteur pendant une semaine
-- Exemple : "J'ai vu des cormorans → j'en ai profité pour expliquer la faune littorale"
CREATE TABLE IF NOT EXISTS public.week_observations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id     UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    pillar       TEXT CHECK (pillar IN ('COMPRENDRE', 'OBSERVER', 'PROTÉGER')),
    text         TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX week_observations_stage_id_idx ON public.week_observations(stage_id);

ALTER TABLE public.week_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own observations"
    ON public.week_observations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stages s
            WHERE s.id = week_observations.stage_id
              AND s.owner_id = auth.uid()
        )
    );
