-- Vote de fin de stage : les deux cartes de la semaine type (niveau 2).
--
-- Le lot précédent ne couvrait que le niveau 1, or une semaine réellement composée dans
-- l'application tombait sur des cartes de niveau 2 : le vote s'ouvrait vide, et rien ne
-- permettait de l'essayer. Ces deux cartes débloquent le parcours de bout en bout.
--
-- Registre : niveau 2 (Approfondi), donc vocabulaire normal — « houle », « grain » sont
-- du vocabulaire de marin que ce public possède. Seule la langue soutenue descend d'un
-- cran (« scruter » → « regarder au loin »), parce que le niveau désigne un public averti
-- du sujet, pas un lecteur à l'aise avec les mots rares.
UPDATE pedagogical_content SET
    vote_vrai = 'Vent contre houle, la mer devient courte et hachée : c''est là qu''on est le plus secoué.',
    vote_faux = 'Pour savoir si la mer sera agitée, il suffit de regarder la force du vent.'
WHERE id = '105';

UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f105_meme_sens_ou_pas' THEN elem || jsonb_build_object('confirmation', 'on a comparé la direction du vent et celle des vagues'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '105';

UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f105_pourquoi_ca_secoue' THEN elem || jsonb_build_object('confirmation', 'on a cherché pourquoi la mer secouait autant'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '105';

UPDATE pedagogical_content SET
    vote_vrai = 'En mer, le mauvais temps arrive vite : on regarde la météo avant, et le ciel pendant.',
    vote_faux = 'Si la météo est bonne le matin, elle le reste pour la journée.'
WHERE id = '40';

UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f40_ligne_sombre' THEN elem || jsonb_build_object('confirmation', 'on a regardé au loin pour repérer un grain qui arrive'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '40';

UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f40_combien_de_temps' THEN elem || jsonb_build_object('confirmation', 'on a parié en combien de temps un grain pouvait arriver'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '40';

UPDATE pedagogical_content SET actions = (
  SELECT jsonb_agg(CASE WHEN elem->>'id' = 'f40_relais_ciel' THEN elem || jsonb_build_object('confirmation', 'l''un de nous surveillait l''horizon pendant que les autres naviguaient'::text) ELSE elem END ORDER BY ord)
  FROM jsonb_array_elements(actions) WITH ORDINALITY AS t(elem, ord)
) WHERE id = '40';

-- Contrôle : ces deux cartes doivent être complètes, sinon le vote se rouvrirait vide.
DO $$
DECLARE manquantes INT; sans_conf INT;
BEGIN
  SELECT count(*) INTO manquantes
    FROM pedagogical_content
   WHERE id IN ('105', '40') AND (vote_vrai IS NULL OR vote_faux IS NULL);

  SELECT count(*) INTO sans_conf
    FROM pedagogical_content pc, jsonb_array_elements(pc.actions) AS a
   WHERE pc.id IN ('105', '40') AND a->>'confirmation' IS NULL;

  IF manquantes > 0 OR sans_conf > 0 THEN
    RAISE EXCEPTION 'Vote incomplet : % carte(s) sans affirmation, % action(s) sans confirmation', manquantes, sans_conf;
  END IF;
END $$;
