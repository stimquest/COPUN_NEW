-- Raisons cochées parmi une liste prédéfinie, en plus de la note libre — permet
-- d'agréger des données mesurables (ex: "manque de temps" revient sur 60% des
-- objectifs peu retenus) plutôt que de ne dépendre que de texte libre non exploitable.
ALTER TABLE public.stage_objective_reviews
    ADD COLUMN IF NOT EXISTS reasons TEXT[] NOT NULL DEFAULT '{}';
