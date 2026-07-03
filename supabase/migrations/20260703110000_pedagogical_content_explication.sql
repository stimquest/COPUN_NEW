-- Ajoute un champ "explication" court aux cartes objectifs : 2-3 phrases qui répondent
-- vraiment à la question (façon livre "les pourquoi"), distinct de :
-- - objectif : ce que le mono doit viser pédagogiquement (déjà existant)
-- - tip : un conseil d'animation/terrain (déjà existant)
-- Contenu rédigé au fil de l'eau, donc nullable — pas encore rempli pour toutes les fiches.
ALTER TABLE pedagogical_content ADD COLUMN IF NOT EXISTS explication TEXT;
