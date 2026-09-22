-- Actions transversales retenues pour la semaine.
--
-- Distinctes des actions par sujet (`stage_preparations.actions`) : celles-ci sont
-- génériques, se tiennent sur toute la durée du stage et se choisissent une seule fois.
--
-- C'est ce niveau de choix qui rend le générique utilisable. Proposées fiche par fiche,
-- les mêmes actions réapparaissaient à chaque sujet d'un même groupe — plusieurs fois par
-- semaine, puis à l'identique la semaine suivante : le choix devenait mécanique. Une
-- action valable partout doit se décider là où elle s'applique, c'est-à-dire sur le stage.
--
-- Définies côté application dans `src/data/actions-semaine.ts`, rangées par pilier COP.
ALTER TABLE public.stages ADD COLUMN IF NOT EXISTS actions_semaine TEXT[];

COMMENT ON COLUMN public.stages.actions_semaine IS
  'Identifiants des actions transversales du stage, définies dans src/data/actions-semaine.ts.';
