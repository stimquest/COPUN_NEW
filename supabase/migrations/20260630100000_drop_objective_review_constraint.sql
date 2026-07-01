-- La contrainte forçait impact_level NOT NULL quand execution_status est partial/done,
-- ce qui bloquait les mises à jour rapides depuis le dashboard (sans impact_level).
ALTER TABLE public.stage_objective_reviews
    DROP CONSTRAINT IF EXISTS stage_objective_reviews_consistency;
