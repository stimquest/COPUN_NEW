-- Couche transmission — lot 3 (1/5) : marées avancées, vagues, météo, courants.
--
-- Objectif : couvrir les 65 fiches restantes pour que l'écran « Ce que je vais
-- raconter » ne retombe jamais sur du jargon. Le repli sur le champ `objectif` a été
-- supprimé côté app : « Comprendre les adaptations spécifiques (respiration,
-- camouflage…) » était présenté comme une phrase à dire à des enfants — pire qu'un
-- écran vide. Chaque fiche doit donc porter son propre `a_retenir`.
--
-- Trois registres d'accroche : une question qui interpelle, une invitation à observer,
-- un défi qui met le groupe en action. Contenu ancré sur `explication` et `tip`.

-- ══ MARÉES (suite) ═══════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Comment on peut connaître l''heure de la marée dans dix ans ?',
  accroches_variantes = ARRAY[
    'Comment on peut connaître l''heure de la marée dans dix ans ?',
    'La Lune et le Soleil suivent des trajets connus. Qu''est-ce que ça permet de prévoir ?',
    'Trouvez la marée la plus haute du mois sur le calendrier. Vous avez une minute.'
  ],
  a_observer = 'L''annuaire des marées : les horaires sont donnés à la minute, des mois à l''avance.',
  a_retenir = 'La Lune et le Soleil suivent des trajets qu''on sait calculer. C''est pour ça qu''on connaît les marées à l''avance, à la minute près.',
  erreur_frequente = 'On imagine que la météo influence l''heure des marées. Le vent peut changer la hauteur de l''eau, jamais l''horaire.'
WHERE id = '6';

UPDATE pedagogical_content SET
  accroche = 'Il y a un moment, dans la marée, où le courant est le plus fort. Lequel ?',
  accroches_variantes = ARRAY[
    'Il y a un moment, dans la marée, où le courant est le plus fort. Lequel ?',
    'Regardez l''eau filer autour de ce piquet. Elle va plus vite que tout à l''heure ?',
    'Pariez : à quelle heure le courant sera le plus fort aujourd''hui ?'
  ],
  a_observer = 'La vitesse du courant autour d''un obstacle fixe, en début de marée puis à mi-marée.',
  a_retenir = 'C''est au milieu de la marée que l''eau se déplace le plus vite. C''est le moment où il faut être le plus attentif.',
  erreur_frequente = 'On croit le courant le plus fort à marée haute ou basse. C''est l''inverse : à ces moments-là, il est presque nul.'
WHERE id = '9';

UPDATE pedagogical_content SET
  accroche = 'Le pêcheur, l''oiseau et le crabe ont un point commun. Lequel ?',
  accroches_variantes = ARRAY[
    'Le pêcheur, l''oiseau et le crabe ont un point commun. Lequel ?',
    'Regardez qui vient sur l''estran à marée basse. Ils sont là par hasard ?',
    'Trouvez trois choses, ici, qui ne se passeraient pas à marée haute.'
  ],
  a_observer = 'Ce qui n''existe qu''à marée basse : oiseaux qui fouillent, pêcheurs à pied, coquillages accessibles.',
  a_retenir = 'Ici, tout le monde vit au rythme de la marée : les animaux, les plantes et les humains.',
  erreur_frequente = 'On pense que la marée ne concerne que les bateaux. Elle règle la journée de presque tout ce qui vit sur l''estran.'
WHERE id = '11';

UPDATE pedagogical_content SET
  accroche = 'Certains animaux attendent les grandes marées pour se reproduire. Pourquoi celles-là ?',
  accroches_variantes = ARRAY[
    'Certains animaux attendent les grandes marées pour se reproduire. Pourquoi celles-là ?',
    'Aujourd''hui la mer descend très loin. Qu''est-ce que ça change pour ce qui vit ici ?',
    'Cherchez ce qu''on peut voir aujourd''hui et qu''on ne verrait pas un jour de petite marée.'
  ],
  a_observer = 'La zone découverte aujourd''hui par rapport à d''habitude, et ce qu''elle laisse apparaître.',
  a_retenir = 'Les grandes marées découvrent des zones qu''on ne voit presque jamais. Certaines espèces les attendent pour pondre.',
  erreur_frequente = 'On croit que toutes les marées se valent. Les grandes marées sont des rendez-vous que certaines espèces attendent toute l''année.'
WHERE id = '12';

-- ══ VAGUES ET HOULE (suite) ══════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Une vague avance tranquillement, puis d''un coup elle casse. Qu''est-ce qui s''est passé ?',
  accroches_variantes = ARRAY[
    'Une vague avance tranquillement, puis d''un coup elle casse. Qu''est-ce qui s''est passé ?',
    'Regardez où les vagues cassent. Toujours au même endroit ? Pourquoi là ?',
    'Repérez la ligne où les vagues déferlent, et devinez ce qu''il y a sous l''eau.'
  ],
  a_observer = 'La ligne de déferlement : elle marque l''endroit où le fond remonte.',
  a_retenir = 'Quand le fond remonte, le bas de la vague freine mais le haut continue : elle bascule et casse.',
  erreur_frequente = 'On croit que la vague casse parce qu''elle est trop grosse. Elle casse parce que l''eau devient trop peu profonde.'
WHERE id = '32';

UPDATE pedagogical_content SET
  accroche = 'Tant qu''elle n''a pas cassé, une vague vous soulève. Après, c''est autre chose. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Tant qu''elle n''a pas cassé, une vague vous soulève. Après, c''est autre chose. Pourquoi ?',
    'Observez une vague avant et après qu''elle déferle. Qu''est-ce qui change vraiment ?',
    'Suivez une seule vague des yeux, du large jusqu''au sable. Racontez son voyage.'
  ],
  a_observer = 'Une même vague avant et après le déferlement : elle soulève, puis elle pousse.',
  a_retenir = 'Avant de casser, la vague soulève l''eau. Quand elle casse, toute son énergie se libère d''un coup.',
  erreur_frequente = 'On pense qu''une grosse vague est dangereuse tout le temps. C''est au moment précis où elle déferle qu''elle a le plus de force.'
WHERE id = '35';

UPDATE pedagogical_content SET
  accroche = 'Il n''y a pas un souffle de vent, et pourtant il y a des vagues. D''où viennent-elles ?',
  accroches_variantes = ARRAY[
    'Il n''y a pas un souffle de vent, et pourtant il y a des vagues. D''où viennent-elles ?',
    'Regardez si les vagues sont bien alignées ou en désordre. Ça dit d''où elles viennent.',
    'Comptez les secondes entre deux vagues. Régulier ou pas ? Cherchons pourquoi.'
  ],
  a_observer = 'La régularité des vagues et l''absence — ou non — de vent local.',
  a_retenir = 'La houle est née d''une tempête loin d''ici. Elle continue à voyager même quand le vent s''est arrêté.',
  erreur_frequente = 'On croit qu''il faut du vent ici pour avoir des vagues. La houle arrive de très loin, sans vent sur place.'
WHERE id = '36';

