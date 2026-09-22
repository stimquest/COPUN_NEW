-- Le récit : ce que le moniteur construit à partir des fiches retenues.
--
-- Changement de nature. Jusqu'ici les fiches étaient traitées comme des tâches :
-- sélectionnées, validées, comptabilisées, avec un statut d'exécution et des points.
-- Ce vocabulaire dit « tu as un travail à faire » alors qu'une fiche est une source
-- d'information. Résultat observé : on coche pour avancer au lieu de lire pour
-- comprendre — l'auteur de l'app le faisait lui-même.
--
-- Le livrable n'est pas une liste cochée, c'est un moniteur qui sait quoi raconter.
-- Concrètement : à partir de plusieurs fiches, il construit UN récit — un ordre, des
-- enchaînements, une idée finale — sans avoir à l'écrire. L'app lui fait prendre les
-- décisions (par quoi je commence, qu'est-ce que je garde pour la fin) ; c'est cet
-- arbitrage qui structure sa pensée et lui permet de s'en souvenir sur l'eau, où il
-- n'aura pas son téléphone.

-- Pas de colonne d'ordre : un moniteur ne déroule pas un plan séquentiel, il retient
-- deux ou trois choses et les sort quand l'occasion se présente sur l'eau. Imposer une
-- séquence ne correspondait à aucun geste réel.

-- Idée à faire retenir, choisie parmi celles que porte la fiche : la phrase qui doit
-- rester aux enfants quand tout le reste est oublié.
ALTER TABLE public.stage_preparations ADD COLUMN IF NOT EXISTS chute TEXT;

COMMENT ON COLUMN public.stage_preparations.chute IS
  'Idée à faire retenir, retenue par le moniteur pour ce sujet.';

-- Colonnes de l'ancien modèle « préparation = tâche à valider ». Le rappel auto-évalué
-- ne vérifiait rien (on pouvait cliquer sans avoir rien restitué) et le compteur de
-- révisions n'a jamais été exploité.
ALTER TABLE public.stage_preparations DROP COLUMN IF EXISTS rappel_reussi;
ALTER TABLE public.stage_preparations DROP COLUMN IF EXISTS revisions;
ALTER TABLE public.stage_preparations DROP COLUMN IF EXISTS derniere_revision_at;
