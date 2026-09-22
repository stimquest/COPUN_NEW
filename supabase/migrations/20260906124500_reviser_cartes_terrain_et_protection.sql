-- Révision éditoriale : passer du savoir abstrait à une scène terrain observable.

UPDATE pedagogical_content SET
  question = 'Quels usages partageons-nous sur ce littoral ?',
  objectif = 'Faire repérer les usages réellement présents et comprendre les besoins de cohabitation.',
  explication = 'Un même littoral peut être un lieu de travail, de déplacement, de loisir et de vie sauvage. Pêcheurs, conchyliculteurs, plaisanciers, promeneurs et pratiquants n''utilisent pas toujours le même espace ni le même moment : les règles locales servent à rendre cette cohabitation possible.',
  accroche = 'Regardez le site : qui l''utilise aujourd''hui, et de quoi chacun a-t-il besoin pour y avoir sa place ?',
  erreur_frequente = 'Voir une plage comme un décor de loisirs fait oublier qu''elle est aussi un espace de travail, de déplacement et d''habitat.',
  a_observer = 'Les traces d''usages présents : bateaux, casiers, bouées, parcs, chemins, zones balisées.',
  a_retenir = 'Le littoral est partagé : comprendre les autres usages aide à y trouver sa place sans les gêner.',
  actions = jsonb_build_array(jsonb_build_object('id','f75_carte_usages','label','Cartographier les usages','consigne','Depuis un point haut ou une carte, faites repérer trois usages visibles, leur zone et leur moment. Cherchez ensuite une règle ou un comportement qui évite un conflit.')),
  accroches_formes = NULL
WHERE id = '75';

UPDATE pedagogical_content SET
  question = 'Quelle trace notre groupe laisse-t-il sur ce site ?',
  objectif = 'Distinguer les impacts immédiatement évitables du groupe des enjeux plus larges, sans culpabiliser.',
  explication = 'Toute présence laisse une trace : bruit, passage, déchets, dérangement ou simple occupation d''un espace. L''enjeu n''est pas de prétendre ne rien modifier, mais d''observer les effets possibles de notre activité et de choisir les adaptations qui évitent les impacts inutiles.',
  accroche = 'Avant de repartir, qu''est-ce que notre groupe aura changé ici — même pour peu de temps ?',
  erreur_frequente = 'Un impact n''est pas seulement un déchet. Il peut aussi venir du bruit, d''un passage répété ou d''une distance trop courte avec la faune.',
  a_observer = 'Les sentiers, zones piétinées, déchets, traces de passage et réactions de la faune.',
  a_retenir = 'On ne maîtrise pas tout, mais on peut adapter notre présence aux impacts que l''on voit.',
  actions = jsonb_build_array(jsonb_build_object('id','f76_adapter_sortie','label','Une adaptation concrète','consigne','Choisissez une trace potentielle du groupe et décidez d''une adaptation immédiate : trajet, distance, volume sonore, regroupement ou gestion des déchets.')),
  accroches_formes = NULL
WHERE id = '76';

UPDATE pedagogical_content SET
  question = 'Comment une activité maritime peut-elle durer sans épuiser le lieu où elle se pratique ?',
  objectif = 'Comprendre, à partir d''un usage local, que l''activité économique dépend aussi du bon état du milieu.',
  explication = 'Pêche, tourisme, navigation ou production d''énergie dépendent tous d''une mer praticable et vivante. Parler d''économie bleue revient à chercher comment une activité peut rester utile dans le temps sans détruire les ressources, les habitats ou les paysages dont elle dépend.',
  accroche = 'Choisissons une activité visible ici : de quoi a-t-elle besoin pour pouvoir encore exister dans vingt ans ?',
  erreur_frequente = 'Économie et environnement ne sont pas deux camps séparés : une activité durable a besoin d''un milieu qui continue de fonctionner.',
  a_observer = 'Une activité locale, ce qu''elle utilise et ce qu''elle doit préserver pour durer.',
  a_retenir = 'Vivre de la mer suppose de préserver ce qui permet d''en vivre.',
  actions = jsonb_build_array(jsonb_build_object('id','f77_activite_durable','label','Une activité, deux besoins','consigne','Choisissez une activité locale et faites lister ce qu''elle prélève ou utilise, puis ce qu''elle doit laisser en bon état pour durer.')),
  accroches_formes = NULL