UPDATE pedagogical_content SET
  accroche = 'Ces rochers couverts d''algues ont l''air vides. Regardez de plus près.',
  accroches_variantes = ARRAY[
    'Ces rochers couverts d''algues ont l''air vides. Regardez de plus près.',
    'Sous chaque touffe d''algues, il y a des habitants. Combien on en trouve ?',
    'Trouvez une petite mare entre les rochers et listez ce qui vit dedans, sans rien déplacer.'
  ],
  a_observer = 'Les mares résiduelles et le dessous des algues : anémones, petits crabes, alevins.',
  a_retenir = 'Les rochers couverts d''algues sont pleins de vie. On passe par les accès prévus plutôt que de marcher dessus.',
  erreur_frequente = 'On croit que marcher sur les rochers ne dérange rien. Chaque pas écrase des animaux minuscules qu''on ne voit pas.'
WHERE id = '37';

UPDATE pedagogical_content SET
  accroche = 'En mer, le temps peut changer en quelques minutes. Pourquoi plus vite qu''à terre ?',
  accroches_variantes = ARRAY[
    'En mer, le temps peut changer en quelques minutes. Pourquoi plus vite qu''à terre ?',
    'Regardez l''horizon. Vous voyez quelque chose arriver ?',
    'Photographiez le ciel dans votre tête. On le compare dans une heure.'
  ],
  a_observer = 'L''horizon au large : une ligne sombre, un rideau de pluie, un changement de couleur.',
  a_retenir = 'En mer, rien n''arrête le mauvais temps : il arrive vite. On regarde la météo avant, et le ciel pendant.',
  erreur_frequente = 'On consulte la météo le matin et on n''y pense plus. En mer, elle peut basculer en quelques dizaines de minutes.'
WHERE id = '40';

UPDATE pedagogical_content SET
  accroche = 'Un orage qui arrive, ça nous embête. Et pour les animaux, ça change quoi ?',
  accroches_variantes = ARRAY[
    'Un orage qui arrive, ça nous embête. Et pour les animaux, ça change quoi ?',
    'Avant de sortir, on vérifie deux choses. Lesquelles, à votre avis ?',
    'Trouvez trois signes, maintenant, qui disent si on peut y aller sereinement.'
  ],
  a_observer = 'Les signes d''un changement : ciel qui se charge, vent qui forcit, oiseaux qui rentrent.',
  a_retenir = 'Regarder la météo avant de partir, c''est se protéger — et éviter de déranger les animaux au mauvais moment.',
  erreur_frequente = 'On pense que la météo ne concerne que notre sécurité. Une sortie au mauvais moment dérange aussi la faune.'
WHERE id = '43';

-- ══ MÉTÉO ET NUAGES (suite) ══════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Cette pluie qui tombe ici, elle vient peut-être de l''autre bout de la mer.',
  accroches_variantes = ARRAY[
    'Cette pluie qui tombe ici, elle vient peut-être de l''autre bout de la mer.',
    'L''eau de la mer part dans le ciel, puis revient. Comment fait-elle le voyage ?',
    'Racontez-moi le trajet d''une goutte d''eau, de la mer jusqu''à votre visage.'
  ],
  a_observer = 'Les nuages qui se forment au-dessus de la mer et se déplacent vers la terre.',
  a_retenir = 'L''eau de la mer s''évapore, forme les nuages, puis retombe en pluie — parfois très loin d''où elle est partie.',
  erreur_frequente = 'On croit que la pluie tombe là où l''eau s''est évaporée. Elle peut retomber à des centaines de kilomètres.'
WHERE id = '84';

UPDATE pedagogical_content SET
  accroche = 'Un nuage, ça se fabrique. Il faut trois ingrédients. Lesquels ?',
  accroches_variantes = ARRAY[
    'Un nuage, ça se fabrique. Il faut trois ingrédients. Lesquels ?',
    'Soufflez sur vos mains par temps froid : vous venez de faire un mini-nuage.',
    'Surveillez un nuage qui se forme. Le premier qui le voit apparaître a gagné.'
  ],
  a_observer = 'Un nuage qui grossit ou qui se dissipe pendant qu''on le regarde.',
  a_retenir = 'De l''air chaud et humide qui monte, qui refroidit, et de minuscules poussières : ça fait un nuage.',
  erreur_frequente = 'On croit que le nuage est fait de vapeur invisible. C''est de l''eau redevenue liquide, en gouttelettes.'
WHERE id = '99';

-- ══ COURANTS (suite) ═════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'On dit qu''il y a des rivières dans la mer. Mais sans berges ni fond. Comment c''est possible ?',
  accroches_variantes = ARRAY[
    'On dit qu''il y a des rivières dans la mer. Mais sans berges ni fond. Comment c''est possible ?',
    'Regardez cette bouée : l''eau file autour. Elle va où, cette eau ?',
    'Lâchez un morceau d''algue à l''eau et suivez-le des yeux pendant une minute.'
  ],
  a_observer = 'Un objet flottant qui dérive, ou le remous autour d''une bouée.',
  a_retenir = 'Un courant marin, c''est de l''eau qui se déplace dans la mer, sans berges — poussée par le vent, la marée ou la température.',
  erreur_frequente = 'On imagine un courant visible comme une rivière. Il se repère seulement à ce qu''il déplace.'
WHERE id = '89';

-- ══ VAGUES : la houle ════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Ces vagues bien rangées ont fait des centaines de kilomètres pour arriver ici.',
  accroches_variantes = ARRAY[
    'Ces vagues bien rangées ont fait des centaines de kilomètres pour arriver ici.',
    'Comparez : des vagues en désordre, et des vagues bien alignées. Laquelle vient de loin ?',
    'Chronométrez le temps entre deux vagues. Plus c''est long, plus elles viennent de loin.'
  ],
  a_observer = 'L''alignement et l''espacement des vagues : une houle est régulière, la mer du vent ne l''est pas.',
  a_retenir = 'La houle, ce sont des vagues nées d''une tempête lointaine. En voyageant, elles se sont mises en rang.',
  erreur_frequente = 'On appelle tout « vague ». La houle est régulière et vient de loin ; la mer du vent est courte et se forme sur place.'
WHERE id = '90';

-- ══ OBSERVER ET SE REPÉRER ═══════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Pourquoi on ne part jamais à la même heure d''un jour à l''autre ?',
  accroches_variantes = ARRAY[
    'Pourquoi on ne part jamais à la même heure d''un jour à l''autre ?',
    'Comparez l''horaire d''aujourd''hui et celui de demain sur le tableau. Vous voyez l''écart ?',
    'Prédisez l''heure de mise à l''eau d''après-demain. On vérifiera qui avait juste.'
  ],
  a_observer = 'Le tableau des horaires : environ 50 minutes de décalage chaque jour.',
  a_retenir = 'La marée se décale d''environ 50 minutes par jour. Notre horaire de départ la suit.',
  erreur_frequente = 'On croit que l''horaire est décidé par le club. C''est la marée qui commande, et elle change tous les jours.'
WHERE id = '68';

UPDATE pedagogical_content SET
  accroche = 'Avant de mettre un pied dans l''eau, je regarde quatre choses. Vous en trouvez combien ?',
  accroches_variantes = ARRAY[
    'Avant de mettre un pied dans l''eau, je regarde quatre choses. Vous en trouvez combien ?',
    'Prenez trente secondes pour lire le paysage. Qu''est-ce qui vous saute aux yeux ?',
    'Chacun donne une info utile sur les conditions du jour. On ne répète pas celle du voisin.'
  ],
  a_observer = 'Le vent (sens et force), l''état de la mer, les nuages, l''heure de marée.',
  a_retenir = 'Cinq minutes à regarder le ciel, la mer et le vent avant de partir évitent la plupart des mauvaises surprises.',
  erreur_frequente = 'On regarde surtout s''il fait beau. Le vent et la marée comptent bien plus que le soleil.'
