-- Couche transmission — lot 2 : 48 fiches supplémentaires.
--
-- Avec le lot 1 (15 fiches) et les méduses (3), on atteint 66 fiches sur 131 : environ
-- la moitié du catalogue dispose d'une formulation prête à transmettre. Les groupes
-- « marées », « courants », « vent », « météo », « laisse de mer » et « dunes » sont
-- désormais couverts sur leurs trois dimensions COP.
--
-- Trois variantes de registres distincts, ancrées sur le champ `explication` :
--   1. une question directe qui interpelle ;
--   2. une invitation à observer quelque chose de précis ;
--   3. un défi qui met le groupe en action.
-- La troisième était initialement une affirmation fausse à retourner (« Vrai ou
-- faux ? ») : réponse trop évidente pour mobiliser, et doublon avec le champ
-- `erreur_frequente` qui porte déjà cette idée.

-- ══ LES MARÉES ═══════════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Je peux vous dire l''heure de la marée du 14 juillet 2030. Vous me croyez ?',
  accroches_variantes = ARRAY[
    'Je peux vous dire l''heure de la marée du 14 juillet 2030. Vous me croyez ?',
    'Comment on fait pour savoir à quelle heure la mer sera haute demain ?',
    'Trouvez l''heure de la prochaine marée haute sur le tableau. Vous avez trente secondes.'
  ],
  a_observer = 'L''annuaire des marées ou l''application affichée au club.',
  a_retenir = 'Les marées sont si régulières qu''on les calcule des années à l''avance. Il suffit de lire le calendrier.',
  erreur_frequente = 'On imagine qu''il faut observer la mer pour savoir. C''est l''inverse : tout est calculé d''avance, à la minute près.'
WHERE id = '2';

UPDATE pedagogical_content SET
  accroche = 'À Cherbourg, la marée haute n''est pas à la même heure qu''ici. Pourquoi ?',
  accroches_variantes = ARRAY[
    'À Cherbourg, la marée haute n''est pas à la même heure qu''ici. Pourquoi ?',
    'Imaginez une vague géante qui doit contourner tous les caps. Elle met combien de temps ?',
    'Sur la carte : trouvez deux ports où la marée haute n''est pas à la même heure.'
  ],
  a_observer = 'Sur une carte, la forme de la côte : les caps à contourner, les baies à remplir.',
  a_retenir = 'La marée est une onde qui voyage. Elle contourne les caps et entre dans les baies : elle n''arrive pas partout en même temps.',
  erreur_frequente = 'On croit que la mer monte partout d''un coup. C''est une vague lente qui se propage le long des côtes.'
WHERE id = '3';

UPDATE pedagogical_content SET
  accroche = 'Là, l''eau ne bouge plus du tout. Elle est en panne ?',
  accroches_variantes = ARRAY[
    'Là, l''eau ne bouge plus du tout. Elle est en panne ?',
    'Entre la marée qui monte et celle qui descend, il se passe quelque chose. Quoi ?',
    'Surveillez le courant autour de ce piquet. Prévenez-moi à la seconde où il s''arrête.'
  ],
  a_observer = 'Le courant autour d''une bouée : il ralentit, s''arrête, puis repart dans l''autre sens.',
  a_retenir = 'L''étale, c''est la pause entre deux marées. Le courant s''arrête quelques minutes, puis repart à l''envers.',
  erreur_frequente = 'On pense que la mer change de sens instantanément. Il y a un vrai moment de calme entre les deux.'
WHERE id = '5';

UPDATE pedagogical_content SET
  accroche = 'La mer monte-t-elle toujours à la même vitesse ?',
  accroches_variantes = ARRAY[
    'La mer monte-t-elle toujours à la même vitesse ?',
    'Vous posez vos affaires ici. Dans une heure, l''eau aura avancé de combien ? Ça dépend du moment.',
    'On marque le niveau maintenant, puis dans une heure. Pariez sur la distance gagnée.'
  ],
  a_observer = 'L''avancée de l''eau sur le sable, mesurée en début puis en milieu de marée.',
  a_retenir = 'La mer monte lentement au début, très vite au milieu, puis lentement à la fin.',
  erreur_frequente = 'On croit la montée régulière. C''est au milieu de la marée que l''eau avance le plus vite — le moment où on se fait surprendre.'
WHERE id = '8';

UPDATE pedagogical_content SET
  accroche = 'Les marins ont des mots à eux pour la marée. Vous en connaissez ?',
  accroches_variantes = ARRAY[
    'Les marins ont des mots à eux pour la marée. Vous en connaissez ?',
    'Flot, jusant, étale : trois mots, trois moments. Lequel est lequel ?',
    'Marée montante et marée descendante, ça suffit comme vocabulaire. Qui est d''accord ?'
  ],
  a_observer = 'Le sens du courant maintenant, pour nommer où on en est : flot, jusant ou étale.',
  a_retenir = 'Le flot, c''est la mer qui monte. Le jusant, c''est la mer qui descend. L''étale, c''est la pause entre les deux.',
  erreur_frequente = 'On confond jusant et étale. Le jusant descend ; l''étale ne bouge plus.'
WHERE id = '10';

