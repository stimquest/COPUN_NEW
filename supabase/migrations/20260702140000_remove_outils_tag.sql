-- Retire le mot-clé « outils » des fiches pédagogiques : trop vague pour être utile
-- dans les filtres et le suivi des notions sur /stats.
UPDATE pedagogical_content
SET tags_filtre = array_remove(tags_filtre, 'outils')
WHERE 'outils' = ANY(tags_filtre);