WHERE id = '70';

UPDATE pedagogical_content SET
  accroche = 'Si vous ne voyez plus le club depuis l''eau, comment vous savez où vous êtes ?',
  accroches_variantes = ARRAY[
    'Si vous ne voyez plus le club depuis l''eau, comment vous savez où vous êtes ?',
    'Cherchez sur la côte deux choses hautes et bien visibles. Ce sont vos repères.',
    'Chacun choisit son amer et le montre du doigt. On compare nos repères.'
  ],
  a_observer = 'Les points remarquables de la côte : clocher, phare, château d''eau, grande maison.',
  a_retenir = 'Un amer, c''est un repère fixe et visible de loin. En croiser deux permet de savoir où on se trouve.',
  erreur_frequente = 'On se repère sur un bateau ou une bouée. Ça bouge — il faut un point à terre qui ne bouge pas.'
WHERE id = '71';

UPDATE pedagogical_content SET
  accroche = 'Vous voyez quelque chose d''inhabituel sur la plage. Vous en faites quoi ?',
  accroches_variantes = ARRAY[
    'Vous voyez quelque chose d''inhabituel sur la plage. Vous en faites quoi ?',
    'Un animal échoué, un filet abandonné, une nappe bizarre : à qui on le dit ?',
    'Repérez une chose qui n''a rien à faire ici. On décide ensemble quoi en faire.'
  ],
  a_observer = 'Ce qui détonne : espèce échouée, pollution, matériel abandonné, couleur anormale de l''eau.',
  a_retenir = 'Nos yeux servent à quelque chose : signaler ce qui est anormal peut déclencher une vraie action.',
  erreur_frequente = 'On se dit que quelqu''un d''autre l''a sûrement déjà signalé. Souvent, personne ne l''a fait.'
WHERE id = '72';

-- ══ OBSERVER : la posture ════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Quelle est la différence entre regarder et observer ?',
  accroches_variantes = ARRAY[
    'Quelle est la différence entre regarder et observer ?',
    'Choisissez un animal et posez-vous trois questions sur lui. Lesquelles ?',
    'Deux minutes de silence face à la mer. Chacun revient avec une question.'
  ],
  a_observer = 'Ce qui intrigue : un comportement, une forme, une couleur inattendue.',
  a_retenir = 'Regarder, tout le monde le fait. Observer, c''est se demander pourquoi c''est comme ça.',
  erreur_frequente = 'On croit qu''observer, c''est avoir de bons yeux. C''est surtout se poser des questions.'
WHERE id = '92';

UPDATE pedagogical_content SET
  accroche = 'Fermez les yeux dix secondes. Qu''est-ce que vous apprenez sur cet endroit ?',
  accroches_variantes = ARRAY[
    'Fermez les yeux dix secondes. Qu''est-ce que vous apprenez sur cet endroit ?',
    'Il y a des choses ici qu''on ne peut pas voir. Comment les repérer quand même ?',
    'Défi : trois informations sur ce lieu sans utiliser vos yeux.'
  ],
  a_observer = 'Les sons (cris d''oiseaux, ressac), les odeurs (algues, vase), le vent sur la peau.',
  a_retenir = 'Les yeux ne suffisent pas : le bruit, les odeurs et le vent racontent aussi ce qui se passe ici.',
  erreur_frequente = 'On observe uniquement avec les yeux. L''oreille repère souvent un oiseau bien avant le regard.'
WHERE id = '93';

UPDATE pedagogical_content SET
  accroche = 'Pour repérer quelque chose de bizarre, il faut d''abord savoir ce qui est normal. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Pour repérer quelque chose de bizarre, il faut d''abord savoir ce qui est normal. Pourquoi ?',
    'Qu''est-ce qu''on voit ici absolument tout le temps ? Faites-en la liste.',
    'Trouvez une chose habituelle et une chose inhabituelle sur cette plage.'
  ],
  a_observer = 'Les espèces et éléments qu''on retrouve à chaque séance — puis ce qui sort du lot.',
  a_retenir = 'Connaître ce qui est ordinaire ici, c''est ce qui permet de remarquer ce qui ne l''est pas.',
  erreur_frequente = 'On croit qu''il faut être expert pour observer. Il suffit de bien connaître son coin.'
WHERE id = '94';

UPDATE pedagogical_content SET
  accroche = 'On peut abîmer quelque chose juste en le regardant de trop près. Comment ?',
  accroches_variantes = ARRAY[
    'On peut abîmer quelque chose juste en le regardant de trop près. Comment ?',
    'Observez cet animal et surveillez sa réaction. Il vous a repérés ?',
    'Approchez-vous doucement et arrêtez-vous dès qu''il change de comportement.'
  ],
  a_observer = 'La réaction de l''animal quand on approche : il continue, ou il se fige ?',
  a_retenir = 'Un bon observateur ne laisse pas de trace. Si l''animal change de comportement, c''est qu''on est trop près.',
  erreur_frequente = 'On pense qu''observer est sans conséquence. S''approcher trop coûte de l''énergie à l''animal.'
WHERE id = '95';

-- ══ LE VIVANT ET NOUS ════════════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Pourquoi il y a autant de vie ici, entre la terre et la mer ?',
  accroches_variantes = ARRAY[
    'Pourquoi il y a autant de vie ici, entre la terre et la mer ?',
    'Comptez combien de milieux différents on voit d''ici : sable, rochers, dune, eau…',
    'Trouvez un endroit où deux milieux se rencontrent, et regardez ce qui y vit.'
  ],
  a_observer = 'La juxtaposition des milieux : sable, rochers, mares, dune, eau — chacun avec ses habitants.',
  a_retenir = 'Le littoral est un carrefour entre la terre et la mer. Deux mondes qui se rencontrent, ça fait beaucoup plus de vie.',
  erreur_frequente = 'On voit une plage comme un endroit vide. C''est un des milieux les plus riches qui soient.'
WHERE id = '57';

UPDATE pedagogical_content SET
  accroche = 'Cette plage ne sert pas à la même chose en avril et en octobre. Pour qui ?',
  accroches_variantes = ARRAY[
    'Cette plage ne sert pas à la même chose en avril et en octobre. Pour qui ?',
    'Qui habite cette plage cette semaine ? Cherchons des indices.',
    'Trouvez un signe de qui vit ici en ce moment : nid, jeunes, groupe posé.'
  ],
  a_observer = 'Les indices du moment : nids, jeunes oiseaux, groupes en halte, terriers actifs.',
  a_retenir = 'Le même endroit sert de nurserie au printemps et d''étape de voyage en automne. Chaque saison a ses habitants.',
  erreur_frequente = 'On croit que les mêmes animaux sont là toute l''année. Le littoral change complètement d''occupants selon la saison.'
WHERE id = '65';