UPDATE pedagogical_content SET
  accroche = 'Je pose les affaires ici. Dans deux heures, elles sont où ?',
  accroches_variantes = ARRAY[
    'Je pose les affaires ici. Dans deux heures, elles sont où ?',
    'La ligne d''algues d''hier suffit-elle pour savoir où poser nos affaires aujourd''hui ?',
    'Au-dessus de la laisse de mer, mes affaires sont en sécurité. Toujours ?'
  ],
  a_observer = 'La laisse de mer la plus récente, et le coefficient du jour.',
  a_retenir = 'La laisse de mer montre la marée précédente. Si le coefficient monte, l''eau ira plus haut : on pose nettement au-dessus.',
  erreur_frequente = 'On se fie à la trace de la veille. Avec un coefficient plus fort, la mer dépasse cette ligne.'
WHERE id = '15';

UPDATE pedagogical_content SET
  accroche = 'Hier la marée haute était à 14h. Aujourd''hui, à 14h50. Qui a décalé l''heure ?',
  accroches_variantes = ARRAY[
    'Hier la marée haute était à 14h. Aujourd''hui, à 14h50. Qui a décalé l''heure ?',
    'Chaque jour, la marée a environ 50 minutes de retard. D''où vient ce retard ?',
    'Regardez le tableau de la semaine et trouvez la règle cachée dans les horaires.'
  ],
  a_observer = 'Le tableau des marées de la semaine : l''heure qui glisse d''un jour à l''autre.',
  a_retenir = 'La Lune met 24h50 pour repasser au-dessus de nous. La marée la suit, donc elle a 50 minutes de retard chaque jour.',
  erreur_frequente = 'On y voit une irrégularité. C''est au contraire parfaitement régulier : 50 minutes de décalage, tous les jours.'
WHERE id = '91';

-- ══ LES COURANTS ═════════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'L''eau de la mer bouge tout le temps. Qu''est-ce qui la pousse ?',
  accroches_variantes = ARRAY[
    'L''eau de la mer bouge tout le temps. Qu''est-ce qui la pousse ?',
    'Trois choses différentes font bouger l''eau de la mer. Vous en trouvez combien ?',
    'Comparez le sens du vent et celui du courant. Pareil ou pas ?'
  ],
  a_observer = 'Le sens du courant près d''une bouée, et le sens du vent : est-ce le même ?',
  a_retenir = 'Trois choses font bouger l''eau : la Lune (marée), le vent (dérive), et les grands courants de l''océan.',
  erreur_frequente = 'On attribue tout au vent. Près des côtes, c''est surtout la marée qui crée le courant.'
WHERE id = '24';

UPDATE pedagogical_content SET
  accroche = 'Il y a des rivières invisibles dans la mer. Comment on les reconnaît ?',
  accroches_variantes = ARRAY[
    'Il y a des rivières invisibles dans la mer. Comment on les reconnaît ?',
    'Un courant qui s''inverse toutes les six heures, un autre qui suit le vent : lequel est lequel ?',
    'Notez le sens du courant. On revient dans six heures vérifier ensemble.'
  ],
  a_observer = 'Le sens du courant maintenant — et ce qu''il sera dans six heures.',
  a_retenir = 'Le courant de marée s''inverse toutes les 6 heures. Celui de dérive suit le vent. Les grands courants, eux, ne s''arrêtent jamais.',
  erreur_frequente = 'On imagine un courant unique et permanent. Ici, il change de sens deux fois par jour.'
WHERE id = '25';

UPDATE pedagogical_content SET
  accroche = 'Deux bateaux identiques partent ensemble. L''un arrive deux fois plus vite. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Deux bateaux identiques partent ensemble. L''un arrive deux fois plus vite. Pourquoi ?',
    'Un courant de 2 nœuds : concrètement, ça change quoi pour nous ?',
    'Si je pagaie assez fort, le courant n''a pas d''importance. Qui est d''accord ?'
  ],
  a_observer = 'Un repère fixe à terre pour voir si on avance vraiment, ou si on dérive.',
  a_retenir = 'Le courant s''ajoute à notre vitesse ou s''y oppose. Contre lui, on peut ramer sans avancer d''un mètre.',
  erreur_frequente = 'On juge sa progression en regardant l''eau autour de soi. Il faut un repère à terre : lui seul dit si on avance.'
WHERE id = '26';

UPDATE pedagogical_content SET
  accroche = 'Regardez cette bouée : elle a une petite moustache d''écume. Elle nous dit quelque chose.',
  accroches_variantes = ARRAY[
    'Regardez cette bouée : elle a une petite moustache d''écume. Elle nous dit quelque chose.',
    'Comment savoir dans quel sens l''eau file, sans se mettre à l''eau ?',
    'Sans rien jeter à l''eau : trouvez le sens du courant en regardant cette bouée.'
  ],
  a_observer = 'Le remous ou la traînée d''écume derrière une bouée, un poteau, un rocher.',
  a_retenir = 'L''eau qui file autour d''un obstacle laisse une moustache d''écume du côté où elle pousse.',
  erreur_frequente = 'On croit qu''il faut un objet flottant à jeter. Les bouées et piquets déjà en place suffisent.'
WHERE id = '27';

