-- Couche "comment en parler aux enfants".
--
-- Le catalogue répond aujourd'hui à « c'est quoi ? » : question / objectif / tip /
-- explication s'adressent tous au moniteur, en vocabulaire adulte. Le besoin remonté
-- par les moniteurs en test est l'étape d'après — « qu'est-ce que je dis aux gamins,
-- là, en 10 min sur le ponton ? ». Personne ne leur donne ça, et c'est ce qui bloque
-- le passage de la consultation (mémo) à la transmission.
--
-- Quatre champs courts plutôt qu'un texte libre : un moniteur pressé doit repérer
-- « qu'est-ce que je dis » d'un coup d'œil, ce qu'un bloc de prose ne permet pas.
-- Tous nullables et rédigés au fil de l'eau (même approche que `explication`) :
-- l'UI n'affiche le bloc que s'il est rempli, donc aucune régression sur les ~128
-- fiches non traitées.
ALTER TABLE pedagogical_content ADD COLUMN IF NOT EXISTS accroche TEXT;
ALTER TABLE pedagogical_content ADD COLUMN IF NOT EXISTS a_observer TEXT;
ALTER TABLE pedagogical_content ADD COLUMN IF NOT EXISTS a_retenir TEXT;
ALTER TABLE pedagogical_content ADD COLUMN IF NOT EXISTS erreur_frequente TEXT;

COMMENT ON COLUMN pedagogical_content.accroche IS 'Phrase/question qui capte les enfants — se lit tel quel, en mots d''enfant.';
COMMENT ON COLUMN pedagogical_content.a_observer IS 'Ce qu''on leur fait concrètement regarder ou toucher sur place.';
COMMENT ON COLUMN pedagogical_content.a_retenir IS 'L''idée à garder, en une phrase courte et simple.';
COMMENT ON COLUMN pedagogical_content.erreur_frequente IS 'La croyance fausse habituelle, et ce qu''on répond.';

-- ── Sujet méduses ────────────────────────────────────────────────────────────
-- Absent du catalogue alors que c'est le sujet qui a spontanément intéressé les
-- moniteurs cette saison (arrivée des méduses, rencontres en pratique). Trois fiches
-- couvrant les trois dimensions, rédigées d'emblée avec leur couche transmission.
INSERT INTO pedagogical_content
  (id, niveau, dimension, question, objectif, tip, explication,
   accroche, a_observer, a_retenir, erreur_frequente, tags_theme, tags_filtre)
VALUES
(
  '200', 1, 'COMPRENDRE',
  'Pourquoi y a-t-il des méduses certains jours et pas d''autres ?',
  'Comprendre que les méduses ne nagent pas où elles veulent : ce sont le vent et les courants qui les amènent près du bord.',
  'Le jour où il y en a beaucoup, demandez d''où vient le vent : c''est presque toujours lui qui les a poussées vers la plage.',
  'Les méduses se déplacent très peu par elles-mêmes : elles dérivent. Un vent qui souffle vers la côte pendant un ou deux jours suffit à ramener vers le bord des bancs entiers qui vivaient au large. C''est pour cela qu''elles arrivent souvent toutes en même temps, puis disparaissent quand le vent tourne.',
  'Vous avez vu combien de méduses aujourd''hui ? À votre avis, elles ont décidé de venir ici, ou quelqu''un les a poussées ?',
  'Regardez le sens du vent sur l''eau, et cherchez si les méduses sont toutes du même côté — souvent elles s''accumulent là où le vent pousse.',
  'La méduse ne choisit pas où elle va : c''est le vent et les courants qui la déplacent.',
  'Beaucoup pensent que les méduses viennent « attaquer » la plage. Elles ne viennent pas vers nous : elles se laissent porter, et parfois ça les amène ici.',
  ARRAY['caracteristiques_littoral', 'interactions_elements_climatiques'],
  ARRAY['méduse', 'vent', 'biodiversité']
),
(
  '201', 1, 'OBSERVER',
  'Comment reconnaître les méduses qu''on croise ici ?',
  'Savoir distinguer les principales méduses locales et repérer lesquelles sont urticantes.',
  'Faites-les observer sans toucher, à l''épuisette ou depuis le bord : la couleur et les dessins sur l''ombrelle suffisent à les différencier.',
  'Sur nos côtes, l''aurélie (translucide, quatre anneaux violets bien visibles) est la plus fréquente et n''est pratiquement pas urticante. La rhizostome, plus grosse et bleutée, est impressionnante mais peu piquante. La méduse boussole, avec ses traits bruns en rayons, pique nettement plus.',
  'Regardez celle-là : vous voyez les quatre ronds sur son dos ? C''est comme sa carte d''identité. Chaque méduse a son dessin.',
  'La forme de l''ombrelle, la couleur, et surtout les dessins dessus : quatre anneaux violets, des rayons bruns, ou rien du tout.',
  'On reconnaît une méduse à ses dessins, et tous les dessins ne piquent pas pareil.',
  'On croit souvent que toutes les méduses piquent fort. La plus courante ici, l''aurélie aux quatre anneaux, ne pique quasiment pas.',
  ARRAY['observation_sensorielle', 'caracteristiques_littoral'],
  ARRAY['méduse', 'biodiversité', 'observation']
),
(
  '202', 1, 'PROTÉGER',
  'Que faire quand on trouve une méduse échouée sur la plage ?',
  'Adopter le bon geste face à une méduse échouée : ne pas toucher, ne pas détruire, comprendre son rôle.',
  'C''est le moment idéal pour rappeler qu''un animal échoué reste un animal vivant ou utile — on observe, on ne piétine pas.',
  'Une méduse échouée reste urticante plusieurs heures, même morte et même en morceaux : ses cellules piquantes fonctionnent encore. Elle n''est pas un déchet — elle nourrit les oiseaux et d''autres animaux, et sa présence renseigne sur l''état de la mer.',
  'Celle-là est sur le sable, elle ne bouge plus. Est-ce qu''on peut la toucher, à votre avis ?',
  'Approchez-vous sans toucher : regardez si elle est entière, si des oiseaux sont venus, si d''autres sont échouées au même endroit.',
  'Une méduse échouée pique encore. On la regarde, on ne la touche pas, on ne l''écrase pas.',
  'Beaucoup pensent qu''une méduse échouée ou morte ne pique plus. C''est faux : elle pique encore, et même un morceau de tentacule dans le sable peut piquer.',
  ARRAY['caracteristiques_littoral', 'observation_sensorielle'],
  ARRAY['méduse', 'biodiversité', 'gestes']
)
ON CONFLICT (id) DO UPDATE SET
  accroche = EXCLUDED.accroche,
  a_observer = EXCLUDED.a_observer,
  a_retenir = EXCLUDED.a_retenir,
  erreur_frequente = EXCLUDED.erreur_frequente,
  explication = EXCLUDED.explication;