UPDATE pedagogical_content SET
  accroche = 'Nous, on repart ce soir. Eux, ils habitent ici. Ça change quoi ?',
  accroches_variantes = ARRAY[
    'Nous, on repart ce soir. Eux, ils habitent ici. Ça change quoi ?',
    'Combien d''espèces vivent ici en permanence, à votre avis ?',
    'Regardez derrière vous en partant : est-ce qu''on voit qu''on est passés ?'
  ],
  a_observer = 'Les traces qu''on laisse : empreintes, affaires posées, bruit, zones piétinées.',
  a_retenir = 'On est de passage, eux sont chez eux. On repart en laissant l''endroit comme on l''a trouvé.',
  erreur_frequente = 'On se sent chez soi sur une plage publique. C''est d''abord le lieu de vie permanent de centaines d''espèces.'
WHERE id = '66';

UPDATE pedagogical_content SET
  accroche = 'Le vent fait les vagues, les vagues font la plage, la plage abrite des animaux. Et après ?',
  accroches_variantes = ARRAY[
    'Le vent fait les vagues, les vagues font la plage, la plage abrite des animaux. Et après ?',
    'Enlevez le vent : qu''est-ce qui disparaît d''autre ?',
    'Construisons la chaîne à voix haute : chacun ajoute un maillon.'
  ],
  a_observer = 'Un enchaînement visible ici : le vent, le sable déplacé, les plantes qui le retiennent, les animaux qui s''y abritent.',
  a_retenir = 'Ici, tout est relié : changer une chose déplace tout le reste.',
  erreur_frequente = 'On regarde chaque élément séparément. Le vent, l''eau, le sable et les animaux forment un seul système.'
WHERE id = '69';

UPDATE pedagogical_content SET
  accroche = 'La règle la plus simple pour protéger cet endroit tient en quatre mots. Vous les trouvez ?',
  accroches_variantes = ARRAY[
    'La règle la plus simple pour protéger cet endroit tient en quatre mots. Vous les trouvez ?',
    'Regardez autour de vous : qu''est-ce qui ne devrait pas être là ?',
    'En partant, chacun vérifie son mètre carré. On ne laisse rien.'
  ],
  a_observer = 'L''endroit avant qu''on arrive et après qu''on parte : y a-t-il une différence ?',
  a_retenir = 'Ne rien laisser derrière soi. C''est la règle la plus simple et la plus efficace.',
  erreur_frequente = 'On pense qu''un petit déchet ne compte pas. Multiplié par tous les passages, ça fait une plage transformée.'
WHERE id = '73';

UPDATE pedagogical_content SET
  accroche = 'Imaginez que quelqu''un traverse votre salon sans prévenir. C''est ce qu''on fait ici.',
  accroches_variantes = ARRAY[
    'Imaginez que quelqu''un traverse votre salon sans prévenir. C''est ce qu''on fait ici.',
    'Regardez où on met les pieds. Qui habite là ?',
    'Trouvez un chemin jusqu''à l''eau qui dérange le moins de monde possible.'
  ],
  a_observer = 'Les zones habitées qu''on traverse : mares, touffes d''algues, laisse de mer, dune.',
  a_retenir = 'On est chez eux. On contourne plutôt que de traverser, on regarde plutôt que de toucher.',
  erreur_frequente = 'On prend le chemin le plus court. Il passe souvent par les zones les plus fragiles.'
WHERE id = '74';

-- ══ LES ACTIVITÉS HUMAINES ═══════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Comptez combien de métiers différents vivent de cette mer.',
  accroches_variantes = ARRAY[
    'Comptez combien de métiers différents vivent de cette mer.',
    'Regardez autour : qui d''autre utilise cet endroit en ce moment ?',
    'Trouvez trois indices d''une activité humaine, sans compter la nôtre.'
  ],
  a_observer = 'Les traces d''usages : bateaux de pêche, parcs à huîtres, promeneurs, cabanes, bouées de mouillage.',
  a_retenir = 'La mer et la plage servent à beaucoup de monde en même temps : pêcheurs, ostréiculteurs, promeneurs, sportifs.',
  erreur_frequente = 'On croit la plage réservée aux vacanciers. C''est aussi un lieu de travail pour beaucoup de gens.'
WHERE id = '75';

UPDATE pedagogical_content SET
  accroche = 'Un tout petit déchet peut tuer un gros animal. Comment ?',
  accroches_variantes = ARRAY[
    'Un tout petit déchet peut tuer un gros animal. Comment ?',
    'Cherchez ce que l''homme a laissé ici. Qu''est-ce que ça peut faire à un animal ?',
    'Trouvez l''objet le plus petit qui n''a rien à faire sur cette plage.'
  ],
  a_observer = 'Les traces de notre passage : déchets, sentiers creusés, zones piétinées, bruit.',
  a_retenir = 'Chaque activité laisse une trace. Même minuscule, un déchet peut être avalé par un animal.',
  erreur_frequente = 'On juge un déchet à sa taille. Les plus petits sont souvent les plus dangereux, parce qu''ils sont avalés.'
WHERE id = '76';

UPDATE pedagogical_content SET
  accroche = 'Peut-on gagner sa vie avec la mer sans l''abîmer ?',
  accroches_variantes = ARRAY[
    'Peut-on gagner sa vie avec la mer sans l''abîmer ?',
    'Regardez les bateaux : lesquels ont l''air de faire attention à l''environnement ?',
    'Trouvez une activité d''ici qui pourrait durer encore cent ans sans épuiser la mer.'
  ],
  a_observer = 'Les activités visibles et ce qu''elles prélèvent ou rejettent.',
  a_retenir = 'L''économie bleue, c''est vivre de la mer sans l''épuiser — pour que ça marche encore dans cinquante ans.',
  erreur_frequente = 'On oppose économie et environnement. Une mer vidée ne fait plus vivre personne.'
WHERE id = '77';

UPDATE pedagogical_content SET
  accroche = 'Le matériel qu''on utilise aujourd''hui n''est plus celui d''il y a dix ans. Qu''est-ce qui a changé ?',
  accroches_variantes = ARRAY[
    'Le matériel qu''on utilise aujourd''hui n''est plus celui d''il y a dix ans. Qu''est-ce qui a changé ?',
    'Regardez notre matériel : qu''est-ce qui pourrait être fait autrement ?',
    'Trouvez une chose, ici, qui montre qu''on essaie de faire mieux qu''avant.'
  ],
  a_observer = 'Le matériel du club et les aménagements : matériaux, mouillages, zones balisées.',
  a_retenir = 'Les pratiques changent : matériaux recyclés, mouillages qui abîment moins le fond, zones protégées.',
  erreur_frequente = 'On croit que rien ne bouge. Beaucoup de choses ont déjà changé, souvent sans qu''on le remarque.'
WHERE id = '78';

UPDATE pedagogical_content SET
  accroche = 'Ce qu''on met dans notre assiette change ce qui se passe dans la mer. Comment ?',
  accroches_variantes = ARRAY[
    'Ce qu''on met dans notre assiette change ce qui se passe dans la mer. Comment ?',
    'Un poisson pêché correctement et un autre pêché n''importe comment : on peut faire la différence ?',
    'Listez ce que vous avez apporté aujourd''hui. Combien finira à la poubelle ?'
  ],
  a_observer = 'Nos propres affaires : emballages jetables ou réutilisables, gourdes, matériel durable.',
  a_retenir = 'Chaque achat est un choix. Préférer une pêche durable et éviter le jetable, c''est agir même loin de la mer.',
  erreur_frequente = 'On pense qu''il faut habiter au bord de mer pour agir. Les choix du quotidien comptent autant.'
