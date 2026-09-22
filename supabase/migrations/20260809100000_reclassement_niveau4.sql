-- Reclassement des fiches niveau 4.
--
-- Le niveau 4 n'était branché dans aucun écran de l'app (filtre Explorer, formulaire
-- admin, type TypeScript) jusqu'à src/data/niveaux.ts : ces 15 fiches (dernier lot ajouté
-- au catalogue, IDs 113-128) étaient de fait invisibles au filtre par niveau et
-- impossibles à réassigner depuis l'admin.
--
-- Reclassement selon le critère retenu pour le niveau (cible de public, pas difficulté
-- rédactionnelle — vérifié : la longueur moyenne du texte ne varie que de 15 % entre
-- niveaux) :
--   niveau 2 — utile à tout groupe sans prérequis, souvent lié à la sécurité nautique
--              de base (houle/vague de vent, signes de changement météo, nuages,
--              courants de surface).
--   niveau 3 — suppose une sensibilisation déjà installée : recul temporel (comparaison
--              sur 50 ans), réflexion méta sur sensibilisation/action plutôt que sur un
--              phénomène concret, ou notion scientifique plus fine (bioaccumulation).
--
-- Aucune fiche ne reste en niveau 4 : le palier redevient vide plutôt que de contenir un
-- mélange non homogène.
UPDATE pedagogical_content SET niveau = 2 WHERE id IN ('113', '114', '115', '118', '119', '121', '122', '123', '124');
UPDATE pedagogical_content SET niveau = 3 WHERE id IN ('116', '117', '125', '126', '127', '128');

-- Appliqué directement en base (PATCH par identifiant) le 2026-08-09 : cette migration
-- documente le changement pour la reconstruction d'un environnement neuf, elle n'a pas
-- été rejouée via le SQL Editor.
