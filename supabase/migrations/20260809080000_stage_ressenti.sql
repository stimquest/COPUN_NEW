-- Bilan de semaine : un ressenti global, pas un statut par fiche.
--
-- Remplace l'usage courant de `stage_objective_reviews`, qui faisait remplir exécution +
-- impact + raisons pour chaque fiche sélectionnée (jusqu'à 15 fois le même formulaire par
-- semaine). Les fiches construisent un discours ; leur réussite se juge à l'échelle de la
-- semaine. `stage_objective_reviews` n'est pas supprimée : elle garde l'historique des
-- semaines déjà closes avec l'ancien système.
--
-- Format : { niveau: 'largement'|'en_partie'|'pas_vraiment', raisons: string[], note: string }
ALTER TABLE public.stages ADD COLUMN IF NOT EXISTS ressenti JSONB;

COMMENT ON COLUMN public.stages.ressenti IS
  'Bilan global de la semaine, défini dans src/lib/stage-ressenti.ts : { niveau, raisons, note }.';
