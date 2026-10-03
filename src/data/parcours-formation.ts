/** Connaissances courtes, sélectionnées dans le wiki pour la pratique du moniteur. */
export type FicheCours = { titre: string; texte: string; terrain: string; retenir: string };
export type QuestionCours = { id: string; question: string; options: { id: string; texte: string }[]; correct: string; retour: string; ficheIndex: number };
export type ParcoursFormation = {
    id: string; titre: string; duree: string; objectif: string;
    fiches: FicheCours[]; questions: QuestionCours[];
    ressources: { id: string; titre: string }[];
    sources?: { titre: string; href: string }[];
    /** Compatibilité avec les essais déjà inscrits dans le carnet. */
    actionsTerrain: { id: string }[];
};
const f = (titre: string, texte: string, terrain: string, retenir: string): FicheCours => ({ titre, texte, terrain, retenir });
const q = (ficheIndex: number, question: string, options: [string, string, string], correct: number, retour: string): QuestionCours => ({
    id: `q${ficheIndex + 1}`, ficheIndex, question,
    options: options.map((texte, index) => ({ id: String(index), texte })), correct: String(correct), retour,
});
const wiki = {
    littoral: { id: '877ee652-9496-438e-b0db-0196c7bf67c2', titre: 'Le littoral d’Agon-Coutainville' },
    marees: { id: '7a98747d-fa3e-4f14-afe1-3096f01de694', titre: 'Le rythme des marées' },
    coefficients: { id: '3725323b-b01b-40d3-9c55-9b4a8d9786d4', titre: 'Les coefficients de marée' },
    climat: { id: '6ca78503-11c7-49cd-b648-c7dda536d4d7', titre: 'Les éléments climatiques' },
    dunes: { id: 'af6e2722-c56e-4c10-97cf-167fcd1f5845', titre: 'Le vent et la formation des dunes' },
    vivant: { id: 'f616b248-0be8-49bf-a5f5-4f1a72dbf13c', titre: 'Le vivant observable en début d’été à Agon' },
    plantes: { id: 'f8737ce6-efff-45fa-81b9-5e855680fc4e', titre: 'L’eau de mer et les plantes' },
    algues: { id: 'ce3adceb-6f72-4728-8415-264c323eda96', titre: 'Algues et plantes des sols salés' },
    usages: { id: '81c6d9e2-8c31-4b3d-b083-761fd516d176', titre: 'Les activités humaines sur le littoral' },
    elevage: { id: '462aeca9-6424-4995-8da7-e8e22e0f9493', titre: 'L’élevage des huîtres et des moules' },
    mer: { id: 'ce166a08-525d-428e-950b-4ecf0e3aa8ed', titre: 'Observer l’état de la mer' },
    reperes: { id: 'ee8873cb-c335-4ed9-a46b-0954952afc8f', titre: 'Repères et amers près d’Agon' },
    sens: { id: '9ced955e-c284-45be-a093-5e1862564f33', titre: 'Observer avec les sens' },
    gestes: { id: '55eb9231-4f53-45c2-a8ca-e792275ad80d', titre: 'Ne pas déranger le vivant et préserver la laisse de mer' },
    impact: { id: '0ab66ab4-69e2-49ce-a7f1-cb7ea6009fce', titre: 'Réduire notre impact sur le littoral' },
    partager: { id: 'f8320eb7-e6c3-4830-b043-7dd6f656c42f', titre: 'À qui transmettre une observation' },
    photos: { id: 'eb8510af-7dc6-4667-af69-7e622de0fb8a', titre: 'La photo-identification des dauphins' },
};
const brise = { titre: 'La brise — Météo-France', href: 'https://meteofrance.com/meteo-a-z/la-brise' };
const shom = { titre: 'Niveau de la mer — Shom', href: 'https://shom.fr/fr/nos-domaines-dexpertise/niveau-de-la-mer' };

