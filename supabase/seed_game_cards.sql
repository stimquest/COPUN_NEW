-- =====================================================
-- Seed : Cartes de jeu COPUN
-- Quizz basés directement sur les fiches pédagogiques
-- Thèmes alignés avec tags_theme des cartes pédago
-- =====================================================

TRUNCATE TABLE game_cards RESTART IDENTITY CASCADE;

-- =====================================================
-- QUIZZ — Les Marées (fiches 1-12, 91)
-- =====================================================
INSERT INTO game_cards (type, theme, data) VALUES

('quizz', 'Les Marées', '{
  "question": "Pourquoi y a-t-il des marées ?",
  "answers": ["La rotation de la Terre sur elle-même", "L''attraction gravitationnelle de la Lune et du Soleil", "Les différences de température entre les océans", "Le vent dominant en surface"],
  "correctAnswerIndex": 1,
  "explanation": "Les marées résultent de l''attraction combinée de la Lune (principal facteur) et du Soleil sur les masses d''eau. La Terre tourne plus vite que la Lune ne l''orbite, créant le cycle semi-diurne."
}'),

('quizz', 'Les Marées', '{
  "question": "Combien de marées hautes se produisent en moyenne par jour sur les côtes françaises ?",
  "answers": ["1", "2", "3", "4"],
  "correctAnswerIndex": 1,
  "explanation": "Le régime semi-diurne produit 2 marées hautes et 2 marées basses par jour, soit un cycle d''environ 12h25. Ce décalage est dû au fait que le jour lunaire dure 24h50, pas 24h."
}'),

('quizz', 'Les Marées', '{
  "question": "Comment connaît-on à l''avance les horaires de marée ?",
  "answers": ["En observant la couleur de la mer", "En utilisant un annuaire des marées ou une application (SHOM)", "En regardant la position de la Lune uniquement", "En mesurant la vitesse du courant"],
  "correctAnswerIndex": 1,
  "explanation": "Les marées sont si régulières qu''on peut les calculer des années à l''avance. Le SHOM publie des annuaires et des applications donnant les horaires à la minute près."
}'),

('quizz', 'Les Marées', '{
  "question": "Pourquoi l''heure de la marée n''est-elle pas la même partout en même temps ?",
  "answers": ["À cause de la rotation de la Terre uniquement", "La forme des côtes influence la propagation de l''onde de marée", "Les différences de salinité retardent la marée", "Le fond marin est plus profond à certains endroits"],
  "correctAnswerIndex": 1,
  "explanation": "L''onde de marée, comme une vague géante, doit contourner les obstacles géographiques. La forme des côtes, les détroits et les baies modifient sa vitesse de propagation locale."
}'),

('quizz', 'Les Marées', '{
  "question": "Comment s''appelle la zone du littoral qui se couvre et se découvre avec la marée ?",
  "answers": ["La laisse de mer", "L''estran", "La zone subtidale", "Le platier"],
  "correctAnswerIndex": 1,
  "explanation": "L''estran (ou zone intertidale) est la bande côtière alternativement couverte et découverte par la mer. C''est un des milieux les plus riches et les plus extrêmes de la planète."
}'),

('quizz', 'Les Marées', '{
  "question": "Qu''est-ce que l''étale de marée ?",
  "answers": ["La période où le courant est le plus fort", "Le moment de transition entre marée montante et descendante, où le courant est quasi nul", "La hauteur maximale atteinte par la marée", "La durée totale d''une marée"],
  "correctAnswerIndex": 1,
  "explanation": "L''étale est un bref moment de pause entre le flot et le jusant. Le courant y est quasi nul. C''est un moment favorable pour certaines activités, mais il ne dure pas longtemps."
}'),

('quizz', 'Les Marées', '{
  "question": "Que signifie un fort coefficient de marée (vive-eau) ?",
  "answers": ["La marée montante sera plus rapide que la descente", "L''estran découvrira plus loin et les courants seront plus forts", "La mer sera plus calme et sans courant", "Il y aura moins d''organismes sur l''estran"],
  "correctAnswerIndex": 1,
  "explanation": "Un fort coefficient signifie une grande amplitude de marée : l''estran découvre plus loin, les courants sont plus puissants. C''est important pour la sécurité et la pratique nautique."
}'),

('quizz', 'Les Marées', '{
  "question": "La marée monte-t-elle à la même vitesse tout au long du flot ?",
  "answers": ["Oui, la vitesse est constante", "Non, elle monte plus vite à mi-parcours (règle des douzièmes)", "Non, elle monte plus vite au début", "Non, elle monte plus vite à la fin"],
  "correctAnswerIndex": 1,
  "explanation": "Selon la règle des douzièmes, la marée monte 1/12 la 1ère heure, 2/12 la 2ème, 3/12 la 3ème (mi-parcours = maximum), puis ralentit symétriquement. La mi-marée est le moment des courants les plus forts."
}'),

('quizz', 'Les Marées', '{
  "question": "Comment appelle-t-on la marée montante en vocabulaire technique ?",
  "answers": ["Le jusant", "L''étale", "Le flot", "La vive-eau"],
  "correctAnswerIndex": 2,
  "explanation": "Le flot désigne la marée montante. Le jusant est la descente, l''étale le moment de transition, et la vive-eau une marée de grande amplitude."
}'),

('quizz', 'Les Marées', '{
  "question": "Pourquoi les marées influencent-elles la biodiversité et les activités humaines ?",
  "answers": ["Uniquement parce qu''elles modifient la température de l''eau", "Elles rythment la vie de toutes les espèces littorales et des activités comme la pêche ou la navigation", "Elles créent du vent qui affecte les oiseaux", "Elles changent la couleur de l''eau selon le coefficient"],
  "correctAnswerIndex": 1,
  "explanation": "Pêcheurs, oiseaux, algues, crustacés — tout vit au rythme des marées. Les horaires d''accès aux ports, les zones de pêche à pied, les zones de reproduction : tout dépend de ce cycle."
}'),

