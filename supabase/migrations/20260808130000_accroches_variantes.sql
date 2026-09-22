-- Variantes d'accroche : le support du geste d'appropriation.
--
-- L'app prépare, elle n'accompagne pas sur l'eau (les moniteurs n'ont pas leur
-- téléphone en séance). Son vrai travail est donc la MÉMORISATION : le moniteur doit
-- pouvoir fermer l'app et se souvenir de ce qu'il voulait dire deux heures plus tard.
--
-- Or relire n'ancre rien ; ce qui ancre, c'est l'effort actif. Écrire sa propre phrase
-- serait idéal mais les moniteurs ne taperont pas. Choisir entre plusieurs formulations
-- produit un effet proche pour un coût d'interaction quasi nul : comparer et trancher
-- est un acte actif, et la phrase retenue devient « la sienne ».
--
-- D'où ce tableau de 2-3 variantes de ton différent par fiche (question directe,
-- observation, idée fausse à retourner) : sans écart réel entre elles, le choix serait
-- factice et l'ancrage disparaîtrait.
ALTER TABLE pedagogical_content ADD COLUMN IF NOT EXISTS accroches_variantes TEXT[];

COMMENT ON COLUMN pedagogical_content.accroches_variantes IS
  'Formulations alternatives de l''accroche, proposées au choix pendant la préparation. Le choix est l''acte d''appropriation qui fait mémoriser.';

-- Sujet méduses : tons volontairement contrastés pour que le choix soit un vrai
-- arbitrage (interpeller / faire observer / retourner une idée fausse).
UPDATE pedagogical_content SET accroches_variantes = ARRAY[
  'Vous en avez vu combien aujourd''hui ? À votre avis, elles ont décidé de venir ici, ou quelqu''un les a poussées ?',
  'Regardez d''où vient le vent. Maintenant regardez où sont les méduses. Vous voyez quelque chose ?',
  'Une méduse, ça nage où ça veut. Qui est d''accord ?'
] WHERE id = '200';

UPDATE pedagogical_content SET accroches_variantes = ARRAY[
  'Regardez celle-là : vous voyez les quatre ronds sur son dos ? C''est comme sa carte d''identité.',
  'Il y a plusieurs sortes de méduses ici. Vous sauriez me dire laquelle pique et laquelle ne pique pas ?',
  'Toutes les méduses piquent très fort. Vrai ou faux ?'
] WHERE id = '201';

UPDATE pedagogical_content SET accroches_variantes = ARRAY[
  'Celle-là est sur le sable, elle ne bouge plus. Est-ce qu''on peut la toucher, à votre avis ?',
  'Il y a une méduse échouée là-bas. Qu''est-ce qu''on en fait ?',
  'Une méduse morte, ça ne pique plus. Qui pense que c''est vrai ?'
] WHERE id = '202';
