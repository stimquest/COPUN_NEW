-- Révision éditoriale : marées et courants côtiers
-- Une carte COP'UN part d'un indice vérifiable et non d'une « idée reçue » inventée.

UPDATE pedagogical_content SET
  question = 'Pourquoi la mer monte-t-elle et descend-elle, même sans vent ?',
  objectif = 'Distinguer le mouvement de marée, lié surtout à la Lune et au Soleil, de l''état de surface créé par le vent.',
  tip = 'Partir de deux observations : un jour calme où la mer monte quand même, et un jour venteux où les vagues bougent sans que l''horaire de marée change.',
  explication = 'Le vent ride la surface et crée les vagues ; la marée fait monter et descendre l''ensemble du niveau de la mer. Ce mouvement suit principalement l''attraction de la Lune, renforcée ou atténuée par celle du Soleil. Vent et pression peuvent modifier le niveau réellement observé près de la côte, mais ils ne remplacent pas le cycle de marée.',
  accroche = 'Aujourd''hui, même si le vent tombait complètement, est-ce que la mer arrêterait de monter ?',
  erreur_frequente = 'Ce qu''on peut facilement confondre : les vagues bougent avec le vent, tandis que le niveau de la mer suit la marée. Ce sont deux mouvements différents qui se superposent.',
  a_observer = 'Le niveau de l''eau contre un rocher ou un poteau, puis l''état de surface : calme, rides ou vagues.',
  a_retenir = 'Le vent fait surtout bouger la surface ; la marée fait varier le niveau de la mer.',
  actions = jsonb_build_array(jsonb_build_object('id','f1_deux_mouvements','label','Deux mouvements à distinguer','consigne','Montrez le niveau de l''eau sur un repère puis les vagues à sa surface. Demandez ce qui changerait si le vent tombait, et ce qui continuerait quand même.')),
  accroches_formes = NULL
WHERE id = '1';

UPDATE pedagogical_content SET
  question = 'Comment lire un horaire de marée pour préparer une sortie ?',
  objectif = 'Savoir trouver l''heure et la hauteur prévues de pleine ou basse mer, puis les relier au site et à l''activité.',
  tip = 'Faire chercher l''information utile du jour : pas seulement « l''heure de la marée », mais la pleine ou basse mer concernée et ce qu''elle change pour le groupe.',
  explication = 'Les marées astronomiques sont calculées à l''avance à partir des mouvements de la Lune et du Soleil. Un annuaire ou une application donne des prévisions pour un port de référence ; elles servent à organiser la sortie, mais l''état réel de la mer dépend aussi localement du vent, de la pression et de la houle.',
  accroche = 'Nous voulons être sur l''eau à 14 h : quelle information de marée faut-il vérifier avant de décider ?',
  erreur_frequente = 'Un horaire de marée n''est pas une autorisation automatique de sortir. Il faut encore le relier au lieu, à la météo et au niveau du groupe.',
  a_observer = 'L''annuaire ou l''application : heure, hauteur prévue et port de référence.',
  a_retenir = 'Les horaires se prévoient ; une sortie se décide en croisant cette prévision avec les conditions réelles.',
  actions = jsonb_build_array(jsonb_build_object('id','f2_lire_prevision','label','Trouver l''information utile','consigne','Donnez une heure de départ et faites rechercher la prochaine pleine ou basse mer, sa hauteur et le port concerné. Puis demandez ce que cela change concrètement pour la séance.')),
  accroches_formes = NULL
WHERE id = '2';