WHERE id = '77';

UPDATE pedagogical_content SET
  question = 'Quel choix concret pouvons-nous faire avant une sortie pour limiter nos déchets ?',
  objectif = 'Passer d''une injonction générale à un choix de matériel ou d''organisation réellement faisable au club.',
  explication = 'Les déchets les plus simples à éviter sont ceux que l''on n''a pas apportés : gourdes, goûters sans suremballage, matériel entretenu et réparable, rangement prévu au retour. Le bon choix dépend de ce que le groupe utilise réellement, pas d''une liste idéale impossible à appliquer.',
  accroche = 'Regardons ce que nous avons apporté : quel objet pourrait ne pas devenir un déchet aujourd''hui ?',
  erreur_frequente = 'Le tri est utile, mais éviter l''objet jetable ou prolonger la vie d''un matériel a souvent plus d''effet.',
  a_observer = 'Le contenu du sac collectif et les objets qui seront jetés, réutilisés ou réparés.',
  a_retenir = 'Le geste le plus simple est souvent de ne pas produire le déchet.',
  actions = jsonb_build_array(jsonb_build_object('id','f79_choix_sortie','label','Un choix pour aujourd''hui','consigne','Faites repérer un objet jetable ou fragile de la sortie et choisissez ensemble une alternative réaliste pour la prochaine séance.')),
  accroches_formes = NULL
WHERE id = '79';

UPDATE pedagogical_content SET
  question = 'Comment transmettre une observation utile à un programme de sciences participatives ?',
  objectif = 'Comprendre qu''une donnée utile associe observation, contexte et respect du vivant ; elle est ensuite vérifiée.',
  explication = 'Les programmes de sciences participatives permettent de partager des observations avec des naturalistes et des chercheurs. Une donnée utile ne se résume pas à une photo : on note au minimum le lieu, la date et le comportement observé ; l''identification peut être proposée puis validée. On ne s''approche jamais d''une espèce pour obtenir une image.',
  accroche = 'Notre observation du jour mérite-t-elle d''être signalée ? Qu''aurions-nous besoin de noter pour qu''elle soit utile ?',
  erreur_frequente = 'Une photo géolocalisée n''est pas automatiquement une donnée fiable. Le contexte, la qualité de l''observation et la validation comptent aussi.',
  a_observer = 'Une espèce ou un phénomène observé sans dérangement : lieu, date, comportement et, si adapté, photo lointaine.',
  a_retenir = 'Une observation partagée est utile si elle est située, décrite et réalisée sans déranger.',
  actions = jsonb_build_array(jsonb_build_object('id','f80_fiche_observation','label','Préparer une observation','consigne','Sans approcher l''animal, notez ensemble lieu, date, comportement et conditions. Décidez ensuite si une plateforme adaptée peut recevoir cette observation.')),
  accroches_formes = NULL
WHERE id = '80';

UPDATE pedagogical_content SET
  question = 'Qu''est-ce qui rend une observation utile à partager ?',
  objectif = 'Compléter la carte de sciences participatives par un discernement : tout n''a pas besoin d''être publié, mais certaines observations méritent d''être documentées.',
  explication = 'Les observateurs de terrain peuvent compléter les suivis scientifiques, surtout lorsqu''ils décrivent des changements, des comportements inhabituels ou la présence d''une espèce. La valeur vient de l''ensemble : observation précise, contexte, répétition et validation. Signaler n''est pas seulement « envoyer une photo ».',
  accroche = 'Parmi ce que nous avons vu aujourd''hui, qu''est-ce qui mérite d''être noté — et qu''est-ce qui reste une simple impression ?',
  erreur_frequente = 'Toutes les observations n''ont pas la même valeur, mais aucune ne devient inutile parce que l''observateur n''est pas expert.',
  a_observer = 'Ce qui est réellement décrit, comparé ou inhabituel, plutôt que ce qui est seulement aperçu.',
  a_retenir = 'Une observation utile est précise, située et honnête sur ce que l''on a — ou n''a pas — vu.',
  actions = jsonb_build_array(jsonb_build_object('id','f81_trier_observations','label','Décrire avant partager','consigne','Choisissez une observation du jour. Séparez les faits vus, les hypothèses et les informations manquantes avant de décider si elle peut être signalée.')),
  accroches_formes = NULL