UPDATE pedagogical_content SET
  accroche = 'On part jusqu''à la bouée là-bas. Le retour sera plus dur ou plus facile ?',
  accroches_variantes = ARRAY[
    'On part jusqu''à la bouée là-bas. Le retour sera plus dur ou plus facile ?',
    'Pourquoi on regarde le courant avant de partir, et jamais après ?',
    'Le courant, on le sent tout de suite quand on est dessus. Qui est d''accord ?'
  ],
  a_observer = 'Le sens du courant avant le départ, et le trajet de retour envisagé.',
  a_retenir = 'On vérifie le courant avant de partir. Il peut doubler l''effort du retour ou nous déporter sans qu''on le sente.',
  erreur_frequente = 'On croit qu''on sent le courant. Porté par lui, on ne sent rien — c''est au retour qu''on comprend.'
WHERE id = '28';

UPDATE pedagogical_content SET
  accroche = 'Un courant, ce n''est pas que de l''eau qui bouge. Qu''est-ce qu''il transporte d''autre ?',
  accroches_variantes = ARRAY[
    'Un courant, ce n''est pas que de l''eau qui bouge. Qu''est-ce qu''il transporte d''autre ?',
    'Si je jette quelque chose ici, ça part où, à votre avis ?',
    'Repérez ce qui flotte à la surface et suivez-le des yeux. Il va où ?'
  ],
  a_observer = 'Ce que le courant transporte en surface : algues, débris, mousse.',
  a_retenir = 'Les courants sont les autoroutes de la vie marine : ils transportent le plancton et les larves. Ce qu''on y jette voyage avec.',
  erreur_frequente = 'On pense qu''un déchet jeté au large disparaît. Il suit le courant, exactement comme la nourriture des animaux.'
WHERE id = '29';

-- ══ LES VAGUES ET LA HOULE ═══════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Qu''est-ce qui fabrique les vagues ?',
  accroches_variantes = ARRAY[
    'Qu''est-ce qui fabrique les vagues ?',
    'Soufflez sur votre gobelet d''eau. Vous venez de faire des vagues — comment ?',
    'Soufflez sur l''eau dans le creux de vos mains. Vous venez de fabriquer une vague.'
  ],
  a_observer = 'La taille des vagues aujourd''hui, mise en rapport avec la force du vent.',
  a_retenir = 'C''est le vent qui fait les vagues, en frottant sur l''eau. Plus il souffle fort et longtemps, plus elles grossissent.',
  erreur_frequente = 'On confond vagues et marée. La marée, c''est la Lune ; les vagues, c''est le vent.'
WHERE id = '30';

UPDATE pedagogical_content SET
  accroche = 'Ces vagues-là viennent peut-être d''une tempête à mille kilomètres. Lesquelles ?',
  accroches_variantes = ARRAY[
    'Ces vagues-là viennent peut-être d''une tempête à mille kilomètres. Lesquelles ?',
    'Des vagues bien rangées, d''autres en désordre : quelle différence entre les deux ?',
    'Vague et houle, c''est la même chose. Qui est d''accord ?'
  ],
  a_observer = 'La régularité : vagues espacées et alignées, ou courtes et désordonnées ?',
  a_retenir = 'La mer du vent est courte et désordonnée, fabriquée ici. La houle est longue et régulière : elle vient de loin.',
  erreur_frequente = 'On appelle tout « vague ». La houle a voyagé, parfois depuis une tempête à des centaines de kilomètres.'
WHERE id = '31';

UPDATE pedagogical_content SET
  accroche = 'Décrivez-moi la mer, là, en trois mots.',
  accroches_variantes = ARRAY[
    'Décrivez-moi la mer, là, en trois mots.',
    'Vous voyez des moutons blancs sur les vagues ? Ça veut dire quelque chose de précis.',
    'Chacun trouve un mot pour décrire la mer. On ne peut pas répéter celui du voisin.'
  ],
  a_observer = 'La surface : plate, ridée, clapoteuse, avec ou sans écume blanche sur les crêtes.',
  a_retenir = 'On décrit la mer avec des mots simples : plate, ridée, clapoteuse, avec ou sans moutons.',
  erreur_frequente = 'On se contente de « ça va » ou « c''est gros ». Les moutons apparaissent à partir d''un vent précis : c''est un vrai indice.'
WHERE id = '33';

UPDATE pedagogical_content SET
  accroche = 'Deux vagues de la même hauteur : l''une est dangereuse, l''autre non. Comment les distinguer ?',
  accroches_variantes = ARRAY[
    'Deux vagues de la même hauteur : l''une est dangereuse, l''autre non. Comment les distinguer ?',
    'Une vague douce et une vague creuse : laquelle vous laisse le temps de réagir ?',
    'Ce qui compte dans une vague, c''est sa hauteur. Qui est d''accord ?'
  ],
  a_observer = 'L''espacement entre deux vagues et la raideur de leur face avant.',
  a_retenir = 'Une vague longue et douce laisse le temps de réagir. Une vague courte et creuse casse d''un coup.',
  erreur_frequente = 'On juge une vague à sa hauteur seule. C''est sa forme — creuse ou douce — qui fait la différence.'
WHERE id = '34';

