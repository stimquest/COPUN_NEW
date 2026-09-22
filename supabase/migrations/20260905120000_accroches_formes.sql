-- Aligne les propositions « J'ouvre avec » sur les quatre formes enseignées
-- dans la formation : pari, piège, constat intrigant et choix forcé.
--
-- Le format repose uniquement sur des fonctions PostgreSQL. Les apostrophes françaises
-- sont échappées avec deux apostrophes, sans littéral JSON intermédiaire.

ALTER TABLE public.pedagogical_content
    ADD COLUMN IF NOT EXISTS accroches_formes JSONB;

COMMENT ON COLUMN public.pedagogical_content.accroches_formes IS
    'Propositions d''accroche reliées à une forme pédagogique : pari, piège, constat ou choix forcé.';

WITH propositions(id, ordre, forme, texte) AS (
    VALUES
    -- Météo et nuages
    ('38', 1, 'pari', 'Je parie qu''il fait plus frais ici, au bord de l''eau, qu''au parking. Vous me croyez ?'),
    ('38', 2, 'piege', 'Il y a le même soleil ici qu''au village, donc il fait la même température. Qui est d''accord ?'),
    ('38', 3, 'constat', 'Au village il fait chaud, et ici on grelotte. Pourtant on n''a presque pas bougé. Pourquoi ?'),
    ('38', 4, 'choix_force', 'Pour avoir moins chaud en été : on reste près de la mer ou on va dans les terres ? Il faut choisir.'),

    ('39', 1, 'pari', 'Je parie qu''une partie de l''eau de ce nuage était dans la mer il n''y a pas si longtemps. Vous me croyez ?'),
    ('39', 2, 'piege', 'Un nuage, c''est de la vapeur comme la fumée d''une casserole. Qui est d''accord ?'),
    ('39', 3, 'constat', 'La mer est tout en bas et le nuage tout là-haut. Pourtant c''est la même eau. Comment est-elle montée ?'),
    ('39', 4, 'choix_force', 'L''eau du nuage : elle monte en gouttes ou elle descend en gouttes ? Il faut choisir.'),

    ('41', 1, 'pari', 'Je parie que le ciel n''aura pas le même aspect à la fin de la séance. Vous me croyez ?'),
    ('41', 2, 'piege', 'Pour savoir le temps qu''il va faire, un seul coup d''œil au ciel suffit. Qui est d''accord ?'),
    ('41', 3, 'constat', 'Le ciel est clair maintenant, pourtant il peut annoncer un changement. Qu''est-ce qu''on doit regarder ?'),
    ('41', 4, 'choix_force', 'Ce ciel est dégagé, voilé ou couvert ? Vous devez vous mettre d''accord sur un mot.'),

    ('42', 1, 'pari', 'Je parie que ce gros nuage qui monte en tour ne laissera pas le temps tranquille. Vous me croyez ?'),
    ('42', 2, 'piege', 'Tous les nuages annoncent la pluie. Qui est d''accord ?'),
    ('42', 3, 'constat', 'Regardez : un nuage reste fin et étiré, l''autre gonfle en tour. Pourtant ce sont tous les deux des nuages. Qu''est-ce qui change ?'),
    ('42', 4, 'choix_force', 'Nuage fin en altitude ou gros nuage qui gonfle : lequel vous inquiète le plus ?'),

    ('82', 1, 'pari', 'Je parie que ce nuage n''aura pas la même forme dans cinq minutes. Vous me croyez ?'),
    ('82', 2, 'piege', 'Un nuage, c''est un gros morceau de coton solide dans le ciel. Qui est d''accord ?'),
    ('82', 3, 'constat', 'Regardez ce nuage : il change de forme sous nos yeux, pourtant personne ne le touche. Comment c''est possible ?'),
    ('82', 4, 'choix_force', 'Ce nuage, il va s''étaler ou monter en tour ? Il faut choisir.'),

    ('83', 1, 'pari', 'Je parie que ce nuage presque noir n''est pas fait d''une eau différente du nuage blanc. Vous me croyez ?'),
    ('83', 2, 'piege', 'Un nuage gris est gris parce qu''il est sale. Qui est d''accord ?'),
    ('83', 3, 'constat', 'Ces deux nuages sont faits d''eau, pourtant l''un est blanc et l''autre presque noir. Comment l''expliquer ?'),
    ('83', 4, 'choix_force', 'Lequel laisse passer le plus de lumière : le nuage fin ou le nuage épais ? Il faut choisir.'),

    -- Vent
    ('17', 1, 'pari', 'Je parie que je peux vous dire d''où vient le vent sans le voir une seule fois. Vous me croyez ?'),
    ('17', 2, 'piege', 'Le vent est fabriqué quelque part, puis il arrive jusqu''à nous. Qui est d''accord ?'),
    ('17', 3, 'constat', 'Personne ne souffle, pourtant les herbes, le drapeau et l''eau bougent tous dans le même sens. Pourquoi ?'),
    ('17', 4, 'choix_force', 'Le vent vient-il de l''endroit où le drapeau va, ou de l''endroit d''où il arrive ? Il faut choisir.'),

    ('18', 1, 'pari', 'Il est 10 heures, pas un souffle. Je parie qu''à 14 heures ça soufflera. Vous me croyez ?'),
    ('18', 2, 'piege', 'Un matin sans vent annonce forcément une journée calme. Qui est d''accord ?'),
    ('18', 3, 'constat', 'Le matin est calme, et pourtant presque tous les après-midis le vent se lève ici. Qu''est-ce qui le déclenche ?'),
    ('18', 4, 'choix_force', 'Cet après-midi, le vent viendra de la mer ou de la terre ? Il faut choisir.'),

    ('20', 1, 'pari', 'Je parie que vos corps suffisent pour trouver d''où vient le vent. Vous me croyez ?'),
    ('20', 2, 'piege', 'Pour connaître le vent, il faut forcément un instrument. Qui est d''accord ?'),
    ('20', 3, 'constat', 'On ne voit pas le vent, pourtant nos cheveux, les rides de l''eau et le drapeau donnent tous la même réponse. Laquelle ?'),
    ('20', 4, 'choix_force', 'Le côté froid de votre doigt mouillé : il regarde le vent ou lui tourne le dos ? Il faut choisir.'),

    ('85', 1, 'pari', 'Je parie que je peux vous montrer le vent sans vous montrer l''air. Vous me croyez ?'),
    ('85', 2, 'piege', 'Puisqu''on ne voit pas le vent, on ne peut pas savoir s''il est là. Qui est d''accord ?'),
    ('85', 3, 'constat', 'On ne voit pas l''air, pourtant les herbes se couchent, les cheveux bougent et l''eau se ride. Qu''est-ce qui les relie ?'),
    ('85', 4, 'choix_force', 'Pour trouver le vent : on regarde le ciel ou ce qu''il déplace ? Il faut choisir.'),

    -- Marées et estran
    ('1', 1, 'pari', 'Je parie que la mer aura monté avant la fin de la séance, même si nous ne la voyons pas bouger. Vous me croyez ?'),
    ('1', 2, 'piege', 'C''est le vent qui fait monter et descendre la mer. Qui est d''accord ?'),
    ('1', 3, 'constat', 'La plage est immense maintenant, pourtant ce matin elle était sous l''eau. Qui l''a fait disparaître ?'),
    ('1', 4, 'choix_force', 'Pour faire monter la mer : le vent ou la Lune ? Il faut choisir.'),

    ('4', 1, 'pari', 'Je parie que cette plage sera de nouveau sous l''eau avant demain. Vous me croyez ?'),
    ('4', 2, 'piege', 'Ici il n''y a rien qui vit : la mer recouvre tout deux fois par jour. Qui est d''accord ?'),
    ('4', 3, 'constat', 'Ce matin c''était la mer, maintenant c''est une plage. Pourtant c''est exactement le même endroit. Comment s''appelle-t-il ?'),
    ('4', 4, 'choix_force', 'Cette bande entre la mer et la plage : elle appartient à la mer ou à la terre ? Il faut choisir.'),

    ('7', 1, 'pari', 'Je parie qu''avec le nombre écrit sur le tableau je peux savoir si la mer ira très loin aujourd''hui. Vous me croyez ?'),
    ('7', 2, 'piege', 'Un gros coefficient veut seulement dire que la mer monte plus haut. Qui est d''accord ?'),
    ('7', 3, 'constat', 'Certains jours la mer découvre une immense plage, d''autres elle en laisse très peu. Pourtant la Lune est toujours là. Pourquoi ?'),
    ('7', 4, 'choix_force', 'Avec un gros coefficient : la mer descend peu ou très loin ? Il faut choisir.'),

    ('13', 1, 'pari', 'Je parie que ce rocher nous dira si la mer monte avant que nos yeux le voient. Vous me croyez ?'),
    ('13', 2, 'piege', 'Pour voir la marée monter, il suffit de regarder l''eau quelques secondes. Qui est d''accord ?'),
    ('13', 3, 'constat', 'L''eau semble immobile, pourtant cinq minutes plus tard elle n''arrive plus au même endroit sur le rocher. Comment l''avoir remarqué ?'),
    ('13', 4, 'choix_force', 'Pour savoir si la mer bouge : on regarde une vague ou un repère fixe ? Il faut choisir.'),

    ('14', 1, 'pari', 'Je parie que cette ligne d''algues sait mieux que nous où l''eau va revenir. Vous me croyez ?'),
    ('14', 2, 'piege', 'La ligne d''algues sur le sable, c''est juste de la saleté. Qui est d''accord ?'),
    ('14', 3, 'constat', 'La mer est loin, pourtant une ligne d''algues est restée très haut sur la plage. Qu''est-ce qu''elle raconte ?'),
    ('14', 4, 'choix_force', 'Pour poser nos affaires : au-dessus ou au-dessous de la ligne d''algues ? Il faut choisir.'),

    ('16', 1, 'pari', 'Je parie qu''il y a plus de vie sous nos pieds ici qu''on ne peut en voir. Vous me croyez ?'),
    ('16', 2, 'piege', 'Cette partie de plage paraît vide, donc on peut courir partout sans déranger personne. Qui est d''accord ?'),
    ('16', 3, 'constat', 'On ne voit presque aucun animal, pourtant le sable est plein de petits trous et de coquilles. Qui vit là ?'),
    ('16', 4, 'choix_force', 'Cet endroit paraît vide : il est vide ou il cache de la vie ? Il faut choisir.'),

    -- Dunes
    ('44', 1, 'pari', 'Je parie que cette petite touffe d''herbe peut fabriquer une dune. Vous me croyez ?'),
    ('44', 2, 'piege', 'Une dune est là depuis toujours : personne ne la construit. Qui est d''accord ?'),
    ('44', 3, 'constat', 'Derrière chaque plante, un peu de sable s''accumule. Pourtant le vent emporte le sable partout ailleurs. Pourquoi ici ?'),
    ('44', 4, 'choix_force', 'Le sable derrière cette plante : le vent l''a emporté ou il l''a déposé ? Il faut choisir.'),

    ('48', 1, 'pari', 'Je parie que ces herbes fines tiennent plus de sable que nos mains. Vous me croyez ?'),
    ('48', 2, 'piege', 'Marcher sur une dune ne casse rien : ce n''est que du sable. Qui est d''accord ?'),
    ('48', 3, 'constat', 'Là où les plantes poussent, le sable tient. Là où elles ont disparu, il s''en va. Pourtant c''est le même vent. Pourquoi ?'),
    ('48', 4, 'choix_force', 'Les plantes de dune servent à décorer ou à tenir le sable ? Il faut choisir.'),

    -- Courants
    ('24', 1, 'pari', 'Je parie que l''eau près de nous ne bouge pas seulement à cause du vent. Vous me croyez ?'),
    ('24', 2, 'piege', 'Près de la côte, c''est toujours le vent qui fait avancer l''eau. Qui est d''accord ?'),
    ('24', 3, 'constat', 'Le vent va dans un sens, mais l''eau près de la bouée semble aller dans un autre. Pourtant tout est sur la même mer. Pourquoi ?'),
    ('24', 4, 'choix_force', 'Cette eau qui bouge : c''est la Lune ou le vent qui la pousse surtout ici ? Il faut choisir.'),

    ('25', 1, 'pari', 'Je parie que le courant devant nous ne va pas dans le même sens dans six heures. Vous me croyez ?'),
    ('25', 2, 'piege', 'Un courant dans la mer va toujours dans le même sens. Qui est d''accord ?'),
    ('25', 3, 'constat', 'Il y a une rivière invisible dans la mer : elle change même de sens sans avoir de berges. Comment est-ce possible ?'),
    ('25', 4, 'choix_force', 'Un courant qui s''inverse toutes les six heures : il suit la marée ou le vent ? Il faut choisir.'),

    ('26', 1, 'pari', 'Je parie que deux bateaux identiques peuvent avancer à des vitesses très différentes sans que l''un rame plus fort. Vous me croyez ?'),
    ('26', 2, 'piege', 'Si je rame assez fort, le courant n''a plus d''importance. Qui est d''accord ?'),
    ('26', 3, 'constat', 'Deux bateaux partent ensemble. L''un arrive bien avant l''autre, pourtant ils font le même effort. Qu''est-ce qui les sépare ?'),
    ('26', 4, 'choix_force', 'Pour savoir si on avance vraiment : on regarde l''eau ou un repère à terre ? Il faut choisir.'),

    ('27', 1, 'pari', 'Je parie que cette bouée peut nous montrer le sens du courant sans que nous jetions quoi que ce soit à l''eau. Vous me croyez ?'),
    ('27', 2, 'piege', 'Pour connaître le courant, il faut forcément jeter un objet flottant à l''eau. Qui est d''accord ?'),
    ('27', 3, 'constat', 'Cette bouée ne bouge presque pas, pourtant une moustache d''écume se forme toujours du même côté. Qu''est-ce qu''elle raconte ?'),
    ('27', 4, 'choix_force', 'L''écume derrière la bouée : elle est du côté où l''eau arrive ou du côté où elle part ? Il faut choisir.'),

    -- Vagues et houle : les formes sont des possibilités, pas un quota.
    -- Les constats de terrain sont à choisir lorsque le phénomène est visible.
    ('30', 1, 'pari', 'Je parie que je peux faire des vagues dans ce récipient sans toucher l''eau. Vous me croyez ?'),
    ('30', 2, 'choix_force', 'Pour faire des rides sur cette eau : je souffle dessus ou je souffle à côté ? À vous de choisir avant que j''essaie.'),

    ('31', 1, 'constat', 'De grandes ondulations traversent les petites vagues en désordre. Pourtant c''est la même mer. Pourquoi deux mouvements différents ?'),
    ('31', 2, 'piege', 'Toutes les vagues que nous voyons ont été fabriquées par le vent d''ici. Qui est d''accord ?'),

    ('32', 1, 'constat', 'Les vagues passent sans casser au large, puis déferlent près de la plage. Pourtant rien ne leur barre le chemin à la surface. Qu''est-ce qui change ?'),
    ('32', 2, 'choix_force', 'Pour comprendre pourquoi la vague casse ici : vous cherchez ce qui change dans le ciel ou sous l''eau ?'),

    ('33', 1, 'piege', '« La mer est belle. » Avec ça, quelqu''un qui ne la voit pas peut imaginer les vagues. Qui est d''accord ?'),
    ('33', 2, 'choix_force', 'Pour décrire la mer à quelqu''un au téléphone : « elle est jolie » ou « elle est ridée, sans écume » ? Quelle phrase lui apprend quelque chose ?'),

    ('34', 1, 'piege', 'Deux vagues de la même hauteur ont forcément la même forme. Qui est d''accord ?'),
    ('34', 2, 'choix_force', 'Pour dessiner cette vague : une bosse arrondie ou une pente raide ? Choisissez, puis montrez ce qui vous a décidés.'),

    ('35', 1, 'constat', 'La crête était lisse ; maintenant elle s''écroule en écume et tout bouillonne. Pourtant nous avons suivi la même vague. Qu''est-ce qui vient de changer ?'),
    ('35', 2, 'piege', 'Quand une vague casse, c''est seulement sa couleur qui change. Qui est d''accord ?'),

    ('36', 1, 'constat', 'Pas un souffle de vent ici, pourtant les vagues continuent d''arriver. Où faut-il chercher leur origine ?'),
    ('36', 2, 'choix_force', 'Ces vagues arrivent sans vent sur la plage : vous cherchez le vent qui les a créées ici ou plus loin en mer ?'),

    ('37', 1, 'piege', 'Ces rochers sont solides, donc marcher dessus ne peut rien abîmer. Qui est d''accord ?'),
    ('37', 2, 'constat', 'De loin, cette mare paraît vide. Sans rien toucher, on y voit pourtant de petits mouvements. Qui habite là ?'),

    ('90', 1, 'piege', 'La houle commence à exister juste devant la plage. Qui est d''accord ?'),
    ('90', 2, 'choix_force', 'La houle : des vagues qui ont voyagé ou un courant qui nous emmène ? Que choisissez-vous ?'),

    ('104', 1, 'piege', 'Pour connaître la taille des vagues créées par le vent, sa force suffit. Qui est d''accord ?'),
    ('104', 2, 'choix_force', 'Le même vent souffle sur une petite mare et sur une grande étendue de mer : où les vagues ont-elles le plus de place pour grandir ?'),

    ('108', 1, 'pari', 'Je parie qu''avec un chronomètre, nous pouvons mesurer quelque chose sur les vagues sans mesurer leur hauteur. Vous me croyez ?'),
    ('108', 2, 'choix_force', 'Pour mesurer la période des vagues : un mètre ou un chronomètre ? Choisissez votre outil.'),

    ('122', 1, 'piege', 'Le vent vient de tomber : les vagues vont s''arrêter tout de suite. Qui est d''accord ?'),
    ('122', 2, 'constat', 'Le drapeau est retombé, pourtant la mer continue de bouger. Pourquoi ne s''arrête-t-elle pas avec le vent ?'),

    ('123', 1, 'piege', 'Pour comprendre ce que la houle donnera sur une plage, sa direction ne compte pas. Qui est d''accord ?'),
    ('123', 2, 'choix_force', 'Sur cette carte, la houle arrive de ce côté : quelle plage lui fait face, celle-ci ou celle-là ?'),

    ('124', 1, 'piege', 'Pas de vent sur la plage : cela prouve qu''il n''y aura pas de grosses vagues. Qui est d''accord ?'),
    ('124', 2, 'choix_force', 'Pour savoir si une houle arrive : la météo de la plage suffit ou il faut aussi regarder les prévisions de houle ?')
),
agregats AS (
    SELECT
        id,
        array_agg(texte ORDER BY ordre) AS accroches,
        jsonb_agg(
            jsonb_build_object('forme', forme, 'texte', texte)
            ORDER BY ordre
        ) AS accroches_formes
    FROM propositions
    GROUP BY id
)
UPDATE public.pedagogical_content AS contenu
SET
    accroche = agregats.accroches[1],
    accroches_variantes = agregats.accroches,
    accroches_formes = agregats.accroches_formes
FROM agregats
WHERE contenu.id = agregats.id;