WHERE id = '79';

UPDATE pedagogical_content SET
  accroche = 'Avec un téléphone, vous pouvez aider de vrais scientifiques. Vous voyez comment ?',
  accroches_variantes = ARRAY[
    'Avec un téléphone, vous pouvez aider de vrais scientifiques. Vous voyez comment ?',
    'Cette observation qu''on vient de faire pourrait servir à quelqu''un. À qui ?',
    'Photographiez une espèce et essayons de l''identifier ensemble.'
  ],
  a_observer = 'Une espèce identifiable, sa localisation et la date — les trois infos qui font une donnée utile.',
  a_retenir = 'Une photo géolocalisée envoyée sur iNaturalist ou OBSenMER devient une vraie donnée scientifique.',
  erreur_frequente = 'On croit qu''il faut être expert. Une photo bien située vaut déjà beaucoup pour les chercheurs.'
WHERE id = '80';

UPDATE pedagogical_content SET
  accroche = 'Aucun scientifique ne peut être partout. Qui peut l''aider ?',
  accroches_variantes = ARRAY[
    'Aucun scientifique ne peut être partout. Qui peut l''aider ?',
    'On est douze aujourd''hui, sur cette plage. Combien de paires d''yeux ça fait par saison ?',
    'Notez une observation du jour. Si tout le monde le faisait, ça donnerait quoi ?'
  ],
  a_observer = 'Ce qu''on voit et que peu de gens voient : espèces, comportements, changements du site.',
  a_retenir = 'Des milliers d''yeux valent mieux qu''un seul. Ce qu''on observe ici peut compléter ce que les scientifiques savent.',
  erreur_frequente = 'On pense que notre observation ne vaut rien. C''est leur nombre qui fait leur valeur.'
WHERE id = '81';

-- ══ PROTÉGER LE TERRITOIRE ═══════════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Ce qu''on jette dans l''eau finit par revenir dans notre assiette. Par quel chemin ?',
  accroches_variantes = ARRAY[
    'Ce qu''on jette dans l''eau finit par revenir dans notre assiette. Par quel chemin ?',
    'Pourquoi on interdit parfois la baignade ou la pêche à pied ici ?',
    'Retracez le trajet d''un déchet, de la poubelle jusqu''à notre repas.'
  ],
  a_observer = 'Les panneaux de qualité des eaux, les interdictions temporaires de pêche à pied.',
  a_retenir = 'Protéger l''environnement, c''est aussi se protéger : eau de baignade, coquillages, air — tout nous revient.',
  erreur_frequente = 'On sépare la nature et notre santé. Ce qu''on rejette finit par nous atteindre.'
WHERE id = '98';

UPDATE pedagogical_content SET
  accroche = 'L''eau, le poisson, le sable : est-ce qu''il y en aura toujours autant ?',
  accroches_variantes = ARRAY[
    'L''eau, le poisson, le sable : est-ce qu''il y en aura toujours autant ?',
    'Une ressource qui se renouvelle, ça veut dire qu''elle est infinie ?',
    'Citez une chose ici qui se renouvelle, et une qui ne se renouvelle pas.'
  ],
  a_observer = 'Ce qui est prélevé sur ce site : coquillages, poissons, sable, eau.',
  a_retenir = 'Les ressources se renouvellent, mais à leur rythme. Si on prend plus vite qu''elles ne repoussent, elles s''épuisent.',
  erreur_frequente = 'On croit qu''une ressource renouvelable est inépuisable. Tout dépend de la vitesse à laquelle on la prélève.'
WHERE id = '109';

UPDATE pedagogical_content SET
  accroche = 'Ce bout de plastique sera encore là quand vous serez grands-parents.',
  accroches_variantes = ARRAY[
    'Ce bout de plastique sera encore là quand vous serez grands-parents.',
    'Un plastique dans la mer, il devient quoi avec le temps ?',
    'Cherchez le plus petit morceau de plastique que vous pouvez trouver dans le sable.'
  ],
  a_observer = 'Les microplastiques mêlés au sable, et les plastiques plus gros dans la laisse de mer.',
  a_retenir = 'Le plastique ne disparaît pas : il se casse en morceaux de plus en plus petits, que les animaux avalent.',
  erreur_frequente = 'On croit qu''un plastique finit par se décomposer. Il se fragmente seulement, et reste là des siècles.'
WHERE id = '110';

UPDATE pedagogical_content SET
  accroche = 'En quelques kilomètres ici, on passe de la mer au bocage. C''est rare, à votre avis ?',
  accroches_variantes = ARRAY[
    'En quelques kilomètres ici, on passe de la mer au bocage. C''est rare, à votre avis ?',
    'Combien de paysages différents on voit depuis cet endroit ?',
    'Décrivez ce qu''on trouverait en marchant droit vers l''intérieur des terres.'
  ],
  a_observer = 'La succession des milieux depuis la mer : estran, dune, prés salés, plaine, bocage.',
  a_retenir = 'La Normandie enchaîne mer, littoral, plaine et bocage sur peu de distance. Cette variété fait sa richesse — et sa fragilité.',
  erreur_frequente = 'On voit un paysage ordinaire. C''est une mosaïque de milieux rare, où chaque zone abrite des espèces différentes.'
WHERE id = '111';

UPDATE pedagogical_content SET
  -- Correction : la fiche avançait « 34 sites avec une partie marine ». La DREAL
  -- Normandie recense 94 sites Natura 2000 au total, dont 31 comportant une partie
  -- marine (23 majoritairement marins) ; les 34 correspondent aux sites placés sous
  -- autorité administrative de l'État, un autre découpage.
  -- Source : DREAL Normandie — Natura 2000 en mer.
  tip = 'La Normandie compte 94 sites Natura 2000, dont une trentaine avec une partie marine : estuaires, zones littorales, bancs de sable.',
  explication = 'Natura 2000 est un réseau européen de zones où la nature est suivie et protégée sans interdire toute activité : on y concilie usages humains et préservation des habitats. La Normandie compte 94 sites, dont une trentaine comportent une partie marine — estuaires, zones littorales, bancs de sable — soit environ 775 000 hectares de domaine marin.',
  accroche = 'Cet endroit est peut-être protégé par une loi européenne, sans que ça se voie.',
  accroches_variantes = ARRAY[
    'Cet endroit est peut-être protégé par une loi européenne, sans que ça se voie.',
    'Une zone protégée, ça veut dire qu''on ne peut plus rien y faire ?',
    'Cherchez un panneau ou un balisage qui indique une zone particulière.'
  ],
  a_observer = 'Les panneaux d''information, les balisages de zones sensibles, les périmètres signalés.',
  a_retenir = 'Protégé ne veut pas dire interdit : ça veut dire surveillé, pour que les activités et la nature tiennent ensemble.',
  erreur_frequente = 'On imagine une réserve fermée au public. Natura 2000 organise la cohabitation plutôt que d''interdire.'
WHERE id = '112';