UPDATE pedagogical_content SET
  question = 'Qu''est-ce que l''étale, et pourquoi est-elle importante ?',
  objectif = 'Comprendre que les courants changent de sens entre flot et jusant, avec un moment de faiblesse variable selon le site.',
  tip = 'Ne pas donner une durée universelle : l''étale et le changement de courant ne coïncident pas partout exactement avec la pleine ou basse mer.',
  explication = 'Entre le flot et le jusant, le courant ralentit avant de repartir dans l''autre sens : c''est l''étale. Son heure et sa durée dépendent beaucoup du lieu ; dans une baie, un chenal ou près d''un cap, le courant peut changer avant ou après la pleine mer affichée au port.',
  accroche = 'Quand la marée change de sens, le courant fait-il demi-tour immédiatement ?',
  erreur_frequente = 'Pleine mer, basse mer et étale ne sont pas toujours le même moment. Sur un site donné, on vérifie le courant local plutôt que de le deviner.',
  a_observer = 'Le courant autour d''une bouée, d''un poteau ou dans un chenal, à plusieurs moments de la marée.',
  a_retenir = 'L''étale est le passage entre deux sens de courant ; son horaire est local.',
  actions = jsonb_build_array(jsonb_build_object('id','f5_sens_courant','label','Quand le courant change-t-il ?','consigne','Repérez le sens du courant près d''un amer fixe, puis consultez l''information locale du site. Comparez le changement observé avec l''horaire de pleine ou basse mer.')),
  accroches_formes = NULL
WHERE id = '5';

UPDATE pedagogical_content SET
  question = 'Pourquoi les marées peuvent-elles être prévues longtemps à l''avance ?',
  objectif = 'Comprendre la différence entre la marée astronomique prédite et le niveau d''eau réellement observé.',
  tip = 'Dire « prévision de marée » plutôt que « certitude à la minute » : elle est calculée avec précision, mais la météo peut créer une surcote ou une décote.',
  explication = 'Les positions de la Lune et du Soleil obéissent à des mouvements calculables : c''est ce qui permet de prévoir les marées astronomiques longtemps à l''avance. Sur le terrain, le niveau d''eau réel peut toutefois s''écarter de cette prévision sous l''effet du vent et de la pression atmosphérique, surtout lors de conditions agitées.',
  accroche = 'Si la marée est calculée des années à l''avance, pourquoi regarde-t-on encore la météo avant de sortir ?',
  erreur_frequente = 'La marée astronomique est prévisible ; la hauteur d''eau réellement observée n''est jamais séparée des conditions météorologiques.',
  a_observer = 'La prévision de marée, puis le vent, la pression et l''état de mer annoncés.',
  a_retenir = 'On calcule la marée ; on vérifie les conditions qui peuvent modifier le niveau réel.',
  actions = jsonb_build_array(jsonb_build_object('id','f6_prevision_et_reel','label','Prévision et réalité','consigne','Comparez l''horaire de marée prévu avec les prévisions de vent et de pression du jour. Faites nommer ce que chaque information permet — ou ne permet pas — d''anticiper.')),
  accroches_formes = NULL
WHERE id = '6';

UPDATE pedagogical_content SET
  question = 'Que nous indique le coefficient de marée ?',
  objectif = 'Comprendre que le coefficient décrit l''ampleur de la marée, sans remplacer les hauteurs prévues ni les informations locales de courant.',
  tip = 'Toujours lire le coefficient avec les heures et hauteurs prévues du port, puis les particularités du site.',
  explication = 'Le coefficient donne une indication sur l''amplitude de la marée : plus il est élevé, plus l''écart entre basse et pleine mer est important dans les ports où il est utilisé. Il ne donne ni une hauteur d''eau en mètres ni, à lui seul, la force du courant sur chaque site.',
  accroche = 'Le coefficient est de 95 : qu''est-ce que ce nombre nous apprend vraiment — et qu''est-ce qu''il ne nous apprend pas ?',
  erreur_frequente = 'Le coefficient n''est pas une hauteur d''eau et ne suffit pas à décider si un courant est adapté au groupe.',
  a_observer = 'Les heures, hauteurs et coefficient du jour, ainsi que la zone découverte sur le site.',
  a_retenir = 'Un fort coefficient annonce une grande amplitude ; pour décider, on le croise avec les hauteurs, le lieu et les conditions.',
  actions = jsonb_build_array(jsonb_build_object('id','f7_croiser_infos','label','Ce que dit le coefficient','consigne','Comparez deux journées dans l''annuaire : coefficient, heures et hauteurs. Faites distinguer ce que donne le nombre seul de ce que donne la prévision complète.')),
  accroches_formes = NULL
WHERE id = '7';

