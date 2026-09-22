-- Repair only the known UTF8-to-Windows-1252 mojibake sequences introduced by
-- the two preceding content migrations. The file is deliberately ASCII-only.

CREATE OR REPLACE FUNCTION pg_temp.repair_mojibake(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE result text := input;
BEGIN
  IF result IS NULL THEN RETURN NULL; END IF;
  result := replace(result, chr(195) || chr(169), convert_from(decode('c3a9', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(168), convert_from(decode('c3a8', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(170), convert_from(decode('c3aa', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(171), convert_from(decode('c3ab', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(160), convert_from(decode('c3a0', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(162), convert_from(decode('c3a2', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(174), convert_from(decode('c3ae', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(175), convert_from(decode('c3af', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(180), convert_from(decode('c3b4', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(182), convert_from(decode('c3b6', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(185), convert_from(decode('c3b9', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(187), convert_from(decode('c3bb', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(188), convert_from(decode('c3bc', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(167), convert_from(decode('c3a7', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(8240), convert_from(decode('c389', 'hex'), 'UTF8'));
  result := replace(result, chr(195) || chr(8364), convert_from(decode('c380', 'hex'), 'UTF8'));
  result := replace(result, chr(197) || chr(8220), convert_from(decode('c593', 'hex'), 'UTF8'));
  result := replace(result, chr(197) || chr(8217), convert_from(decode('c592', 'hex'), 'UTF8'));
  result := replace(result, chr(194) || chr(171), convert_from(decode('c2ab', 'hex'), 'UTF8'));
  result := replace(result, chr(194) || chr(187), convert_from(decode('c2bb', 'hex'), 'UTF8'));
  result := replace(result, chr(226) || chr(8364) || chr(8217), convert_from(decode('e28099', 'hex'), 'UTF8'));
  result := replace(result, chr(226) || chr(8364) || chr(8221), convert_from(decode('e28094', 'hex'), 'UTF8'));
  result := replace(result, chr(226) || chr(8364) || chr(8230), convert_from(decode('e280a6', 'hex'), 'UTF8'));
  result := replace(result, chr(226) || chr(8364) || chr(8220), convert_from(decode('e2809c', 'hex'), 'UTF8'));
  result := replace(result, chr(226) || chr(8364) || chr(8218), convert_from(decode('e28091', 'hex'), 'UTF8'));
  RETURN result;
END;
$$;

WITH revised_cards AS (
  SELECT unnest(ARRAY[
    '1','2','5','6','7','8','9','10','12','14','15','24','25','68','91','106',
    '75','76','77','79','80','81','88','92','94','95','98','103','109','112',
    '116','125','126','127','128','custom_6b2d0675_1782543234539'
  ]) AS id
)
UPDATE pedagogical_content AS content
SET
  question = pg_temp.repair_mojibake(content.question),
  objectif = pg_temp.repair_mojibake(content.objectif),
  tip = pg_temp.repair_mojibake(content.tip),
  explication = pg_temp.repair_mojibake(content.explication),
  accroche = pg_temp.repair_mojibake(content.accroche),
  erreur_frequente = pg_temp.repair_mojibake(content.erreur_frequente),
  a_observer = pg_temp.repair_mojibake(content.a_observer),
  a_retenir = pg_temp.repair_mojibake(content.a_retenir),
  actions = CASE WHEN content.actions IS NULL THEN NULL ELSE pg_temp.repair_mojibake(content.actions::text)::jsonb END,
  -- FluxDecouverte uses variants before the base hook. Keep one coherent hook here.
  accroches_variantes = ARRAY[pg_temp.repair_mojibake(content.accroche)]
FROM revised_cards
WHERE content.id = revised_cards.id;

DROP FUNCTION pg_temp.repair_mojibake(text);