UPDATE pedagogical_content SET
  accroche = 'On reste cinq minutes sans bouger avant d''y aller. Pourquoi, à votre avis ?',
  accroches_variantes = ARRAY[
    'On reste cinq minutes sans bouger avant d''y aller. Pourquoi, à votre avis ?',
    'Regardez où les vagues cassent, et où l''eau est plus calme. Vous voyez la différence ?',
    'Comptez les vagues : elles arrivent par séries. Combien dans une série ?'
  ],
  a_observer = 'La fréquence des grosses séries, l''endroit où les vagues cassent, les zones calmes entre deux.',
  a_retenir = 'Cinq minutes à regarder la mer depuis le bord avant d''y aller : c''est ce qui évite la plupart des problèmes.',
  erreur_frequente = 'On juge la mer en un coup d''œil. Les grosses vagues arrivent par séries — il faut attendre pour les voir.'
WHERE id = '120';

-- ══ MÉTÉO : NUAGES (approfondissement) ═══════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Plus on monte, plus il fait froid. Qu''est-ce que ça change pour l''eau dans l''air ?',
  accroches_variantes = ARRAY[
    'Plus on monte, plus il fait froid. Qu''est-ce que ça change pour l''eau dans l''air ?',
    'Regardez la base des nuages : ils commencent tous à peu près à la même hauteur. Pourquoi ?',
    'Cherchez un nuage qui se forme sous vos yeux et suivez-le.'
  ],
  a_observer = 'La base des nuages, toujours à peu près à la même altitude — c''est là que l''air devient assez froid.',
  a_retenir = 'En montant, l''air se refroidit et ne peut plus garder son eau : elle se transforme en gouttelettes. C''est le nuage.',
  erreur_frequente = 'On pense que les nuages se forment n''importe où. Ils apparaissent à l''altitude précise où l''air devient trop froid.'
WHERE id = '100';

UPDATE pedagogical_content SET
  accroche = 'Les nuages annoncent le temps qu''il fera. Comment les lire ?',
  accroches_variantes = ARRAY[
    'Les nuages annoncent le temps qu''il fera. Comment les lire ?',
    'Regardez la forme des nuages, pas seulement leur couleur. Fins, en amas, en tour ?',
    'Pariez sur le temps de cet après-midi en regardant seulement le ciel.'
  ],
  a_observer = 'Un voile fin et haut, des amas qui grossissent, ou un nuage qui monte en tour.',
  a_retenir = 'Un voile fin annonce un changement en douceur. Des nuages qui gonflent vers le haut annoncent de l''instabilité.',
  erreur_frequente = 'On regarde si le ciel est gris ou bleu. C''est la forme et l''évolution des nuages qui renseignent vraiment.'
WHERE id = '101';

UPDATE pedagogical_content SET
  accroche = 'Le matin le vent vient de la terre, l''après-midi de la mer. Qui a donné l''ordre ?',
  accroches_variantes = ARRAY[
    'Le matin le vent vient de la terre, l''après-midi de la mer. Qui a donné l''ordre ?',
    'Touchez le sable, puis l''eau. Le plus chaud des deux fabrique le vent.',
    'Notez le sens du vent maintenant. On revérifie en fin de séance.'
  ],
  a_observer = 'Le sens du vent au fil de la journée, et l''écart de température entre le sable et l''eau.',
  a_retenir = 'La terre chauffe plus vite que la mer : l''air chaud monte au-dessus du sable et l''air frais de la mer vient le remplacer.',
  erreur_frequente = 'On croit que le vent vient toujours du même côté. Près des côtes, il peut s''inverser entre le matin et l''après-midi.'
WHERE id = '102';

UPDATE pedagogical_content SET
  accroche = 'Ces oiseaux ont fait des milliers de kilomètres. Si cette plage disparaît, ils vont où ?',
  accroches_variantes = ARRAY[
    'Ces oiseaux ont fait des milliers de kilomètres. Si cette plage disparaît, ils vont où ?',
    'Regardez les oiseaux qui se nourrissent : ils rechargent leurs batteries pour la suite du voyage.',
    'Repérez un groupe d''oiseaux posés et devinez depuis combien de temps ils sont là.'
  ],
  a_observer = 'Les zones de repos et de nourrissage : vasières, bancs de sable, prés salés.',
  a_retenir = 'Les oiseaux migrateurs ont besoin d''étapes précises pour se nourrir. Sans elles, le voyage échoue.',
  erreur_frequente = 'On croit qu''un oiseau peut s''arrêter n''importe où. Il revient à des sites précis, et il en a besoin.'
WHERE id = '103';

-- ══ VAGUES ET HOULE (technique) ══════════════════════════════════════════════
UPDATE pedagogical_content SET
  accroche = 'Pour faire une grosse vague, il faut trois ingrédients. Vous les devinez ?',
  accroches_variantes = ARRAY[
    'Pour faire une grosse vague, il faut trois ingrédients. Vous les devinez ?',
    'Le vent souffle depuis ce matin. Est-ce que les vagues ont grossi ?',
    'Comparez les vagues du côté abrité et du côté exposé. Même vent, même taille ?'
  ],
  a_observer = 'La force du vent, depuis combien de temps il souffle, et la distance de mer libre devant nous.',
  a_retenir = 'Trois choses font la taille des vagues : la force du vent, le temps qu''il souffle, et la distance de mer qu''il traverse.',
  erreur_frequente = 'On ne retient que la force du vent. Un vent modéré qui souffle longtemps sur une grande distance lève de plus grosses vagues.'
WHERE id = '104';

UPDATE pedagogical_content SET
  accroche = 'Quand le vent et la houle vont dans des sens opposés, la mer devient désagréable. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Quand le vent et la houle vont dans des sens opposés, la mer devient désagréable. Pourquoi ?',
    'Regardez le sens du vent, puis celui des vagues. Ils vont ensemble ?',
    'Trouvez le sens du vent et celui de la houle, chacun de son côté. On compare.'
  ],
  a_observer = 'Le sens du vent et celui des vagues : dans le même sens, ou l''un contre l''autre ?',
  a_retenir = 'Vent contre houle, la mer devient courte et hachée : c''est là qu''on est le plus secoué.',
  erreur_frequente = 'On regarde seulement la force du vent. C''est le désaccord entre vent et houle qui rend la mer difficile.'
WHERE id = '105';

UPDATE pedagogical_content SET
  accroche = 'Avant de partir, on vérifie trois choses côté marée. Lesquelles ?',
  accroches_variantes = ARRAY[
    'Avant de partir, on vérifie trois choses côté marée. Lesquelles ?',
    'Regardez le tableau : la mer monte ou descend en ce moment ?',
    'Trouvez sur l''eau un endroit où le courant est visiblement plus fort.'
  ],
  a_observer = 'L''heure de la prochaine marée, le coefficient, et les zones où l''eau file plus vite.',
  a_retenir = 'Avant de partir : l''heure de la marée, son coefficient, et où le courant sera fort.',
  erreur_frequente = 'On regarde l''heure de la marée sans le coefficient. C''est lui qui dit si le courant sera gérable.'
WHERE id = '106';