('quizz', 'Les Marées', '{
  "question": "Pourquoi les horaires de marée se décalent-ils d''environ 50 minutes chaque jour ?",
  "answers": ["À cause du vent dominant qui ralentit la marée", "Parce que la journée lunaire dure 24h50, pas 24h, donc la Terre doit tourner un peu plus pour ''rattraper'' la Lune", "À cause de la rotation de la Terre qui s''accélère légèrement", "Parce que la salinité de l''eau change chaque jour"],
  "correctAnswerIndex": 1,
  "explanation": "La Lune avance dans son orbite pendant que la Terre tourne. Le jour lunaire dure ~24h50, donc chaque marée se produit environ 50 minutes plus tard que la veille."
}'),

-- =====================================================
-- QUIZZ — Météo & Marées (fiches 17-22, 38-43, 82-84, 99-102)
-- =====================================================

('quizz', 'Météo & Marées', '{
  "question": "Comment se forme le vent ?",
  "answers": ["Par la rotation de la Terre uniquement", "Par des différences de pression atmosphérique : l''air se déplace des hautes vers les basses pressions", "Par l''évaporation de l''eau de mer", "Par la chaleur dégagée par le Soleil directement"],
  "correctAnswerIndex": 1,
  "explanation": "Le vent est de l''air qui se déplace d''une zone de haute pression (beaucoup d''air) vers une zone de basse pression (peu d''air). Plus l''écart de pression est grand, plus le vent est fort."
}'),

('quizz', 'Météo & Marées', '{
  "question": "Comment se forme une brise thermique côtière en été ?",
  "answers": ["La mer se réchauffe plus vite que la terre le matin", "La terre se réchauffe plus vite que la mer, l''air chaud monte au-dessus de la terre et l''air frais de la mer prend sa place", "Le vent général de la dépression est aspiré vers la côte", "La différence de salinité crée un mouvement d''air"],
  "correctAnswerIndex": 1,
  "explanation": "En journée, la terre chauffe plus vite que la mer. L''air chaud de la terre monte, et l''air frais de la mer prend sa place : c''est la brise de mer. La nuit, le phénomène s''inverse."
}'),

('quizz', 'Météo & Marées', '{
  "question": "Un vent de terre, qu''est-ce que cela signifie pour un pratiquant côtier ?",
  "answers": ["Un vent soufflant de la mer vers la plage, favorable au retour", "Un vent soufflant de la côte vers le large, qui peut éloigner du bord", "Un vent parallèle à la côte, sans danger", "Un vent variable et faible"],
  "correctAnswerIndex": 1,
  "explanation": "Le vent de terre souffle de la côte vers le large. Il peut sembler calme depuis la plage (zone abritée) alors que la mer ouverte est agitée. Il peut éloigner du bord en cas de problème."
}'),

('quizz', 'Météo & Marées', '{
  "question": "Pourquoi le temps change-t-il plus vite en mer qu''à terre ?",
  "answers": ["L''air marin est plus léger et se déplace plus vite", "La mer a une inertie thermique différente de la terre, et les systèmes météo se déplacent sans obstacles", "Les vagues accélèrent le déplacement des nuages", "L''eau salée conduit mieux la chaleur"],
  "correctAnswerIndex": 1,
  "explanation": "La mer est plus lente à se réchauffer et refroidir que la terre. Les systèmes météo (dépressions, fronts) se déplacent sur l''océan sans obstacles orographiques et peuvent évoluer très rapidement."
}'),

('quizz', 'Météo & Marées', '{
  "question": "Comment se forme un nuage ?",
  "answers": ["De la vapeur d''eau brûlante qui monte directement du sol", "L''air chaud et humide monte, se refroidit, et la vapeur d''eau se condense autour de particules en suspension", "Le vent pousse l''humidité vers le haut", "La pluie s''évapore avant d''atteindre le sol"],
  "correctAnswerIndex": 1,
  "explanation": "L''air chaud monte, se refroidit en altitude, ne peut plus contenir autant de vapeur d''eau, et la vapeur se condense autour de particules (poussières, sel marin) pour former des gouttelettes : le nuage."
}'),

('quizz', 'Météo & Marées', '{
  "question": "Quel type de nuage annonce souvent des orages et des conditions instables ?",
  "answers": ["Le stratus (nappe grise basse)", "Le cirrus (filaments blancs en altitude)", "Le cumulonimbus (développement vertical imposant)", "L''altocumulus (moutons blancs à altitude moyenne)"],
  "correctAnswerIndex": 2,
  "explanation": "Le cumulonimbus est le nuage d''orage par excellence : développement vertical très important, il produit pluie intense, grêle, éclairs et foudre. À éviter absolument en mer."
}'),

('quizz', 'Météo & Marées', '{
  "question": "Pourquoi anticiper la brise thermique est-il utile pour planifier une sortie ?",
  "answers": ["Elle refroidit l''eau et rend la baignade difficile", "Si le soleil tape fort le matin avec peu de vent, la brise se lève généralement en début d''après-midi", "Elle crée des courants sous-marins dangereux", "Elle annonce toujours une tempête"],
  "correctAnswerIndex": 1,
  "explanation": "Un ciel clair et peu de vent le matin sont les conditions idéales pour la brise thermique qui se lèvera en début d''après-midi. Ce rythme prévisible permet d''adapter son planning d''activité."
}'),

('quizz', 'Météo & Marées', '{
  "question": "Qu''indique une chute rapide du baromètre ?",
  "answers": ["Du beau temps stable à venir", "Une probable dégradation météo rapide (arrivée d''une dépression)", "Un changement de marée imminent", "Une remontée de vent de terre"],
  "correctAnswerIndex": 1,
  "explanation": "Une chute rapide de la pression atmosphérique annonce l''arrivée d''une dépression avec vent, pluie et mer agitée. C''est un signal d''alerte important pour toute activité nautique."
}'),

-- =====================================================
-- QUIZZ — Repères spatio-temporels (fiches 2, 5-10, 20-22, 27-28, 68, 70-71)
-- =====================================================

('quizz', 'Repères spatio-temporels', '{
  "question": "Pourquoi est-il important de connaître l''amplitude de la marée avant une sortie ?",
  "answers": ["Pour choisir la couleur de sa combinaison", "Pour évaluer la sécurité : un fort coefficient = courants plus puissants et estran qui découvre plus loin", "Pour savoir si la mer sera chaude", "Pour connaître la direction du vent dominant"],
  "correctAnswerIndex": 1,
  "explanation": "Un fort coefficient signifie plus de courant et un estran qui découvre plus loin. Cela change tout pour la sécurité : durée disponible sur le site, force des courants, rapidité de la remontée."
}'),