UPDATE pedagogical_content SET
  question = 'Pourquoi la mer ne progresse-t-elle pas toujours à la même vitesse ?',
  objectif = 'Observer que la vitesse apparente de montée ou de descente varie et comprendre que les règles simplifiées ne remplacent pas l''observation locale.',
  tip = 'La règle des douzièmes peut servir d''ordre de grandeur sur certains sites, mais pas de règle de sécurité universelle.',
  explication = 'La hauteur de l''eau ne varie pas toujours de façon régulière : elle peut sembler avancer plus vite à certains moments, selon la forme de la côte, la pente de plage et le site observé. La règle des douzièmes est un repère théorique utile pour comprendre une marée semi-diurne régulière ; elle ne décrit pas exactement toutes les côtes.',
  accroche = 'Si la mer avance de dix pas pendant la première heure, avancera-t-elle forcément de dix pas pendant la suivante ?',
  erreur_frequente = 'Une règle de calcul ne remplace pas les repères du terrain : sur une plage plate ou dans une baie, l''eau peut sembler gagner très vite du terrain.',
  a_observer = 'La position de l''eau par rapport à deux repères fixes, relevée à intervalles réguliers.',
  a_retenir = 'La marée n''avance pas toujours au même rythme ; on garde des repères et on anticipe.',
  actions = jsonb_build_array(jsonb_build_object('id','f8_reperes_reguliers','label','Mesurer plutôt que supposer','consigne','Choisissez deux repères fixes et notez la position de l''eau à intervalles réguliers. Comparez les écarts au lieu de chercher une vitesse théorique.')),
  accroches_formes = NULL
WHERE id = '8';

UPDATE pedagogical_content SET
  question = 'Pourquoi le courant ne suit-il pas exactement l''heure de pleine ou basse mer ?',
  objectif = 'Comprendre que la force et le changement de sens du courant sont des phénomènes locaux.',
  tip = 'Pour une activité nautique, s''appuyer sur les informations locales de courant et sur l''observation, pas sur une règle unique de « mi-marée ».',
  explication = 'Le courant dépend du volume d''eau qui passe, mais aussi de la forme des caps, baies, chenaux et estuaires. Il peut être très fort à un moment différent de la mi-marée théorique, et son changement de sens peut être décalé par rapport à l''horaire de pleine ou basse mer du port.',
  accroche = 'La pleine mer est à 15 h. Peut-on en déduire exactement le moment où le courant sera le plus fort ici ?',
  erreur_frequente = '« À mi-marée, le courant est toujours maximal » est une simplification. Le courant se lit et se prépare à l''échelle du site.',
  a_observer = 'Les zones où l''eau accélère, les remous autour des obstacles et les informations locales de navigation.',
  a_retenir = 'Le courant est local : l''horaire de marée aide à l''anticiper, mais ne suffit pas à le décrire.',
  actions = jsonb_build_array(jsonb_build_object('id','f9_courant_local','label','Où l''eau accélère-t-elle ?','consigne','Depuis le bord, repérez une zone calme et une zone accélérée. Reliez-les à la forme du site avant de consulter le créneau de courant local.')),
  accroches_formes = NULL
WHERE id = '9';

UPDATE pedagogical_content SET
  question = 'Comment nomme-t-on la marée montante et la marée descendante ?',
  objectif = 'Employer le vocabulaire marin avec précision, en le reliant à une observation du sens de l''eau.',
  tip = 'Le mot ne doit pas être un quiz de vocabulaire : faire nommer le mouvement réellement observé.',
  explication = 'En vocabulaire maritime, le flot désigne la marée montante et le jusant la marée descendante. L''étale est le moment de transition où le courant ralentit avant de repartir dans l''autre sens.',
  accroche = 'Regardons le repère : l''eau gagne-t-elle du terrain ou en laisse-t-elle ? Les marins ont un mot pour chacun de ces mouvements.',
  erreur_frequente = 'Flot, jusant et étale ne sont pas trois synonymes : ils décrivent trois moments différents du cycle.',
  a_observer = 'Le niveau d''eau et le sens du courant au moment présent.',
  a_retenir = 'Flot : la mer monte. Jusant : elle descend. Étale : le courant change de sens.',
  actions = jsonb_build_array(jsonb_build_object('id','f10_nommer_mouvement','label','Nommer ce qui se passe','consigne','À partir d''un repère fixe, faites décrire le mouvement de l''eau puis introduisez le mot précis : flot, jusant ou étale.')),
  accroches_formes = NULL