UPDATE pedagogical_content SET
  accroche = 'Regarder la mer cinq minutes avant de partir, ça sert à quoi concrètement ?',
  accroches_variantes = ARRAY[
    'Regarder la mer cinq minutes avant de partir, ça sert à quoi concrètement ?',
    'D''après ce que vous voyez, on y va ou on attend ?',
    'Chacun donne un argument pour ou contre la sortie du jour.'
  ],
  a_observer = 'Vagues, houle, vent, courant : ce qu''ils annoncent ensemble pour la séance.',
  a_retenir = 'Lire la mer avant d''y aller permet de choisir le bon matériel, le bon endroit — ou de renoncer.',
  erreur_frequente = 'On décide d''y aller parce que c''était prévu. Les conditions du jour comptent plus que le programme.'
WHERE id = '107';

UPDATE pedagogical_content SET
  accroche = 'Comptez les secondes entre deux vagues. Ce chiffre raconte quelque chose.',
  accroches_variantes = ARRAY[
    'Comptez les secondes entre deux vagues. Ce chiffre raconte quelque chose.',
    'Des vagues rapprochées ou espacées : lesquelles viennent de loin ?',
    'Défi : chronométrez la période de la houle. Chacun son chiffre, on compare.'
  ],
  a_observer = 'Le temps entre deux crêtes qui passent au même point.',
  a_retenir = 'La période, c''est le temps entre deux vagues. Plus il est long, plus la houle vient de loin et porte d''énergie.',
  erreur_frequente = 'On juge la mer à la hauteur des vagues. Une houle longue, même basse, peut être puissante.'
WHERE id = '108';

UPDATE pedagogical_content SET
  accroche = 'Même jour, même vent : ici c''est calme, à un kilomètre c''est agité. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Même jour, même vent : ici c''est calme, à un kilomètre c''est agité. Pourquoi ?',
    'Regardez la forme de la côte. Où est-ce qu''on serait le plus abrité ?',
    'Trouvez le coin le plus calme visible d''ici, et expliquez pourquoi il l''est.'
  ],
  a_observer = 'La forme de la côte : caps exposés, baies abritées, hauts-fonds où les vagues cassent au large.',
  a_retenir = 'La forme de la côte change tout : un cap prend la houle de plein fouet, une baie l''amortit.',
  erreur_frequente = 'On croit que la mer est pareille partout dans le secteur. Quelques centaines de mètres suffisent à tout changer.'
WHERE id = '113';

UPDATE pedagogical_content SET
  accroche = 'Il y a une façon de classer les nuages. Vous devineriez sur quels critères ?',
  accroches_variantes = ARRAY[
    'Il y a une façon de classer les nuages. Vous devineriez sur quels critères ?',
    'Regardez le ciel : combien d''étages de nuages vous distinguez ?',
    'Chacun choisit un nuage et le décrit : haut ou bas ? en amas ou en couche ?'
  ],
  a_observer = 'L''altitude des nuages, leur forme (en amas, en couche, en filaments) et s''ils portent la pluie.',
  a_retenir = 'On classe les nuages selon trois choses : leur hauteur, leur forme, et s''ils donnent de la pluie.',
  erreur_frequente = 'On croit que les noms de nuages sont arbitraires. Ils décrivent exactement la hauteur et la forme.'
WHERE id = '114';

UPDATE pedagogical_content SET
  accroche = 'Un nuage qui monte comme une tour, avec une base sombre : on rentre ou on continue ?',
  accroches_variantes = ARRAY[
    'Un nuage qui monte comme une tour, avec une base sombre : on rentre ou on continue ?',
    'Cherchez dans le ciel le nuage le plus haut. À quoi ressemble sa forme ?',
    'Le premier qui repère un nuage à développement vertical prévient tout le monde.'
  ],
  a_observer = 'Un nuage qui grandit vers le haut, base sombre et sommet en enclume.',
  a_retenir = 'Le cumulonimbus monte très haut et sa base est sombre. Il annonce pluie forte, grêle ou orage : on ne prend pas de risque.',
  erreur_frequente = 'On attend d''entendre le tonnerre. Le nuage se voit bien avant qu''on l''entende — c''est là qu''il faut décider.'
WHERE id = '115';

-- ══ NIVEAU 4 : approfondissements ════════════════════════════════════════════
-- Fiches destinées aux groupes déjà sensibilisés. Le langage reste simple : c'est le
-- sujet qui est plus exigeant, pas la formulation.

UPDATE pedagogical_content SET
  accroche = 'Les hirondelles arrivent plus tôt qu''avant. Qu''est-ce que ça nous dit ?',
  accroches_variantes = ARRAY[
    'Les hirondelles arrivent plus tôt qu''avant. Qu''est-ce que ça nous dit ?',
    'Si on note chaque année la date d''arrivée d''un oiseau, qu''est-ce qu''on découvre ?',
    'Cherchez qui est arrivé cette semaine. Est-ce la saison habituelle pour cette espèce ?'
  ],
  a_observer = 'Les espèces présentes aujourd''hui, et si leur venue correspond à la saison attendue.',
  a_retenir = 'La phénologie, c''est la date à laquelle les oiseaux arrivent et repartent. Ces dates se décalent d''année en année.',
  erreur_frequente = 'On croit que les migrations sont réglées comme une horloge. Les dates bougent, et c''est justement ce qui alerte les scientifiques.'
WHERE id = '116';

UPDATE pedagogical_content SET
  accroche = 'Un oiseau qui arrive trop tôt peut ne pas trouver à manger. Comment c''est possible ?',
  accroches_variantes = ARRAY[
    'Un oiseau qui arrive trop tôt peut ne pas trouver à manger. Comment c''est possible ?',
    'Le climat change. Pour un oiseau migrateur, ça change quoi concrètement ?',
    'Imaginez : vous arrivez au restaurant trois semaines avant l''ouverture. C''est le problème de ces oiseaux.'
  ],
  a_observer = 'Les espèces présentes, et si leur nourriture habituelle est déjà disponible.',
  a_retenir = 'Avec le climat qui change, les oiseaux arrivent plus tôt — parfois avant que leur nourriture soit là.',
  erreur_frequente = 'On pense que s''adapter suffit. Le problème est le décalage : l''oiseau change ses dates, mais pas sa nourriture au même rythme.'
WHERE id = '117';

UPDATE pedagogical_content SET
  accroche = 'La nourriture de la mer est surtout au fond. Comment elle remonte ?',
  accroches_variantes = ARRAY[
    'La nourriture de la mer est surtout au fond. Comment elle remonte ?',
    'Pourquoi certains coins de mer sont pleins de poissons et d''autres presque vides ?',
    'Cherchez un endroit où les oiseaux se rassemblent. Il s''y passe quelque chose sous l''eau.'
  ],
  a_observer = 'Les rassemblements d''oiseaux en mer : ils signalent souvent une remontée de nourriture.',
  a_retenir = 'Les courants remontent la nourriture des profondeurs vers la surface. Là où ils le font, la vie abonde.',
  erreur_frequente = 'On croit la mer uniformément peuplée. La vie se concentre là où les courants apportent de quoi manger.'
WHERE id = '118';

UPDATE pedagogical_content SET
  accroche = 'Trois choses font tourner les courants de surface. Le vent en est une. Les autres ?',
  accroches_variantes = ARRAY[
    'Trois choses font tourner les courants de surface. Le vent en est une. Les autres ?',
    'La Terre tourne. Est-ce que ça a un effet sur l''eau de la mer ?',
    'Regardez la carte : trouvez un endroit où la côte doit forcément dévier le courant.'
  ],
  a_observer = 'Le sens du vent, la forme de la côte, et le sens réel du courant : les trois concordent-ils ?',
  a_retenir = 'Le vent pousse l''eau, la rotation de la Terre la fait dévier, et la forme des côtes la canalise.',
  erreur_frequente = 'On attribue tout au vent. La rotation de la Terre dévie les courants, ce qui explique qu''ils ne suivent pas exactement le vent.'