-- ══ L'ÉTAT DE LA MER ═════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Avant de partir, on regarde « l''état de la mer ». Ça veut dire quoi, exactement ?',
  accroches_variantes = ARRAY[
    'Avant de partir, on regarde « l''état de la mer ». Ça veut dire quoi, exactement ?',
    'Si je vous demande l''état de la mer, vous me répondez quoi ?',
    'En trente secondes : hauteur des vagues, sens du vent, écume ou pas. Go.'
  ],
  a_observer = 'Hauteur des vagues, espacement, direction du vent et de la houle, présence d''écume.',
  a_retenir = 'L''état de la mer, c''est tout ce qui se passe en surface : hauteur des vagues, leur espacement, le vent, la houle.',
  erreur_frequente = 'On résume à la hauteur des vagues. L''espacement et la direction comptent tout autant.'
WHERE id = '96';

UPDATE pedagogical_content SET
  accroche = 'Sans mettre un pied dans l''eau, dites-moi si la mer est praticable.',
  accroches_variantes = ARRAY[
    'Sans mettre un pied dans l''eau, dites-moi si la mer est praticable.',
    'Qu''est-ce qu''on peut apprendre de la mer rien qu''en la regardant depuis la plage ?',
    'Pour savoir comment est la mer, il faut y aller. Qui est d''accord ?'
  ],
  a_observer = 'Les moutons blancs, le sens des vagues, si elles cassent, la netteté de l''horizon.',
  a_retenir = 'Depuis le bord on voit déjà l''essentiel : l''écume blanche trahit le vent, un horizon flou annonce le mauvais temps.',
  erreur_frequente = 'On croit qu''il faut être sur l''eau pour juger. Une bonne partie se lit depuis la plage.'
WHERE id = '97';

-- ══ LE VENT ══════════════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Vent de terre ou vent de mer : lequel vous inquiète le plus ?',
  accroches_variantes = ARRAY[
    'Vent de terre ou vent de mer : lequel vous inquiète le plus ?',
    'Le vent nous pousse vers le large. On s''en rend compte à quel moment ?',
    'Un vent qui vient de la plage, c''est plus rassurant. Qui est d''accord ?'
  ],
  a_observer = 'D''où vient le vent par rapport à la plage : de la terre vers la mer, ou l''inverse ?',
  a_retenir = 'Le vent de terre pousse vers le large sans qu''on le sente : c''est le plus traître. Le vent de mer complique le retour mais nous ramène.',
  erreur_frequente = 'On se méfie du vent fort de face. Le plus dangereux est celui qui pousse doucement vers le large.'
WHERE id = '19';

UPDATE pedagogical_content SET
  accroche = 'Depuis le début de la séance, le vent a changé. Qui l''a remarqué ?',
  accroches_variantes = ARRAY[
    'Depuis le début de la séance, le vent a changé. Qui l''a remarqué ?',
    'Le vent est notre moteur. Quand est-ce qu''il devient un problème ?',
    'Notez le sens du vent maintenant. Je vous repose la question dans une heure.'
  ],
  a_observer = 'Le vent maintenant, comparé à celui du départ : même sens, même force ?',
  a_retenir = 'Le vent change pendant la séance. On garde un œil dessus en permanence, pas seulement au départ.',
  erreur_frequente = 'On vérifie le vent une fois, au départ. Il tourne et forcit — c''est ce changement qui surprend.'
WHERE id = '21';

UPDATE pedagogical_content SET
  accroche = 'Il est 10h, pas un souffle, grand soleil. Je parie qu''à 14h ça souffle. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Il est 10h, pas un souffle, grand soleil. Je parie qu''à 14h ça souffle. Pourquoi ?',
    'Quels signes, ce matin, annoncent du vent cet après-midi ?',
    'Pariez : à quelle heure le vent va se lever aujourd''hui ? On vérifiera.'
  ],
  a_observer = 'Le ciel du matin (clair ou voilé) et l''absence de vent : les ingrédients de la brise à venir.',
  a_retenir = 'Ciel clair et pas de vent le matin annoncent la brise de l''après-midi : le soleil chauffe la terre, l''air se met en route.',
  erreur_frequente = 'On croit qu''un matin calme annonce une journée calme. C''est souvent le signe inverse.'
WHERE id = '22';

UPDATE pedagogical_content SET
  accroche = 'Le vent, vous pouvez le voir ?',
  accroches_variantes = ARRAY[
    'Le vent, vous pouvez le voir ?',
    'On ne voit pas le vent, mais on voit ce qu''il fait. Quoi, par exemple ?',
    'Attrapez le vent dans votre veste ouverte. Vous tenez quelque chose de bien réel.'
  ],
  a_observer = 'Tout ce qui trahit le vent : herbes, drapeau, rides sur l''eau, cheveux.',
  a_retenir = 'Le vent, c''est de l''air qui bouge. On ne le voit pas, mais on voit tout ce qu''il déplace.',
  erreur_frequente = 'On oublie que l''air est une matière. Le vent, c''est de l''air bien réel qui se déplace, pas du vide.'
WHERE id = '85';