WHERE id = '81';

UPDATE pedagogical_content SET
  question = 'Comment observer un mammifère marin sans le déranger ?',
  objectif = 'Apprendre un protocole de guet et de signalement prudent plutôt qu''une mémorisation de chiffres ou d''espèces.',
  tip = 'Phoques, marsouins et dauphins sont discrets. Une observation lointaine, brève et documentée vaut mieux qu''une tentative d''approche.',
  explication = 'Les côtes normandes accueillent régulièrement des mammifères marins, notamment des phoques et des marsouins. Les reconnaître avec certitude demande parfois de l''expérience : sur le terrain, l''essentiel est de garder ses distances et de décrire ce qui est vu — silhouette, souffle, direction, comportement — sans chercher à s''approcher.',
  accroche = 'Au large, quelque chose apparaît puis disparaît. Que peut-on noter sans aller voir de plus près ?',
  erreur_frequente = 'Voir une forme à la surface ne suffit pas toujours à nommer l''espèce ; on décrit d''abord ce que l''on observe.',
  a_observer = 'Depuis le bord : silhouettes, souffles, direction de déplacement, temps d''apparition et comportement.',
  a_retenir = 'Pour bien observer un mammifère marin, on garde sa distance et on décrit avant d''identifier.',
  actions = jsonb_build_array(jsonb_build_object('id','f88_guet_respectueux','label','Dix minutes de guet','consigne','Délimitez un secteur depuis le bord et observez sans vous déplacer vers l''animal. Notez les faits vus, même si l''espèce reste inconnue.')),
  accroches_formes = NULL
WHERE id = '88';

UPDATE pedagogical_content SET
  question = 'Comment passer de « je vois » à « je comprends mieux » ?',
  objectif = 'Installer une démarche d''observation simple, réutilisable sur toutes les cartes.',
  explication = 'Une observation commence par des faits : ce que l''on voit, entend ou mesure. Ensuite viennent les questions et les hypothèses ; enfin, on cherche ce qui permet de vérifier. Cette méthode évite de confondre une impression avec une explication.',
  accroche = 'Choisissons une chose devant nous : qu''est-ce que nous savons vraiment, et qu''est-ce que nous supposons ?',
  erreur_frequente = 'Observer ne demande pas d''avoir la réponse tout de suite. Une bonne question vaut mieux qu''une explication inventée.',
  a_observer = 'Un détail précis du paysage, du vivant ou de l''état de mer.',
  a_retenir = 'Je vois ; je me demande ; je peux vérifier.',
  actions = jsonb_build_array(jsonb_build_object('id','f92_faits_hypotheses','label','Faits, questions, hypothèses','consigne','Sur un élément visible, faites trois colonnes à l''oral : ce que nous voyons, ce que nous nous demandons, ce que nous pourrions vérifier.')),
  accroches_formes = NULL
WHERE id = '92';

UPDATE pedagogical_content SET
  question = 'Que décrire avant de chercher le nom d''une espèce ?',
  objectif = 'Développer une observation descriptive accessible aux débutants avant l''identification.',
  explication = 'Identifier une espèce peut être utile, mais le premier geste consiste à la décrire : forme, taille, couleur, déplacement, lieu et comportement. Cette description aide ensuite à comparer, chercher ou demander un avis ; elle permet aussi d''observer sans être déjà expert.',
  accroche = 'Avant de chercher son nom, comment décririons-nous cet animal à quelqu''un qui ne le voit pas ?',
  erreur_frequente = 'Ne pas connaître le nom d''une espèce n''empêche pas de faire une observation de qualité.',
  a_observer = 'Forme, taille, couleur, comportement, habitat et traces.',
  a_retenir = 'Décrire avant de nommer : c''est ainsi qu''on observe vraiment.',
  actions = jsonb_build_array(jsonb_build_object('id','f94_decrire_avant_nommer','label','Portrait sans nom','consigne','Choisissez un organisme ou une trace et faites-en le portrait sans prononcer de nom. Cherchez l''identification seulement après.')),
  accroches_formes = NULL
