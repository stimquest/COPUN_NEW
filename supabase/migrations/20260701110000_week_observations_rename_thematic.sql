-- Renomme linked_content_id en linked_thematic (tag texte, pas FK)
ALTER TABLE public.week_observations
  DROP COLUMN IF EXISTS linked_content_id,
  ADD COLUMN IF NOT EXISTS linked_thematic text
    CHECK (linked_thematic IN (
      'caracteristiques_littoral','reperes_spatio_temporels','interactions_climatiques',
      'biodiversite_saisonnalite','activites_humaines','lecture_paysage',
      'cohabitation_vivant','impact_presence_humaine','sciences_participatives'
    ));
