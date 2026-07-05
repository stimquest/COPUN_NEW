-- =============================================
-- Champ "explication" — les 128 cartes objectifs COP'UN
-- =============================================
-- 2-3 phrases qui répondent vraiment à la question posée (façon livre
-- "les pourquoi"), distinctes de :
-- - objectif : ce que le mono doit viser pédagogiquement (déjà en base)
-- - tip      : un conseil d'animation/terrain (déjà en base)
-- Le wiki (fiches mémo) reste le lieu d'exploration approfondie —
-- ce champ ne fait qu'apporter de quoi raconter le concept sur le terrain.
--
-- Sourcing (vérifié par recherche web pour tout contenu chiffré ou technique) :
-- - Marées, coefficients (échelle 20-120) : SHOM
-- - Déferlement des vagues                : Wikipédia, ENSEEIHT
-- - Houle / mer du vent / fetch           : Météo-France, sources nautiques
-- - Classification des nuages             : OMM / Météo-France
-- - Migrations d'oiseaux en Normandie     : GONm (Groupe Ornithologique Normand),
--                                            ANBDD (phénologie : 4,7 j en moyenne
--                                            au printemps, 1986-2022 — pas le "18 j"
--                                            du tip pré-existant de la fiche 116,
--                                            non retenu faute de source fiable)
-- - Mammifères marins en Normandie        : ANBDD (24 espèces recensées)
-- - Natura 2000 en Normandie              : DREAL Normandie / Région Normandie
--                                            (94 sites dont 34 avec partie marine —
--                                            confirme le tip pré-existant de la fiche 112)
-- Pour le reste (mécanismes qualitatifs sans chiffre précis), rédaction sur la
-- base des connaissances déjà présentes et validées dans le projet (quiz, wiki).
-- =============================================

-- 5 [COMPRENDRE] Pourquoi le moment entre deux marées s'appelle l'étale ?
UPDATE pedagogical_content SET explication =
'Quand la mer arrête de monter, avant de redescendre, l''eau ne bouge presque plus pendant quelques minutes — comme une respiration entre deux mouvements. C''est l''étale : le courant y est quasi nul.'
WHERE id = '5';

-- 7 [COMPRENDRE] Pourquoi il est important de connaître l'amplitude de la marée ?
UPDATE pedagogical_content SET explication =
'Le coefficient de marée (de 20 à 120) mesure l''écart entre marée haute et marée basse. Plus il est élevé, plus l''eau monte et descend fort — et plus les courants sont puissants.'
WHERE id = '7';

-- 11 [COMPRENDRE] Pourquoi le rythme des marées a des incidences sur le « vivant » et les activités humaines ?
UPDATE pedagogical_content SET explication =
'Chaque espèce de l''estran a appris à vivre avec l''alternance immersion/émersion : certaines se nourrissent à marée basse, d''autres se reproduisent à marée haute. Les activités humaines suivent le même rythme : horaires de pêche, accès aux ports, sorties en mer.'
WHERE id = '11';

-- 17 [COMPRENDRE] Comment se forme le vent ?
UPDATE pedagogical_content SET explication =
'L''air se déplace toujours d''une zone où il y en a beaucoup (haute pression) vers une zone où il y en a moins (basse pression), un peu comme l''air qui s''échappe d''un ballon. Plus l''écart de pression est grand, plus le vent souffle fort.'
WHERE id = '17';

-- 20 [OBSERVER] Comment repère-t-on d'où vient le vent ?
UPDATE pedagogical_content SET explication =
'Le vent laisse des traces visibles : un drapeau qui claque, de la fumée qui dérive, des rides sur l''eau. Tous pointent dans la direction où le vent souffle — il suffit de remonter le fil.'
WHERE id = '20';

-- 32 [COMPRENDRE] Comment se produit le déferlement des vagues ?
UPDATE pedagogical_content SET explication =
'En pleine mer, une vague avance librement. Mais en s''approchant du rivage, le fond remonte : la base de la vague ralentit à cause du frottement, alors que le sommet continue d''avancer. Il finit par dépasser la base et s''effondre — c''est le déferlement.'
WHERE id = '32';

-- 44 [COMPRENDRE] Comment se forment les dunes ?
UPDATE pedagogical_content SET explication =
'Le vent transporte le sable sec de la plage vers l''intérieur des terres. Dès qu''il rencontre un obstacle — une touffe d''oyat, un morceau de bois — le sable s''y accumule peu à peu. C''est ainsi qu''une dune grandit, année après année.'
WHERE id = '44';

-- 13 [OBSERVER] Comment sait-on que l'eau monte et descend ?
UPDATE pedagogical_content SET explication =
'À l''œil nu, la marée est trop lente pour se voir en direct — il faut comparer le niveau de l''eau à un repère fixe (rocher, poteau) à quelques minutes d''intervalle pour voir la différence.'
WHERE id = '13';

-- 27 [OBSERVER] Comment repère-t-on le sens du courant ?
UPDATE pedagogical_content SET explication =
'L''eau qui s''écoule autour d''un obstacle fixe — une bouée, un poteau — forme un petit remous ou une traînée d''écume du côté vers lequel elle pousse. Cette « moustache » indique directement le sens du courant.'
WHERE id = '27';

-- 46 [OBSERVER] Comment décrirais-tu l'état de la plage ?
UPDATE pedagogical_content SET explication =
'Chaque plage a sa propre carte d''identité : couleur et grain du sable, présence de galets ou de rochers, hauteur des dunes, largeur de l''estran. Ces éléments racontent l''histoire du lieu — son exposition au vent, à la houle, à l''érosion.'
WHERE id = '46';

-- 16 [PROTÉGER] Pourquoi respecter les zones de reproduction selon les cycles de marée ?
UPDATE pedagogical_content SET explication =
'L''estran découvert à marée basse abrite des œufs, des larves et de jeunes animaux enfouis dans le sable ou cachés sous les rochers. Un pas suffit parfois à écraser une ponte entière — invisible mais bien présente sous la surface.'
WHERE id = '16';