('quizz', 'Repères spatio-temporels', '{
  "question": "Qu''est-ce que les courants sont les plus forts lors d''une marée ?",
  "answers": ["Au début du flot", "À l''étale", "À mi-marée", "À la marée haute"],
  "correctAnswerIndex": 2,
  "explanation": "Selon la règle des douzièmes, c''est à mi-marée (3ème et 4ème heure) que le débit est maximum et les courants les plus forts. C''est un moment de vigilance accrue pour tous les navigateurs."
}'),

('quizz', 'Repères spatio-temporels', '{
  "question": "Comment repère-t-on la direction du vent sans instrument ?",
  "answers": ["En regardant la direction des vagues uniquement", "En mouillant son doigt et le levant : le côté qui refroidit indique d''où vient le vent", "En observant le sens des nuages uniquement", "En regardant où volent les mouettes"],
  "correctAnswerIndex": 1,
  "explanation": "Un doigt mouillé levé en l''air refroidit sur le côté d''où vient le vent. On peut aussi regarder les drapeaux, la fumée, les rideaux d''eau sur la mer."
}'),

('quizz', 'Repères spatio-temporels', '{
  "question": "Comment repère-t-on le sens du courant dans l''eau ?",
  "answers": ["En goûtant l''eau — elle est plus salée dans le sens du courant", "En observant l''eau autour d''une bouée ou d''un poteau : une ''moustache'' d''écume se forme en aval", "En regardant la direction des vagues de surface", "En plongeant un bâton verticalement"],
  "correctAnswerIndex": 1,
  "explanation": "L''eau qui s''écoule autour d''un obstacle fixe (bouée, poteau, rocher) forme une traînée d''écume ou de remous du côté aval. C''est le signe le plus facile à lire pour identifier le sens du courant."
}'),

('quizz', 'Repères spatio-temporels', '{
  "question": "Qu''est-ce qu''un amer ?",
  "answers": ["Un type de courant côtier dangereux", "Un point de repère visuel fixe à terre utilisé pour se localiser (clocher, phare, château d''eau)", "La profondeur minimale d''un chenal", "Un signal sonore de brume"],
  "correctAnswerIndex": 1,
  "explanation": "Un amer est tout objet fixe et remarquable à terre servant de repère visuel. En navigation côtière, deux amers permettent de se positionner par intersection."
}'),

('quizz', 'Repères spatio-temporels', '{
  "question": "Pourquoi prendre des repères (amers) avant de partir sur l''eau ?",
  "answers": ["Pour impressionner les autres pratiquants", "Pour pouvoir se localiser et retrouver son chemin, même si les conditions changent", "Pour mesurer la vitesse du courant", "Pour estimer la hauteur des vagues"],
  "correctAnswerIndex": 1,
  "explanation": "Les amers permettent de se situer et de garder le cap même si la visibilité baisse ou si le courant déporte. Un clocher, un château d''eau, un cap : identifiez-les avant de partir."
}'),

('quizz', 'Repères spatio-temporels', '{
  "question": "Pourquoi les activités humaines doivent-elles s''adapter aux rythmes naturels du littoral ?",
  "answers": ["C''est une obligation légale uniquement", "La nature aura toujours le dernier mot : marées, vents, saisons — s''adapter c''est être en sécurité et en harmonie avec le milieu", "Pour des raisons touristiques uniquement", "Uniquement pour les pêcheurs professionnels"],
  "correctAnswerIndex": 1,
  "explanation": "Marées, vents, saisons de reproduction — tous ces rythmes naturels conditionnent la sécurité et l''impact des activités. Les connaître permet d''agir au bon moment et au bon endroit."
}'),

-- =====================================================
-- QUIZZ — Caractéristiques du littoral (fiches 3-4, 32, 44-50, 57)
-- =====================================================

('quizz', 'Caractéristiques du littoral', '{
  "question": "Qu''appelle-t-on la laisse de mer ?",
  "answers": ["La limite légale de la mer sur la plage", "La ligne de dépôts (algues, coquilles, débris) laissée par la mer au niveau de sa plus haute montée", "La zone toujours immergée même à marée basse", "L''écume produite par les vagues"],
  "correctAnswerIndex": 1,
  "explanation": "La laisse de mer marque le niveau de la dernière marée haute. Elle contient des débris naturels (algues, bois, coquilles) essentiels à l''écosystème dunaire, et aussi des déchets humains."
}'),

('quizz', 'Caractéristiques du littoral', '{
  "question": "Comment se forment les dunes côtières ?",
  "answers": ["Par érosion des falaises par les vagues", "Par accumulation de sable transporté par le vent, piégé par les plantes pionnières", "Par dépôt de sédiments fluviaux uniquement", "Par action des marées sur le sable"],
  "correctAnswerIndex": 1,
  "explanation": "Le sable transporté par le vent est piégé par les plantes pionnières (oyat, chiendent des sables) qui constituent la première ligne de fixation. Sans végétation, la dune est mobile et fragile."
}'),

('quizz', 'Caractéristiques du littoral', '{
  "question": "Pourquoi les dunes sont-elles fragiles ?",
  "answers": ["Le sable est trop fin et s''envole facilement", "Le piétinement détruit la végétation qui retient le sable, déclenchant l''érosion", "L''eau de mer les dissout progressivement", "Les dunes sont en fait très solides et résistantes"],
  "correctAnswerIndex": 1,
  "explanation": "La végétation dunaire retient le sable avec ses racines. Quand on la piétine, les plants meurent, le sable se déstabilise et la dune recule. C''est pourquoi les chemins balisés sont obligatoires."
}'),

('quizz', 'Caractéristiques du littoral', '{
  "question": "Pourquoi le littoral est-il un milieu particulièrement riche en biodiversité ?",
  "answers": ["Parce que l''eau y est plus chaude qu''au large", "C''est une zone de rencontre entre terre et mer (écotone) qui multiplie les habitats et les ressources", "Parce que les vagues apportent des nutriments du fond", "Uniquement parce qu''il y a moins de prédateurs"],
  "correctAnswerIndex": 1,
  "explanation": "Le littoral est un écotone : une zone de transition entre deux milieux (terre/mer). Ces zones de contact sont toujours les plus riches en espèces, car elles combinent les ressources des deux milieux."
}'),

