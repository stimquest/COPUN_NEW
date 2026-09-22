-- Correction factuelle — groupe « Les marées ».
--
-- Contexte : le contenu d'origine (question / objectif / tip / explication) a été
-- produit par IA puis relu rapidement. Les lots de transmission le reformulaient en
-- langage enfant — ce qui PROPAGE une erreur au lieu de la filtrer, et l'aggrave, car
-- simplifier transforme une approximation en affirmation nette.
--
-- Vérification menée sur sources externes. Trois imprécisions corrigées, une nuance
-- ajoutée. Le reste (règle des douzièmes 1-2-3-3-2-1, maximum de courant en mi-marée,
-- décalage de ~50 min/jour, échelle de coefficient 20-120 calculée par le SHOM à Brest)
-- est confirmé et reste inchangé.

-- ── #1 : mécanisme des marées ────────────────────────────────────────────────
-- Erreur : « la Lune tire l'eau, deux fois par jour elle monte » escamote le second
-- bourrelet et rend le « deux fois » incompréhensible — si la Lune attirait simplement
-- l'eau vers elle, il n'y aurait qu'une marée haute par jour.
-- Réalité : l'attraction différentielle crée DEUX renflements, l'un face à la Lune,
-- l'autre à l'opposé (effet de la rotation du système Terre-Lune). La Terre tournant
-- sur elle-même, chaque point traverse les deux.
-- Sources : Puy de Sciences (UCA), Couleur-Science, Alloprof.
UPDATE pedagogical_content SET
  -- Le tip d'origine (« la Terre tourne plus vite que la Lune ») explique le décalage
  -- quotidien de 50 min, pas la présence de deux marées : il ne répondait pas à la
  -- question posée. Corrigé pour porter le mécanisme des deux renflements.
  tip = 'Deux renflements d''eau, un de chaque côté de la Terre : en tournant, on traverse les deux. D''où deux marées hautes par jour.',
  explication = 'La Lune n''attire pas la Terre de façon uniforme : elle tire plus fort sur la face qui lui fait face, et moins fort sur la face opposée. Il se forme ainsi deux renflements d''eau, l''un côté Lune, l''autre à l''opposé. Comme la Terre tourne sur elle-même, chaque point de la côte traverse ces deux renflements au cours d''une journée : d''où deux marées hautes et deux marées basses. Le Soleil joue le même rôle, mais environ deux fois plus faiblement car il est bien plus loin.',
  a_observer = 'Le niveau de l''eau contre un rocher ou un poteau, au début et à la fin de la séance.',
  a_retenir = 'La Lune déforme l''océan en deux bosses, une de chaque côté de la Terre. En tournant, on passe dans les deux : ça fait deux marées hautes par jour.',
  erreur_frequente = 'On croit que c''est le vent qui fait monter la mer. Le vent fait les vagues ; la marée, c''est la Lune — et le Soleil, un peu.'
WHERE id = '1';

-- ── #5 : l'étale ─────────────────────────────────────────────────────────────
-- Imprécision : « quelques minutes » sous-estime. Les sources donnent de 20 min à 1 h
-- selon le lieu et le coefficient. Nuance ajoutée : l'étale est un moment de courant
-- nul, à ne pas confondre avec l'absence de changement de niveau.
-- Sources : Wikipédia (Étale), Pêches et Océans Canada, CK/Mer.
UPDATE pedagogical_content SET
  -- « quasi nul » corrigé : à l'étale le courant s'annule réellement (c'est sa
  -- définition, aussi appelée renverse). Durée précisée dans le tip.
  objectif = 'Comprendre qu''entre deux marées le courant s''annule avant de repartir en sens inverse.',
  tip = 'Une étale dure de vingt minutes à une heure selon le lieu et le coefficient — c''est court, il faut en profiter.',
  explication = 'Entre la marée montante et la marée descendante, le courant s''annule : c''est l''étale, aussi appelée renverse. Sa durée varie selon le lieu et le coefficient — d''une vingtaine de minutes à une heure environ. Il y a une étale de pleine mer et une étale de basse mer. C''est le moment le plus calme pour naviguer ou observer l''estran, mais il ne dure pas.',
  a_retenir = 'L''étale, c''est la pause entre deux marées : le courant s''arrête, puis repart dans l''autre sens. Ça peut durer de vingt minutes à une heure.',
  erreur_frequente = 'On pense que la mer change de sens d''un coup. Il y a un vrai moment de calme — mais plus court qu''on ne croit.'
WHERE id = '5';

-- ── #7 : le coefficient ──────────────────────────────────────────────────────
-- Précision ajoutée : le coefficient est un rapport à une marée moyenne de référence,
-- calculé pour Brest et appliqué à toute la Manche et l'Atlantique. Il ne donne donc
-- PAS la hauteur d'eau locale — confusion fréquente et source d'erreur pratique.
-- Sources : SHOM via point-maree.fr, Multicoques Pratique, LaToileScoute.
UPDATE pedagogical_content SET
  -- La question portait sur « l'amplitude », l'objectif sur « le coefficient » : deux
  -- notions différentes (le marnage est une hauteur en mètres, le coefficient un
  -- rapport sans unité). Alignés, et la distinction est désormais explicite.
  question = 'Pourquoi il est important de connaître le coefficient de marée ?',
  objectif = 'Distinguer coefficient et hauteur d''eau, et comprendre ce qu''un fort coefficient implique pour la sécurité.',
  tip = 'Fort coefficient : l''estran découvre plus loin, la mer remonte plus haut, et surtout le courant est plus puissant.',
  explication = 'Le coefficient de marée (de 20 à 120) compare l''amplitude du jour à une marée moyenne de référence. Il est calculé pour Brest et vaut pour toute la Manche et l''Atlantique : il indique si la marée est forte ou faible, mais pas la hauteur d''eau à un endroit précis — celle-ci se lit dans l''annuaire du port. En dessous de 60 on parle de mortes-eaux, au-delà de 90 de vives-eaux. Plus il est élevé, plus l''écart entre haute et basse mer est grand, et plus les courants sont puissants.',
  a_retenir = 'Plus le coefficient est grand, plus la mer monte haut ET descend bas — et surtout, plus le courant est fort.',
  erreur_frequente = 'On croit que le coefficient donne la hauteur d''eau. Il donne seulement l''ampleur de la marée : la hauteur réelle dépend du lieu.'
WHERE id = '7';

-- ── #91 : décalage quotidien ─────────────────────────────────────────────────
-- Le tip d'origine contenait un bloc de texte brut mal formaté (explication complète
-- collée dans le champ conseil). Contenu factuellement correct mais inutilisable tel
-- quel par un moniteur : remis à sa place.
-- Source : Observatoire de Paris (media4.obspm.fr), Loisirs Nautic.
UPDATE pedagogical_content SET
  tip = 'Montrez le tableau des marées de la semaine : l''heure glisse d''environ 50 minutes chaque jour, très régulièrement.',
  a_retenir = 'La Lune met 24h50 à repasser au-dessus de nous, parce qu''elle avance sur son orbite pendant que la Terre tourne. La marée la suit : environ 50 minutes de retard par jour.'
WHERE id = '91';