-- 63 [PROTÉGER] Pourquoi je peux observer tout en étant discret ?
UPDATE pedagogical_content SET explication =
'Un animal qui repère une présence humaine change souvent de comportement avant même de fuir : il s''arrête de se nourrir, reste immobile, guette. Rester silencieux et à distance permet de l''observer sans le pousser à gaspiller cette énergie.'
WHERE id = '63';

-- 75 [COMPRENDRE] Quelles sont les activités humaines en mer et sur le littoral ?
UPDATE pedagogical_content SET explication =
'Le littoral est un espace partagé par de nombreux usages qui cohabitent, parfois avec des règles pour s''organiser : pêche professionnelle et à pied, plaisance et sports nautiques, tourisme et promenade, conchyliculture, transport maritime.'
WHERE id = '75';

-- 98 [PROTÉGER] Pourquoi la protection de l'environnement est-elle importante pour la santé humaine ?
UPDATE pedagogical_content SET explication =
'Ce que l''on rejette dans l''eau ou dans l''air finit souvent par nous revenir : poissons contaminés, eau de baignade polluée, air chargé en particules. Protéger le milieu marin, c''est aussi se protéger soi-même.'
WHERE id = '98';

-- 118 [COMPRENDRE] Quel est le rôle des courants marins dans la distribution des nutriments dans l'océan ?
UPDATE pedagogical_content SET explication =
'En profondeur, l''eau est froide et chargée en nutriments accumulés au fil du temps. Certains courants la font remonter vers la surface (upwelling) : le phytoplancton peut alors s''en nourrir et prospérer, nourrissant à son tour toute la chaîne alimentaire.'
WHERE id = '118';
-- Lot 1 — Marées, courants, vagues/houle, météo marine, nuages (caracteristiques_littoral)
-- Sources : SHOM (marées, coefficients), Météo-France (nuages, houle/fetch),
-- ENSEEIHT/Wikipédia (déferlement, déjà vérifié dans l'échantillon précédent)

UPDATE pedagogical_content SET explication =
'Deux fois par jour environ, la Lune (et un peu le Soleil) attirent les masses d''eau vers eux. La Terre tournant plus vite que la Lune ne se déplace sur son orbite, chaque point du globe passe deux fois sous cette attraction en un peu plus de 24h : d''où deux marées hautes et deux marées basses.'
WHERE id = '1';

UPDATE pedagogical_content SET explication =
'Les marées suivent un cycle astronomique parfaitement régulier, calculable à l''avance. Le SHOM (Service Hydrographique et Océanographique de la Marine) publie des annuaires officiels donnant les horaires pour tous les ports français, des années à l''avance.'
WHERE id = '2';

UPDATE pedagogical_content SET explication =
'La marée n''est pas un simple "niveau qui monte" partout en même temps : c''est une onde qui se propage depuis l''océan et doit contourner les caps, entrer dans les baies, remonter les estuaires. Chaque obstacle géographique retarde ou accélère son passage, d''où des horaires différents d''une plage à l''autre.'
WHERE id = '3';

UPDATE pedagogical_content SET explication =
'L''estran est soumis à des conditions extrêmes : immergé puis à l''air libre, chaud puis froid, humide puis desséché — parfois plusieurs fois par jour. Peu d''organismes supportent un tel grand écart, ce qui en fait un milieu à la fois pauvre en espèces généralistes et riche en espèces hyper-spécialisées.'
WHERE id = '4';

UPDATE pedagogical_content SET explication =
'La position de la Lune et du Soleil suit des lois de mécanique céleste connues avec une précision extrême. C''est ce qui permet de calculer, des années à l''avance, l''heure et la hauteur de chaque marée dans n''importe quel port, à quelques minutes près.'
WHERE id = '6';

UPDATE pedagogical_content SET explication =
'La marée ne monte pas à vitesse constante. Elle est lente au début et à la fin du flot, et beaucoup plus rapide entre la 2ᵉ et la 4ᵉ heure : c''est la règle des douzièmes (1/12, 2/12, 3/12, 3/12, 2/12, 1/12 du marnage total, heure par heure).'
WHERE id = '8';

UPDATE pedagogical_content SET explication =
'C''est pendant les heures où la marée monte ou descend le plus vite (règle des douzièmes) que le débit d''eau est maximal — donc que les courants sont les plus forts. À l''étale, à l''inverse, le courant tombe presque à zéro.'
WHERE id = '9';

UPDATE pedagogical_content SET explication =
'Ce vocabulaire vient de la marine traditionnelle : le "flot" est la marée montante, le "jusant" la marée descendante. Entre les deux se glisse l''étale, ce bref moment où le courant s''arrête avant de repartir dans l''autre sens.'
WHERE id = '10';

UPDATE pedagogical_content SET explication =
'En journée, la terre chauffe plus vite que la mer. L''air chaud au-dessus du sol monte, laissant la place à l''air plus frais venu du large : c''est la brise de mer, qui se lève souvent en début d''après-midi. La nuit, le phénomène s''inverse (brise de terre).'
WHERE id = '18';

UPDATE pedagogical_content SET explication =
'Trois forces mettent l''eau en mouvement : l''attraction de la Lune et du Soleil (courants de marée), le vent qui pousse la surface (courants de dérive), et de grandes circulations océaniques permanentes liées aux différences de température et de densité de l''eau.'
WHERE id = '24';

UPDATE pedagogical_content SET explication =
'Les courants de marée changent de sens toutes les 6h, les courants de dérive suivent le vent du moment, et les courants généraux (comme le Gulf Stream) circulent presque toujours dans la même direction, sur des milliers de kilomètres.'
WHERE id = '25';

UPDATE pedagogical_content SET explication =
'Un courant s''additionne ou se soustrait à la vitesse d''un bateau ou d''un nageur selon qu''on le prend dans le sens ou à contre-sens. Ignorer un courant fort, c''est risquer d''être déporté loin de sa trajectoire prévue, parfois vers le large.'
WHERE id = '26';

UPDATE pedagogical_content SET explication =
'Le vent frotte sur la surface de l''eau et lui transmet de l''énergie : plus il souffle fort, longtemps, et sur une grande étendue d''eau libre (le fetch), plus les vagues qu''il crée sont hautes et puissantes.'
WHERE id = '30';

UPDATE pedagogical_content SET explication =
'La mer du vent est créée localement : courte, désordonnée, elle suit les sautes du vent. La houle, elle, vient d''une tempête parfois lointaine — en voyageant, elle s''organise et devient régulière. On peut avoir de la houle par temps calme.'
WHERE id = '31';

UPDATE pedagogical_content SET explication =
'L''eau met beaucoup plus de temps à chauffer ou refroidir que la terre (forte inertie thermique). Cette lenteur adoucit les écarts de température près des côtes, mais elle alimente aussi des masses d''air très différentes qui se rencontrent et créent une météo changeante.'
WHERE id = '38';

UPDATE pedagogical_content SET explication =
'L''eau s''évapore en permanence depuis les océans. En montant, cet air humide se refroidit ; la vapeur d''eau se condense alors en minuscules gouttelettes autour de particules en suspension (poussière, sel marin) — c''est un nuage.'
WHERE id = '39';

UPDATE pedagogical_content SET explication =
'En mer, aucun relief ne freine les systèmes météo (dépressions, fronts) : ils se déplacent librement et peuvent faire basculer les conditions en quelques dizaines de minutes, alors qu''à terre le même système met plus de temps à arriver.'
WHERE id = '40';

UPDATE pedagogical_content SET explication =
'Une dune n''est jamais figée : plus on s''éloigne de la plage, plus la végétation change, car chaque zone est protégée différemment du vent et des embruns salés. Les plantes pionnières colonisent le sable mobile, puis d''autres espèces s''installent à mesure que le sol se stabilise.'
WHERE id = '45';

UPDATE pedagogical_content SET explication =
'C''est la laisse de mer : elle marque l''endroit où l''eau s''est arrêtée à la dernière marée haute, en y déposant tout ce qu''elle transportait — algues, coquillages, bois flotté, et parfois des déchets humains.'
WHERE id = '50';

UPDATE pedagogical_content SET explication =
'La laisse de mer mélange deux origines : les débris naturels arrachés par les vagues (algues, coquilles vides, bois) qui nourrissent l''écosystème dunaire, et les déchets d''origine humaine (plastiques, mégots) qui, eux, n''ont rien à y faire.'
WHERE id = '51';

UPDATE pedagogical_content SET explication =
'La position et la forme de la laisse de mer changent d''une marée à l''autre selon la force du vent, l''amplitude de la marée et le sens des courants. En l''observant, on peut deviner jusqu''où la mer est montée et d''où venaient les éléments transportés.'
WHERE id = '52';

UPDATE pedagogical_content SET explication =
'Parce que la marée se décale d''environ 50 minutes chaque jour : l''horaire de navigation d''aujourd''hui ne sera plus le bon demain. Ce décalage suit la Lune, comme le cycle des coefficients qui revient toutes les deux semaines — la nature impose son calendrier, et le programme de la semaine s''y ajuste.'
WHERE id = '68';

UPDATE pedagogical_content SET explication =
'Pollution de l''eau, déchets plastiques, surpêche, dérangement de la faune, artificialisation du littoral : chaque activité humaine laisse une trace, parfois minime à l''échelle d''une personne mais énorme cumulée sur des millions de visiteurs.'
WHERE id = '76';

UPDATE pedagogical_content SET explication =
'Le nuage n''est pas un objet fixe : c''est un rassemblement de minuscules gouttelettes d''eau ou de cristaux de glace en suspension dans l''air, si légers qu''ils flottent tant que l''air ne les fait pas retomber sous forme de pluie ou de neige.'
WHERE id = '82';

UPDATE pedagogical_content SET explication =
'Un nuage fin laisse passer la lumière du soleil et paraît blanc. Un nuage épais, chargé de gouttelettes ou de cristaux, bloque une grande partie de cette lumière : il apparaît alors gris, voire noir juste avant un orage.'
WHERE id = '83';

UPDATE pedagogical_content SET explication =
'Les nuages sont une étape de passage : l''eau des océans s''évapore, monte, se condense en nuage, puis retombe en pluie — souvent loin de son point de départ. Sans ce transport, l''eau douce ne pourrait pas atteindre les terres éloignées de la mer.'
WHERE id = '84';

UPDATE pedagogical_content SET explication =
'L''air ne reste jamais parfaitement immobile : dès qu''une zone se réchauffe plus qu''une autre, l''air s''y allège et monte, laissant un vide que l''air voisin, plus dense, vient combler. Ce mouvement horizontal de l''air, c''est le vent.'
WHERE id = '85';

UPDATE pedagogical_content SET explication =
'Contrairement à un fleuve, un courant marin n''a ni lit ni berges visibles — c''est un déplacement d''eau au sein même de l''océan, entraîné par le vent, les marées ou de grandes circulations liées à la température et à la salinité de l''eau.'
WHERE id = '89';

UPDATE pedagogical_content SET explication =
'Une houle a quitté depuis longtemps la tempête qui l''a créée. En voyageant sur de longues distances, ses vagues désordonnées s''organisent, se régularisent et s''espacent — c''est pour cela qu''on peut avoir une mer agitée par de la houle alors qu''il n''y a pas de vent sur place.'
WHERE id = '90';

UPDATE pedagogical_content SET explication =
'La Lune met environ 24h50 à repasser au-dessus d''un même point de la Terre (un peu plus qu''une journée solaire, car elle avance elle-même sur son orbite pendant ce temps). C''est ce léger décalage qui retarde chaque marée d''environ 50 minutes par rapport à la veille.'
WHERE id = '91';

UPDATE pedagogical_content SET explication =
'L''air chaud et humide, plus léger, s''élève dans l''atmosphère. En montant, il se refroidit et ne peut plus retenir autant de vapeur d''eau : celle-ci se condense en minuscules gouttelettes ou cristaux, formant un nuage visible.'
WHERE id = '99';

UPDATE pedagogical_content SET explication =
'Plus l''air monte haut, plus il fait froid, et un air froid retient beaucoup moins de vapeur d''eau qu''un air chaud. Ce refroidissement force donc l''eau invisible contenue dans l''air à redevenir liquide (ou glace) : c''est la condensation qui forme le nuage.'
WHERE id = '100';

UPDATE pedagogical_content SET explication =
'La forme et l''altitude d''un nuage racontent ce qui se prépare : un voile fin annonce souvent un changement en douceur, un nuage qui gonfle verticalement signale de l''instabilité, un ciel entièrement gris et bas indique un temps stable mais couvert.'
WHERE id = '101';

UPDATE pedagogical_content SET explication =
'La terre se réchauffe et se refroidit plus vite que la mer. En journée, l''air chaud au-dessus du sol monte et l''air frais du large vient le remplacer : c''est la brise de mer. La nuit, la terre se refroidit plus vite que la mer, et le mouvement s''inverse : c''est la brise de terre.'
WHERE id = '102';

UPDATE pedagogical_content SET explication =
'Une houle puissante n''a besoin que de trois ingrédients : un vent fort, qui souffle longtemps, sur une grande étendue d''eau libre (le fetch). Diminuez l''un des trois, et la houle reste modeste, même avec les deux autres réunis.'
WHERE id = '104';

UPDATE pedagogical_content SET explication =
'Une baie abritée amortit la houle, un cap exposé l''amplifie. Un fond qui remonte doucement lisse les vagues, un haut-fond ou un récif proche du rivage les fait au contraire cabrer et déferler plus fort. Chaque configuration locale change complètement l''état de la mer.'
WHERE id = '113';

UPDATE pedagogical_content SET explication =
'Les météorologues classent les nuages selon trois critères complémentaires : leur altitude (bas, moyen, haut), leur forme (en couches, en amas, filamenteux) et leur capacité à donner de la pluie. Combinés, ces critères permettent d''identifier un nuage et d''anticiper le temps qu''il annonce.'
WHERE id = '114';

UPDATE pedagogical_content SET explication =
'Le cumulonimbus est reconnaissable à son développement vertical impressionnant, parfois jusqu''à 12 km de haut, en forme d''enclume à son sommet. C''est le nuage responsable des orages, de la grêle et des rafales violentes — à éviter absolument en mer.'
WHERE id = '115';

UPDATE pedagogical_content SET explication =
'À la surface, le vent pousse l''eau ; en profondeur, la rotation de la Terre (effet Coriolis) dévie sa trajectoire ; et la forme des côtes et des fonds marins canalise ou détourne ce mouvement. Les trois s''additionnent pour dessiner les grands courants de surface.'
WHERE id = '119';
-- Lot 2 — Observation, lecture du paysage, sécurité nautique (lecture_paysage)
-- Sources : Wikipédia (déferlement, déjà vérifié), sources nautiques (échelle de Beaufort,
-- pratiques d'observation), connaissances générales de vulgarisation scientifique

UPDATE pedagogical_content SET explication =
'La ligne de débris déposée par la mer (laisse de mer) marque exactement le niveau atteint par la dernière marée haute. En repérant cette ligne dès l''arrivée, on sait jusqu''où l''eau est déjà montée aujourd''hui — et donc jusqu''où elle risque de monter encore.'
WHERE id = '14';

UPDATE pedagogical_content SET explication =
'La laisse de mer d''aujourd''hui n''indique que la marée précédente : si le coefficient augmente, la mer montera plus haut que la fois d''avant. Poser ses affaires nettement au-dessus de cette ligne évite la mauvaise surprise du matériel emporté.'
WHERE id = '15';

UPDATE pedagogical_content SET explication =
'Les marins utilisent une échelle simple pour décrire l''état de la mer : plate, ridée, clapoteuse, avec ou sans moutons (écume sur les crêtes, qui apparaît généralement à partir d''un vent de force 3). Cette description rapide en dit long sur les conditions du moment.'
WHERE id = '33';

UPDATE pedagogical_content SET explication =
'Une vague douce et longue laisse le temps de réagir. Une vague courte et creuse, elle, casse plus brutalement et de façon moins prévisible — c''est ce type de vague, plus que la hauteur seule, qui rend une mer dangereuse pour une petite embarcation.'
WHERE id = '34';

UPDATE pedagogical_content SET explication =
'Tant qu''elle n''a pas déferlé, une vague transporte de l''énergie sans grand danger : elle soulève simplement l''eau. C''est au moment où elle déferle que cette énergie se libère d''un coup, créant turbulence et force d''impact — d''où l''importance de repérer où et comment ça casse avant de s''engager.'
WHERE id = '35';

UPDATE pedagogical_content SET explication =
'Un ciel se décrit par sa couverture nuageuse (dégagé, voilé, couvert), sa couleur et sa luminosité. Ces indices simples, observés régulièrement, permettent de sentir un changement de temps avant même de consulter une prévision.'
WHERE id = '41';

UPDATE pedagogical_content SET explication =
'La forme d''un nuage donne des indices sur le temps à venir : un nuage fin et filandreux en altitude annonce souvent un changement en douceur, un nuage qui gonfle verticalement signale de l''instabilité, une nappe grise uniforme indique un temps stable mais couvert.'
WHERE id = '42';

UPDATE pedagogical_content SET explication =
'Les vagues et le vent grignotent le sable de la dune côté mer pendant les tempêtes, créant parfois une petite falaise verticale. Entre deux épisodes agités, le vent redépose du sable et la végétation le refixe peu à peu — la dune respire au fil des saisons.'
WHERE id = '47';

UPDATE pedagogical_content SET explication =
'La laisse de mer est un concentré de ce que la mer a croisé : coquilles vides, algues arrachées, bois flotté, parfois des œufs de raie ou des os de seiche — autant d''indices sur les espèces qui vivent au large ou sur l''estran.'
WHERE id = '53';

UPDATE pedagogical_content SET explication =
'La proportion d''éléments naturels par rapport aux déchets humains dans la laisse de mer donne une photographie rapide de l''état du littoral à cet endroit : beaucoup de nature et peu de plastique est plutôt bon signe, l''inverse est un signal d''alerte.'
WHERE id = '54';

UPDATE pedagogical_content SET explication =
'Le sable garde la mémoire du passage des animaux : empreintes de pattes, plumes tombées, coquilles ouvertes par un prédateur, terriers dans la vase. Il suffit de ralentir le pas et de regarder vraiment le sol pour lire ces traces.'
WHERE id = '61';

UPDATE pedagogical_content SET explication =
'Le dérangement ne commence pas quand l''animal fuit, mais bien avant : un oiseau qui arrête de se nourrir, qui redresse la tête, qui cesse de couver, montre déjà qu''il a repéré une présence gênante. Observer dans le calme, c''est repérer ces signaux et reculer avant d''aller trop loin.'
WHERE id = '62';

UPDATE pedagogical_content SET explication =
'Avant de partir, un rapide tour d''horizon — direction et force du vent, état de la mer, type de nuages, heure de marée — permet de repérer à l''avance ce qui pourrait mal tourner, plutôt que de le découvrir une fois sur l''eau.'
WHERE id = '70';

UPDATE pedagogical_content SET explication =
'Un amer (phare, clocher, château d''eau) reste visible et fixe même quand on perd ses repères en mer. En croisant deux amers, on peut savoir précisément où l''on se trouve — une technique de navigation utilisée bien avant le GPS, et toujours utile s''il tombe en panne.'
WHERE id = '71';

UPDATE pedagogical_content SET explication =
'Des milliers de promeneurs et de pratiquants parcourent le littoral chaque jour : leurs yeux valent mieux qu''un seul observateur isolé. Un déchet inhabituel, un animal en détresse ou un engin de pêche abandonné signalés à temps peuvent déclencher une intervention rapide.'
WHERE id = '72';

UPDATE pedagogical_content SET explication =
'Les acteurs du nautisme testent de plus en plus de solutions pour réduire leur impact : combinaisons en matériaux recyclés, mouillages sur bouées plutôt qu''ancres pour épargner les herbiers, chartes de bonnes pratiques partagées entre clubs.'
WHERE id = '78';

UPDATE pedagogical_content SET explication =
'Observer sans curiosité, c''est juste regarder. La curiosité pousse à se poser des questions sur ce qu''on voit — pourquoi cet oiseau se comporte ainsi, d''où vient cette trace — et c''est cette question qui transforme un simple coup d''œil en véritable observation.'
WHERE id = '92';

UPDATE pedagogical_content SET explication =
'Beaucoup d''informations sur le milieu marin ne sont pas visibles : le cri d''un oiseau, l''odeur des algues à marée basse, le bruit du ressac contre les rochers. Mobiliser plusieurs sens à la fois permet de capter bien plus qu''en se fiant uniquement à la vue.'
WHERE id = '93';

UPDATE pedagogical_content SET explication =
'On ne remarque un fait inhabituel que si l''on sait d''abord ce qui est habituel. Connaître les espèces courantes d''un site permet de repérer immédiatement ce qui sort de l''ordinaire — une espèce rare, un comportement anormal — là où un œil non formé ne verrait rien de particulier.'
WHERE id = '94';

UPDATE pedagogical_content SET explication =
'Observer ne doit jamais se faire au prix du bien-être de ce qu''on observe : s''approcher trop près, faire du bruit ou toucher un animal pour "mieux voir" transforme l''observation en dérangement. Le respect fait partie intégrante de la démarche, pas une contrainte annexe.'
WHERE id = '95';

UPDATE pedagogical_content SET explication =
'Certains signaux annoncent un changement rapide des conditions : des drapeaux qui se raidissent d''un coup, de l''écume qui s''étend sur l''eau, des nuages sombres qui approchent vite, ou l''horizon qui devient soudain flou. Ces signes doivent pousser à renforcer la vigilance, voire à différer la sortie.'
WHERE id = '121';
-- Lot 3 — Interactions climatiques, état de la mer, sécurité nautique
-- Sources : Météo-France, sources nautiques (houle/vent/fetch, déjà vérifiées lot 1),
-- vulgarisation navigation

UPDATE pedagogical_content SET explication =
'Un vent de terre pousse vers le large sans qu''on s''en rende toujours compte près du bord, ce qui peut rendre le retour difficile ou impossible en pagayant. Un vent de mer, à l''inverse, peut créer du clapot juste devant la plage et compliquer une sortie de l''eau.'
WHERE id = '19';

UPDATE pedagogical_content SET explication =
'En arrivant près de la côte, la houle qui voyageait au large rencontre des fonds de moins en moins profonds : elle ralentit, se cambre, et finit par déferler comme une vague classique. Houle et vague ne sont donc pas deux phénomènes séparés, mais deux étapes d''un même mouvement d''eau.'
WHERE id = '36';

UPDATE pedagogical_content SET explication =
'Rien n''existe isolément en milieu marin : le vent crée les vagues, les vagues façonnent la côte en creusant ou en déposant du sable, cette forme de côte abrite des espèces particulières qui, à leur tour, attirent d''autres animaux. Modifier un seul de ces éléments a des répercussions sur tous les autres.'
WHERE id = '69';

UPDATE pedagogical_content SET explication =
'L''état de la mer résume en un coup d''œil ce qu''il faut savoir avant de s''engager : hauteur et espacement des vagues, direction du vent et de la houle, présence de courants ou de zones de ressac. C''est la synthèse rapide qui permet de juger si les conditions sont adaptées à l''activité prévue.'
WHERE id = '96';

UPDATE pedagogical_content SET explication =
'Sans mettre un pied dans l''eau, on peut déjà en apprendre beaucoup : des moutons (écume blanche) sur les crêtes trahissent un vent soutenu, la façon dont les vagues déferlent indique leur force, et une visibilité réduite à l''horizon annonce souvent une dégradation météo en approche.'
WHERE id = '97';

UPDATE pedagogical_content SET explication =
'Quand le vent souffle dans le même sens que la houle, il l''accompagne et la mer reste relativement organisée. Quand il souffle contre elle, il la hache : les vagues se raccourcissent, se resserrent et deviennent plus imprévisibles — c''est souvent dans cette configuration que la mer devient la plus inconfortable.'
WHERE id = '105';

UPDATE pedagogical_content SET explication =
'Avant de partir, trois questions concrètes sur la marée : à quelle heure est la prochaine haute ou basse mer, quelle est l''amplitude prévue (coefficient), et où se trouvent les zones connues de courant fort ou de ressac sur le site.'
WHERE id = '106';

UPDATE pedagogical_content SET explication =
'Un même plan d''eau peut passer de calme à dangereux en quelques dizaines de minutes si le vent forcit ou si la houle grossit. Observer l''état de la mer avant de partir, c''est décider en connaissance de cause plutôt que de découvrir un problème une fois engagé, loin du bord.'
WHERE id = '107';

UPDATE pedagogical_content SET explication =
'La période se mesure en secondes entre deux crêtes qui passent au même endroit. Une mer du vent locale a une période courte (quelques secondes), tandis qu''une houle qui a voyagé longtemps a une période plus longue — souvent 10 secondes ou plus — signe de vagues plus organisées et plus puissantes.'
WHERE id = '108';

UPDATE pedagogical_content SET explication =
'Une vague de vent naît et meurt sur place, sous le contrôle direct du vent local : elle s''arrête dès qu''il tombe. Une houle, elle, continue son chemin bien après que le vent qui l''a créée a cessé de souffler, parfois à des centaines de kilomètres de sa zone d''origine.'
WHERE id = '122';

UPDATE pedagogical_content SET explication =
'Une houle qui arrive de face sur une plage concentre son énergie directement sur le rivage. Une houle qui arrive de biais perd une partie de cette énergie en glissant le long de la côte — ce qui change fortement la taille et la qualité des vagues d''un spot à un autre, même avec la même houle au large.'
WHERE id = '123';

UPDATE pedagogical_content SET explication =
'Une houle générée par une tempête lointaine peut arriver sur une côte totalement calme et sans vent local, provoquant des vagues fortes et inattendues, voire une érosion accélérée. Se fier uniquement au temps qu''il fait sur place, sans vérifier la houle, peut donc être trompeur.'
WHERE id = '124';

UPDATE pedagogical_content SET explication =
'Le vent peut aider à avancer ou pousser vers le danger selon sa direction. Sur l''eau, ne jamais perdre le fil de sa force et de son sens permet d''anticiper une évolution des conditions et de garder toujours un chemin de retour possible vers le bord.'
WHERE id = '21';

UPDATE pedagogical_content SET explication =
'Un ciel clair et peu de vent en tout début de matinée sont les ingrédients typiques d''une future brise thermique : le sol va chauffer vite, l''air va s''y élever, et l''air frais du large viendra le remplacer en début d''après-midi. Ce cycle journalier, bien identifié, se répète souvent plusieurs jours de suite en été.'
WHERE id = '22';

UPDATE pedagogical_content SET explication =
'Un courant qu''on ignore peut doubler l''effort nécessaire pour avancer, ou au contraire déporter loin de sa trajectoire prévue sans qu''on s''en rende compte immédiatement. Vérifier son sens avant de partir permet d''économiser son énergie et d''éviter d''être emmené là où on ne voulait pas aller.'
WHERE id = '28';
-- Lot 4 — Biodiversité, saisonnalité, migrations et mammifères marins en Normandie
-- Sources : GONm (Groupe Ornithologique Normand) / ANBDD pour la phénologie de migration,
-- ANBDD pour les mammifères marins normands
-- Note : le champ "tip" existant de la fiche 116 mentionne "~18 jours" pour le décalage
-- de phénologie ; ma recherche (GONm, suivi 1986-2022) donne 4,7 jours en moyenne au
-- printemps (avec de fortes variations selon l'espèce, de +1 à -15 jours). Je m'appuie
-- sur le chiffre le plus solidement sourcé plutôt que de répéter celui du tip.

UPDATE pedagogical_content SET explication =
'Le littoral cumule les ressources de deux mondes à la fois : les nutriments apportés par la terre (rivières, ruissellement) et ceux de la mer (courants, marées). Cette zone de rencontre, appelée écotone, offre donc plus d''habitats et de nourriture qu''un milieu marin ou terrestre isolé.'
WHERE id = '57';

UPDATE pedagogical_content SET explication =
'Chaque espèce de l''estran a développé une solution à ses contraintes : une carapace rigide contre le dessèchement et les prédateurs pour le crabe, des branchies pour respirer sous l''eau, une texture flexible pour résister au ressac chez certaines algues. Ces adaptations sont le fruit de millions d''années d''évolution dans un milieu extrême.'
WHERE id = '58';

UPDATE pedagogical_content SET explication =
'Tout commence par le phytoplancton, minuscule algue capable de capter l''énergie du soleil. Il nourrit le zooplancton, qui nourrit les petits poissons, qui nourrissent à leur tour les grands prédateurs. Si un maillon de cette chaîne s''effondre — par surpêche ou pollution — tous les suivants en pâtissent.'
WHERE id = '59';

UPDATE pedagogical_content SET explication =
'De nombreuses espèces marines suivent un calendrier précis : reproduction à une saison donnée, migration entre zones d''alimentation et de reproduction, hivernage dans des eaux plus clémentes. Nos côtes servent souvent d''étape de repos et de ravitaillement sur ces longs trajets.'
WHERE id = '60';

UPDATE pedagogical_content SET explication =
'Un oiseau migrateur alterne chaque année entre deux zones géographiques, généralement pour fuir le froid ou rejoindre un site de reproduction. La Normandie n''est pas toujours la destination finale : pour beaucoup d''espèces, c''est une étape de repos et de ravitaillement sur un trajet bien plus long.'
WHERE id = '86';

UPDATE pedagogical_content SET explication =
'Les estuaires et zones humides normandes offrent une nourriture abondante (vasières riches en invertébrés) à des oiseaux épuisés par de longs vols. Pour certaines espèces, comme l''Eider à duvet, la population hivernant en Normandie représente une part significative de l''effectif national.'
WHERE id = '87';

UPDATE pedagogical_content SET explication =
'Un oiseau migrateur qui trouve sa zone d''escale détruite ou trop dérangée n''a souvent pas d''autre option à proximité : il arrive épuisé et repart sans avoir pu reconstituer ses réserves. Protéger ces étapes normandes, c''est protéger la réussite du voyage entier, bien au-delà de nos frontières régionales.'
WHERE id = '103';

UPDATE pedagogical_content SET explication =
'La phénologie, c''est le calendrier naturel des migrations : dates d''arrivée et de départ. Le suivi mené depuis les années 1980 par les ornithologues normands montre un décalage progressif de ce calendrier, différent selon les espèces — certaines avancent leur passage, d''autres le retardent.'
WHERE id = '116';

UPDATE pedagogical_content SET explication =
'Un climat plus doux plus tôt dans l''année pousse certains oiseaux à avancer leur retour, pour profiter d''une période favorable qui commence plus tôt. Mais toutes les espèces ne s''adaptent pas au même rythme, ce qui peut créer un décalage entre l''arrivée des oiseaux et la disponibilité de leur nourriture habituelle.'
WHERE id = '117';

UPDATE pedagogical_content SET explication =
'Vingt-quatre espèces de mammifères marins ont été recensées, vivantes ou échouées, sur le littoral normand — un chiffre qui témoigne d''une richesse peu connue du grand public. Trois d''entre elles sont observées régulièrement toute l''année : le phoque veau-marin, le phoque gris et le marsouin commun.'
WHERE id = '88';
-- Lot 5 — Cohabitation avec le vivant (cohabitation_vivant) + économie bleue (activites_humaines)
-- Contenu qualitatif, pas de données chiffrées engageantes à vérifier

UPDATE pedagogical_content SET explication =
'Une voile trop puissante par rapport au vent oblige à forcer sur le matériel et sur son propre pilotage — ce qui laisse moins d''attention disponible pour repérer un oiseau posé sur l''eau ou une zone sensible à éviter. Adapter sa voilure aux conditions, c''est aussi se donner les moyens de rester vigilant.'
WHERE id = '23';

UPDATE pedagogical_content SET explication =
'Les courants ne transportent pas que de l''eau : ils déplacent aussi le plancton, les larves de poissons et de crustacés, la nourriture de nombreuses espèces. Un déchet jeté dans un courant fort peut donc voyager loin et affecter des milieux bien au-delà du point où il a été abandonné.'
WHERE id = '29';

UPDATE pedagogical_content SET explication =
'Rochers couverts d''algues, mares résiduelles ou anfractuosités abritent souvent une vie discrète mais dense — anémones, petits crabes, alevins. Rester sur les sentiers ou les zones de sable dégagé évite d''écraser sans le voir tout un pan de cet écosystème.'
WHERE id = '37';

UPDATE pedagogical_content SET explication =
'Vérifier la météo avant de sortir protège à la fois le pratiquant, qui évite d''être surpris par un coup de vent ou un orage, et la faune locale, qui subit un stress supplémentaire si des activités humaines se poursuivent en pleine dégradation des conditions.'
WHERE id = '43';

UPDATE pedagogical_content SET explication =
'Chaque fuite ou changement de comportement coûte de l''énergie à un animal — une énergie dont il a besoin pour se nourrir, se reproduire ou simplement survivre à l''hiver. En période de reproduction, un dérangement répété peut même conduire des parents à abandonner leurs œufs ou leurs petits.'
WHERE id = '64';

UPDATE pedagogical_content SET explication =
'Un même endroit du littoral peut accueillir des usages très différents selon la saison : nurserie au printemps, halte migratoire en automne, zone d''hivernage en hiver. Savoir "qui est là et pourquoi" à un moment donné permet d''adapter sa présence pour ne pas perturber ce qui compte le plus à cet instant.'
WHERE id = '65';

UPDATE pedagogical_content SET explication =
'Aucun geste n''est trop petit pour compter à l''échelle collective : signaler une observation, ramasser un déchet, respecter une zone balisée. Multipliés par des milliers de personnes qui font pareil, ces petits gestes individuels deviennent une vraie force de protection.'
WHERE id = '67';

UPDATE pedagogical_content SET explication =
'Sur l''estran ou en mer, on est de passage dans un milieu qui est en permanence le lieu de vie d''innombrables espèces. Adapter sa trajectoire, son volume sonore et sa distance d''observation, c''est simplement se comporter en invité respectueux plutôt qu''en propriétaire des lieux.'
WHERE id = '74';

UPDATE pedagogical_content SET explication =
'L''économie bleue regroupe toutes les activités liées à la mer — pêche, tourisme, énergies marines, transport — conçues pour rester rentables sur le long terme sans épuiser les ressources ni dégrader les écosystèmes dont elles dépendent elles-mêmes.'
WHERE id = '77';
-- Lot 6 — Impact de la présence humaine, gestion des déchets, protection (impact_presence_humaine)
-- Sources : DREAL Normandie / Région Normandie (Natura 2000, vérifié : 94 sites dont 34
-- avec partie marine), ANBDD (mammifères marins comme sentinelles écologiques)

UPDATE pedagogical_content SET explication =
'Les racines des plantes dunaires (oyat, chiendent) retiennent le sable comme un filet. Chaque passage répété sur une même zone tasse le sol et abîme ces plantes ; sans elles, le sable redevient mobile et la dune commence à s''éroder — parfois de façon irréversible.'
WHERE id = '48';

UPDATE pedagogical_content SET explication =
'Le recul du trait de côte n''est pas nouveau — les côtes ont toujours bougé — mais il s''accélère : la montée du niveau des mers et des tempêtes plus fréquentes ou plus violentes rongent le littoral plus vite qu''il ne peut se reconstituer naturellement, menaçant parfois des habitations proches du rivage.'
WHERE id = '49';

UPDATE pedagogical_content SET explication =
'Un nettoyage de plage efficace fait le tri : les déchets d''origine humaine (plastiques, mégots, verre) sont retirés, tandis que le bois flotté, les algues et les coquillages restent sur place, car ils nourrissent la laisse de mer et l''écosystème dunaire qui en dépend.'
WHERE id = '55';

UPDATE pedagogical_content SET explication =
'Le déchet le plus facile à gérer est celui qu''on ne produit jamais : une gourde réutilisable, des emballages limités, du matériel choisi pour durer évitent d''avoir quoi que ce soit à ramasser derrière soi, mieux que n''importe quel geste de nettoyage a posteriori.'
WHERE id = '56';

UPDATE pedagogical_content SET explication =
'Le littoral n''appartient à aucun visiteur en particulier : c''est le lieu de vie permanent de centaines d''espèces qui, elles, n''ont pas d''autre endroit où aller. Chaque personne de passage a donc la responsabilité de laisser l''endroit dans l''état où elle l''a trouvé, sinon meilleur.'
WHERE id = '66';

UPDATE pedagogical_content SET explication =
'La règle la plus simple reste la plus efficace : ne rien laisser derrière soi. Combinée au respect des sentiers balisés et à la distance gardée avec la faune, elle couvre l''essentiel d''une pratique responsable du littoral.'
WHERE id = '73';

UPDATE pedagogical_content SET explication =
'Chaque achat est un choix : privilégier des produits de la mer issus d''une pêche encadrée et durable, limiter les emballages plastiques à usage unique, choisir du matériel réparable plutôt que jetable. Multipliés à l''échelle de millions de consommateurs, ces choix pèsent directement sur la santé des écosystèmes marins.'
WHERE id = '79';

UPDATE pedagogical_content SET explication =
'L''eau douce, les sols fertiles, la biodiversité ou le poisson ne sont pas des stocks infinis : ils se renouvellent, mais à un rythme limité. Protéger l''environnement, c''est justement veiller à ne pas prélever plus vite que ce rythme naturel de renouvellement, pour que ces ressources restent disponibles demain.'
WHERE id = '109';

UPDATE pedagogical_content SET explication =
'Un plastique jeté en mer met des décennies, parfois des siècles, à se dégrader complètement. En se fragmentant, il devient microplastique, ingéré par le plancton puis par toute la chaîne alimentaire — jusqu''aux poissons que nous consommons.'
WHERE id = '110';

UPDATE pedagogical_content SET explication =
'Sur un territoire restreint, la Normandie combine mer, littoral, plaine et bocage — une diversité de milieux rare, mais fragile, car ces espaces sont aussi parmi les plus prisés pour l''habitat, l''agriculture et le tourisme. D''où un équilibre constant à trouver entre usages humains et préservation.'
WHERE id = '111';

UPDATE pedagogical_content SET explication =
'Le réseau Natura 2000 compte 94 sites en Normandie, dont 34 intègrent une partie marine — zones littorales, estuaires, bancs de sable. Ce classement encadre les activités humaines sur ces espaces pour protéger les habitats et les espèces qui en dépendent, sans forcément les interdire au public.'
WHERE id = '112';

UPDATE pedagogical_content SET explication =
'Les mammifères marins occupent le sommet de la chaîne alimentaire marine et vivent longtemps : ils accumulent donc dans leur organisme les effets d''une pollution ou d''une dégradation du milieu sur plusieurs années. Leur suivi permet ainsi de repérer des signaux d''alerte pour tout l''écosystème, bien avant qu''ils ne deviennent visibles ailleurs.'
WHERE id = '128';
-- Lot 7 — Sciences participatives, sensibilisation, préparation avant sortie
-- Contenu qualitatif ; iNaturalist et OBSenMER déjà cités et cohérents avec les
-- applications mentionnées dans les fiches mémo publiées

UPDATE pedagogical_content SET explication =
'Des applications comme iNaturalist ou OBSenMER permettent à n''importe qui de photographier une espèce et de la géolocaliser en quelques secondes. Ces observations rejoignent ensuite de vraies bases de données utilisées par les chercheurs pour suivre l''évolution de la biodiversité.'
WHERE id = '80';

UPDATE pedagogical_content SET explication =
'Aucun scientifique ne peut être partout à la fois. Les millions d''observations remontées chaque année par des promeneurs, plongeurs ou pêcheurs à pied permettent de couvrir un territoire bien plus vaste que ce que quelques équipes de recherche pourraient surveiller seules.'
WHERE id = '81';

UPDATE pedagogical_content SET explication =
'Comprendre pourquoi un geste compte pousse naturellement à mieux choisir ce qu''on achète : privilégier un produit réparable, refuser un emballage inutile, réduire sa consommation de plastique. La sensibilisation nourrit les choix, et les choix répétés finissent par peser sur les pratiques des entreprises elles-mêmes.'
WHERE id = '125';

UPDATE pedagogical_content SET explication =
'Savoir qu''un problème existe ne suffit pas à le résoudre : c''est le pas suivant, celui de changer concrètement une habitude ou de participer à une initiative, qui produit un effet réel. Les deux sont complémentaires, mais l''un ne remplace jamais l''autre.'
WHERE id = '126';

UPDATE pedagogical_content SET explication =
'Certains effets du changement climatique sont déjà engagés et ne peuvent plus être totalement annulés. Mais l''ampleur des dégâts futurs dépend encore largement des décisions prises aujourd''hui : réduire les émissions et s''adapter maintenant limite les risques les plus graves de demain.'
WHERE id = '127';

UPDATE pedagogical_content SET explication =
'Avant d''entrer dans l''eau, quelques minutes d''observation depuis le rivage suffisent souvent à éviter un problème : repérer la fréquence des grosses séries de vagues, où elles cassent, s''il existe une zone plus calme pour sortir en cas de besoin, et si l''ensemble correspond bien à son propre niveau.'
WHERE id = '120';
-- Lot 8 — Fiche complémentaire (oubliée du découpage par tags_theme initial)

UPDATE pedagogical_content SET explication =
'En vive-eau, l''estran découvre très loin et les courants sont puissants : certaines espèces synchronisent justement leur ponte sur ces grandes marées pour que leurs larves profitent d''un fort courant de dispersion. En morte-eau, l''amplitude réduite offre au contraire des conditions plus calmes pour d''autres activités.'
WHERE id = '12';