('quizz', 'Caractéristiques du littoral', '{
  "question": "D''où viennent les débris naturels qu''on trouve dans la laisse de mer ?",
  "answers": ["Uniquement des bateaux qui passent au large", "De l''activité de la mer : algues décrochées, bois flotté, coquilles vidées, œufs de raie", "Des rivières qui se jettent à la mer uniquement", "Du fond marin uniquement"],
  "correctAnswerIndex": 1,
  "explanation": "La laisse de mer contient ce que la mer transporte : algues arrachées par les vagues, bois flotté, coquilles, œufs de raie, os de seiche... Ces éléments naturels nourrissent l''écosystème dunaire."
}'),

('quizz', 'Caractéristiques du littoral', '{
  "question": "Qu''est-ce que le recul du trait de côte ?",
  "answers": ["Le mouvement normal de la marée qui couvre et découvre la plage", "Le recul progressif de la limite terre/mer dû à l''érosion, accéléré par la montée des eaux et les tempêtes", "La progression des dunes vers l''intérieur des terres", "L''affaissement du fond marin"],
  "correctAnswerIndex": 1,
  "explanation": "Le recul du trait de côte est l''érosion progressive des côtes. La montée du niveau de la mer et des tempêtes plus intenses accélèrent ce phénomène naturel, menaçant habitations et écosystèmes."
}'),

-- =====================================================
-- QUIZZ — Observation Sensorielle (fiches 13-15, 20, 27, 33-36, 41-42, 46-47, 53-54, 61-62, 70, 92-97)
-- =====================================================

('quizz', 'Observation Sensorielle', '{
  "question": "Comment sait-on que la mer monte ou descend, sans montre ni application ?",
  "answers": ["En goûtant l''eau — elle est plus salée quand la marée monte", "En choisissant un point fixe (rocher, poteau) et en observant si le niveau monte ou descend par rapport à lui", "En comptant les vagues", "En regardant la direction du vent"],
  "correctAnswerIndex": 1,
  "explanation": "Choisir un point fixe et observer le niveau de l''eau à 5 minutes d''intervalle. Si l''eau monte sur le rocher, c''est le flot. Si elle descend et dégage des algues, c''est le jusant."
}'),

('quizz', 'Observation Sensorielle', '{
  "question": "Quel est le meilleur indice naturel pour savoir jusqu''où va monter la mer ?",
  "answers": ["La hauteur des nuages", "La laisse de haute mer : la ligne de débris (algues, bois) laissée par la dernière marée haute", "La couleur de l''eau au large", "La hauteur des vagues actuelles"],
  "correctAnswerIndex": 1,
  "explanation": "La laisse de haute mer est le meilleur repère naturel. Elle marque le niveau de la dernière marée haute. Si les affaires sont posées en dessous, elles risquent d''être emportées."
}'),

('quizz', 'Observation Sensorielle', '{
  "question": "Quels sens peut-on utiliser pour observer la nature au bord de la mer (en dehors de la vue) ?",
  "answers": ["Uniquement le toucher", "L''ouïe (bruit des vagues, oiseaux), l''odorat (iode, algues), parfois le toucher (texture des rochers)", "Uniquement l''odorat", "Il faut des instruments — les sens ne suffisent pas"],
  "correctAnswerIndex": 1,
  "explanation": "Un bon observateur mobilise tous ses sens : écouter le bruit de la mer sur les rochers, sentir l''iode des algues à marée basse, sentir la direction du vent sur sa peau. L''observation ne se limite pas aux yeux."
}'),

('quizz', 'Observation Sensorielle', '{
  "question": "Comment observer la faune littorale sans la déranger ?",
  "answers": ["S''approcher le plus possible pour bien voir", "Rester à distance, ne pas faire de bruit, utiliser des jumelles — il y a dérangement dès qu''il y a un changement de comportement", "Faire du bruit pour que les animaux restent immobiles", "Observer uniquement les espèces protégées"],
  "correctAnswerIndex": 1,
  "explanation": "Le dérangement commence dès qu''un animal change de comportement (s''envole, plonge, s''éloigne). Rester discret, à distance, sans faire de bruit préserve l''animal et améliore l''observation."
}'),

('quizz', 'Observation Sensorielle', '{
  "question": "Quels éléments peut-on trouver dans la laisse de mer pour lire l''état de l''écosystème ?",
  "answers": ["Uniquement des déchets plastiques", "Des coquillages, œufs de raie, os de seiche, algues — et la proportion de déchets humains renseigne sur la santé du milieu", "Uniquement des roches et du sable", "Uniquement des organismes vivants"],
  "correctAnswerIndex": 1,
  "explanation": "La laisse de mer est une fenêtre sur l''écosystème. Beaucoup d''éléments naturels = bon signe. Beaucoup de plastiques = mauvais signe. Les œufs de raie, os de seiche, algues particulières indiquent la présence d''espèces spécifiques."
}'),

('quizz', 'Observation Sensorielle', '{
  "question": "Quels signes visuels permettent d''évaluer l''état de la mer depuis le rivage ?",
  "answers": ["La couleur des rochers uniquement", "La présence de moutons (crêtes blanches), la hauteur des vagues, si elles cassent, la visibilité à l''horizon", "La présence de bateaux de pêche uniquement", "La température de l''air"],
  "correctAnswerIndex": 1,
  "explanation": "Les ''moutons'' (écume sur les crêtes) apparaissent à partir de Beaufort 3. La façon dont les vagues cassent, la visibilité, le type de houle — tout cela se lit depuis le rivage avant de s''engager sur l''eau."
}'),

('quizz', 'Observation Sensorielle', '{
  "question": "Que peut-on observer concernant les vagues pour anticiper leur dangerosité ?",
  "answers": ["Uniquement leur hauteur", "Leur hauteur, leur forme (creuses ou douces), leur fréquence, et s''il y a du ressac sur les zones rocheuses", "Uniquement leur couleur", "La direction du vent uniquement"],
  "correctAnswerIndex": 1,
  "explanation": "Des vagues creuses et rapides sont plus dangereuses que des vagues douces et longues. Le ressac (vague qui rebondit sur la côte) crée des zones particulièrement instables. Observer 5 minutes avant de s''engager."
}'),

