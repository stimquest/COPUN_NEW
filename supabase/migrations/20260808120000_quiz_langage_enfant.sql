-- Quiz : passage au langage enfant sur les sujets récurrents.
--
-- Retour terrain : le quiz de fin de semaine plaît, mais les questions sont
-- inutilisables telles quelles avec des enfants — vocabulaire de manuel ("régime
-- semi-diurne", "zone subtidale", "propagation de l'onde"), et distracteurs aussi
-- techniques que la bonne réponse, donc impossibles à éliminer au bon sens. Les
-- moniteurs n'ont pas le temps de reformuler en direct : la reformulation doit être
-- pré-écrite.
--
-- On ne touche que les sujets réellement rencontrés (marée, vent, laisse de mer,
-- littoral) plutôt que les 61 cartes d'un coup. L'ancienne formulation est conservée
-- dans data->'version_moniteur' : rien n'est perdu, et on peut comparer ou revenir
-- en arrière si le retour est mauvais.

-- Sauvegarde de la version d'origine (idempotent : ne réécrit pas si déjà sauvegardée)
UPDATE game_cards
SET data = data || jsonb_build_object(
      'version_moniteur',
      jsonb_build_object(
        'question', data->'question',
        'answers', data->'answers',
        'correctAnswerIndex', data->'correctAnswerIndex',
        'explanation', data->'explanation'
      )
    )
WHERE type = 'quizz'
  AND data ? 'question'
  AND NOT (data ? 'version_moniteur');

-- ── Marées ───────────────────────────────────────────────────────────────────
UPDATE game_cards SET data = data || '{
  "question": "La mer monte et descend tous les jours. Qu''est-ce qui la fait bouger comme ça ?",
  "answers": ["La Lune, qui tire sur l''eau", "Le vent qui souffle sur la mer", "Les bateaux qui passent", "L''eau qui chauffe au soleil"],
  "correctAnswerIndex": 0,
  "explanation": "C''est la Lune qui tire sur l''eau de la mer, comme un aimant. Le Soleil aide un peu aussi, mais il est beaucoup plus loin."
}'::jsonb
WHERE type = 'quizz' AND data->>'question' = 'Pourquoi y a-t-il des marées ?';

UPDATE game_cards SET data = data || '{
  "question": "En une journée, combien de fois la mer monte-t-elle complètement ?",
  "answers": ["1 fois", "2 fois", "5 fois", "Ça change tous les jours"],
  "correctAnswerIndex": 1,
  "explanation": "La mer monte 2 fois et descend 2 fois par jour. Entre deux marées hautes, il se passe un peu plus de 12 heures."
}'::jsonb
WHERE type = 'quizz' AND data->>'question' LIKE 'Combien de marées hautes%';

UPDATE game_cards SET data = data || '{
  "question": "Comment fait-on pour savoir à quelle heure la mer sera haute demain ?",
  "answers": ["On regarde la couleur de l''eau", "On regarde un calendrier des marées ou une appli", "On attend de voir", "On demande aux pêcheurs, personne d''autre ne sait"],
  "correctAnswerIndex": 1,
  "explanation": "Les marées sont tellement régulières qu''on peut les calculer des années à l''avance. Il suffit de lire le calendrier des marées."
}'::jsonb
WHERE type = 'quizz' AND data->>'question' LIKE 'Comment connaît-on à l''avance%';

UPDATE game_cards SET data = data || '{
  "question": "Cette partie de la plage est couverte par la mer à marée haute, et à l''air libre à marée basse. Comment on l''appelle ?",
  "answers": ["L''estran", "La dune", "Le port", "La falaise"],
  "correctAnswerIndex": 0,
  "explanation": "L''estran, c''est la bande de plage qui se découvre à marée basse. C''est là qu''on trouve les coquillages, les crabes et les petites mares."
}'::jsonb
WHERE type = 'quizz' AND data->>'question' LIKE '%zone du littoral qui se couvre et se découvre%';

UPDATE game_cards SET data = data || '{
  "question": "Pourquoi la mer n''est-elle pas haute à la même heure partout en France ?",
  "answers": ["Parce que la forme des côtes ralentit ou accélère l''eau", "Parce que l''eau est plus salée à certains endroits", "Parce qu''il fait plus chaud dans le Sud", "Parce que les horloges sont différentes"],
  "correctAnswerIndex": 0,
  "explanation": "L''eau doit contourner les caps, entrer dans les baies… Comme dans un couloir plein d''obstacles, elle n''arrive pas partout en même temps."
}'::jsonb
WHERE type = 'quizz' AND data->>'question' LIKE '%pas la même partout%';

-- ── Laisse de mer / littoral ─────────────────────────────────────────────────
UPDATE game_cards SET data = data || '{
  "question": "Après la marée haute, il reste une ligne d''algues et de coquillages sur le sable. C''est quoi ?",
  "answers": ["La laisse de mer", "Des déchets à ramasser", "De la mousse", "Une trace de bateau"],
  "correctAnswerIndex": 0,
  "explanation": "C''est la laisse de mer : tout ce que la mer a déposé en se retirant. Ce n''est pas sale — plein de petites bêtes et d''oiseaux y trouvent à manger."
}'::jsonb
WHERE type = 'quizz' AND data->>'question' ILIKE '%laisse de mer%';

-- ── Vent / météo ─────────────────────────────────────────────────────────────
UPDATE game_cards SET data = data || '{
  "question": "L''après-midi en été, le vent se lève souvent et vient de la mer. Pourquoi ?",
  "answers": ["Parce que la terre chauffe plus vite que la mer", "Parce que la mer est plus salée l''après-midi", "Parce que les vagues poussent l''air", "C''est le hasard"],
  "correctAnswerIndex": 0,
  "explanation": "Le soleil chauffe la terre plus vite que l''eau. L''air chaud monte au-dessus de la plage, et l''air frais de la mer vient prendre sa place : ça fait du vent."
}'::jsonb
WHERE type = 'quizz' AND (data->>'question' ILIKE '%brise thermique%' OR data->>'question' ILIKE '%vent%après-midi%');
