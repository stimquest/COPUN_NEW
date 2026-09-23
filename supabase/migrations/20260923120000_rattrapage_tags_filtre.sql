-- Rattrapage des tags_filtre manquants sur 47 cartes (#75, #82-128).
--
-- Ces cartes portaient déjà tags_theme (les 9 grandes catégories COP), mais
-- tags_filtre — les mots-clés fins utilisés par la recherche en texte libre de
-- l'écran « Choisir les sujets » — était resté à '{}' (tableau vide, pas NULL) : un
-- lot ajouté après le balisage initial des 84 premières cartes, sans repasser par
-- cette étape. Conséquence concrète : taper « méduse », « vent » ou tout mot-clé sur
-- l'une de ces 47 cartes ne la faisait jamais remonter, sans qu'aucun signal ne le
-- montre — l'écran affichait simplement zéro résultat.
--
-- Vocabulaire choisi en réutilisant au maximum les 34 tags déjà en usage sur les 84
-- autres cartes (marée, vent, houle, biodiversité, zone sensible…), pour que la
-- recherche reste cohérente d'une carte à l'autre. Quatre termes nouveaux, absents
-- du vocabulaire existant alors que plusieurs cartes en dépendent : « oiseaux »,
-- « mammifères marins », « cycle de l'eau », « cohabitation ».
--
-- tags_theme n'est pas touché : il était déjà correct sur ces 47 cartes.

UPDATE pedagogical_content SET tags_filtre = '{"action citoyenne","cohabitation"}'::text[] WHERE id = '75';
UPDATE pedagogical_content SET tags_filtre = '{"nuage","météo"}'::text[] WHERE id = '82';
UPDATE pedagogical_content SET tags_filtre = '{"nuage","météo"}'::text[] WHERE id = '83';
UPDATE pedagogical_content SET tags_filtre = '{"nuage","météo","cycle de l''eau"}'::text[] WHERE id = '84';
UPDATE pedagogical_content SET tags_filtre = '{"vent"}'::text[] WHERE id = '85';
UPDATE pedagogical_content SET tags_filtre = '{"migration","oiseaux"}'::text[] WHERE id = '86';
UPDATE pedagogical_content SET tags_filtre = '{"migration","oiseaux","zone sensible"}'::text[] WHERE id = '87';
UPDATE pedagogical_content SET tags_filtre = '{"mammifères marins","biodiversité"}'::text[] WHERE id = '88';
UPDATE pedagogical_content SET tags_filtre = '{"courant"}'::text[] WHERE id = '89';
UPDATE pedagogical_content SET tags_filtre = '{"houle"}'::text[] WHERE id = '90';
UPDATE pedagogical_content SET tags_filtre = '{"marée","coefficient"}'::text[] WHERE id = '91';
UPDATE pedagogical_content SET tags_filtre = '{"observation"}'::text[] WHERE id = '92';
UPDATE pedagogical_content SET tags_filtre = '{"observation","repères visuels"}'::text[] WHERE id = '93';
UPDATE pedagogical_content SET tags_filtre = '{"observation","faune","flore"}'::text[] WHERE id = '94';
UPDATE pedagogical_content SET tags_filtre = '{"observation","faune"}'::text[] WHERE id = '95';
UPDATE pedagogical_content SET tags_filtre = '{"météo","vague","vent"}'::text[] WHERE id = '96';
UPDATE pedagogical_content SET tags_filtre = '{"météo","vague","repères visuels"}'::text[] WHERE id = '97';
UPDATE pedagogical_content SET tags_filtre = '{"écosystème","pollution"}'::text[] WHERE id = '98';
UPDATE pedagogical_content SET tags_filtre = '{"nuage","météo"}'::text[] WHERE id = '99';
UPDATE pedagogical_content SET tags_filtre = '{"nuage","météo"}'::text[] WHERE id = '100';
UPDATE pedagogical_content SET tags_filtre = '{"nuage","météo","repères visuels"}'::text[] WHERE id = '101';
UPDATE pedagogical_content SET tags_filtre = '{"vent","thermique"}'::text[] WHERE id = '102';
UPDATE pedagogical_content SET tags_filtre = '{"migration","oiseaux","zone sensible"}'::text[] WHERE id = '103';
UPDATE pedagogical_content SET tags_filtre = '{"houle","vent"}'::text[] WHERE id = '104';
UPDATE pedagogical_content SET tags_filtre = '{"vent","houle","sécurité"}'::text[] WHERE id = '105';
UPDATE pedagogical_content SET tags_filtre = '{"marée","courant","sécurité"}'::text[] WHERE id = '106';
UPDATE pedagogical_content SET tags_filtre = '{"vague","sécurité"}'::text[] WHERE id = '107';
UPDATE pedagogical_content SET tags_filtre = '{"houle"}'::text[] WHERE id = '108';
UPDATE pedagogical_content SET tags_filtre = '{"écosystème"}'::text[] WHERE id = '109';
UPDATE pedagogical_content SET tags_filtre = '{"pollution","gestes"}'::text[] WHERE id = '110';
UPDATE pedagogical_content SET tags_filtre = '{"biodiversité","zone sensible"}'::text[] WHERE id = '111';
UPDATE pedagogical_content SET tags_filtre = '{"zone sensible","biodiversité"}'::text[] WHERE id = '112';
UPDATE pedagogical_content SET tags_filtre = '{"vague","estran"}'::text[] WHERE id = '113';
UPDATE pedagogical_content SET tags_filtre = '{"nuage"}'::text[] WHERE id = '114';
UPDATE pedagogical_content SET tags_filtre = '{"nuage","météo"}'::text[] WHERE id = '115';
UPDATE pedagogical_content SET tags_filtre = '{"migration","oiseaux"}'::text[] WHERE id = '116';
UPDATE pedagogical_content SET tags_filtre = '{"migration","oiseaux"}'::text[] WHERE id = '117';
UPDATE pedagogical_content SET tags_filtre = '{"courant","écosystème"}'::text[] WHERE id = '118';
UPDATE pedagogical_content SET tags_filtre = '{"courant","vent"}'::text[] WHERE id = '119';
UPDATE pedagogical_content SET tags_filtre = '{"vent","repères visuels","sécurité"}'::text[] WHERE id = '121';
UPDATE pedagogical_content SET tags_filtre = '{"houle","vague"}'::text[] WHERE id = '122';
UPDATE pedagogical_content SET tags_filtre = '{"houle"}'::text[] WHERE id = '123';
UPDATE pedagogical_content SET tags_filtre = '{"houle","sécurité"}'::text[] WHERE id = '124';
UPDATE pedagogical_content SET tags_filtre = '{"éco-geste","action citoyenne"}'::text[] WHERE id = '125';
UPDATE pedagogical_content SET tags_filtre = '{"éco-geste","action citoyenne"}'::text[] WHERE id = '126';
UPDATE pedagogical_content SET tags_filtre = '{"action citoyenne"}'::text[] WHERE id = '127';
UPDATE pedagogical_content SET tags_filtre = '{"mammifères marins","biodiversité"}'::text[] WHERE id = '128';

-- Contrôle : plus aucune carte du catalogue système ne doit avoir tags_filtre vide.
DO $$
DECLARE restantes INT;
BEGIN
  SELECT count(*) INTO restantes
    FROM pedagogical_content
   WHERE source <> 'custom' AND (tags_filtre IS NULL OR tags_filtre = '{}');

  IF restantes > 0 THEN
    RAISE EXCEPTION 'Rattrapage incomplet : % carte(s) du catalogue système restent sans tags_filtre', restantes;
  END IF;
END $$;