WHERE id = '10';

UPDATE pedagogical_content SET
  question = 'Que changent les vives-eaux et les mortes-eaux sur un site ?',
  objectif = 'Relier l''amplitude de la marée aux zones accessibles, aux courants et aux usages du site, sans généraliser un comportement biologique.',
  tip = 'Partir du site : jusqu''où l''estran se découvre, quels passages deviennent possibles ou risqués, qui utilise cet espace aujourd''hui ?',
  explication = 'En vives-eaux, l''écart entre basse et pleine mer est plus grand : l''estran peut se découvrir davantage et les courants peuvent être plus marqués dans certains passages. En mortes-eaux, les variations sont plus modestes. Ces différences changent l''accès au site, les activités possibles et les conditions rencontrées par les espèces de l''estran.',
  accroche = 'Aujourd''hui la plage découvre très loin ; que pourrions-nous voir ou faire différemment lors d''une morte-eau ?',
  erreur_frequente = 'Toutes les marées ne se ressemblent pas, mais aucune règle ne dispense de regarder les caractéristiques locales du site.',
  a_observer = 'La limite de l''estran découverte, les accès, les chenaux et les usages présents.',
  a_retenir = 'Vives-eaux et mortes-eaux changent l''amplitude de la marée ; sur le terrain, on regarde ce que cela transforme ici.',
  actions = jsonb_build_array(jsonb_build_object('id','f12_comparer_marees','label','Ce qui change ici','consigne','À partir de deux journées de l''annuaire, comparez la zone qui découvrira et les accès possibles. Faites formuler ce que cela change pour la sortie.')),
  accroches_formes = NULL
WHERE id = '12';

UPDATE pedagogical_content SET
  question = 'Que raconte la laisse de mer ?',
  objectif = 'Utiliser la laisse de mer comme indice du passage de l''eau, sans la confondre avec une prévision suffisante de la prochaine pleine mer.',
  tip = 'La laisse de mer est un indice à lire avec le calendrier de marée et les conditions du jour ; elle ne remplace jamais une prévision.',
  explication = 'La laisse de mer est formée d''algues, coquilles, bois et autres éléments déposés par l''eau. Elle garde la trace d''un passage de la mer, mais sa position dépend aussi du vent, des vagues et des marées précédentes. Elle aide à lire la plage ; elle ne permet pas, seule, de prévoir exactement la prochaine limite de l''eau.',
  accroche = 'Cette ligne d''algues raconte un passage de la mer. Mais suffit-elle à savoir où l''eau ira tout à l''heure ?',
  erreur_frequente = 'La laisse de mer est un indice précieux, pas une limite garantie pour la marée suivante.',
  a_observer = 'Les différentes lignes de dépôts, leur composition et leur hauteur sur la plage.',
  a_retenir = 'La laisse de mer raconte ce que l''eau a déposé ; pour anticiper, on la croise avec la prévision du jour.',
  actions = jsonb_build_array(jsonb_build_object('id','f14_lire_laisse','label','Indice ou prévision ?','consigne','Repérez une ligne de laisse, puis consultez la prochaine marée et les conditions de vent. Faites distinguer ce que la ligne indique de ce qu''il reste à vérifier.')),
  accroches_formes = NULL
WHERE id = '14';

UPDATE pedagogical_content SET
  objectif = 'Choisir un emplacement de matériel qui reste sûr pendant la séance en croisant la marée prévue, les conditions du jour et la configuration de la plage.',
  tip = 'Avant d''installer le matériel : prochaine pleine mer, hauteur prévue, vent/houle, accès de repli et marge réelle au-dessus de la zone atteignable.',
  explication = 'La laisse de mer donne un repère utile, mais elle correspond à des conditions passées. Pour poser le matériel, on regarde surtout la prochaine marée prévue et sa hauteur, puis on garde une marge adaptée au vent, à la houle et à la forme de la plage. En cas de doute, on choisit plus haut et on conserve un accès de sortie.',
  erreur_frequente = 'Le coefficient seul ne dit pas jusqu''où l''eau ira sur cette plage. Il faut lire la prévision complète et les conditions réelles.',
  a_observer = 'La laisse de mer, la prochaine pleine mer prévue, la houle et un itinéraire de repli.',
  a_retenir = 'Pour poser le matériel, on croise prévision, conditions locales et marge de sécurité.',
  actions = jsonb_build_array(jsonb_build_object('id','f15_choisir_emplacement','label','Choisir avec une marge','consigne','Faites choisir un emplacement et demandez quelles informations le justifient : prochaine marée, hauteur, vent/houle, accès de repli. Le groupe doit pouvoir expliquer sa marge.')),
  accroches_formes = NULL