-- =====================================================
-- QUIZZ — Toutes les notions - comprendre (fiches 58-60, 69, 75-77, 88, 118-119)
-- =====================================================

('quizz', 'Toutes les notions - comprendre', '{
  "question": "Comment les espèces marines sont-elles adaptées à l''estran, un milieu extrême ?",
  "answers": ["Elles ne s''y adaptent pas — c''est un milieu hostile vide de vie", "Elles développent des adaptations spécifiques : carapaces (crabe), adhérence (patelle), dessèchement toléré (algues)", "Elles migrent à chaque marée", "Elles vivent uniquement dans l''eau constamment"],
  "correctAnswerIndex": 1,
  "explanation": "L''estran alterne immersion et émersion, chaleur et froid, eau douce (pluie) et eau salée. Ses habitants ont des adaptations remarquables : la patelle colle à son rocher, la crépidule résiste à la dessiccation, les algues sont flexibles."
}'),

('quizz', 'Toutes les notions - comprendre', '{
  "question": "Comment fonctionne une chaîne alimentaire marine ?",
  "answers": ["Les gros poissons mangent les petits, sans autre lien", "Du phytoplancton aux grands prédateurs, chaque maillon est essentiel : la disparition d''un maillon affecte toute la chaîne", "Les algues mangent les poissons", "Seuls les animaux du fond participent à la chaîne"],
  "correctAnswerIndex": 1,
  "explanation": "Le phytoplancton → zooplancton → petits poissons → grands prédateurs. Chaque maillon est vital. La surpêche d''un maillon, la disparition du phytoplancton — tout déséquilibre se répercute dans toute la chaîne."
}'),

('quizz', 'Toutes les notions - comprendre', '{
  "question": "Quelles sont les principales activités humaines sur le littoral ?",
  "answers": ["Uniquement la pêche professionnelle", "Pêche, plaisance, sports nautiques, tourisme, transport maritime, extraction de ressources — nous partageons tous cet espace", "Uniquement le tourisme et la baignade", "Uniquement les activités industrielles"],
  "correctAnswerIndex": 1,
  "explanation": "Le littoral est un espace partagé entre de nombreux usages : pêcheurs professionnels, plaisanciers, kitesurfeurs, promeneurs, industries portuaires. Cette cohabitation nécessite des règles et de la concertation."
}'),

('quizz', 'Toutes les notions - comprendre', '{
  "question": "Qu''est-ce que l''économie bleue ?",
  "answers": ["L''économie des pays côtiers uniquement", "Le développement d''activités économiques maritimes qui respectent la santé de l''océan sur le long terme", "La pêche industrielle intensive", "Le tourisme balnéaire uniquement"],
  "correctAnswerIndex": 1,
  "explanation": "L''économie bleue désigne l''ensemble des activités économiques liées à la mer (pêche, tourisme, énergies marines, transport) développées de manière durable, sans compromettre la santé de l''océan."
}'),

('quizz', 'Toutes les notions - comprendre', '{
  "question": "Quels sont les trois grands facteurs qui entraînent les courants marins de surface ?",
  "answers": ["La lune, le soleil et la pluie", "Le vent, la rotation de la Terre (effet de Coriolis) et la forme des côtes / fonds marins", "La température, la salinité et les marées uniquement", "La pression atmosphérique uniquement"],
  "correctAnswerIndex": 1,
  "explanation": "Les courants de surface résultent de l''action du vent (principal moteur), de l''effet de Coriolis (déviation due à la rotation terrestre) et de la géographie des côtes et des fonds qui canalisent et dévient les flux."
}'),

('quizz', 'Toutes les notions - comprendre', '{
  "question": "Quel est le rôle des courants marins dans la distribution des nutriments ?",
  "answers": ["Aucun — les nutriments restent toujours au fond", "Les courants transportent de l''eau riche en nutriments depuis les profondeurs vers la surface, permettant à la vie de prospérer", "Les courants appauvrissent l''eau en nutriments", "Uniquement les courants profonds ont un rôle"],
  "correctAnswerIndex": 1,
  "explanation": "Les remontées d''eau profonde (upwellings), provoquées par des courants, font remonter des eaux froides riches en nutriments en surface. Ces zones sont parmi les plus productives biologiquement au monde."
}'),

('quizz', 'Toutes les notions - comprendre', '{
  "question": "Pourquoi tous les éléments du milieu marin sont-ils interdépendants ?",
  "answers": ["Ce n''est pas le cas — chaque espèce vit indépendamment", "Le vent crée les vagues, les vagues façonnent la côte, la côte abrite des espèces — tout est lié dans un système complexe", "Seuls le vent et les marées sont liés", "L''interdépendance ne concerne que les espèces animales"],
  "correctAnswerIndex": 1,
  "explanation": "Le vent crée des vagues, les vagues érodent les falaises créant des anses, les anses abritent des espèces spécifiques qui attirent des oiseaux — tout s''influence. Modifier un élément impacte tout le système."
}'),

-- =====================================================
-- QUIZZ — Toutes les notions - observer (fiches 13-15, 54, 61, 72, 78, 92-97, 105-107)
-- =====================================================

('quizz', 'Toutes les notions - observer', '{
  "question": "Comment identifier des traces de présence animale sur le littoral ?",
  "answers": ["Uniquement par les sons produits par les animaux", "Par les empreintes dans le sable humide, les plumes, les coquilles ouvertes, les algues arrachées", "En creusant dans le sable", "Il est impossible de trouver des traces sans jumelles"],
  "correctAnswerIndex": 1,
  "explanation": "Les traces de pas sur le sable humide, les plumes, les coquilles percées par des prédateurs, les empreintes de phoques — le littoral est une lecture continue de la vie animale si l''on sait regarder."
}'),

('quizz', 'Toutes les notions - observer', '{
  "question": "Pourquoi tout ce qui est inhabituel en mer ou sur le littoral doit-il être signalé ?",
  "answers": ["Par obligation légale uniquement", "Chaque signalement (pollution, espèce échouée, filet abandonné) peut déclencher une action de protection ou de recherche", "Uniquement si c''est une espèce protégée", "Uniquement en zone de réserve naturelle"],
  "correctAnswerIndex": 1,
  "explanation": "Des milliers d''yeux valent mieux qu''un seul. Signaler une pollution, un animal échoué, un engin abandonné peut déclencher une intervention. Des applications comme OBSenMER permettent de centraliser ces observations."
}'),

