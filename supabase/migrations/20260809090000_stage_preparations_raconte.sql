-- Sujet raconté au groupe — la rature du carnet, pas un statut de tâche.
--
-- Remplace toute idée de case à cocher sur le programme de la semaine : le moniteur raye
-- un sujet qu'il a traité, comme sur une liste papier. C'est un état du document affiché
-- sur l'accueil (voir ProgrammeCondense), pas un statut d'exécution avec impact et
-- raisons — ce suivi détaillé reste au bilan de clôture (stages.ressenti).
ALTER TABLE public.stage_preparations ADD COLUMN IF NOT EXISTS raconte BOOLEAN;

COMMENT ON COLUMN public.stage_preparations.raconte IS
  'Sujet raconté au groupe pendant la séance — true/false/null, mis à jour depuis ProgrammeCondense.';