-- ══ LA MÉTÉO ET LES NUAGES ═══════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Il fait 25 degrés au village et on grelotte sur l''eau. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Il fait 25 degrés au village et on grelotte sur l''eau. Pourquoi ?',
    'Pourquoi il fait toujours plus frais au bord de la mer en été ?',
    'Comparez ce que vous ressentez ici et ce qu''il faisait au parking tout à l''heure.'
  ],
  a_observer = 'La différence de température ressentie entre le parking et le bord de l''eau.',
  a_retenir = 'L''eau chauffe et refroidit lentement. Près de la mer, il fait moins chaud l''été et moins froid l''hiver.',
  erreur_frequente = 'On s''habille pour la météo du village. Sur l''eau, il fait plus frais et le vent est plus fort.'
WHERE id = '38';

UPDATE pedagogical_content SET
  accroche = 'D''où vient l''eau des nuages ?',
  accroches_variantes = ARRAY[
    'D''où vient l''eau des nuages ?',
    'Un nuage, c''est de la fumée ? De la vapeur ? Autre chose ?',
    'Suivez un nuage des yeux pendant deux minutes. Il fait quoi ?'
  ],
  a_observer = 'Les nuages du jour : où ils se forment, dans quelle direction ils vont.',
  a_retenir = 'L''eau de la mer s''évapore, monte, refroidit et se transforme en minuscules gouttelettes : c''est le nuage.',
  erreur_frequente = 'On pense qu''un nuage est fait de vapeur. C''est de l''eau redevenue liquide, en très fines gouttes.'
WHERE id = '39';

UPDATE pedagogical_content SET
  accroche = 'Décrivez-moi le ciel, là. Dégagé, voilé, couvert ?',
  accroches_variantes = ARRAY[
    'Décrivez-moi le ciel, là. Dégagé, voilé, couvert ?',
    'Le ciel de ce matin annonce quoi pour cet après-midi ?',
    'Décrivez le ciel en un mot. On refait l''exercice en fin de séance.'
  ],
  a_observer = 'La couverture nuageuse, la couleur du ciel, la luminosité.',
  a_retenir = 'On décrit le ciel simplement : dégagé, voilé ou couvert. Regardé souvent, il annonce le temps qui vient.',
  erreur_frequente = 'On regarde le ciel une seule fois. C''est en le comparant d''une heure à l''autre qu''on voit venir le changement.'
WHERE id = '41';

UPDATE pedagogical_content SET
  accroche = 'Ce nuage-là monte comme une tour. Bon ou mauvais signe ?',
  accroches_variantes = ARRAY[
    'Ce nuage-là monte comme une tour. Bon ou mauvais signe ?',
    'Nuage fin en altitude, ou gros nuage qui gonfle : lequel vous inquiète ?',
    'Tous les nuages annoncent la pluie. Qui est d''accord ?'
  ],
  a_observer = 'La forme des nuages : filandreux en altitude, ou gonflés vers le haut avec une base sombre.',
  a_retenir = 'Un nuage fin et étiré annonce un changement en douceur. Un nuage qui gonfle vers le haut annonce l''orage.',
  erreur_frequente = 'On juge un nuage à sa couleur. C''est sa forme — plat ou en tour — qui renseigne le mieux.'
WHERE id = '42';

UPDATE pedagogical_content SET
  accroche = 'Si je pouvais attraper un nuage, j''aurais quoi dans la main ?',
  accroches_variantes = ARRAY[
    'Si je pouvais attraper un nuage, j''aurais quoi dans la main ?',
    'Un nuage, ça pèse lourd ou c''est léger, à votre avis ?',
    'Choisissez un nuage et retrouvez-le dans cinq minutes. Bonne chance.'
  ],
  a_observer = 'Un nuage précis, et le fait qu''il change de forme en quelques minutes.',
  a_retenir = 'Un nuage, c''est des milliards de gouttelettes d''eau si petites qu''elles flottent dans l''air.',
  erreur_frequente = 'On imagine un objet solide et stable. Un nuage se fait et se défait en permanence.'
WHERE id = '82';

UPDATE pedagogical_content SET
  accroche = 'Pourquoi certains nuages sont blancs et d''autres presque noirs ?',
  accroches_variantes = ARRAY[
    'Pourquoi certains nuages sont blancs et d''autres presque noirs ?',
    'Un nuage gris foncé, il contient quoi de plus qu''un nuage blanc ?',
    'Trouvez dans le ciel le nuage le plus clair et le plus sombre. Qu''est-ce qui les différencie ?'
  ],
  a_observer = 'Les nuages du jour : comparer l''épaisseur des blancs et celle des gris.',
  a_retenir = 'Un nuage fin laisse passer la lumière : il est blanc. Un nuage épais la bloque : il paraît gris ou noir.',
  erreur_frequente = 'On croit que le nuage noir est fait d''autre chose. C''est la même eau — il est juste beaucoup plus épais.'
WHERE id = '83';

-- ══ LA PLAGE ET LES DUNES ════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'En marchant de la plage vers l''intérieur, les plantes changent. Vous avez remarqué ?',
  accroches_variantes = ARRAY[
    'En marchant de la plage vers l''intérieur, les plantes changent. Vous avez remarqué ?',
    'Pourquoi il y a des herbes ici, des buissons là-bas, et des arbres au fond ?',
    'En marchant vers l''intérieur, comptez combien de fois les plantes changent.'
  ],
  a_observer = 'La succession des végétations en s''éloignant de la mer : herbes rases, oyats, buissons, arbres.',
  a_retenir = 'Plus on s''éloigne de la mer, plus la dune est protégée du vent et du sel : les plantes changent par étages.',
  erreur_frequente = 'On voit la dune comme un tas uniforme. C''est une succession de milieux, chacun avec ses plantes.'