('quizz', 'Toutes les notions - observer', '{
  "question": "Que faut-il observer sur la marée et le courant avant une activité nautique ?",
  "answers": ["Uniquement la hauteur de la mer au moment du départ", "L''heure de haute/basse mer, l''amplitude, les zones de courant fort ou de ressac potentiel", "La couleur de l''eau uniquement", "La direction du vent uniquement"],
  "correctAnswerIndex": 1,
  "explanation": "Avant toute sortie : heure et coefficient de marée, zones de courant identifiées, zones de ressac. Ces informations, croisées avec la météo, permettent d''évaluer le niveau de risque et d''adapter le plan."
}'),

('quizz', 'Toutes les notions - observer', '{
  "question": "Comment les pratiques nautiques et littorales évoluent-elles vers plus de durabilité ?",
  "answers": ["Elles ne changent pas — les pratiques restent identiques depuis 50 ans", "Matériaux recyclés, moteurs électriques, zones protégées, codes de bonne conduite en mer — les choses changent", "Uniquement par l''interdiction de certaines activités", "Uniquement grâce aux réglementations obligatoires"],
  "correctAnswerIndex": 1,
  "explanation": "Bateaux solaires, combinaisons en matériaux recyclés, zones de mouillage sur bouées pour protéger les herbiers, charte des bonnes pratiques — les acteurs du milieu s''engagent progressivement vers plus de durabilité."
}'),

-- =====================================================
-- QUIZZ — Interactions des éléments climatiques (fiches 24-26, 30-32, 49, 69, 76, 104, 109-112)
-- =====================================================

('quizz', 'Interactions des éléments climatiques', '{
  "question": "Quelle est la différence entre les vagues et la houle ?",
  "answers": ["Il n''y a aucune différence", "La mer du vent est courte et désordonnée (vent local). La houle est longue et régulière, formée au large et ayant voyagé loin de sa zone de génération", "La houle est uniquement présente en océan, pas près des côtes", "Les vagues sont plus grosses que la houle"],
  "correctAnswerIndex": 1,
  "explanation": "La houle a voyagé loin de la tempête qui l''a créée : elle devient régulière et longue. On peut avoir de la houle par vent calme. La mer du vent est créée localement, courte et hachée."
}'),

('quizz', 'Interactions des éléments climatiques', '{
  "question": "Quels sont les trois facteurs qui déterminent la taille d''une houle ?",
  "answers": ["La profondeur, la salinité et la température de l''eau", "La vitesse du vent, la durée pendant laquelle il souffle, et le fetch (distance d''eau libre sur laquelle il souffle)", "La lune, le soleil et la pression atmosphérique uniquement", "Le courant marin, la marée et la pression"],
  "correctAnswerIndex": 1,
  "explanation": "Plus le vent est fort, souffle longtemps et sur une grande distance (fetch), plus la houle est puissante. C''est pourquoi les côtes exposées à l''Atlantique reçoivent de fortes houles venant de milliers de kilomètres."
}'),

('quizz', 'Interactions des éléments climatiques', '{
  "question": "Comment se produit le déferlement des vagues à l''approche du rivage ?",
  "answers": ["Uniquement à cause du vent côtier", "Quand la profondeur de l''eau devient insuffisante, la base de la vague ralentit, la crête s''avance et ''trébuche'' : la vague déferle", "Les vagues déferlent uniquement lors des marées hautes", "Le déferlement est causé par le courant de marée uniquement"],
  "correctAnswerIndex": 1,
  "explanation": "En eau peu profonde (profondeur inférieure à environ la moitié de la longueur d''onde), la base de la vague freine sur le fond, la crête continue et dépasse : la vague ''trébuche'' et déferle."
}'),

('quizz', 'Interactions des éléments climatiques', '{
  "question": "Comment les différents types de courants s''influencent-ils ?",
  "answers": ["Les courants de marée et les courants de vent n''interagissent jamais", "Courants de marée, de dérive (vent) et généraux se combinent : leur addition peut créer des zones très agitées ou au contraire calmes", "Seul le courant de marée compte près des côtes", "Les courants généraux n''existent pas en Méditerranée"],
  "correctAnswerIndex": 1,
  "explanation": "Un courant de marée de 2 nœuds opposé à un courant de vent peut créer une mer très hachée et dangereuse. À l''inverse, aller dans le sens du courant peut doubler votre vitesse."
}'),

('quizz', 'Interactions des éléments climatiques', '{
  "question": "Pourquoi la gestion des déchets plastiques est-elle un enjeu particulièrement important pour le milieu marin ?",
  "answers": ["Uniquement pour des raisons esthétiques", "Les plastiques persistent des centaines d''années, se fragmentent en microplastiques, entrent dans la chaîne alimentaire et affectent tout l''écosystème marin", "Uniquement parce qu''ils bloquent les hélices des bateaux", "Le milieu marin neutralise naturellement les plastiques en quelques années"],
  "correctAnswerIndex": 1,
  "explanation": "Un plastique en mer peut persister 100 à 400 ans. En se fragmentant, il crée des microplastiques ingérés par le plancton, les poissons, et finalement retrouvés dans nos assiettes. C''est une contamination globale de la chaîne du vivant."
}'),

('quizz', 'Interactions des éléments climatiques', '{
  "question": "Pourquoi le littoral normand est-il considéré comme un territoire à forts enjeux de biodiversité ?",
  "answers": ["Uniquement parce qu''il est peu fréquenté", "Il combine des milieux diversifiés (mer, estran, dunes, estuaires, bocage) dans un équilibre fragile entre usages humains et nature", "Parce que la Normandie interdit toute activité humaine sur son littoral", "Uniquement parce que les eaux y sont très froides"],
  "correctAnswerIndex": 1,
  "explanation": "La Normandie concentre des milieux remarquables : baie du Mont-Saint-Michel, falaises d''Étretat, marais du Cotentin, estuaires de la Seine et de la Vire — 34 sites Natura 2000 avec partie marine."
}'),