WHERE id = '15';

UPDATE pedagogical_content SET
  question = 'Qu''est-ce qui peut faire bouger l''eau de mer ici ?',
  objectif = 'Distinguer les effets locaux de la marée, du vent, des vagues et des courants plus larges.',
  tip = 'Ne pas chercher une cause unique : comparer le niveau, les vagues, le sens du vent et le sens du courant.',
  explication = 'L''eau de mer peut bouger pour plusieurs raisons : la marée fait varier le niveau et crée des courants ; le vent pousse la surface ; les vagues transportent de l''énergie ; la température et la salinité alimentent aussi de grandes circulations océaniques. Près d''une côte, la cause dominante dépend du lieu et du moment.',
  accroche = 'Ici, qu''est-ce qui bouge vraiment : le niveau, la surface, le courant — ou les trois à la fois ?',
  erreur_frequente = 'Voir de l''eau en mouvement ne suffit pas à en connaître la cause. On compare les indices avant de conclure.',
  a_observer = 'Niveau contre un repère, direction du vent, direction du courant et forme des vagues.',
  a_retenir = 'Marée, vent et vagues peuvent agir ensemble, mais pas de la même manière.',
  actions = jsonb_build_array(jsonb_build_object('id','f24_quatre_indices','label','Quatre indices','consigne','Répartissez les observations : un repère de niveau, le vent, le courant et les vagues. Mettez ensuite en commun ce que chaque indice raconte.')),
  accroches_formes = NULL
WHERE id = '24';

UPDATE pedagogical_content SET
  question = 'Pourquoi tous les courants ne se ressemblent-ils pas ?',
  objectif = 'Identifier que les courants ont des causes et des rythmes différents, sans appliquer une règle unique à un site.',
  tip = 'Sur une sortie, la question utile est : quel courant domine ici maintenant, et de quelles informations locales disposons-nous ?',
  explication = 'Certains courants sont liés aux marées et changent de sens avec le cycle local ; d''autres sont entraînés par le vent ; d''autres encore appartiennent à de grandes circulations océaniques. Leur vitesse et leur direction dépendent aussi de la côte, des fonds et des passages resserrés.',
  accroche = 'Deux courants peuvent-ils avoir la même direction aujourd''hui et une origine complètement différente ?',
  erreur_frequente = 'Un courant n''a pas un rythme universel. Pour naviguer, on cherche l''information du site plutôt qu''une règle apprise par cœur.',
  a_observer = 'Le sens du courant près d''un repère et les informations de courant propres au site.',
  a_retenir = 'Un courant peut être lié à la marée, au vent ou à la géographie locale : on identifie sa cause avant de prévoir son évolution.',
  actions = jsonb_build_array(jsonb_build_object('id','f25_identifier_courant','label','Quel courant observons-nous ?','consigne','Faites relever le sens du vent, celui du courant et l''heure de marée. Demandez quelles causes sont plausibles ici et quelle source locale permettrait de vérifier.')),
  accroches_formes = NULL
WHERE id = '25';