WHERE id = '45';

UPDATE pedagogical_content SET
  accroche = 'Cette plage a une carte d''identité. Qu''est-ce qui la rend unique ?',
  accroches_variantes = ARRAY[
    'Cette plage a une carte d''identité. Qu''est-ce qui la rend unique ?',
    'Comparez le sable ici et celui de là-bas. Pareil ?',
    'Toutes les plages se ressemblent. Qui est d''accord ?'
  ],
  a_observer = 'Couleur et grain du sable, galets, hauteur des dunes, largeur de l''estran.',
  a_retenir = 'Chaque plage a sa carte d''identité : son sable, ses galets, ses dunes, sa largeur.',
  erreur_frequente = 'On croit qu''une plage n''est que du sable. Chaque détail raconte comment la mer et le vent travaillent ici.'
WHERE id = '46';

UPDATE pedagogical_content SET
  accroche = 'Après la tempête, la dune avait une falaise. Qui l''a taillée ?',
  accroches_variantes = ARRAY[
    'Après la tempête, la dune avait une falaise. Qui l''a taillée ?',
    'Est-ce que la dune est au même endroit que l''an dernier ?',
    'Cherchez une racine à l''air libre ou une petite falaise de sable. Qui en trouve une ?'
  ],
  a_observer = 'Le pied de la dune côté mer : falaise verticale fraîche, ou pente douce recolonisée ?',
  a_retenir = 'Les tempêtes taillent la dune côté mer. Entre deux, le vent la reconstruit doucement.',
  erreur_frequente = 'On croit la dune figée. Elle recule et avance en permanence, au rythme des tempêtes.'
WHERE id = '47';

UPDATE pedagogical_content SET
  accroche = 'Dans cinquante ans, la mer sera peut-être là où on est assis. Ou pas.',
  accroches_variantes = ARRAY[
    'Dans cinquante ans, la mer sera peut-être là où on est assis. Ou pas.',
    'Pourquoi on parle de plus en plus du recul de la côte ?',
    'Repérez quelque chose de construit par l''homme que la mer a rattrapé.'
  ],
  a_observer = 'Les traces du recul : blockhaus dans l''eau, arbres déchaussés, escaliers qui ne mènent plus nulle part.',
  a_retenir = 'Les côtes ont toujours bougé, mais ça s''accélère : la mer monte et les tempêtes sont plus fortes.',
  erreur_frequente = 'On croit à un phénomène récent. Il est ancien — c''est sa vitesse qui a changé.'
WHERE id = '49';

-- ══ LA LAISSE DE MER ═════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Dans cette ligne, il y a deux sortes de choses. Vous voyez lesquelles ?',
  accroches_variantes = ARRAY[
    'Dans cette ligne, il y a deux sortes de choses. Vous voyez lesquelles ?',
    'Faites deux tas : ce qui vient de la mer, ce qui vient de nous.',
    'Deux tas en cinq minutes : ce qui vient de la mer, ce qui vient de nous.'
  ],
  a_observer = 'Le tri : algues, coquilles, bois d''un côté ; plastique, cordage, mégots de l''autre.',
  a_retenir = 'La mer dépose des choses naturelles, utiles à la plage. Elle dépose aussi nos déchets, qui n''ont rien à y faire.',
  erreur_frequente = 'On met tout dans le même sac. Les algues et le bois nourrissent la dune ; le plastique, non.'
WHERE id = '51';

UPDATE pedagogical_content SET
  accroche = 'Cette ligne n''était pas là hier, ou pas au même endroit. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Cette ligne n''était pas là hier, ou pas au même endroit. Pourquoi ?',
    'La forme de cette ligne raconte d''où vient le courant. Comment la lire ?',
    'Marquez où passe la ligne aujourd''hui. On revient demain voir si elle a bougé.'
  ],
  a_observer = 'La position et la forme de la ligne aujourd''hui, comparée à la précédente.',
  a_retenir = 'La laisse de mer change de place à chaque marée, selon le vent, le coefficient et le courant.',
  erreur_frequente = 'On croit à une ligne fixe. Elle se redessine deux fois par jour.'
WHERE id = '52';

UPDATE pedagogical_content SET
  accroche = 'Cette ligne peut nous dire si le littoral va bien. Comment ?',
  accroches_variantes = ARRAY[
    'Cette ligne peut nous dire si le littoral va bien. Comment ?',
    'Comptez sur un mètre : combien d''objets naturels, combien de plastiques ?',
    'Un mètre de laisse chacun : comptez les objets naturels et les plastiques.'
  ],
  a_observer = 'La proportion entre éléments naturels et déchets humains sur un mètre de laisse.',
  a_retenir = 'Plus il y a de plastique par rapport aux algues et aux coquilles, plus le littoral est en mauvaise santé.',
  erreur_frequente = 'On pense qu''il faut des analyses. Un simple comptage donne déjà une bonne photographie.'