-- =====================================================
-- QUIZZ — Général (fiches 63-67, 73-74, 79-81, 98, 125-128)
-- =====================================================

('quizz', 'Général', '{
  "question": "Pourquoi un dérangement de la faune peut-il causer du tort aux animaux ?",
  "answers": ["Uniquement parce que les animaux ont peur du bruit", "Fuite = dépense d''énergie précieuse, abandon du nid, stress. Des parents dérangés peuvent abandonner leurs œufs ou leurs petits", "Les animaux s''habituent rapidement à la présence humaine sans conséquences", "Seuls les oiseaux sont sensibles au dérangement"],
  "correctAnswerIndex": 1,
  "explanation": "Chaque fuite coûte de l''énergie à un animal. En période de reproduction, le dérangement peut provoquer l''abandon des œufs ou des jeunes. C''est pourquoi la discrétion est une règle fondamentale."
}'),

('quizz', 'Général', '{
  "question": "Quelle est la règle d''or pour limiter son impact sur le littoral ?",
  "answers": ["Ramasser uniquement les déchets plastiques", "Ne rien laisser derrière soi et respecter les chemins balisés", "Éviter d''aller à la plage en dehors des zones aménagées", "Observer mais ne jamais toucher quoi que ce soit"],
  "correctAnswerIndex": 1,
  "explanation": "''Ne rien laisser derrière soi'' est la règle de base. Combinée au respect des chemins balisés (pour les dunes) et des distances d''observation (pour la faune), elle résume l''essentiel de la pratique responsable."
}'),

('quizz', 'Général', '{
  "question": "Pourquoi chacun peut-il devenir un acteur de la préservation de la biodiversité ?",
  "answers": ["Uniquement les scientifiques peuvent contribuer", "Signaler une espèce, ramasser un déchet, respecter les zones — chaque geste compte et les données citoyennes sont précieuses pour la recherche", "Uniquement en faisant des dons à des associations", "La préservation est uniquement l''affaire des pouvoirs publics"],
  "correctAnswerIndex": 1,
  "explanation": "Les sciences participatives (iNaturalist, OBSenMER, Vigie-Nature) collectent des millions d''observations citoyennes. Des milliers d''yeux valent mieux qu''un seul. Chaque signalement est une donnée pour la science."
}'),

('quizz', 'Général', '{
  "question": "Pourquoi la protection de l''environnement est-elle aussi une question de santé humaine ?",
  "answers": ["Ce n''est pas lié — la santé humaine ne dépend pas de l''environnement marin", "La pollution de l''eau et de l''air cause des maladies. L''environnement est notre ''maison commune'' : s''il est en mauvais état, notre santé en pâtit", "Uniquement pour les personnes vivant près de la mer", "Uniquement à cause des algues toxiques"],
  "correctAnswerIndex": 1,
  "explanation": "Pollution de l''eau → maladies hydrique. Microplastiques dans les aliments. Algues toxiques liées à l''eutrophisation. La santé des écosystèmes marins est directement liée à la santé humaine."
}'),

('quizz', 'Général', '{
  "question": "Quelle différence y a-t-il entre ''sensibilisation'' et ''action'' environnementale ?",
  "answers": ["Ce sont deux mots pour la même chose", "La sensibilisation c''est la prise de conscience et l''information ; l''action c''est l''application concrète : changer ses habitudes, participer à des initiatives", "La sensibilisation suffit — l''action n''est pas nécessaire", "L''action est uniquement collective, la sensibilisation uniquement individuelle"],
  "correctAnswerIndex": 1,
  "explanation": "La sensibilisation ouvre les yeux, l''action change les comportements. Savoir que le plastique pollue (sensibilisation) et refuser une paille en plastique (action) sont deux étapes complémentaires mais distinctes."
}'),

-- =====================================================
-- TRIAGE — Vrai ou Faux
-- =====================================================

('triage', 'Les Marées', '{
  "statement": "La marée monte à la même vitesse du début jusqu''à la fin du flot.",
  "isTrue": false,
  "explanation": "La règle des douzièmes montre que la marée monte lentement au début (1/12 la 1ère heure), rapidement au milieu (3/12 aux 3ème et 4ème heures) et à nouveau lentement à la fin. C''est à mi-marée que les courants sont les plus forts."
}'),

('triage', 'Les Marées', '{
  "statement": "On peut calculer les horaires de marée des années à l''avance.",
  "isTrue": true,
  "explanation": "Les marées sont des phénomènes astronomiques réguliers et prévisibles. Le SHOM peut calculer les horaires avec une précision à la minute, des années à l''avance."
}'),

('triage', 'Météo & Marées', '{
  "statement": "Un vent de terre est dangereux car il peut éloigner du bord et la zone côtière peut sembler calme alors que la mer ouverte est agitée.",
  "isTrue": true,
  "explanation": "La zone côtière sous le vent de terre est abritée, mais au-delà, la mer peut être agitée. En cas de problème, le vent pousse vers le large au lieu d''aider à rentrer."
}'),

('triage', 'Caractéristiques du littoral', '{
  "statement": "Il faut ramasser toute la laisse de mer (algues incluses) pour nettoyer la plage.",
  "isTrue": false,
  "explanation": "Les éléments naturels de la laisse de mer (algues, bois, coquilles) nourrissent l''écosystème dunaire et abritent de nombreux invertébrés. Seuls les déchets d''origine humaine doivent être ramassés."
}'),

('triage', 'Observation Sensorielle', '{
  "statement": "Le dérangement d''un animal commence uniquement quand il prend la fuite.",
  "isTrue": false,
  "explanation": "Il y a dérangement dès qu''il y a un changement de comportement : un oiseau qui cesse de se nourrir, un phoque qui lève la tête, un animal qui s''immobilise. La fuite est le stade le plus extrême du dérangement."
}'),

('triage', 'Toutes les notions - observer', '{
  "statement": "Observer 5 minutes la mer depuis le rivage avant de s''engager sur l''eau est une bonne pratique de sécurité.",
  "isTrue": true,
  "explanation": "Ces quelques minutes permettent d''identifier les séries de grosses vagues, les zones de déferlement, les courants visibles, les zones calmes. C''est un réflexe de sécurité essentiel."
}'),