WHERE id = '94';

UPDATE pedagogical_content SET
  question = 'Comment savoir que notre présence dérange un animal ?',
  objectif = 'Repérer les signaux de dérangement sans provoquer une réaction et adapter immédiatement la distance.',
  tip = 'On n''approche pas pour trouver la limite : on observe à distance et on recule dès qu''un comportement change.',
  explication = 'Un animal peut cesser de se nourrir, relever la tête, se figer ou s''éloigner avant de fuir. Ces signaux indiquent que notre présence a déjà un coût pour lui. L''observation respectueuse commence donc loin, dans le calme, et s''interrompt ou recule au moindre signe de gêne.',
  accroche = 'Sans nous rapprocher, quels signes nous diraient que cet animal a déjà remarqué notre présence ?',
  erreur_frequente = 'La distance correcte n''est pas celle où l''animal fuit : c''est celle où son comportement ne change pas à cause de nous.',
  a_observer = 'L''activité normale de l''animal et les changements éventuels de posture, d''alimentation ou de déplacement.',
  a_retenir = 'Si l''animal change son comportement à cause de nous, nous sommes déjà trop près.',
  actions = jsonb_build_array(jsonb_build_object('id','f95_distance_respect','label','Observer puis reculer','consigne','Depuis une distance déjà large, repérez l''activité normale de l''animal. Si un signe de vigilance apparaît, reculez ou changez d''itinéraire : ne cherchez jamais à provoquer ce signal.')),
  accroches_formes = NULL
WHERE id = '95';

UPDATE pedagogical_content SET
  question = 'Pourquoi vérifie-t-on la qualité de l''eau avant de se baigner ou de pêcher à pied ?',
  objectif = 'Relier la santé humaine et l''état du milieu à une décision concrète de pratique.',
  explication = 'La qualité de l''eau peut varier après de fortes pluies, des pollutions ou selon le site. Les informations locales sur la baignade et la pêche à pied protègent les personnes comme le milieu : elles aident à savoir quand une activité est adaptée, plutôt que de supposer que l''eau est toujours sans risque.',
  accroche = 'Avant une baignade ou une pêche à pied, où chercherions-nous une information fiable sur l''eau d''aujourd''hui ?',
  erreur_frequente = 'Une eau claire n''est pas forcément une eau dont la qualité est connue. On consulte les informations locales.',
  a_observer = 'Panneaux, informations officielles de baignade ou de pêche à pied, et conditions récentes du site.',
  a_retenir = 'La qualité de l''eau se vérifie : c''est une information de pratique, pas seulement un sujet de santé publique.',
  actions = jsonb_build_array(jsonb_build_object('id','f98_verifier_eau','label','Trouver l''information fiable','consigne','Identifiez la source locale qui informe sur la baignade ou la pêche à pied. Faites distinguer un panneau officiel d''une simple impression visuelle.')),
  accroches_formes = NULL
WHERE id = '98';

UPDATE pedagogical_content SET
  question = 'Pourquoi certains oiseaux ont-ils besoin de cette vasière ou de ce banc de sable ?',
  objectif = 'Relier le comportement visible des oiseaux migrateurs au besoin de repos et d''alimentation, puis à la distance du groupe.',
  explication = 'Pendant une migration ou un hivernage, les oiseaux utilisent certains sites pour se nourrir et reconstituer leurs réserves. Une vasière, un pré salé ou un banc de sable ne sont pas interchangeables : la nourriture, la tranquillité et la marée y comptent. Les déranger les oblige à interrompre ces activités essentielles.',
  accroche = 'Cet oiseau choisit de rester ici alors qu''il pourrait voler plus loin : qu''est-ce que ce lieu lui apporte ?',
  erreur_frequente = 'Un oiseau peut parfois changer de site, mais on ne suppose pas qu''il trouvera aussitôt la même nourriture et la même tranquillité ailleurs.',
  a_observer = 'Oiseaux qui se nourrissent, se reposent ou se regroupent, et la distance à laquelle ils restent calmes.',
  a_retenir = 'Pour un oiseau migrateur, une halte n''est pas un décor : c''est une étape pour refaire ses réserves.',
  actions = jsonb_build_array(jsonb_build_object('id','f103_choisir_distance','label','Choisir notre trajectoire','consigne','Observez un groupe d''oiseaux depuis loin et choisissez un trajet qui ne coupe ni sa zone de repos ni sa zone d''alimentation. Justifiez la distance retenue.')),
  accroches_formes = NULL
