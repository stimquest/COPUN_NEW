-- Ajout des champs "retour terrain" sur week_observations
ALTER TABLE public.week_observations
  ADD COLUMN IF NOT EXISTS pedagogical_action text
    CHECK (pedagogical_action IN ('expliquer', 'montrer', 'questionner', 'laisser_decouvrir')),
  ADD COLUMN IF NOT EXISTS linked_content_id text
    REFERENCES public.pedagogical_content(id) ON DELETE SET NULL;