('triage', 'Général', '{
  "statement": "Chaque observation citoyenne signalée sur des applications comme iNaturalist ou OBSenMER est une donnée utile pour les scientifiques.",
  "isTrue": true,
  "explanation": "Les sciences participatives s''appuient sur des millions d''observations citoyennes pour suivre la biodiversité. Chaque signalement, même banal, contribue à la connaissance scientifique."
}'),

('triage', 'Interactions des éléments climatiques', '{
  "statement": "On peut avoir de la houle même sans vent local.",
  "isTrue": true,
  "explanation": "La houle est générée par une tempête distante. Elle voyage des milliers de kilomètres et arrive sur la côte alors que le vent local est calme. C''est pourquoi la mer peut être agitée par beau temps."
}'),

-- =====================================================
-- MOTS EN RAFALE
-- =====================================================

('mots', 'Les Marées', '{
  "definition": "Zone du littoral alternativement couverte et découverte par la mer, un des milieux les plus riches et extrêmes de la planète",
  "answer": "L''estran",
  "hint": "On le parcourt à marée basse pour trouver des organismes marins"
}'),

('mots', 'Les Marées', '{
  "definition": "Moment de transition entre marée montante et descendante où le courant est quasi nul",
  "answer": "L''étale",
  "hint": "Ni flot, ni jusant — un bref instant de pause"
}'),

('mots', 'Les Marées', '{
  "definition": "Marée de grande amplitude, lors de l''alignement Soleil-Lune-Terre (coefficients élevés)",
  "answer": "La vive-eau",
  "hint": "Contraire de la morte-eau — grandes marées, forts courants"
}'),

('mots', 'Les Marées', '{
  "definition": "Terme technique désignant la marée montante",
  "answer": "Le flot",
  "hint": "Il ''flotte'' vers le haut — par opposition au jusant"
}'),

('mots', 'Les Marées', '{
  "definition": "Terme technique désignant la marée descendante",
  "answer": "Le jusant",
  "hint": "Le jus descend — par opposition au flot"
}'),

('mots', 'Caractéristiques du littoral', '{
  "definition": "Ligne de débris naturels et artificiels déposée par la mer au niveau de sa plus haute montée",
  "answer": "La laisse de mer",
  "hint": "Elle sert de repère pour savoir jusqu''où la mer est montée"
}'),

('mots', 'Repères spatio-temporels', '{
  "definition": "Point de repère visuel fixe à terre (clocher, phare, château d''eau) utilisé par les navigateurs pour se positionner",
  "answer": "L''amer",
  "hint": "Deux de ces repères suffisent à déterminer sa position exacte"
}'),

('mots', 'Interactions des éléments climatiques', '{
  "definition": "Série d''ondes régulières à la surface de la mer, générées par une tempête distante et ayant voyagé loin de leur origine",
  "answer": "La houle",
  "hint": "On peut en avoir par vent calme — elle vient de loin"
}'),

('mots', 'Météo & Marées', '{
  "definition": "Vent local qui se forme l''après-midi car la terre se réchauffe plus vite que la mer, créant un appel d''air de la mer vers la côte",
  "answer": "La brise de mer",
  "hint": "Elle se lève souvent en début d''après-midi par beau temps"
}'),

('mots', 'Toutes les notions - comprendre', '{
  "definition": "Enrichissement excessif d''un milieu aquatique en nutriments (nitrates agricoles), entraînant la prolifération d''algues vertes",
  "answer": "L''eutrophisation",
  "hint": "Elle appauvrit l''eau en oxygène et cause des marées vertes"
}'),

('mots', 'Général', '{
  "definition": "Fragmentation progressive des matières plastiques en particules de moins de 5 mm dans les milieux naturels",
  "answer": "Les microplastiques",
  "hint": "Invisibles à l''œil nu, présents dans toute la chaîne alimentaire marine"
}'),

('mots', 'Observation Sensorielle', '{
  "definition": "Distance d''eau libre sur laquelle le vent souffle sans interruption — l''un des trois facteurs déterminant la taille des vagues",
  "answer": "Le fetch",
  "hint": "Plus il est grand, plus les vagues peuvent être grosses"
}'),

-- =====================================================
-- DILEMME DU MARIN
-- =====================================================

('dilemme', 'Général', '{
  "optionA": "Interdire l''accès à l''estran pendant les périodes de reproduction des espèces littorales",
  "optionB": "Autoriser l''accès en sensibilisant et en délimitant des zones protégées avec balisage",
  "explanation": "Ce dilemme oppose protection maximale et accès éducatif. Les gestionnaires optent souvent pour des solutions mixtes : accès libre hors saison de reproduction, zones balisées en saison. La sensibilisation est plus durable que l''interdiction pure."
}'),

('dilemme', 'Caractéristiques du littoral', '{
  "optionA": "Construire des digues et enrochements pour protéger les maisons menacées par le recul du trait de côte",
  "optionB": "Accompagner le ''repli stratégique'' : relocaliser les habitations menacées et laisser la côte évoluer naturellement",
  "explanation": "Les ouvrages durs protègent localement mais aggravent souvent l''érosion ailleurs et coûtent cher à entretenir. Le repli stratégique est douloureux humainement mais plus efficace à long terme face à la montée des eaux."
}'),

('dilemme', 'Général', '{
  "optionA": "Pratiquer la pêche à pied librement sur tout l''estran, y compris dans les zones de reproduction",
  "optionB": "Respecter les zones et saisons de fermeture même si elles réduisent les prises",
  "explanation": "La pêche à pied intensive dans les zones de reproduction détruit les nurseries et appauvrit les stocks. Les fermetures saisonnières permettent aux espèces de se reproduire et maintiennent des populations viables pour tous."
}'),

('dilemme', 'Interactions des éléments climatiques', '{
  "optionA": "Maintenir ses activités nautiques habituelles en s''adaptant à chaque sortie, sans changer ses pratiques",
  "optionB": "Réduire son impact carbone global (transports, équipements) et adopter des pratiques plus durables sur et autour de l''eau",
  "explanation": "Le changement climatique accélère l''érosion côtière et modifie les conditions météo. La réduction individuelle de l''empreinte carbone, combinée à une pratique responsable, contribue à préserver les milieux qui rendent ces activités possibles."
}');
