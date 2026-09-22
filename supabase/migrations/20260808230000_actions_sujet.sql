-- Actions retenues par le moniteur pour un sujet.
--
-- Trois à cinq actions sont proposées par groupe de phénomène (marées, vent, oiseaux…),
-- définies côté application dans `src/data/actions-sujets.ts`. Elles s'appuient sur ce
-- que le phénomène a de particulier — une idée fausse tenace, un repère observable sur
-- place — et non sur des techniques d'animation générales, qui n'apprendraient rien à un
-- moniteur diplômé.
--
-- Stockées en tableau : le moniteur en retient zéro, une ou plusieurs, sans ordre imposé.
ALTER TABLE public.stage_preparations ADD COLUMN IF NOT EXISTS actions TEXT[];

COMMENT ON COLUMN public.stage_preparations.actions IS
  'Identifiants des actions retenues, définies dans src/data/actions-sujets.ts.';