UPDATE pedagogical_content SET
  question = 'Pourquoi l''horaire de la séance change-t-il d''un jour à l''autre ?',
  objectif = 'Faire constater le décalage quotidien des marées et relier l''organisation d''une activité aux contraintes du site.',
  tip = 'Comparer deux jours du calendrier plutôt que faire réciter « 50 minutes » : le décalage est voisin de cette valeur, mais pas exactement identique chaque jour.',
  explication = 'La Lune avance sur son orbite pendant que la Terre tourne : il faut donc un peu plus de temps pour la retrouver dans la même position apparente. Les horaires de marée se décalent ainsi d''un jour à l''autre, d''environ cinquante minutes en moyenne. Le moniteur adapte alors l''horaire au site, à l''activité et au groupe.',
  accroche = 'Hier nous étions prêts à 14 h ; demain, si la marée nous intéresse, partirons-nous forcément à la même heure ?',
  erreur_frequente = 'Le programme du club n''est pas le seul à fixer l''horaire : sur certains sites, la marée impose une fenêtre utile ou une contrainte à intégrer.',
  a_observer = 'Les horaires de marée de deux jours successifs et la fenêtre réellement utile pour l''activité.',
  a_retenir = 'Les marées se décalent chaque jour ; l''organisation s''adapte aux fenêtres du site.',
  actions = jsonb_build_array(jsonb_build_object('id','f68_comparer_deux_jours','label','Deux jours, deux fenêtres','consigne','Comparez les horaires de deux jours et faites choisir le créneau le plus adapté à l''activité prévue. Demandez ce qui a changé et pourquoi.')),
  accroches_formes = NULL
WHERE id = '68';

UPDATE pedagogical_content SET
  question = 'Pourquoi les horaires de marée se décalent-ils d''un jour à l''autre ?',
  objectif = 'Expliquer simplement l''origine astronomique du décalage quotidien, sans transformer la carte en exercice de mémorisation.',
  tip = 'Cette carte complète la préparation pratique : partir du calendrier déjà consulté, puis seulement expliquer le mouvement de la Lune.',
  explication = 'Pendant une journée, la Terre tourne sur elle-même, mais la Lune avance aussi sur son orbite. Pour retrouver la Lune dans la même direction, la Terre doit tourner un peu plus longtemps qu''un jour solaire : les marées arrivent donc plus tard d''un jour au suivant, avec un décalage voisin de cinquante minutes.',
  accroche = 'Le tableau montre que la pleine mer glisse chaque jour. Qu''est-ce qui, là-haut, fait bouger notre horaire ?',
  erreur_frequente = 'Le décalage est régulier dans son principe, mais on lit toujours le calendrier réel plutôt que d''ajouter mécaniquement un nombre de minutes.',
  a_observer = 'Le décalage des heures de pleine ou basse mer sur plusieurs jours.',
  a_retenir = 'La Lune avance pendant que la Terre tourne : les marées arrivent progressivement plus tard.',
  actions = jsonb_build_array(jsonb_build_object('id','f91_lire_decalage','label','Lire le décalage','consigne','Faites relever les horaires sur trois jours. Décrivez d''abord le glissement observé, puis utilisez un globe ou deux personnes pour expliquer le mouvement Terre-Lune.')),
  accroches_formes = NULL
WHERE id = '91';

UPDATE pedagogical_content SET
  question = 'Que vérifier sur la marée et le courant avant une activité nautique ?',
  objectif = 'Construire une décision de départ à partir d''informations croisées, du site et du niveau réel du groupe.',
  tip = 'Une check-list de départ ne remplace pas le jugement du moniteur : elle rend visibles les informations à croiser.',
  explication = 'Avant de partir, on repère la prochaine marée et les hauteurs prévues, les informations locales de courant, le vent et l''état de mer, puis les zones de repli du site. Le coefficient complète cette lecture, mais ne suffit pas à dire si les conditions conviennent à un groupe donné.',
  accroche = 'Avant de mettre à l''eau, quelle information nous ferait renoncer — et laquelle nous donnerait seulement un indice ?',
  erreur_frequente = 'Connaître l''heure ou le coefficient ne suffit pas. Une décision se prend avec les conditions du site et les capacités du groupe.',
  a_observer = 'Prévision de marée, informations locales de courant, vent, état de mer et solutions de repli.',
  a_retenir = 'Avant de partir, on croise marée, courant, météo, site et groupe.',
  actions = jsonb_build_array(jsonb_build_object('id','f106_decision_depart','label','La décision de départ','consigne','Répartissez les informations entre les stagiaires : marée, courant local, météo/mer, site. Chacun dit ce que son information change dans la décision.')),
  accroches_formes = NULL
WHERE id = '106';
