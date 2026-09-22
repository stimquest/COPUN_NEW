-- 9 fiches portent 'PROTéGER' (é minuscule) au lieu de 'PROTÉGER'.
--
-- Elles échappaient donc à tout filtrage par dimension : invisibles dans le mode guidé
-- comme dans les regroupements par pilier, alors qu'elles existent bien en base. Bug
-- silencieux — aucune erreur, juste du contenu qui ne remonte jamais.
UPDATE pedagogical_content
SET dimension = 'PROTÉGER'
WHERE dimension <> 'PROTÉGER'
  AND upper(dimension) LIKE 'PROT%';

-- Filet de sécurité : la contrainte CHECK d'origine n'imposait pas la casse exacte.
-- Sans cela, un import CSV ou une saisie manuelle réintroduirait le problème.
ALTER TABLE pedagogical_content DROP CONSTRAINT IF EXISTS pedagogical_content_dimension_check;
ALTER TABLE pedagogical_content ADD CONSTRAINT pedagogical_content_dimension_check
    CHECK (dimension IN ('COMPRENDRE', 'OBSERVER', 'PROTÉGER'));