WHERE id = '103';

UPDATE pedagogical_content SET
  question = 'Pourquoi ne prélève-t-on pas une ressource plus vite qu''elle ne se renouvelle ?',
  objectif = 'Aborder le renouvellement à partir d''une ressource locale réellement observable.',
  explication = 'Certaines ressources se renouvellent — poissons, coquillages, végétation — mais pas au même rythme et pas dans toutes les conditions. Prélever durablement consiste à respecter les tailles, saisons, quantités et zones prévues pour laisser aux populations le temps de se reproduire et au milieu le temps de se réparer.',
  accroche = 'Si chacun prend « juste un peu », comment savoir si le site a le temps de se refaire ?',
  erreur_frequente = 'Renouvelable ne veut pas dire inépuisable : tout dépend du rythme de prélèvement et de la capacité du milieu à se reconstituer.',
  a_observer = 'Une ressource locale et les règles qui encadrent sa collecte : taille, saison, quantité, zone.',
  a_retenir = 'Une ressource peut se renouveler seulement si on lui laisse le temps et les conditions de le faire.',
  actions = jsonb_build_array(jsonb_build_object('id','f109_regle_prelevement','label','Lire une règle de prélèvement','consigne','Choisissez une ressource du site et recherchez la règle qui protège son renouvellement. Faites expliquer ce que cette règle laisse au vivant.')),
  accroches_formes = NULL
WHERE id = '109';

UPDATE pedagogical_content SET
  question = 'Que signifie qu''un espace naturel est protégé ?',
  objectif = 'Comprendre une protection à partir d''une règle locale, d''un habitat ou d''une espèce, sans cours institutionnel ni chiffres instables.',
  tip = 'Partir d''un panneau, d''un balisage ou d''une carte du site. Le nom Natura 2000 vient ensuite si cela éclaire réellement la situation.',
  explication = 'Protéger un espace ne signifie pas toujours l''interdire au public. Cela peut organiser les usages pour préserver un habitat, une espèce ou une période sensible : rester sur un chemin, contourner une zone de repos, limiter une pratique à certaines dates. Natura 2000 est l''un des cadres qui peuvent aider à cette cohabitation.',
  accroche = 'Cette règle sur le site protège quoi, et qu''est-ce qu''elle nous demande de changer aujourd''hui ?',
  erreur_frequente = '« Protégé » ne veut pas forcément dire « fermé » ; cela veut dire que les usages doivent tenir compte de ce qui vit là.',
  a_observer = 'Panneaux, balisages, sentiers et zones à contourner, puis l''habitat ou l''espèce concernés.',
  a_retenir = 'Une protection devient concrète quand on comprend ce qu''elle préserve et comment on adapte sa pratique.',
  actions = jsonb_build_array(jsonb_build_object('id','f112_lire_regle_locale','label','Lire une règle du site','consigne','Choisissez un panneau ou un balisage. Identifiez ce qu''il demande, ce qu''il protège et l''adaptation précise que le groupe doit faire.')),
  accroches_formes = NULL
WHERE id = '112';

