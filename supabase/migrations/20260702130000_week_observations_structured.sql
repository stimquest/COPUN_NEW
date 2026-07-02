-- Catégorisation naturaliste des retours terrain, pour produire une donnée exploitable
-- (espèce, effectif, lieu, date/heure) plutôt que du texte libre non structuré.
-- Le reporting est très majoritairement fait après-coup (pas de GPS temps réel fiable) :
-- date/heure et lieu restent des champs texte saisis manuellement par le moniteur.
ALTER TABLE public.week_observations
  ADD COLUMN IF NOT EXISTS observation_type text
    CHECK (observation_type IN ('faune', 'flore', 'meteo_mer', 'pollution', 'activite_humaine', 'autre')),
  ADD COLUMN IF NOT EXISTS target_id uuid REFERENCES public.club_observation_targets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS species_label text,
  ADD COLUMN IF NOT EXISTS species_uncertain boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS individual_count integer,
  ADD COLUMN IF NOT EXISTS location_note text,
  ADD COLUMN IF NOT EXISTS observed_at timestamptz;