WHERE id = '54';

UPDATE pedagogical_content SET
  accroche = 'Le meilleur déchet, c''est lequel ?',
  accroches_variantes = ARRAY[
    'Le meilleur déchet, c''est lequel ?',
    'Ramasser, c''est bien. Mais qu''est-ce qui serait encore mieux ?',
    'Tant qu''on ramasse ses déchets, il n''y a pas de problème. Qui est d''accord ?'
  ],
  a_observer = 'Ce qu''on a apporté aujourd''hui : gourdes ou bouteilles, emballages, matériel.',
  a_retenir = 'Le meilleur déchet est celui qu''on n''a pas produit. Une gourde vaut mieux que dix bouteilles ramassées.',
  erreur_frequente = 'On pense que ramasser suffit. Ramasser répare ; ne pas produire évite.'
WHERE id = '56';

-- ══ LA VIE DANS L'EAU ════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Le crabe a une carapace, l''algue est molle. Pourquoi pas l''inverse ?',
  accroches_variantes = ARRAY[
    'Le crabe a une carapace, l''algue est molle. Pourquoi pas l''inverse ?',
    'Comment on survit ici quand on est mouillé, puis sec, puis mouillé ?',
    'Trouvez un animal ou une algue, et devinez comment il tient quand la mer se retire.'
  ],
  a_observer = 'Une espèce précise et sa solution : carapace, ventouse, souplesse, coquille qui se ferme.',
  a_retenir = 'Chaque espèce a trouvé sa solution : carapace contre le sec, ventouse contre les vagues, souplesse pour plier.',
  erreur_frequente = 'On voit des animaux ordinaires. Ce sont des champions de la survie dans un milieu extrême.'
WHERE id = '58';

UPDATE pedagogical_content SET
  accroche = 'Qui mange qui, ici ? On commence par le plus petit.',
  accroches_variantes = ARRAY[
    'Qui mange qui, ici ? On commence par le plus petit.',
    'Le plus petit être vivant de la mer nourrit tous les autres. Lequel ?',
    'Les gros poissons mangent les petits, et voilà toute la chaîne. Qui est d''accord ?'
  ],
  a_observer = 'Les indices de la chaîne : coquille percée, plumes, restes de repas sur l''estran.',
  a_retenir = 'Tout commence par le plancton, invisible, qui capte l''énergie du soleil. Sans lui, plus rien ne mange.',
  erreur_frequente = 'On fait commencer la chaîne aux poissons. Elle commence par une algue microscopique qu''on ne voit même pas.'
WHERE id = '59';

UPDATE pedagogical_content SET
  accroche = 'Les animaux d''ici ont un calendrier. Vous savez ce qu''il y a dessus ?',
  accroches_variantes = ARRAY[
    'Les animaux d''ici ont un calendrier. Vous savez ce qu''il y a dessus ?',
    'Pourquoi on ne voit pas les mêmes espèces en juillet et en février ?',
    'Listez ce qu''on voit aujourd''hui. On comparera à la prochaine saison.'
  ],
  a_observer = 'Ce qu''on voit aujourd''hui, et ce qu''on ne voyait pas il y a trois mois.',
  a_retenir = 'Chaque espèce a son calendrier : saison de reproduction, périodes de migration, moments de repos.',
  erreur_frequente = 'On croit la faune identique toute l''année. Elle change complètement d''une saison à l''autre.'
WHERE id = '60';

UPDATE pedagogical_content SET
  accroche = 'Combien d''espèces de mammifères marins sur nos côtes, à votre avis ? Une ? Cinq ?',
  accroches_variantes = ARRAY[
    'Combien d''espèces de mammifères marins sur nos côtes, à votre avis ? Une ? Cinq ?',
    'Phoques, marsouins, dauphins : lesquels vivent vraiment ici ?',
    'Cinq minutes de silence, tous les yeux sur l''eau. Qui repère un souffle ou une tête ?'
  ],
  a_observer = 'La surface de l''eau au loin : une tête ronde qui apparaît, un souffle, un aileron.',
  a_retenir = '24 espèces de mammifères marins ont été observées en Normandie. Les plus fréquentes : phoque veau-marin, phoque gris, marsouin.',
  erreur_frequente = 'On croit qu''il faut aller loin pour en voir. Ils sont ici, simplement discrets.'
WHERE id = '88';

-- ══ LES OISEAUX ══════════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Cet oiseau était en Afrique il y a un mois. Il fait quoi ici ?',
  accroches_variantes = ARRAY[
    'Cet oiseau était en Afrique il y a un mois. Il fait quoi ici ?',
    'Pourquoi certains oiseaux partent et reviennent chaque année ?',
    'Comptez les oiseaux posés. Certains sont peut-être arrivés d''Afrique cette semaine.'
  ],
  a_observer = 'Les oiseaux présents aujourd''hui : en groupe ou isolés, posés ou en vol.',
  a_retenir = 'Un oiseau migrateur fait le même voyage chaque année : un endroit pour l''hiver, un autre pour faire ses petits.',
  erreur_frequente = 'On pense que les oiseaux d''ici sont d''ici. Beaucoup ne font que passer, et viennent parfois de très loin.'
WHERE id = '86';

