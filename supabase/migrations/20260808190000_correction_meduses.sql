-- Correction factuelle des fiches méduses (200-202).
--
-- Contrairement aux lots 1 et 2 — qui reformulent le champ `explication` déjà validé
-- par l'expert — le contenu des fiches méduses avait été rédigé sans source. Deux
-- affirmations se sont révélées fausses à la vérification :
--
--   1. « quatre anneaux violets » : les quatre anneaux de l'aurélie sont ses gonades.
--      Elles sont violettes chez le mâle, blanchâtres ou rosées chez la femelle. La
--      couleur ne peut donc pas servir de critère d'identification.
--      Sources : Nausicaa, Station marine de Concarneau, Mer et Littoral.
--
--   2. « urticante plusieurs heures » : très en dessous de la réalité. Les nématocystes
--      d'une méduse échouée restent fonctionnels plusieurs SEMAINES, y compris sur un
--      fragment de tentacule invisible dans le sable. L'erreur allait dans le sens du
--      danger sous-estimé — la corriger relève de la sécurité, pas du détail.
--      Sources : Observatoire du Plancton, sauveteur-aquatique.fr.
--
-- Nuance apportée aussi sur la rhizostome : décrite comme « peu piquante », alors que
-- la littérature la donne modérément venimeuse (sensation de brûlure, dermatite).

-- Troisième variante d'accroche revue sur les trois fiches : les formulations
-- « Vrai ou faux ? » / « Qui est d'accord ? » appelaient une réponse trop évidente pour
-- mobiliser un groupe, et faisaient doublon avec le champ `erreur_frequente`. Remplacées
-- par un défi d'observation, qui met les enfants en action au lieu de les interroger.

-- ── #200 : pourquoi elles arrivent ───────────────────────────────────────────
UPDATE pedagogical_content SET
  accroches_variantes = ARRAY[
    'Vous en avez vu combien aujourd''hui ? À votre avis, elles ont décidé de venir ici, ou quelqu''un les a poussées ?',
    'Regardez d''où vient le vent. Maintenant regardez où sont les méduses. Vous voyez quelque chose ?',
    'Cherchez si elles sont réparties partout ou toutes du même côté. Qu''est-ce que ça raconte ?'
  ]
WHERE id = '200';

-- ── #201 : reconnaissance des espèces ────────────────────────────────────────
UPDATE pedagogical_content SET
  explication = 'Sur nos côtes, l''aurélie (translucide, quatre anneaux en forme de trèfle bien visibles au centre) est la plus fréquente : ses filaments urticants sont trop courts pour traverser la peau humaine, sauf sur les zones très fines comme les lèvres ou les paupières. La rhizostome, bien plus grosse et bleutée, peut provoquer une sensation de brûlure ou une irritation. La méduse boussole, reconnaissable à ses traits bruns disposés en rayons, pique nettement plus.',
  accroche = 'Regardez celle-là : vous voyez les quatre ronds sur son dos ? C''est comme sa carte d''identité.',
  accroches_variantes = ARRAY[
    'Regardez celle-là : vous voyez les quatre ronds sur son dos ? C''est comme sa carte d''identité.',
    'Il y a plusieurs sortes de méduses ici. Vous sauriez dire laquelle pique le plus ?',
    'Comptez combien de sortes de méduses différentes vous repérez aujourd''hui.'
  ],
  a_observer = 'La forme de l''ombrelle et les dessins dessus : quatre anneaux en trèfle au centre, ou des traits bruns en rayons.',
  a_retenir = 'On reconnaît une méduse à ses dessins, et toutes ne piquent pas pareil.',
  erreur_frequente = 'On croit que toutes les méduses piquent fort. La plus courante ici, l''aurélie, a des filaments trop courts pour traverser notre peau.'
WHERE id = '201';

-- ── #202 : méduse échouée ────────────────────────────────────────────────────
UPDATE pedagogical_content SET
  accroches_variantes = ARRAY[
    'Celle-là est sur le sable, elle ne bouge plus. Est-ce qu''on peut la toucher, à votre avis ?',
    'Il y a une méduse échouée là-bas. Qu''est-ce qu''on en fait ?',
    'Repérez-en une sans vous approcher, et décrivez-la-moi de loin.'
  ],
  explication = 'Une méduse échouée reste urticante très longtemps — plusieurs semaines — même morte et même réduite en morceaux : ses cellules urticantes se déclenchent au contact, tant qu''elles sont intactes. Un fragment de tentacule invisible dans le sable pique encore. Elle n''est pas pour autant un déchet : elle nourrit les oiseaux et d''autres animaux, et sa présence renseigne sur l''état de la mer.',
  a_retenir = 'Une méduse échouée pique encore, même morte depuis longtemps. On la regarde, on ne la touche pas.',
  erreur_frequente = 'Beaucoup pensent qu''une méduse morte ne pique plus. Elle reste urticante des semaines, et même un bout de tentacule perdu dans le sable peut piquer.'
WHERE id = '202';