export const PARCOURS_LITTORAL_EAU: ParcoursFormation = {
    id: 'littoral-eau', titre: 'Le littoral change avec l’eau', duree: '5 min',
    objectif: 'Distinguer marée, courant et vagues, puis comprendre comment l’eau transforme le rivage.',
    actionsTerrain: [{ id: 'lire-indice' }, { id: 'comparer' }, { id: 'situer' }],
    ressources: [wiki.littoral, wiki.marees, wiki.coefficients], sources: [shom],
    fiches: [
        f('La marée change le niveau', 'La marée est la montée et la descente périodiques du niveau de la mer, liées principalement aux effets de la Lune et du Soleil. En Manche, on observe généralement deux pleines mers et deux basses mers en un peu plus de 24 heures.', 'Sur un horaire local, repérez la prochaine pleine mer et la prochaine basse mer. Ces horaires concernent le niveau de l’eau.', 'La marée fait varier la hauteur d’eau.'),
        f('Le courant déplace l’eau', 'Un courant est un déplacement de l’eau dans une direction. La marée peut en produire, mais le vent et d’autres phénomènes interviennent aussi. Sa force et sa direction dépendent du lieu et du moment.', 'Suivez une écume déjà présente devant un support fixe. Ne jetez rien à l’eau pour faire la démonstration.', 'Niveau d’eau et déplacement de l’eau sont deux observations différentes.'),
        f('Les vagues agitent la surface', 'Les vagues sont des mouvements de la surface, souvent produits par le vent. Elles peuvent arriver d’une zone lointaine où le vent a soufflé : c’est la houle. Des vagues peuvent donc être présentes avec peu de vent local.', 'Comparez le vent ressenti et les vagues visibles. Leur différence peut être l’occasion de parler de la houle.', 'Le vent d’ici n’explique pas toujours les vagues d’ici.'),
        f('L’eau transporte les matériaux', 'Vagues et courants déplacent sable et autres matériaux : ils peuvent en retirer d’une zone et en déposer ailleurs. Une seule visite ne suffit pas à décrire l’évolution d’une plage à long terme.', 'Comparez deux photos du même lieu, avec leur date et leur niveau de marée. Une plage moins large peut simplement être davantage recouverte.', 'Pour comparer un rivage, tenez compte du moment et de la marée.'),
    ], questions: [
        q(0, 'Quel phénomène fait varier périodiquement le niveau de la mer ?', ['Le courant', 'La marée', 'Le déplacement du sable'], 1, 'La marée fait monter et descendre le niveau de la mer.'),
        q(1, 'Une écume dérive devant une bouée fixe. Que montre-t-elle ?', ['Un mouvement de l’eau en surface', 'La hauteur de la prochaine pleine mer', 'L’âge de la plage'], 0, 'L’écume rend visible un déplacement local en surface, sans prévoir la hauteur d’eau.'),
        q(2, 'Pourquoi peut-il y avoir des vagues avec peu de vent local ?', ['La marée produit toutes les vagues', 'C’est impossible', 'Une houle arrive d’une zone de vent éloignée'], 2, 'La houle peut voyager depuis une zone éloignée où le vent a soufflé.'),
        q(3, 'Pour comparer deux photos de plage, que faut-il relever ?', ['Seulement la couleur du ciel', 'La date et le niveau de marée', 'Seulement le nombre de bateaux'], 1, 'Ces informations aident à distinguer une surface recouverte d’une modification du rivage.'),
    ],
};
export const PARCOURS_LAISSE_DE_MER: ParcoursFormation = {
    id: 'laisse-de-mer', titre: 'La laisse de mer', duree: '6 min',
    objectif: 'Reconnaître les dépôts de la mer, comprendre leur utilité et distinguer les éléments naturels des déchets.',
    actionsTerrain: [{ id: 'distinguer' }, { id: 'observer' }, { id: 'geste-adapte' }], ressources: [wiki.gestes, wiki.impact],
    fiches: [
        f('Ce que la mer dépose', 'La laisse de mer rassemble les éléments déposés sur le rivage par les vagues et les marées. Elle forme souvent une ligne ou des amas dispersés. Sa composition varie selon le site et les conditions.', 'Repérez une ligne de dépôts depuis une zone accessible. Elle indique un passage de l’eau, sans garantir le niveau de la prochaine pleine mer.', 'La laisse de mer est un dépôt du rivage, pas forcément un déchet.'),
        f('Naturel ou déchet ?', 'Algues, bois, coquilles et restes d’animaux peuvent appartenir à la laisse naturelle. Des déchets humains, comme des emballages ou du plastique, peuvent s’y mélanger. Il faut distinguer les éléments plutôt que juger tout l’amas à son aspect.', 'Décrivez la matière et l’origine probable de trois éléments, sans les manipuler. Un objet non identifié peut rester non identifié.', 'Naturel et déchet peuvent se trouver côte à côte.'),
        f('Un abri et de la nourriture', 'Les matières naturelles déposées nourrissent de petits organismes et leur offrent un abri. Ceux-ci peuvent nourrir des oiseaux. En se décomposant, les dépôts participent aussi à la vie du haut de plage.', 'Cherchez du mouvement au bord du dépôt ou des oiseaux qui s’alimentent, sans retourner les amas ni les piétiner.', 'Ce qui paraît abandonné peut encore servir au vivant.'),
        f('Un lien avec le haut de plage', 'Des dépôts naturels peuvent retenir du sable et apporter de la matière à la végétation du haut de plage. Tout enlever modifie donc davantage que l’apparence de la plage.', 'Depuis un accès autorisé, observez la proximité entre dépôts, sable et végétation.', 'Une plage visuellement nette n’est pas forcément mieux préservée.'),
        f('Choisir le geste adapté', 'Laissez les éléments naturels en place. Retirez les déchets humains accessibles lorsque les consignes du site et la sécurité le permettent. Un objet coupant, suspect ou dangereux se signale au responsable du lieu.', 'Avant une collecte, vérifiez les consignes locales et la zone accessible. Une zone sensible ou fermée ne devient pas accessible pour un nettoyage.', 'Préserver le naturel, collecter les déchets adaptés, signaler le reste.'),
    ], questions: [
        q(0, 'Que désigne la laisse de mer ?', ['Uniquement des déchets jetés', 'Les éléments déposés par vagues et marées', 'La limite certaine de la prochaine marée'], 1, 'La laisse est un dépôt passé, sans garantie sur la prochaine limite de l’eau.'),
        q(1, 'Un amas contient des algues et un emballage. Que distinguer ?', ['Éléments naturels et déchets humains', 'Seulement grands et petits éléments', 'Tout l’amas est un déchet'], 0, 'Un emballage peut se mêler à des éléments naturels qui ont leur place sur la plage.'),
        q(2, 'Pourquoi préserver la laisse naturelle ?', ['Elle empêche toutes les tempêtes', 'Elle remplace les dunes', 'Elle offre nourriture et abris'], 2, 'Elle participe à la vie du haut de plage et aux relations alimentaires.'),
        q(3, 'Tout retirer pour rendre la plage nette est-il toujours bénéfique ?', ['Oui, l’aspect suffit à juger', 'Non, cela retire aussi des éléments utiles', 'Oui, si les algues sont sèches'], 1, 'Les dépôts naturels restent utiles au haut de plage, même secs.'),
        q(4, 'Que faire d’un objet coupant dans une zone sensible ?', ['Le faire ramasser par le groupe', 'Déplacer tous les dépôts pour y accéder', 'Le signaler au responsable du site'], 2, 'La sécurité et les consignes du lieu priment sur la collecte.'),
    ],
};
export const PARCOURS_FORMATION: ParcoursFormation[] = [
    PARCOURS_LITTORAL_EAU,
    {
        id: 'vent-meteo', titre: 'Le vent et la météo locale', duree: '5 min', objectif: 'Comprendre la direction du vent, la brise de mer et le rôle des prévisions.', actionsTerrain: [], ressources: [wiki.climat, wiki.mer], sources: [brise],
        fiches: [
            f('Le vent vient d’une direction', 'La direction du vent indique d’où il vient. Un vent d’ouest vient de l’ouest. Vent de mer et vent de terre décrivent sa direction par rapport au rivage : vers la terre ou vers le large.', 'Repérez le rivage et une manche à air. Elle se déploie dans la direction où l’air va.', 'Nommer le vent, c’est nommer son origine.'),
            f('La mer influence le temps local', 'La mer se réchauffe et se refroidit plus lentement que la terre. Elle influence les températures et l’humidité des zones côtières. Le temps ressenti sur une plage peut différer de celui de l’intérieur des terres.', 'Comparez le ressenti sur la plage et dans un lieu abrité, en précisant où vous observez.', 'Une météo se situe dans un lieu et un moment.'),
            f('Pourquoi une brise apparaît', 'Par temps favorable, la terre se réchauffe plus vite que la mer dans la journée. Cette différence peut créer une brise de la mer vers la terre. Elle n’est pas garantie : le vent général et le site peuvent la modifier.', 'Un matin calme ne garantit pas un après-midi calme. Comparez les prévisions et l’évolution observée.', 'La différence de température terre-mer peut créer une brise.'),
            f('Prévision et observation', 'Une prévision décrit une évolution attendue. Une observation décrit ce qui se passe ici et maintenant. Ni un ciel bleu ni un instant sans vent ne résument la météo de toute une séance.', 'Comparez force et direction annoncées à ce que vous observez depuis votre lieu de pratique.', 'Regarder maintenant et consulter la suite se complètent.'),
        ], questions: [
            q(0, 'Un vent d’ouest vient…', ['De l’est', 'De l’ouest', 'Toujours de la mer'], 1, 'La direction nomme l’origine ; ouest ne signifie pas mer sur toutes les côtes.'),
            q(1, 'Pourquoi la mer influence-t-elle les températures côtières ?', ['Elle change de température plus lentement que la terre', 'Elle garde toujours la même température', 'Elle supprime le vent'], 0, 'Son réchauffement et son refroidissement plus lents influencent le climat côtier.'),
            q(2, 'Qu’est-ce qui peut favoriser une brise de mer ?', ['La seule heure de marée', 'La couleur du sable', 'La terre qui chauffe plus vite que la mer'], 2, 'Une différence de température peut créer cette circulation locale.'),
            q(3, 'Le ciel est bleu maintenant. Que peut-on en déduire ?', ['Il restera identique toute la journée', 'Cela décrit le présent, à compléter par les prévisions', 'Le vent ne peut plus se renforcer'], 1, 'Une observation présente ne remplace pas une prévision de l’évolution.'),
        ],
    },
    {
        id: 'milieux-vivants', titre: 'Les milieux et leurs habitants', duree: '5 min', objectif: 'Reconnaître quelques milieux du littoral et leurs conditions de vie.', actionsTerrain: [], ressources: [wiki.littoral, wiki.algues, wiki.plantes, wiki.vivant],
        fiches: [
            f('Un littoral, plusieurs milieux', 'Plage, estran, dunes et prés salés offrent des conditions différentes. Eau, sel, sol et exposition au vent varient. Ces différences expliquent une partie de la diversité du vivant.', 'Depuis un chemin, comparez le sol et la présence d’eau dans deux zones.', 'Pour comprendre le vivant, commencez par son milieu.'),
            f('L’estran alterne eau et air', 'L’estran est la zone que les marées peuvent couvrir et découvrir. Les durées d’immersion varient selon la position. Une mare résiduelle garde de l’eau quand les zones voisines sont découvertes.', 'Observez une mare depuis son bord, sans y entrer ni déplacer ses habitants.', 'La position sur l’estran change les conditions de vie.'),
            f('Algues et plantes des sols salés', 'Les algues vivent dans le milieu aquatique ou sur des supports de l’estran. Les plantes des prés salés, comme la salicorne, sont enracinées dans un sol salé. Leurs milieux ne sont pas identiques.', 'Comparez une algue sur un rocher et une plante enracinée sans les arracher.', 'Vivre dans la mer et pousser dans un sol salé sont deux situations différentes.'),
            f('Le moment change ce qu’on voit', 'Marée, saison et comportement modifient ce qui est visible. Ne rien voir pendant un passage ne prouve pas qu’un lieu est vide. Les articles saisonniers du wiki décrivent leur période, pas toute l’année.', 'Notez lieu, date et état de la marée avec votre observation.', 'Une observation est un aperçu situé, pas un inventaire.'),
        ], questions: [
            q(0, 'Pourquoi dunes et prés salés ont-ils des habitants différents ?', ['Leurs conditions de vie diffèrent', 'Tous les animaux préfèrent le sable sec', 'Le vent est absent des prés salés'], 0, 'Eau, sel, sol et exposition varient entre ces milieux.'),
            q(1, 'Qu’est-ce que l’estran ?', ['Toute la mer au large', 'La zone que les marées peuvent couvrir et découvrir', 'Seulement la dune'], 1, 'L’estran correspond à la zone soumise à cette alternance.'),
            q(2, 'La salicorne pousse…', ['Comme une algue flottante', 'Dans l’eau profonde uniquement', 'Enracinée dans un sol salé'], 2, 'C’est une plante des sols salés, distincte d’une algue marine.'),
            q(3, 'Aucun animal n’est visible. Que conclure ?', ['Le lieu est sans vie', 'L’observation reste limitée au moment et aux conditions', 'La saison ne change rien'], 1, 'Le vivant peut être discret ou visible à un autre moment.'),
        ],
    },
    {
        id: 'littoral-partage', titre: 'Un littoral partagé', duree: '5 min', objectif: 'Repérer les usages du littoral et comprendre comment partager ce lieu.', actionsTerrain: [], ressources: [wiki.usages, wiki.elevage, wiki.impact],
        fiches: [
            f('Un lieu, plusieurs usages', 'Sportifs, promeneurs, pêcheurs et professionnels utilisent le littoral. Ils ont besoin d’accéder à l’eau, circuler ou travailler. Les animaux utilisent aussi cet espace pour vivre.', 'Repérez les usages présents autour de la base.', 'Notre séance se déroule dans un espace partagé.'),
            f('Reconnaître une zone de travail', 'Les tables ostréicoles servent à l’élevage des huîtres. Les bouchots sont des pieux utilisés pour les moules. Ce sont des outils de travail, avec leurs accès et leurs contraintes.', 'Identifiez les installations depuis une zone autorisée et gardez les accès libres.', 'Un parc conchylicole est un espace de production.'),
            f('Les usages suivent la marée', 'La marée modifie les espaces accessibles et les moments d’activité. Une zone disponible à marée basse peut être recouverte ensuite. Certains déplacements et travaux suivent ces créneaux.', 'Comparez les zones utilisées à deux moments de la marée depuis un point sûr.', 'Partager le littoral demande de tenir compte du temps.'),
            f('Adapter notre présence', 'Un accès balisé, une zone de travail ou un secteur sensible indique un besoin à respecter. Reliez la consigne à ce qu’elle protège : passage libre, végétation ou animaux au repos.', 'Repérez les consignes affichées avant d’installer le groupe et le matériel.', 'Voir ce qu’une consigne protège aide à la comprendre.'),
        ], questions: [
            q(0, 'Que signifie “littoral partagé” ?', ['Un espace réservé au sport', 'Un lieu avec plusieurs usages et besoins', 'Une plage sans règles'], 1, 'Sport, travail, loisirs et vie animale coexistent.'),
            q(1, 'À quoi servent les bouchots ?', ['À mesurer le vent', 'À fixer les dunes', 'À élever des moules'], 2, 'Les bouchots sont des pieux utilisés pour les moules.'),
            q(2, 'Pourquoi les usages changent-ils avec la marée ?', ['Les espaces accessibles évoluent', 'La marée supprime toute activité', 'Seule la saison compte'], 0, 'Le niveau d’eau modifie les surfaces et moments d’accès.'),
            q(3, 'Un passage dessert une zone de travail. Quel geste retenir ?', ['Y stocker le matériel', 'Le garder libre et suivre les consignes', 'Ignorer sa fonction'], 1, 'Un accès doit rester disponible pour l’usage auquel il sert.'),
        ],
    },
    {
        id: 'lire-eau', titre: 'Lire les mouvements de l’eau', duree: '5 min', objectif: 'Observer séparément le niveau, le courant et les traces de passage de l’eau.', actionsTerrain: [], ressources: [wiki.mer, wiki.marees, wiki.coefficients], sources: [shom],
        fiches: [
            f('Suivre le niveau sur un support fixe', 'Une seule image ne suffit pas à dire si le niveau monte ou descend. Comparez le même rocher ou poteau à deux moments depuis un point sûr.', 'Regardez le contact de l’eau sur le support, puis à nouveau quelques minutes plus tard.', 'Même repère, deux moments : on constate une variation.'),
            f('Chercher un déplacement', 'Une écume déjà présente peut montrer un mouvement de surface. Cette observation reste locale : elle ne donne pas la force du courant partout ni à toutes les profondeurs.', 'Suivez l’écume par rapport à une bouée fixe, sans rien jeter à l’eau.', 'Un indice de surface renseigne sur cet endroit.'),
            f('Séparer niveau et courant', 'Un niveau presque stable autour d’une pleine ou basse mer ne signifie pas forcément un courant nul. L’étale de niveau et l’étale de courant peuvent se produire à des moments différents.', 'Observez séparément la hauteur sur un support et le mouvement devant lui.', 'Une mer qui ne monte plus peut encore avoir du courant.'),
            f('Lire une trace sans prédire', 'Une ligne de dépôts ou une zone humide renseigne sur un passage récent de l’eau. Vent, vagues et marées suivantes peuvent modifier la limite atteinte. Cette trace ne remplace pas les prévisions locales.', 'Comparez les dépôts aux informations de prochaine pleine mer, avec votre marge habituelle de sécurité.', 'Une trace décrit le passé ; une prévision renseigne sur la suite.'),
        ], questions: [
            q(0, 'Comment constater que le niveau descend ?', ['Regarder une seule vague', 'Comparer le même support fixe à deux moments', 'Regarder les nuages'], 1, 'La comparaison dans le temps montre la variation.'),
            q(1, 'Que montre une écume qui dérive ?', ['Un déplacement en surface à cet endroit', 'Tous les courants du site', 'Le niveau exact de demain'], 0, 'L’observation est locale et concerne la surface.'),
            q(2, 'Un niveau stable signifie-t-il un courant nul ?', ['Oui, toujours', 'Oui, sous un ciel bleu', 'Non, il faut les observer séparément'], 2, 'Étale du niveau et étale du courant ne coïncident pas nécessairement.'),
            q(3, 'La laisse garantit-elle la limite de la prochaine marée ?', ['Oui', 'Non, elle indique un dépôt passé', 'Oui, si elle est visible'], 1, 'La prochaine limite dépend des conditions à venir.'),
        ],
    },
    {
        id: 'reperes', titre: 'Prendre ses repères', duree: '5 min', objectif: 'Choisir des repères fiables et comparer un lieu qui évolue.', actionsTerrain: [], ressources: [wiki.reperes, wiki.littoral, wiki.marees],
        fiches: [
            f('Choisir un amer reconnaissable', 'Un amer est un repère terrestre identifiable depuis la mer : phare, clocher, bâtiment ou relief. Il doit être visible et assez distinct pour ne pas être confondu avec un autre.', 'Nommez deux repères fixes et retrouvez-les sur une carte adaptée.', 'Un bon repère se reconnaît sans ambiguïté.'),
            f('Distinguer fixe et mobile', 'Un bâtiment fixe permet de comparer une position. Un bateau mobile ne joue pas le même rôle. Une bouée peut bouger autour de son mouillage : elle n’est pas équivalente à un point terrestre fixe.', 'Pour comparer le niveau d’eau, choisissez un support fixé au rivage.', 'Le repère doit convenir à ce que vous comparez.'),
            f('Ajouter le moment de la marée', 'Plage, banc de sable et accès changent d’aspect avec le niveau d’eau. La position et l’heure de l’observation comptent. Les prévisions doivent correspondre au port et à la date concernés.', 'Associez votre observation à une heure et à une marée locale.', 'Décrivez un lieu avec sa position et son moment.'),
            f('Comparer depuis le même point', 'Pour lire un changement, gardez le même point de vue et un repère fixe dans l’image. Notez date et conditions : deux cadrages différents peuvent créer une fausse impression de changement.', 'Photographiez depuis un accès autorisé en gardant un bâtiment fixe dans le cadre.', 'Même point de vue et conditions notées rendent la comparaison utile.'),
        ], questions: [
            q(0, 'Qu’est-ce qu’un amer ?', ['Une vague', 'Un repère terrestre identifiable depuis la mer', 'Un bateau mobile'], 1, 'Un amer est terrestre, visible et reconnaissable.'),
            q(1, 'Quel support convient pour comparer le niveau d’eau ?', ['Un flotteur libre', 'Un bateau qui passe', 'Un poteau fixé au rivage'], 2, 'Le support fixe permet de comparer le contact de l’eau.'),
            q(2, 'Quel horaire de marée utiliser ?', ['Celui du port et de la date concernés', 'N’importe quel port sans vérifier', 'Celui de l’année dernière'], 0, 'La prévision correspond à un lieu de référence et à une date.'),
            q(3, 'Comment rendre deux photos comparables ?', ['Changer de point de vue', 'Garder le même point de vue et noter les conditions', 'Retirer les repères'], 1, 'Cadrage, repères et conditions aident à interpréter les différences.'),
        ],
    },
    {
        id: 'ciel-vent', titre: 'Observer le ciel et le vent', duree: '5 min', objectif: 'Décrire les indices du ciel et du vent et les confronter aux prévisions.', actionsTerrain: [], ressources: [wiki.sens, wiki.climat, wiki.mer], sources: [brise],
        fiches: [
            f('Situer l’indice de direction', 'Drapeau et manche à air renseignent sur le vent. Un obstacle proche peut modifier son écoulement. Un indice dans un coin abrité ne représente pas forcément toute la zone.', 'Comparez deux indices existants, dont un bien exposé, depuis un endroit sûr.', 'Situez l’indice avant d’en tirer une conclusion.'),
            f('Regarder les variations', 'Un vent peut être régulier ou souffler par rafales. Un drapeau qui se tend puis retombe montre une variation, sans fournir une vitesse exacte. Une mesure demande un instrument adapté.', 'Regardez le drapeau pendant une minute plutôt qu’un seul instant.', 'Un indice montre une variation, pas toujours un chiffre.'),
            f('Décrire le ciel avant de conclure', 'Couverture nuageuse, mouvement des nuages et visibilité sont observables. Un nuage isolé ne suffit pas à annoncer avec certitude le temps de toute la séance.', 'Comparez le ciel à deux moments et consultez les prévisions locales.', 'Suivre une évolution vaut mieux que deviner sur un seul indice.'),
            f('Croiser les informations', 'Surface de l’eau, vent et ciel renseignent sur des phénomènes différents. Une houle peut venir de loin. Votre décision de séance s’appuie aussi sur les prévisions et votre cadre habituel de sécurité.', 'Séparez ce que vous observez, ce que la prévision annonce et ce que vous décidez.', 'Observation, prévision et décision ont chacune leur rôle.'),
        ], questions: [
            q(0, 'Pourquoi situer un drapeau avant d’interpréter le vent ?', ['Sa couleur indique la marée', 'Un obstacle peut modifier le vent local', 'Le vent est uniforme partout'], 1, 'Un indice abrité peut différer de la zone exposée.'),
            q(1, 'Un drapeau se tend puis retombe. Que montre-t-il ?', ['La vitesse exacte en nœuds', 'La prochaine marée', 'Une variation du vent'], 2, 'Le drapeau ne fournit pas une mesure exacte de vitesse.'),
            q(2, 'Un nuage suffit-il à prévoir toute la séance ?', ['Non, il faut suivre l’évolution et les prévisions', 'Oui, toujours', 'Oui, s’il est sombre'], 0, 'Une prévision ne se déduit pas avec certitude d’un seul nuage.'),
            q(3, 'Pourquoi croiser ciel, vent et mer ?', ['Ils donnent toujours la même information', 'Ils renseignent sur des phénomènes différents', 'Cela remplace les prévisions'], 1, 'Ces indices se complètent et se confrontent aux prévisions.'),
        ],
    },
    {
        id: 'traces-vivant', titre: 'Repérer le vivant et ses traces', duree: '5 min', objectif: 'Repérer des signes de vie et distinguer observation et identification.', actionsTerrain: [], ressources: [wiki.vivant, wiki.gestes, wiki.sens],
        fiches: [
            f('Une trace révèle un passage', 'Empreinte, coquille vide, terrier ou reste de nourriture peuvent signaler une présence animale. Ils ne disent pas toujours quelle espèce est passée ni quand. Décrivez d’abord forme et lieu.', 'Photographiez une trace depuis un accès autorisé sans la modifier.', 'Un signe de présence n’est pas une identification certaine.'),
            f('Chercher les abris visibles', 'Mares, rochers et dépôts naturels peuvent abriter du vivant. On peut observer depuis leur bord. Déplacer les pierres ou retourner les amas change l’abri que l’on cherche à comprendre.', 'Regardez un détail dans une mare ou au bord d’un dépôt, sans soulever ni capturer.', 'Observer un habitat ne demande pas de le démonter.'),
            f('Lire un comportement', 'Un oiseau qui se nourrit ou un animal au repos renseigne sur l’usage du lieu. Si notre présence interrompt cette activité, l’observation devient elle-même une perturbation.', 'Observez à distance. Si le comportement change à votre arrivée, écartez le groupe.', 'Le comportement compte autant que le nom de l’animal.'),
            f('Accepter de ne pas nommer', 'Une observation peut rester “oiseau non identifié” ou “empreinte à confirmer”. Lieu, date, description et photo à distance restent utiles. Un nom incertain présenté comme sûr rend l’information moins fiable.', 'Décrivez taille, forme et comportement avec des mots simples ; vérifiez plus tard.', 'Décrire juste vaut mieux que nommer au hasard.'),
        ], questions: [
            q(0, 'Une empreinte identifie-t-elle toujours espèce et heure du passage ?', ['Oui', 'Non, il faut distinguer indice et certitude', 'Oui, si elle est grande'], 1, 'Une trace ne permet pas toujours une identification ou une datation.'),
            q(1, 'Comment observer une mare résiduelle ?', ['En la vidant', 'En emportant ses habitants', 'Depuis le bord sans déplacer le vivant'], 2, 'Cette observation préserve l’habitat.'),
            q(2, 'L’animal arrête de manger à votre arrivée. Que faire ?', ['Éloigner le groupe', 'Approcher pour une photo', 'Attendre l’envol'], 0, 'Un changement de comportement peut indiquer un dérangement.'),
            q(3, 'Le nom est inconnu. Quelle information reste utile ?', ['Un nom inventé', 'Une description, le lieu et la date', 'Aucune'], 1, 'Une observation située peut être utile sans nom certain.'),
        ],
    },
    {
        id: 'sans-deranger', titre: 'Approcher sans déranger', duree: '5 min', objectif: 'Reconnaître un dérangement et adapter la présence du groupe.', actionsTerrain: [], ressources: [wiki.gestes, wiki.impact],
        fiches: [
            f('Avant même la fuite', 'Un animal peut interrompre son alimentation ou son repos et surveiller notre présence avant de fuir. L’absence de fuite ne prouve donc pas l’absence de dérangement.', 'Observez d’abord à distance en gardant le groupe calme et regroupé.', 'Ne pas fuir ne signifie pas ne pas être dérangé.'),
            f('Pourquoi une interruption compte', 'Une fuite dépense de l’énergie. Une interruption réduit le temps pour se nourrir ou se reposer. Des passages répétés peuvent multiplier ces effets même si chaque groupe reste peu longtemps.', 'Reliez notre passage à l’activité interrompue plutôt que d’attendre un envol.', 'Un petit dérangement répété peut compter.'),
            f('Adapter distance et trajectoire', 'Si le comportement change à votre arrivée, arrêtez l’approche et écartez-vous. N’encerclez pas l’animal et ne lui barrez pas un passage. Suivez les consignes et zones balisées du site.', 'Choisissez un point d’observation distant et un trajet qui contourne le secteur occupé.', 'La bonne distance permet de poursuivre l’activité.'),
            f('Respecter les lieux sensibles', 'Un nid peut être discret et un reposoir vide entre deux passages. Respecter une zone balisée ne dépend pas de voir l’animal. Marée et saison changent aussi ses besoins.', 'Repérez les secteurs signalés avant de proposer un arrêt.', 'Une zone sensible reste à respecter même si rien n’est visible.'),
        ], questions: [
            q(0, 'Un animal ne fuit pas. Est-il forcément tranquille ?', ['Oui', 'Non, son activité peut être interrompue', 'Oui, s’il nous regarde'], 1, 'Le dérangement peut commencer avant la fuite.'),
            q(1, 'Pourquoi éviter les dérangements répétés ?', ['Ils réduisent parfois alimentation et repos', 'Ils aident les animaux à manger', 'Ils ne comptent qu’en cas de contact'], 0, 'Interruptions et fuites coûtent du temps et de l’énergie.'),
            q(2, 'L’animal devient vigilant. Quel geste adopter ?', ['Continuer jusqu’à l’envol', 'L’encercler', 'Arrêter l’approche et s’écarter'], 2, 'Réduisez la pression sans attendre la fuite.'),
            q(3, 'Une zone balisée semble vide. Peut-on entrer ?', ['Oui', 'Non, on respecte le balisage', 'Oui, avec un petit groupe'], 1, 'Le balisage protège aussi ce que l’on ne voit pas.'),
        ],
    },
    {
        id: 'plages-dunes', titre: 'Préserver plages et dunes', duree: '5 min', objectif: 'Comprendre le rôle du sable, des plantes et des accès aménagés.', actionsTerrain: [], ressources: [wiki.dunes, wiki.gestes, wiki.impact],
        fiches: [
            f('Le sable se déplace', 'L’eau transporte les matériaux de la plage. Le vent peut emporter du sable sec vers le haut de plage. Au contact d’un obstacle, il peut s’accumuler : plage, vent et végétation contribuent à la formation des dunes.', 'Observez les accumulations depuis un chemin, sans entrer dans la végétation.', 'Plage et dune appartiennent à un milieu mobile.'),
            f('Les plantes retiennent le sable', 'La végétation ralentit le vent près du sol et ses racines contribuent à maintenir le sable. L’arracher ou la piétiner fragilise ce rôle. Ce n’est pas une décoration ajoutée à la dune.', 'Repérez le sable autour des touffes depuis un accès prévu.', 'Préserver les plantes aide à préserver la dune.'),
            f('Suivre les accès', 'Un raccourci répété abîme la végétation et peut créer une zone de sable nu. Passerelles et chemins canalisent les déplacements pour limiter la dispersion du piétinement.', 'Repérez le passage prévu avant de déplacer groupe et matériel.', 'L’accès aménagé limite notre empreinte sur la dune.'),
            f('Protéger sans tout nettoyer', 'Les dépôts naturels servent au milieu. Une collecte vise les déchets humains adaptés à la manipulation et suit les consignes locales. Végétation et dépôts naturels restent en place.', 'Choisissez une zone autorisée et signalez les déchets dangereux au responsable.', 'Le bon geste dépend de l’objet et du site.'),
        ], questions: [
            q(0, 'Qu’est-ce qui peut transporter du sable sec vers le haut de plage ?', ['Le vent', 'La seule présence d’oiseaux', 'L’ombre des nuages'], 0, 'Le vent transporte du sable sec qui peut s’accumuler derrière un obstacle.'),
            q(1, 'Quel rôle joue la végétation ?', ['Empêcher tout changement', 'Ralentir le vent et contribuer à retenir le sable', 'Transformer le sable en roche'], 1, 'La végétation contribue à l’accumulation et au maintien du sable.'),
            q(2, 'Pourquoi emprunter les accès aménagés ?', ['Pour ne pas voir la dune', 'Parce que le sable ne bouge jamais', 'Pour limiter le piétinement'], 2, 'Les passages canalisés limitent les zones abîmées.'),
            q(3, 'Que préserver pendant une collecte autorisée ?', ['Les éléments naturels et la végétation', 'Tous les plastiques', 'Seulement les grands cailloux'], 0, 'La collecte vise les déchets humains manipulables, selon les consignes locales.'),
        ],
    },
    PARCOURS_LAISSE_DE_MER,
    {
        id: 'connaitre-site', titre: 'Participer à la connaissance du site', duree: '5 min', objectif: 'Noter et partager une observation fiable sans rechercher une expertise naturaliste.', actionsTerrain: [], ressources: [wiki.partager, wiki.photos],
        fiches: [
            f('Une observation simple est utile', 'Une présence animale, une trace ou un changement peut intéresser les personnes qui suivent le site. Rapportez ce que vous avez réellement vu ; il n’est pas nécessaire de faire un inventaire complet.', 'Choisissez une observation de votre séance et décrivez-la en une phrase.', 'Une information précise vaut mieux qu’une liste incertaine.'),
            f('Noter où, quand et quoi', 'Une observation exploitable comporte un lieu assez précis, une date et une description. Heure, nombre et conditions peuvent compléter l’information lorsque vous les connaissez.', 'Notez par exemple trois oiseaux au repos, le lieu et l’heure. Précisez si le nombre est estimé.', 'Lieu, date et description donnent du contexte.'),
            f('Documenter sans déranger', 'Une photo à distance aide à vérifier une observation. Elle ne justifie pas de poursuivre un animal, entrer dans une zone fermée ou déplacer un organisme. Dites si l’identification est incertaine.', 'Gardez une photo prise depuis votre position ; renoncez au gros plan si nécessaire.', 'La qualité d’une donnée ne justifie pas un dérangement.'),
            f('Choisir le destinataire', 'Gestionnaire, association locale ou programme participatif peuvent recueillir des observations. Chacun a ses thèmes et son format. Consultez ses consignes et distinguez un signalement urgent d’une observation ordinaire.', 'Demandez au référent de la base quel canal convient. Transmettez les faits et votre degré de certitude.', 'Bon destinataire et doute explicite rendent le partage utile.'),
        ], questions: [
            q(0, 'Faut-il identifier toutes les espèces pour contribuer ?', ['Oui, sinon rien n’est utile', 'Non, une observation précise peut suffire', 'Oui, avec leurs noms scientifiques'], 1, 'Une observation utile ne demande pas un inventaire.'),
            q(1, 'Quelles informations forment une bonne base ?', ['Seulement une photo', 'Seulement le nom supposé', 'Lieu, date et description'], 2, 'Ces trois éléments situent l’observation.'),
            q(2, 'L’animal s’éloigne pendant la photo. Que faire ?', ['Garder la distance et renoncer au gros plan', 'Le poursuivre', 'Lui barrer le passage'], 0, 'Documenter ne doit pas provoquer un dérangement.'),
            q(3, 'L’identification est incertaine. Comment partager ?', ['Présenter le nom comme certain', 'Décrire les faits et préciser le doute', 'Inventer les détails'], 1, 'Un doute explicite aide le destinataire à vérifier.'),
        ],
    },
];
export type ParcoursId = ParcoursFormation['id'];
