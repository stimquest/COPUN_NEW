-- Réécriture des 3 seules fiches du référentiel dont la "question" était un intitulé
-- de formation plutôt qu'une vraie question transmissible aux stagiaires (audit 2026-07-05).
-- Objectif : chaque fiche = une question qu'un stagiaire peut poser + une réponse que
-- le moniteur peut transmettre + un conseil actionnable.
-- À faire valider par le créateur de la méthode avant application.

UPDATE pedagogical_content SET
    question = 'Comment savoir si on dérange un animal ?',
    objectif = 'Retenir qu''il y a dérangement dès qu''il y a un changement de comportement.',
    tip = 'Jumelles et silence. Faites observer un oiseau au groupe : s''il relève la tête ou s''arrête de se nourrir, on a déjà fait un pas de trop — on recule.'
WHERE id = '62';

UPDATE pedagogical_content SET
    question = 'Pourquoi ne voit-on pas les mêmes animaux selon les saisons ?',
    tip = 'Demandez au groupe : qui habite la plage cette semaine ? Cherchez un indice du moment (nid, jeunes, groupe en halte) et expliquez pourquoi cette espèce a choisi ce site à cette saison.'
WHERE id = '65';

UPDATE pedagogical_content SET
    question = 'Pourquoi on ne part pas à la même heure chaque jour ?',
    objectif = 'Comprendre que les activités nautiques suivent les rythmes de la nature : la marée chaque jour, les coefficients sur deux semaines, les saisons sur l''année.',
    tip = 'Affichez l''horaire de marée du jour et celui de demain : faites constater le décalage aux stagiaires, puis demandez-leur de prédire l''heure de mise à l''eau d''après-demain.',
    explication = 'Parce que la marée se décale d''environ 50 minutes chaque jour : l''horaire de navigation d''aujourd''hui ne sera plus le bon demain. Ce décalage suit la Lune, comme le cycle des coefficients qui revient toutes les deux semaines — la nature impose son calendrier, et le programme de la semaine s''y ajuste.'
WHERE id = '68';