UPDATE pedagogical_content SET
  question = 'Les oiseaux arrivent-ils toujours à la même période ?',
  objectif = 'Comprendre que les dates de présence des oiseaux sont suivies dans le temps et peuvent varier selon les espèces.',
  tip = 'Éviter les chiffres généraux non sourcés : comparer une observation locale à un calendrier ou à une source ornithologique identifiée.',
  explication = 'Les dates d''arrivée, de départ, de floraison ou de reproduction forment un calendrier du vivant, appelé phénologie. Les suivis montrent que ce calendrier évolue selon les espèces et les années : le climat, la nourriture et les conditions de migration ne changent pas tous au même rythme.',
  accroche = 'Si nous voyons cet oiseau aujourd''hui, est-ce « tôt », « tard » ou simplement normal pour cette espèce et ce lieu ?',
  erreur_frequente = 'Une observation isolée ne prouve pas un changement climatique : elle devient parlante quand on la compare à des suivis répétés.',
  a_observer = 'Espèce observée, date, lieu et comportement, puis calendrier local disponible.',
  a_retenir = 'Le calendrier du vivant varie ; ce sont les suivis répétés qui permettent de comprendre comment il évolue.',
  actions = jsonb_build_array(jsonb_build_object('id','f116_comparer_calendrier','label','Comparer à un calendrier','consigne','Notez l''espèce, la date et le lieu. Comparez ensuite cette observation à une source locale et dites clairement ce que l''on peut — ou non — en conclure.')),
  accroches_formes = NULL
WHERE id = '116';

UPDATE pedagogical_content SET
  question = 'Qu''est-ce qui nous aide vraiment à changer une habitude ?',
  objectif = 'Faire réfléchir à un changement précis et possible plutôt qu''à une injonction générale à la consommation responsable.',
  explication = 'Comprendre un problème peut donner envie d''agir, mais une habitude change surtout lorsqu''on sait quoi faire, avec qui et dans quelles conditions. Une décision concrète — par exemple organiser les gourdes du groupe ou réparer un équipement — peut ensuite devenir une règle collective.',
  accroche = 'Nous savons déjà beaucoup de choses sur les déchets : quelle condition nous manque pour faire autrement dès la prochaine sortie ?',
  erreur_frequente = 'Informer ne suffit pas toujours ; il faut aussi rendre le changement simple, visible et possible.',
  a_observer = 'Une habitude réelle du groupe et ce qui la rend facile ou difficile à modifier.',
  a_retenir = 'Une intention devient une habitude quand elle se transforme en choix concret et partagé.',
  actions = jsonb_build_array(jsonb_build_object('id','f125_changer_habitude','label','Rendre le changement possible','consigne','Choisissez une habitude de sortie et identifiez l''obstacle concret. Décidez d''une règle simple qui permet de la changer dès la prochaine séance.')),
  accroches_formes = NULL
WHERE id = '125';

UPDATE pedagogical_content SET
  question = 'Quel geste pouvons-nous réellement changer pendant cette sortie ?',
  objectif = 'Transformer une prise de conscience en adaptation immédiate et vérifiable de la séance.',
  explication = 'Comprendre un enjeu aide à décider ; agir consiste ensuite à modifier quelque chose de concret. Sur le terrain, cela peut être changer de trajet, garder une distance, réduire le jetable, choisir une zone d''attente ou signaler une observation. Le geste doit être adapté au lieu et vérifiable par le groupe.',
  accroche = 'Parmi tout ce que nous venons de comprendre, qu''est-ce que nous pouvons modifier avant de repartir ?',
  erreur_frequente = 'Une promesse vague ne devient pas une action. Il faut un geste précis, un moment et une manière de vérifier qu''il a été fait.',
  a_observer = 'Le moment de la sortie où le groupe peut concrètement modifier sa pratique.',
  a_retenir = 'Agir, c''est choisir une adaptation précise et la faire maintenant.',
  actions = jsonb_build_array(jsonb_build_object('id','f126_agir_maintenant','label','Une adaptation maintenant','consigne','Le groupe choisit une adaptation visible pour la fin de séance. Avant de repartir, vérifiez ensemble qu''elle a bien été appliquée.')),
  accroches_formes = NULL
WHERE id = '126';