UPDATE pedagogical_content SET
  accroche = 'Pourquoi tous ces oiseaux s''arrêtent chez nous plutôt qu''ailleurs ?',
  accroches_variantes = ARRAY[
    'Pourquoi tous ces oiseaux s''arrêtent chez nous plutôt qu''ailleurs ?',
    'Après mille kilomètres de vol, qu''est-ce qu''un oiseau cherche en premier ?',
    'Observez où ils se posent exactement. Pourquoi là et pas ailleurs ?'
  ],
  a_observer = 'La vasière ou l''estran à marée basse : les oiseaux qui fouillent la vase pour se nourrir.',
  a_retenir = 'Nos vasières sont des stations-service : elles regorgent de nourriture pour des oiseaux épuisés par le voyage.',
  erreur_frequente = 'On croit qu''ils s''arrêtent au hasard. Ils reviennent aux mêmes endroits parce qu''on y mange bien.'
WHERE id = '87';

-- ══ OBSERVER SANS DÉRANGER ═══════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Personne en vue. Pourtant ils sont passés par là. Comment le savoir ?',
  accroches_variantes = ARRAY[
    'Personne en vue. Pourtant ils sont passés par là. Comment le savoir ?',
    'Le sable garde la mémoire. De quoi, à votre avis ?',
    'S''il n''y a pas d''animal visible, c''est qu''il n''y en a pas. Qui est d''accord ?'
  ],
  a_observer = 'Empreintes sur le sable humide, plumes, coquilles percées, petits trous, terriers.',
  a_retenir = 'Les animaux laissent des traces : empreintes, plumes, coquilles ouvertes. On lit leur passage.',
  erreur_frequente = 'On cherche l''animal lui-même. Ce sont ses traces qu''on trouve — et elles racontent autant.'
WHERE id = '61';

UPDATE pedagogical_content SET
  accroche = 'Cet oiseau vient de relever la tête. Qu''est-ce que ça veut dire ?',
  accroches_variantes = ARRAY[
    'Cet oiseau vient de relever la tête. Qu''est-ce que ça veut dire ?',
    'À partir de quand est-ce qu''on dérange un animal ? Quand il s''envole ?',
    'On avance de dix pas, puis on s''arrête. Qui voit le premier changement chez l''oiseau ?'
  ],
  a_observer = 'Le comportement de l''animal : il se nourrit tranquillement, ou il s''arrête et nous fixe ?',
  a_retenir = 'Le dérangement commence bien avant la fuite. Un oiseau qui cesse de manger et lève la tête, c''est déjà trop près.',
  erreur_frequente = 'On croit que tant qu''il ne s''envole pas, tout va bien. Il a déjà arrêté de se nourrir.'
WHERE id = '62';

UPDATE pedagogical_content SET
  accroche = 'Comment faire pour tout voir sans être vu ?',
  accroches_variantes = ARRAY[
    'Comment faire pour tout voir sans être vu ?',
    'Qu''est-ce qui fait fuir un animal : le bruit, le mouvement, ou nous ?',
    'Pour bien observer, il faut s''approcher le plus près possible. Qui est d''accord ?'
  ],
  a_observer = 'L''effet de notre groupe : est-ce que les animaux restent, ou est-ce qu''ils s''éloignent ?',
  a_retenir = 'On voit plus de choses en restant loin et silencieux qu''en s''approchant.',
  erreur_frequente = 'On veut s''approcher pour mieux voir. Plus on s''approche, moins il reste d''animaux à regarder.'
WHERE id = '63';

UPDATE pedagogical_content SET
  accroche = 'Un oiseau qui s''envole à cause de nous, il perd quoi ?',
  accroches_variantes = ARRAY[
    'Un oiseau qui s''envole à cause de nous, il perd quoi ?',
    'Faire fuir un animal, c''est grave ? Il revient, non ?',
    'Comptez combien de fois les oiseaux s''envolent pendant qu''on est là.'
  ],
  a_observer = 'Le nombre de fois où un groupe d''oiseaux s''envole pendant notre présence.',
  a_retenir = 'Chaque fuite coûte de l''énergie à l''animal — celle dont il a besoin pour se nourrir et élever ses petits.',
  erreur_frequente = 'On pense qu''il suffit qu''il revienne. Il a dépensé une énergie qu''il ne récupère pas forcément.'
WHERE id = '64';

UPDATE pedagogical_content SET
  accroche = 'On est douze aujourd''hui. Douze gestes, ça change quelque chose ?',
  accroches_variantes = ARRAY[
    'On est douze aujourd''hui. Douze gestes, ça change quelque chose ?',
    'Qu''est-ce que vous pouvez faire, vous, dès aujourd''hui, pour la biodiversité ?',
    'Un seul geste ne sert à rien à l''échelle de la planète. Qui est d''accord ?'
  ],
  a_observer = 'Ce qu''on peut faire ici, maintenant : un déchet ramassé, une zone respectée, une observation notée.',
  a_retenir = 'Un geste seul paraît minuscule. Multiplié par tous ceux qui passent ici, il change vraiment les choses.',
  erreur_frequente = 'On se dit que c''est trop petit pour compter. C''est justement l''addition de ces gestes qui fait la différence.'
WHERE id = '67';