WHERE id = '119';

UPDATE pedagogical_content SET
  accroche = 'Il y a des signes qui disent « rentrez maintenant ». Vous en connaissez ?',
  accroches_variantes = ARRAY[
    'Il y a des signes qui disent « rentrez maintenant ». Vous en connaissez ?',
    'Regardez la surface de l''eau : de l''écume qui s''étale partout, ça annonce quoi ?',
    'Chacun repère un signe d''alerte possible. On fait la liste ensemble.'
  ],
  a_observer = 'Écume qui s''étend, drapeaux qui se raidissent, horizon qui se voile, nuages sombres qui approchent.',
  a_retenir = 'Écume partout, drapeaux tendus, horizon qui disparaît : ce sont les signes qu''il faut rentrer.',
  erreur_frequente = 'On attend d''être gêné pour réagir. Ces signes apparaissent avant que les conditions deviennent difficiles.'
WHERE id = '121';

UPDATE pedagogical_content SET
  accroche = 'Le vent tombe, mais les vagues restent. Comment expliquer ça ?',
  accroches_variantes = ARRAY[
    'Le vent tombe, mais les vagues restent. Comment expliquer ça ?',
    'Comparez : vagues courtes et hachées, ou longues et régulières. Laquelle est née ici ?',
    'Coupez le son du vent dans votre tête et regardez la mer. Elle vient d''où, cette énergie ?'
  ],
  a_observer = 'La présence de vagues alors que le vent local est faible ou nul.',
  a_retenir = 'Une vague de vent naît ici et meurt avec lui. Une houle est née ailleurs et continue toute seule.',
  erreur_frequente = 'On croit qu''un vent faible signifie une mer calme. La houle peut arriver d''une tempête à des centaines de kilomètres.'
WHERE id = '122';

UPDATE pedagogical_content SET
  accroche = 'Deux plages voisines, même houle : l''une est calme, l''autre pas. L''angle explique tout.',
  accroches_variantes = ARRAY[
    'Deux plages voisines, même houle : l''une est calme, l''autre pas. L''angle explique tout.',
    'Regardez sous quel angle les vagues arrivent sur le sable. De face ou de biais ?',
    'Trouvez l''endroit de la côte qui reçoit la houle le plus de face.'
  ],
  a_observer = 'L''angle d''arrivée des vagues par rapport à la plage : perpendiculaire ou oblique.',
  a_retenir = 'Une houle qui arrive de face frappe fort. De biais, elle glisse le long de la côte et déplace le sable.',
  erreur_frequente = 'On ne regarde que la taille des vagues. L''angle d''arrivée change complètement leur effet sur une plage.'
WHERE id = '123';

UPDATE pedagogical_content SET
  accroche = 'La houle arrive par séries. Savoir ça peut vous éviter un mauvais moment.',
  accroches_variantes = ARRAY[
    'La houle arrive par séries. Savoir ça peut vous éviter un mauvais moment.',
    'Observez trois minutes : les vagues sont-elles toutes de la même taille ?',
    'Comptez combien de vagues dans une série, et combien de temps entre deux séries.'
  ],
  a_observer = 'Le rythme des séries : leur fréquence, leur taille, les accalmies entre elles.',
  a_retenir = 'La houle arrive par séries, avec des accalmies entre. Connaître ce rythme permet de choisir son moment.',
  erreur_frequente = 'On juge la mer sur une seule vague. Il faut regarder plusieurs minutes pour voir passer les grosses séries.'
WHERE id = '124';

UPDATE pedagogical_content SET
  accroche = 'Est-ce que savoir suffit à changer ce qu''on fait ?',
  accroches_variantes = ARRAY[
    'Est-ce que savoir suffit à changer ce qu''on fait ?',
    'Depuis le début de la semaine, qu''est-ce que vous avez appris qui pourrait changer une habitude ?',
    'Chacun cite une chose qu''il fera différemment en rentrant.'
  ],
  a_observer = 'Nos propres habitudes : ce qu''on achète, ce qu''on jette, ce qu''on réutilise.',
  a_retenir = 'Comprendre pourquoi c''est important, c''est ce qui donne envie de changer ses habitudes pour de bon.',
  erreur_frequente = 'On croit que l''information suffit. Ce qui fait changer, c''est de comprendre à quoi ça sert concrètement.'
WHERE id = '125';

UPDATE pedagogical_content SET
  accroche = 'Savoir qu''il faut protéger la mer, et le faire : c''est la même chose ?',
  accroches_variantes = ARRAY[
    'Savoir qu''il faut protéger la mer, et le faire : c''est la même chose ?',
    'Beaucoup de gens sont sensibilisés. Pourquoi tout le monde n''agit pas pour autant ?',
    'Trouvez une action concrète, faisable aujourd''hui, ici.'
  ],
  a_observer = 'L''écart entre ce qu''on sait et ce qu''on fait réellement pendant la séance.',
  a_retenir = 'Être sensibilisé, c''est comprendre. Agir, c''est changer quelque chose. Les deux sont nécessaires.',
  erreur_frequente = 'On confond les deux. Beaucoup savent, peu changent leurs habitudes — c''est ce pas-là qui compte.'
WHERE id = '126';

UPDATE pedagogical_content SET
  accroche = 'Certains disent que c''est déjà foutu. Qu''est-ce que vous en pensez ?',
  accroches_variantes = ARRAY[
    'Certains disent que c''est déjà foutu. Qu''est-ce que vous en pensez ?',
    'Si on ne peut pas tout réparer, est-ce que ça vaut encore le coup d''agir ?',
    'Citez une chose qui va mieux aujourd''hui qu''il y a vingt ans dans la nature.'
  ],
  a_observer = 'Les signes d''amélioration ici : espèces revenues, plages plus propres, zones protégées.',
  a_retenir = 'Certaines choses sont irréversibles, mais chaque geste évite le pire. Il n''y a pas de moment où ça ne sert plus à rien.',
  erreur_frequente = 'On bascule dans le « tout est perdu ». C''est faux, et c''est surtout la meilleure façon de ne rien faire.'
WHERE id = '127';

UPDATE pedagogical_content SET
  accroche = 'Si les phoques vont mal, ça veut dire quelque chose sur toute la mer. Pourquoi ?',
  accroches_variantes = ARRAY[
    'Si les phoques vont mal, ça veut dire quelque chose sur toute la mer. Pourquoi ?',
    'Un animal tout en haut de la chaîne alimentaire : qu''est-ce qu''il accumule ?',
    'Scrutez l''eau au loin. Qui repère une tête ronde ou un souffle ?'
  ],
  a_observer = 'La surface de l''eau au large : têtes rondes, souffles, ailerons.',
  a_retenir = 'Les mammifères marins sont en haut de la chaîne : leur état renseigne sur la santé de toute la mer.',
  erreur_frequente = 'On les voit comme des espèces à part. Ce qu''ils accumulent vient de tout ce qui vit en dessous d''eux.'
WHERE id = '128';