UPDATE pedagogical_content SET
  question = 'Qu''est-ce qui peut encore améliorer ce site ?',
  objectif = 'Aborder l''action environnementale par des changements locaux observables, sans promesse simpliste ni discours de découragement.',
  explication = 'Les problèmes environnementaux ont des causes et des échelles différentes. Une sortie ne résout pas tout, mais elle peut rendre visibles des améliorations possibles : une zone de repos respectée, un déchet évité, une pratique adaptée, une information transmise ou une règle collective mieux appliquée. Les gestes individuels comptent lorsqu''ils s''inscrivent aussi dans des choix collectifs.',
  accroche = 'Regardons ce lieu tel qu''il est : quelle amélioration précise dépend de nous, et laquelle dépend d''une décision collective ?',
  erreur_frequente = 'Ni « tout est perdu », ni « un petit geste suffit à tout régler » : les actions n''ont pas la même échelle, mais elles peuvent se compléter.',
  a_observer = 'Un problème ou une amélioration visible du site, et les personnes capables d''agir à différentes échelles.',
  a_retenir = 'Agir consiste à relier un geste local à des règles et décisions collectives plus larges.',
  actions = jsonb_build_array(jsonb_build_object('id','f127_echelles_action','label','Ce qui dépend de qui','consigne','Choisissez un enjeu visible et classez les réponses : ce que le groupe peut faire maintenant, ce que le club peut organiser, ce qui relève d''une décision publique.')),
  accroches_formes = NULL
WHERE id = '127';

UPDATE pedagogical_content SET
  question = 'Quelles informations noter lorsqu''on observe un mammifère marin ?',
  objectif = 'Comprendre la valeur d''un suivi prudent et apprendre à documenter une observation sans surinterpréter l''état de l''écosystème.',
  explication = 'Le suivi des mammifères marins aide à connaître leur présence, leur répartition, leurs comportements et certains problèmes rencontrés. Ces animaux peuvent signaler des changements dans le milieu, mais ils ne résument pas à eux seuls « la santé de toute la mer ». Une observation utile est d''abord précise, distante et transmise au bon interlocuteur.',
  accroche = 'Si nous voyons un phoque ou un marsouin, quelles informations seraient utiles à noter sans le déranger ?',
  erreur_frequente = 'Un mammifère marin est un indicateur parmi d''autres ; une seule observation ne permet pas de conclure sur l''état global de la mer.',
  a_observer = 'Heure, lieu, direction, comportement, conditions et photo lointaine seulement si elle est possible sans approche.',
  a_retenir = 'Observer un mammifère marin, c''est d''abord garder ses distances et décrire des faits précis.',
  actions = jsonb_build_array(jsonb_build_object('id','f128_noter_sans_deranger','label','La fiche de guet','consigne','Préparez une courte fiche : heure, lieu, direction, comportement, conditions. Si un animal est vu, notez les faits sans chercher à le suivre ou l''approcher.')),
  accroches_formes = NULL
WHERE id = '128';

UPDATE pedagogical_content SET
  question = 'Comment changer d''amure sans arrêter le bateau ?',
  objectif = 'Comprendre le principe du virement de bord et faire verbaliser les repères de manœuvre.',
  tip = 'Faire décrire ce que font le bateau, la voile et l''équipage avant, pendant et après la manœuvre.',
  explication = 'Un virement de bord permet de passer d''un bord à l''autre en faisant franchir l''axe du vent au bateau par son avant. Pour le réussir, l''équipage prépare son déplacement, garde de la vitesse, accompagne le passage de la voile puis se replace sur la nouvelle amure.',
  accroche = 'Le vent vient de devant : comment passer de l''autre côté sans s''arrêter ?',
  erreur_frequente = 'Tourner le bateau ne suffit pas : sans vitesse et sans coordination, il peut rester face au vent.',
  a_observer = 'La direction du vent, la vitesse du bateau, le passage de la voile et le déplacement de l''équipage.',
  a_retenir = 'Un virement se prépare : vitesse, passage face au vent, voile et équipage agissent ensemble.',
  actions = jsonb_build_array(jsonb_build_object('id','custom_virement_commenter','label','Commenter une manœuvre','consigne','Avant un virement, faites annoncer les trois étapes. Pendant la manœuvre, un stagiaire décrit ce qu''il voit ; après, le groupe dit ce qui a permis au bateau de repartir.')),
  accroches_formes = NULL
WHERE id = 'custom_6b2d0675_1782543234539';
