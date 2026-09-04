/**
 * Contenu du parcours « Savoir en parler » — formation à la démarche COPUN.
 *
 * Ce que ce parcours enseigne : comment transmettre l'environnement pendant une séance de
 * sport de plein air, quel qu'il soit. Ce qu'il n'enseigne PAS : le littoral lui-même. Les
 * 131 fiches du catalogue sont le matériau que le moniteur apprend à manipuler, jamais le
 * programme — on forme à se servir du contenu, pas à le connaître.
 *
 * La démarche enseignée ici (fabriquer une accroche, retourner une idée reçue, faire faire
 * plutôt que dire) ne dépend d'aucun sport en particulier — elle vaut pour un moniteur de
 * voile comme pour un encadrant de kayak, de randonnée ou d'escalade. Le vocabulaire du
 * contenu reste volontairement générique ; seuls les exemples cités s'appuient sur le
 * catalogue COPUN, propre au littoral quel que soit le sport qui s'y pratique.
 *
 * Constat qui motive ce parcours (été de test, 17 moniteurs, usage quasi nul) : le
 * catalogue est un mur pour qui n'a jamais reçu de formation à la pédagogie
 * environnementale. Les moniteurs disent « je sais déjà » — et c'est vrai qu'ils savent
 * pratiquer. Ce qu'ils ne savent pas, c'est expliquer. D'où une formation professionnelle
 * sur le savoir-faire de transmission, avec validation interne.
 *
 * Format Google Primer : micro-modules de 5-7 min, cartes feuilletées une par une, ton
 * direct, technique nommée plutôt que conseils vagues. Rien n'est bloquant : la préparation
 * de semaine reste accessible sans être passé par ici.
 *
 * Tous les exemples cités sont des accroches, erreurs et actions RÉELLES du catalogue —
 * le moniteur les retrouve telles quelles dans l'app. Rien n'est inventé pour la formation.
 */

/** Bloc d'exemple : une formulation réelle du catalogue, éventuellement commentée. */
export type ExempleCarte = {
    texte: string;
    /** Renvoi vers la fiche d'origine, pour ancrer l'exemple dans le catalogue réel. */
    source?: string;
};

/**
 * Illustration de carte.
 *
 * Uniquement sur les cartes qui décrivent une SCÈNE (un groupe qui décroche, un pari lancé) —
 * jamais en décoration d'une carte de règles, qui est déjà visuelle par sa mise en page.
 * Les fichiers vivent dans `public/formation/` ; une carte dont l'image manque s'affiche
 * simplement sans, sans casser la mise en page.
 *
 * Les prompts de génération sont consignés dans `docs/prompts-illustrations.md`.
 */
export type IllustrationCarte = {
    /** Nom du fichier dans `public/formation/`, extension comprise. */
    fichier: string;
    /** Description pour les lecteurs d'écran — l'illustration porte du sens, pas du décor. */
    alt: string;
};

/**
 * Une carte porte UNE idée. Son type détermine son rendu — un contre-exemple ne se lit pas
 * comme une définition, un exercice ne se lit pas comme un encadré technique.
 */
export type CarteFormation =
    /** Carte de texte simple : une idée, éventuellement une liste de points. */
    | {
        genre: 'texte';
        titre: string;
        texte: string;
        points?: string[];
        illustration?: IllustrationCarte;
    }
    /**
     * Un procédé nommé et ses exemples réels.
     *
     * Le mécanisme (« pourquoi ça marche ») vit sur une carte `mecanisme` séparée : tout
     * réunir débordait de l'écran, et une carte ne défile pas — c'est le principe du
     * format. Deux cartes courtes valent mieux qu'une carte tronquée.
     */
    | {
        genre: 'procede';
        titre: string;
        /** Ce que le moniteur fait, en une phrase. */
        texte: string;
        exemples: ExempleCarte[];
        illustration?: IllustrationCarte;
    }
    /** Le mécanisme d'un procédé — ce qui distingue une formation d'une liste de conseils. */
    | {
        genre: 'mecanisme';
        titre: string;
        /** Pourquoi le procédé fonctionne. */
        pourquoi: string;
        /** Piège courant ou cas d'usage, selon ce que le procédé demande de préciser. */
        attention?: string;
    }
    /** Le mauvais et le bon côte à côte : le procédé le plus efficace pour faire comprendre. */
    | {
        genre: 'contraste';
        titre: string;
        texte: string;
        mauvais: string;
        bon: string;
        /** L'écart, expliqué — sans quoi le contraste ne s'enseigne pas. */
        ecart: string;
    }
    /** Mise en situation à choix. La correction argumente aussi les mauvaises réponses. */
    | {
        genre: 'exercice';
        titre: string;
        enonce: string;
        options: { cle: string; texte: string }[];
        bonneReponse: string;
        /** Pourquoi la bonne l'est, et pourquoi les autres ne le sont pas. */
        correction: string;
    }
    /**
     * Renforcement léger, à intercaler en fin de pile — pas seulement en fin de module.
     *
     * Plus rapide à lire et à répondre qu'un `exercice` à trois options : une seule
     * affirmation liée à ce qui vient d'être vu dans la pile, jamais un nouveau sujet. Le
     * but est de réactiver la notion pendant qu'elle est fraîche (le vrai principe du
     * renforcement Primer), pas de tester au sens scolaire — jamais bloquant, jamais noté.
     */
    | {
        genre: 'vrai_faux';
        titre: string;
        affirmation: string;
        reponse: boolean;
        /** Explique l'affirmation, qu'elle soit vraie ou fausse — jamais un simple "correct". */
        explication: string;
    }
    /** Récapitulatif de fin de module : ce qu'on emporte. */
    | {
        genre: 'bilan';
        titre: string;
        retenir: string[];
        /** Le pont vers l'app : ce que l'outil fait à sa place une fois la technique comprise. */
        note?: string;
    }
    /**
     * Respiration de fin de pile — une carte, comme les autres, mais sombre.
     *
     * Le « Rhythmic Learning » de Primer : finir une pile est une micro-réussite, et le
     * moniteur n'attend pas la fin du module pour sentir qu'il a appris. Le contraste
     * visuel signale le palier sans casser le geste — ça reste une carte qu'on swipe.
     *
     * Générée par le lecteur à partir de la pile, jamais écrite à la main dans le contenu.
     */
    | {
        genre: 'respiration';
        /** Ce que la pile vient d'apprendre. */
        titre: string;
        acquis: string;
        /** Absent sur la dernière pile, où la carte devient la fin du module. */
        suite?: string;
        numero: number;
        total: number;
    };

/**
 * Une pile de 3 à 5 cartes, suivie d'une respiration.
 *
 * C'est le « Rhythmic Learning » de Google Primer : les cartes ne défilent pas d'un bloc,
 * elles arrivent par petits paquets. Finir une pile est une micro-réussite — le moniteur
 * n'attend pas la fin du module pour avoir le sentiment d'avoir appris quelque chose, et
 * chaque palier est un endroit acceptable où s'arrêter.
 *
 * Au-delà de 5 cartes, la pile perd sa fonction : on scinde plutôt que d'allonger.
 */
export type PileFormation = {
    /** Ce que la pile apprend, annoncé sur l'écran de respiration qui la précède. */
    titre: string;
    /** Une phrase sur l'écran de fin de pile : ce que le moniteur vient d'acquérir. */
    acquis: string;
    cartes: CarteFormation[];
};

export type LeconFormation = {
    id: string;
    /** Numéro affiché dans le parcours — l'ordre a un sens : conviction avant mécanique. */
    numero: number;
    titre: string;
    /** Accroche de la liste : l'envie d'entrer, pas le résumé du contenu. */
    accroche: string;
    /** Minutes annoncées — la promesse de durée doit être tenue, pas indicative. */
    duree_min: number;
    piles: PileFormation[];
};

/**
 * Le flux de cartes d'une leçon : les cartes de chaque pile, suivies de sa respiration.
 *
 * Les respirations sont fabriquées ici plutôt qu'écrites dans le contenu — elles se
 * déduisent entièrement de la pile (son titre, son acquis, son rang) et les oublier ou les
 * désynchroniser n'aurait aucun intérêt.
 */
export function cartesDe(lecon: LeconFormation): CarteFormation[] {
    return lecon.piles.flatMap((pile, i) => [
        ...pile.cartes,
        {
            genre: 'respiration' as const,
            titre: pile.titre,
            acquis: pile.acquis,
            suite: lecon.piles[i + 1]?.titre,
            numero: i + 1,
            total: lecon.piles.length,
        },
    ]);
}

export const LECONS_FORMATION: LeconFormation[] = [
    {
        id: 'fabriquer-accroche',
        numero: 4,
        titre: 'Fabriquer une accroche',
        accroche: 'La première phrase, celle qui fait qu\'ils écoutent la deuxième.',
        duree_min: 7,
        piles: [
        {
            titre: 'Le problème',
            acquis: "Tu sais ce qu'une accroche doit faire — et ce qu'elle ne doit pas être.",
            cartes: [
            {
                genre: 'texte',
                titre: 'Le problème que ça résout',
                texte: "Tu as deux minutes et huit gamins qui pensent à autre chose.\n\nSi tu commences par « Alors, les marées, c'est dû à l'attraction de la Lune », tu les as perdus avant la fin de la phrase.\n\nL'accroche, c'est la première phrase. Celle qui fait qu'ils écoutent la deuxième.",
                illustration: {
                    fichier: 'decrochage.jpg',
                    alt: "Un moniteur explique tandis que le groupe d'enfants regarde ailleurs",
                },
            },
            {
                genre: 'texte',
                titre: "Ce qu'une accroche n'est pas",
                texte: "Ni une définition, ni une annonce de programme, ni une question à laquelle personne ne peut répondre.\n\nUne accroche crée un manque : ils veulent la suite parce qu'il leur manque quelque chose.",
                points: [
                    'Une question ouverte, jamais une affirmation',
                    "Une réponse qu'ils croient connaître",
                    'Moins de quinze mots',
                ],
            },
            {
                genre: 'texte',
                titre: 'Quatre formes qui marchent',
                texte: "Il n'y a pas trente-six façons. Quatre formes couvrent presque tout, et elles se reconnaissent.\n\nToutes celles qui suivent sont dans l'app, prêtes à l'emploi.",
                points: ['Le pari', 'Le piège', 'Le constat intrigant', 'Le choix forcé'],
            },
            ],
        },
        {
            titre: 'Deux formes qui engagent',
            acquis: 'Tu sais lancer un pari et poser un piège — deux façons de les faire réagir.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Le pari',
                texte: "Tu annonces quelque chose d'invraisemblable, et tu les mets au défi d'y croire.",
                exemples: [
                    { texte: "Je peux vous dire l'heure de la marée du 14 juillet 2030. Vous me croyez ?", source: 'Les marées' },
                    { texte: "Il est 10h, pas un souffle, grand soleil. Je parie qu'à 14h ça souffle. Pourquoi ?", source: 'Le vent' },
                ],
                illustration: {
                    fichier: 'pari.jpg',
                    alt: 'Un moniteur lance un défi à un groupe attentif',
                },
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi le pari marche',
                pourquoi: "Tu prends le risque, pas eux. Personne n'a peur de se tromper — c'est toi qui es sur la sellette. Ils veulent te prendre en défaut, donc ils écoutent.",
                attention: "À utiliser quand le phénomène est prévisible et que ça a l'air magique : marées, brise thermique, retour du vent l'après-midi.",
            },
            {
                genre: 'procede',
                titre: 'Le piège',
                texte: "Tu énonces une évidence fausse, et tu leur demandes s'ils sont d'accord.",
                exemples: [
                    { texte: "Pour bien observer, il faut s'approcher le plus près possible. Qui est d'accord ?", source: 'Observer sans déranger' },
                    { texte: "Savoir qu'il faut protéger la mer, et le faire : c'est la même chose ?", source: 'Les activités humaines' },
                ],
                illustration: {
                    fichier: 'piege.jpg',
                    alt: "Des enfants lèvent la main pour approuver une affirmation",
                },
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi le piège marche',
                pourquoi: "Ils lèvent la main, ils s'engagent. Quand tu retournes la réponse, ils ne l'oublient plus — parce qu'ils s'étaient positionnés.",
                attention: "Le but n'est pas qu'ils aient l'air bêtes. On ne dit jamais « eh non, perdu », mais « c'est ce qu'on croit tous, et pourtant… ». Tu es de leur côté, pas en face.",
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Dans le piège, le but est que le groupe ait l'air de s'être trompé.",
                reponse: false,
                explication: "Faux. On dit « c'est ce qu'on croit tous », jamais « eh non, perdu ». Le but est d'inclure le groupe dans la croyance qu'on retourne, pas de le désigner comme fautif.",
            },
            ],
        },
        {
            titre: 'Deux formes qui intriguent',
            acquis: 'Tu as les quatre formes. De quoi lancer n\'importe quel sujet.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Le constat intrigant',
                texte: "Tu poses un fait bizarre, sans l'expliquer.",
                exemples: [
                    { texte: "Personne en vue. Pourtant ils sont passés par là. Comment le savoir ?", source: 'La laisse de mer' },
                    { texte: "Il n'y a pas un souffle de vent, et pourtant il y a des vagues. D'où viennent-elles ?", source: 'Les vagues et la houle' },
                ],
                illustration: {
                    fichier: 'constat.jpg',
                    alt: "Des empreintes sur le sable, sans personne alentour",
                },
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi le constat marche',
                pourquoi: "Le mot « pourtant » fait tout le travail. Il y a une contradiction, donc il y a une explication, donc ils veulent l'entendre.",
                attention: "C'est la forme qui exploite le mieux le terrain : à utiliser quand tu as quelque chose de visible sous les yeux.",
            },
            {
                genre: 'procede',
                titre: 'Le choix forcé',
                texte: 'Deux options, ils doivent trancher.',
                exemples: [
                    { texte: 'Vent de terre ou vent de mer : lequel vous inquiète le plus ?', source: 'Le vent' },
                    { texte: "Le pêcheur, l'oiseau et le crabe ont un point commun. Lequel ?", source: 'Les marées' },
                ],
                illustration: {
                    fichier: 'choix.jpg',
                    alt: 'Un groupe se divise en deux camps face à une question',
                },
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi le choix forcé marche',
                pourquoi: "Impossible de rester passif. Même celui qui s'en fiche a un avis. Et un groupe divisé s'écoute — parce que chacun veut savoir qui avait raison.",
                attention: "À utiliser quand il y a une intuition majoritaire fausse. Le vent de terre est le plus dangereux, mais tout le monde répond « vent de mer ».",
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Le constat intrigant fonctionne surtout quand il n'y a rien de visible autour de toi.",
                reponse: false,
                explication: "Faux, c'est l'inverse. Le constat intrigant exploite ce qui est visible sur le terrain — sans quelque chose à montrer, il n'y a pas de « pourtant » à faire jouer.",
            },
            ],
        },
        {
            titre: 'À toi de jouer',
            acquis: 'Tu sais reconnaître une bonne accroche et en choisir une.',
            cartes: [
            {
                genre: 'contraste',
                titre: "L'erreur que tout le monde fait",
                texte: "La première fois, on écrit une annonce de programme au lieu d'une accroche.",
                mauvais: "Aujourd'hui je vais vous expliquer pourquoi la mer monte et descend.",
                bon: 'La mer monte et descend tous les jours. Qui la fait bouger, à votre avis ?',
                ecart: 'La seconde leur demande quelque chose. La première leur demande de se taire.',
            },
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Tu veux parler du fait que le littoral grouille de vie, alors que les enfants trouvent la plage vide.\n\nLaquelle tu choisis ?",
                options: [
                    { cle: 'A', texte: 'Le littoral est un milieu très riche en biodiversité.' },
                    { cle: 'B', texte: "Une plage, c'est vide. Qui est d'accord ?" },
                    { cle: 'C', texte: "Aujourd'hui on va parler des espèces du littoral." },
                ],
                bonneReponse: 'B',
                correction: "**B**, un piège.\n\n**A** est une définition — vraie, mais elle ne demande rien à personne. **C** est une annonce de programme : la phrase la plus fréquente et la moins efficace.\n\n**B** les fait s'engager sur une croyance qu'ils ont vraiment. Ensuite tu lances cinq minutes de recherche, et le décompte les contredit tout seul. Tu n'as même pas eu à expliquer.\n\nC'est l'accroche réelle de la fiche « Pourquoi y a-t-il autant de vie sur le littoral ? ».",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Quatre formes : pari, piège, constat, choix forcé',
                    'Une question ouverte, jamais une affirmation',
                    "Une réponse qu'ils croient connaître",
                    'Moins de quinze mots',
                ],
                note: "Si tu n'as pas le temps d'en fabriquer une : chaque fiche de l'app en propose déjà plusieurs. Tu choisis celle qui te ressemble.",
            },
            ],
        },
        ],
    },
    {
        id: 'retourner-idee-recue',
        numero: 5,
        titre: 'Retourner une idée reçue',
        accroche: 'Le levier le plus efficace pour faire retenir une chose : la corriger, pas l\'énoncer.',
        duree_min: 6,
        piles: [
        {
            titre: 'Pourquoi ça marche mieux',
            acquis: 'Tu sais pourquoi corriger une croyance ancre plus qu\'expliquer un fait neuf.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Une info neuve glisse, une correction reste',
                texte: "Dis à un enfant « les méduses sont poussées par le courant », il l'oublie dans la minute — c'était juste une phrase de plus.\n\nDis-lui « tu crois qu'elles nous attaquent ? En fait non, elles ne choisissent rien », et il s'en souvient. Tu viens de corriger quelque chose qu'il pensait vrai.",
            },
            {
                genre: 'texte',
                titre: 'Le mécanisme en deux temps',
                texte: "Toujours le même schéma, sur toutes les fiches de l'app : on énonce la croyance telle qu'elle circule vraiment, puis on la retourne en une phrase courte.\n\nLa croyance doit être formulée sérieusement — pas caricaturée — sinon personne ne se reconnaît dedans, et rien n'est corrigé.",
                points: [
                    "Énoncer la croyance sans se moquer",
                    "La retourner en une phrase, pas un exposé",
                    "Jamais « eh non, perdu » — toujours « et pourtant »",
                ],
            },
            ],
        },
        {
            titre: 'Deux idées reçues, en vrai',
            acquis: 'Tu as vu le procédé sur deux exemples réels du catalogue.',
            cartes: [
            {
                genre: 'procede',
                titre: 'La fausse évidence',
                texte: "La croyance a l'air logique — c'est justement pour ça qu'elle est répandue. Le retournement montre l'angle mort.",
                exemples: [
                    { texte: "On veut s'approcher pour mieux voir. Plus on s'approche, moins il reste d'animaux à regarder.", source: 'Observer sans déranger' },
                    { texte: "On croit que c'est le vent qui fait monter la mer. Le vent fait les vagues ; la marée, c'est la Lune.", source: 'Les marées' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi ça marche',
                pourquoi: "L'enfant a cru cette évidence toute sa vie sans jamais la remettre en question. La lui montrer fausse crée un vrai déclic — pas une info de plus, une reprogrammation.",
                attention: "Marche mieux sur une croyance qu'ils ont vraiment, pas une que tu inventes pour l'exercice. Si personne n'y croit, il n'y a rien à retourner.",
            },
            {
                genre: 'procede',
                titre: 'La fausse tranquillité',
                texte: "La croyance rassure — elle dit « tout va bien, pas besoin de faire attention ». Le retournement montre que ce n'est pas si simple.",
                exemples: [
                    { texte: "On pense qu'il suffit qu'il revienne. Il a dépensé une énergie qu'il ne récupère pas forcément.", source: 'Cohabitation avec le vivant' },
                    { texte: "On juge un déchet à sa taille. Les plus petits sont souvent les plus dangereux, parce qu'ils sont avalés.", source: 'Impact de la présence humaine' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi ça marche',
                pourquoi: "Une fausse tranquillité pousse à ne rien faire. La retourner ne culpabilise pas — elle montre juste qu'il y a un geste simple qui change quelque chose.",
                attention: "Toujours finir sur ce geste simple, pas sur le problème seul : « on s'écarte » ou « on ramasse même les petits », pas juste « attention, danger ».",
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Retourner une fausse tranquillité doit toujours se terminer sur la gravité du problème.",
                reponse: false,
                explication: "Faux. Il faut toujours finir sur un geste simple à faire — pas sur le problème seul, qui culpabilise sans donner de solution.",
            },
            ],
        },
        {
            titre: 'Le piège à éviter',
            acquis: 'Tu sais formuler une correction qui ne braque personne.',
            cartes: [
            {
                genre: 'contraste',
                titre: 'Corriger sans humilier',
                texte: "La même correction peut souder le groupe ou braquer un enfant, selon comment elle est dite.",
                mauvais: "Non, c'est faux, les méduses ne nous attaquent pas du tout, n'importe quoi.",
                bon: "C'est ce qu'on croit tous en les voyant arriver — et pourtant, elles ne choisissent rien, elles se laissent porter.",
                ecart: "La première désigne un coupable. La seconde inclut tout le monde, toi compris, dans la croyance qu'on corrige ensemble.",
            },
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Un enfant vient de dire : « une méduse échouée sur le sable, elle ne pique plus, elle est morte. »\n\nComment tu retournes ça ?",
                options: [
                    { cle: 'A', texte: "Faux, elle pique toujours, ne la touche jamais." },
                    { cle: 'B', texte: "C'est ce qu'on croit en la voyant immobile — et pourtant, même échouée, elle pique encore, et même un bout de tentacule dans le sable peut piquer." },
                    { cle: 'C', texte: "Les méduses sont des animaux marins composés à 95% d'eau." },
                ],
                bonneReponse: 'B',
                correction: "**B**, la bonne forme.\n\n**A** corrige sèchement, sans inclure l'enfant dans la croyance — il a l'air d'avoir juste tort. **C** est un fait exact mais hors sujet, ça n'engage aucune correction.\n\n**B** reprend le schéma en deux temps : la croyance reformulée avec bienveillance (« c'est ce qu'on croit »), puis le retournement, complet — jusqu'au détail qui change vraiment le comportement (le tentacule détaché).",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    "Corriger une croyance ancre mieux qu'énoncer un fait neuf",
                    "Formuler la croyance sérieusement, sans se moquer",
                    "Toujours finir sur un geste ou un repère simple",
                    "« Et pourtant », jamais « perdu »",
                ],
                note: "Les erreurs fréquentes des fiches de l'app suivent déjà ce schéma — tu peux les reprendre telles quelles.",
            },
            ],
        },
        ],
    },
    {
        id: 'choisir-quoi-transmettre',
        numero: 1,
        titre: 'Choisir quoi transmettre',
        accroche: 'Sur 131 fiches, comment repérer les trois qui valent le coup cette semaine.',
        duree_min: 6,
        piles: [
        {
            titre: 'Le problème du choix',
            acquis: 'Tu sais pourquoi trois sujets valent mieux que neuf, et lesquels choisir en premier.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Neuf thèmes, une semaine',
                texte: "L'app range son contenu en trois piliers — Comprendre, Observer, Protéger — et trois thèmes par pilier. Neuf portes d'entrée au total.\n\nOuvrir les neuf en même temps, c'est ne raconter aucune d'elles correctement. Une semaine tient trois sujets, un par pilier — pas plus.",
            },
            {
                genre: 'texte',
                titre: 'Le critère qui marche',
                texte: "Ne pars pas de « qu'est-ce qui est intéressant » — tout l'est. Pars de ce que le milieu te montre déjà cette semaine.\n\nUn sujet visible sur le terrain se raconte tout seul ; un sujet choisi au hasard demande de convoquer une explication hors sol.",
                points: [
                    "Ce que la météo ou la marée impose cette semaine",
                    "Ce que le groupe a déjà remarqué ou demandé",
                    "Ce qui est visible aujourd'hui, pas juste vrai en général",
                ],
            },
            ],
        },
        {
            titre: 'Un pilier, une entrée',
            acquis: 'Tu sais par où entrer dans chacun des trois piliers.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Comprendre : le lieu',
                texte: "Ce pilier répond à « pourquoi c'est comme ça ici ». Entre par ce qui structure la sortie du jour : le coefficient de marée, le sens du vent, la saison.",
                exemples: [
                    { texte: 'Pourquoi il y a plusieurs marées par jour ?', source: 'Caractéristiques du littoral' },
                    { texte: 'Pourquoi ne voit-on pas les mêmes animaux selon les saisons ?', source: 'Biodiversité et saisonnalité' },
                ],
            },
            {
                genre: 'procede',
                titre: 'Observer : ce qui se voit maintenant',
                texte: "Ce pilier répond à « qu'est-ce qu'on regarde ». Entre par ce qui est visible aujourd'hui, sur l'eau ou sur l'estran, pas par un phénomène qu'il faudrait attendre.",
                exemples: [
                    { texte: "Quelle alerte visuelle peut indiquer une montée rapide du vent ?", source: 'Interactions climatiques' },
                    { texte: 'Comment repérer des traces de présence animale sur ce site ?', source: 'Lecture du paysage' },
                ],
            },
            {
                genre: 'procede',
                titre: 'Protéger : ce qu\'on en fait',
                texte: "Ce pilier répond à « qu'est-ce qu'on décide de faire ». Entre par un geste concret que le groupe peut poser dans la séance, pas par un principe général.",
                exemples: [
                    { texte: 'Comment savoir si on dérange un animal ?', source: 'Cohabitation avec le vivant' },
                    { texte: "Pourquoi chacun peut œuvrer en faveur de la biodiversité ?", source: 'Sciences participatives' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi partir du pilier',
                pourquoi: "Un sujet par pilier donne une semaine équilibrée — comprendre, observer, agir — plutôt que trois variations du même angle. Le groupe reçoit trois façons différentes de se relier au lieu, pas trois fois la même.",
                attention: "Aucun ordre à respecter entre les trois : tu peux commencer par Protéger si c'est ce que la situation du jour impose.",
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Il faut toujours commencer la semaine par un sujet du pilier Comprendre.",
                reponse: false,
                explication: "Faux. Aucun ordre n'est imposé entre les trois piliers — tu commences par celui que la situation du jour impose, même si c'est Protéger.",
            },
            ],
        },
        {
            titre: 'À toi de choisir',
            acquis: 'Tu sais choisir un sujet à partir de ce que la semaine te donne, pas au hasard.',
            cartes: [
            {
                genre: 'contraste',
                titre: 'Partir du catalogue ou partir du terrain',
                texte: "La même semaine peut donner deux choix très différents selon le point de départ.",
                mauvais: "Je vais faire les marées cette semaine, c'est un classique.",
                bon: "Il y a un fort coefficient annoncé demain — je vais montrer au groupe ce que ça change avant de partir.",
                ecart: "Le premier choisit un sujet indépendamment de la semaine. Le second laisse la semaine désigner le sujet — il se racontera sans effort au bon moment.",
            },
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Il fait un temps calme et sans histoire toute la semaine, mais le groupe a trouvé une méduse échouée hier en arrivant.\n\nQuel sujet choisis-tu en priorité ?",
                options: [
                    { cle: 'A', texte: "Les marées, parce que c'est un sujet incontournable." },
                    { cle: 'B', texte: "Ce que faire quand on trouve une méduse échouée." },
                    { cle: 'C', texte: "Aucun, on attend un jour où il se passe vraiment quelque chose." },
                ],
                bonneReponse: 'B',
                correction: "**B**. Le groupe a déjà vécu quelque chose : il a une question toute prête, pas besoin de créer l'occasion.\n\n**A** ignore ce qui est arrivé pour un sujet plaqué de l'extérieur. **C** attend un signal plus fort alors qu'il vient d'avoir lieu — une méduse échouée en est un, pas besoin d'un événement plus spectaculaire.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Trois sujets par semaine, un par pilier',
                    'Le terrain du jour choisit le sujet, pas le catalogue',
                    'Ce que le groupe a déjà remarqué passe en priorité',
                ],
                note: "Une fois le sujet choisi, direction le module « Fabriquer une accroche » pour savoir comment le lancer.",
            },
            ],
        },
        ],
    },
    {
        id: 'terrain-environnement',
        numero: 1,
        titre: 'Ton terrain, c\'est déjà de l\'environnement',
        accroche: 'Pourquoi le milieu où tu encadres n\'est jamais un simple décor.',
        duree_min: 5,
        piles: [
        {
            titre: 'Un décor qui agit sur toi',
            acquis: 'Tu vois que tu utilises déjà le milieu comme un outil, sans le nommer.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Tu lis le milieu à chaque séance',
                texte: "Avant de partir, tu regardes le ciel, tu sens le vent, tu vérifies l'heure de marée. Ce n'est pas de l'environnement au sens « cours de sciences » — c'est ta sécurité, ta zone, ton horaire.\n\nLe milieu n'est donc jamais un décor : c'est ce qui décide ce que tu peux faire aujourd'hui.",
            },
            {
                genre: 'texte',
                titre: 'La question arrive toujours',
                texte: "Un stagiaire demande pourquoi il y a des méduses, pourquoi la mer est basse, ce qu'est cette chose échouée sur le sable. Ça arrive dans toutes les séances, pas seulement celles où tu l'as prévu.\n\nCe module ne rajoute rien à ta séance : il te donne de quoi répondre à ce qui arrive déjà.",
            },
            ],
        },
        {
            titre: 'Ce que ça change concrètement',
            acquis: 'Tu sais ce que ce module apporte, et ce qu\'il ne te demande pas.',
            cartes: [
            {
                genre: 'contraste',
                titre: 'Un cours en plus, ou un regard en plus',
                texte: "La différence entre les deux tient à ce que tu ajoutes vraiment à ta séance.",
                mauvais: "Il faudrait que je fasse une vraie leçon sur l'environnement, mais je n'ai pas le temps ni les compétences pour ça.",
                bon: "J'ai deux minutes pendant le gréement, et une méduse sous les yeux — autant en parler maintenant.",
                ecart: "La première imagine un cours à préparer en plus. La seconde utilise un moment qui existe déjà, avec ce que le milieu montre déjà.",
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi ça reste léger',
                pourquoi: "Tu n'ajoutes jamais de temps : tu remplis un moment mort qui existait déjà (gréement, attente, retour). Le milieu fournit le sujet, tu n'as rien à inventer.",
                attention: "Si un jour tu n'as ni l'envie ni l'occasion, tu ne fais rien — rien ne s'accumule, rien ne manque à la séance suivante.",
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Pour transmettre l'environnement, il faut ajouter un vrai temps de cours à la séance.",
                reponse: false,
                explication: "Faux. Le principe est inverse : tu remplis un temps mort qui existe déjà (gréement, attente, retour), tu n'ajoutes rien à la durée de la séance.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Le milieu où tu encadres agit déjà sur ta séance',
                    'La question du stagiaire arrive, préparé ou non',
                    'Ce module remplit un temps mort, il n\'en ajoute pas',
                ],
                note: "La suite logique : « Ce que ça change pour toi », pour voir ce que ça t'apporte concrètement.",
            },
            ],
        },
        ],
    },
    {
        id: 'ce-que-ca-change',
        numero: 2,
        titre: 'Ce que ça change pour toi',
        accroche: 'Les temps morts remplis, le groupe qui accroche, le coût réel — deux minutes.',
        duree_min: 5,
        piles: [
        {
            titre: 'Le bénéfice concret',
            acquis: 'Tu sais précisément ce que ça t\'apporte, pas juste "c\'est bien pour la planète".',
            cartes: [
            {
                genre: 'texte',
                titre: 'Le temps mort qui pèse',
                texte: "Gréement, attente des parents, météo qui hésite : ces moments existent déjà, et ils pèsent souvent — le groupe s'agite, tu répètes les consignes de sécurité une troisième fois.\n\nUn sujet bien amené transforme ce moment en quelque chose que le groupe attend, pas subit.",
            },
            {
                genre: 'texte',
                titre: 'Ce que tu gagnes, toi',
                texte: "Ce n'est pas seulement bon pour le groupe. C'est aussi ce qui te distingue : le moniteur qui sait répondre, qui a une anecdote, qui tient l'attention sans hausser la voix.",
                points: [
                    "Des temps morts occupés sans effort de préparation",
                    "Une réponse prête quand la question tombe",
                    "Une posture plus assurée face aux parents et au club",
                ],
            },
            ],
        },
        {
            titre: 'Le coût réel',
            acquis: 'Tu sais que le coût tient en deux minutes, pas en une compétence à acquérir.',
            cartes: [
            {
                genre: 'mecanisme',
                titre: 'Pourquoi ça ne prend presque rien',
                pourquoi: "Tu n'as pas besoin de tout savoir sur le sujet — juste une accroche, une idée à retenir, une action. C'est exactement ce que fournit une fiche de l'app : le minimum nécessaire, prêt à dire.",
                attention: "Ne cherche pas à \"faire un cours complet\". Deux minutes bien utilisées valent mieux que dix minutes où tu improvises et perds le fil.",
            },
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Tu attends les parents dix minutes, le groupe s'ennuie un peu. Qu'est-ce qui rapporte le plus pour ce moment précis ?",
                options: [
                    { cle: 'A', texte: "Préparer un exposé de dix minutes sur l'écosystème du littoral." },
                    { cle: 'B', texte: "Poser une question sur ce qui est visible autour de vous à cet instant." },
                    { cle: 'C', texte: "Ne rien faire, ce n'est pas le moment." },
                ],
                bonneReponse: 'B',
                correction: "**B**. Le temps mort est précisément le moment où une question courte, ancrée dans ce qui est là, occupe le groupe sans effort de préparation.\n\n**A** demande une préparation disproportionnée pour dix minutes d'attente. **C** laisse filer une occasion gratuite — le milieu offre toujours quelque chose à regarder pendant qu'on attend.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Un temps mort occupé, pas un cours ajouté',
                    'Le bénéfice est autant pour toi que pour le groupe',
                    'Deux minutes suffisent, avec une seule idée claire',
                ],
                note: "Prochaine étape naturelle : « Repérer le bon moment pour en parler », dans le thème La méthode COPUN.",
            },
            ],
        },
        ],
    },
    {
        id: 'reperer-bon-moment',
        numero: 1,
        titre: 'Repérer le bon moment pour en parler',
        accroche: 'Le milieu te tend l\'occasion : à toi de savoir la reconnaître et la saisir.',
        duree_min: 5,
        piles: [
        {
            titre: 'Deux façons d\'entrer',
            acquis: 'Tu distingues les deux occasions que le milieu te tend, sans en préférer une.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Tu n\'as rien à préparer à l\'avance',
                texte: "Tu n'as pas à guetter LE moment parfait. Le milieu t'en donne deux sortes, en permanence, et les deux sont aussi valables l'une que l'autre.",
                points: [
                    "Quelque chose se montre — tu expliques ce que c'est",
                    "Tu annonces quelque chose — vous allez le vérifier ensemble",
                ],
            },
            {
                genre: 'procede',
                titre: 'Entrer par l\'observé',
                texte: "Une méduse échouée, une trace sur le sable, un nuage qui change de forme : quelque chose apparaît devant vous, tu pars de là.",
                exemples: [
                    { texte: "Que faire quand on trouve une méduse échouée sur la plage ?", source: 'Cohabitation avec le vivant' },
                    { texte: "Comment reconnaître les méduses qu'on croise ici ?", source: 'Observation sensorielle' },
                ],
            },
            ],
        },
        {
            titre: 'L\'autre entrée',
            acquis: 'Tu sais utiliser une annonce comme point de départ, pas seulement un imprévu.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Entrer par l\'annoncé',
                texte: "Un coefficient de marée élevé demain, un vent qui doit tourner : tu annonces ce qui va arriver, puis vous vérifiez ensemble sur le terrain.",
                exemples: [
                    { texte: "Pourquoi il est important de connaître le coefficient de marée ?", source: 'Repères spatio-temporels' },
                    { texte: "Comment sait-on jusqu'où la mer va monter ?", source: 'Impact de la présence humaine' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi aucune des deux ne domine',
                pourquoi: "L'observé capte l'attention immédiatement parce que c'est déjà là. L'annoncé crée une attente puis une confirmation, ce qui ancre tout autant. Ce n'est jamais un pis-aller par rapport à l'autre.",
                attention: "Le seul critère : ce que la situation te tend maintenant. Une méduse sous les yeux appelle l'observé ; un grand coefficient prévu demain appelle l'annoncé.",
            },
            ],
        },
        {
            titre: 'À toi de choisir',
            acquis: 'Tu sais reconnaître laquelle des deux entrées la situation te tend.',
            cartes: [
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "La météo annonce un gros coefficient de marée pour après-demain. Rien de particulier ne se passe aujourd'hui sur le terrain.\n\nComment tu abordes le sujet ?",
                options: [
                    { cle: 'A', texte: "Tu attends que quelque chose se montre avant d'en parler." },
                    { cle: 'B', texte: "Tu annonces le coefficient à venir, et vous irez vérifier ensemble après-demain." },
                    { cle: 'C', texte: "Tu expliques la théorie complète des marées tout de suite." },
                ],
                bonneReponse: 'B',
                correction: "**B**. Rien à observer aujourd'hui, mais une information à venir : c'est exactement le terrain de l'entrée par l'annoncé.\n\n**A** attend un signal qui n'a pas de raison d'apparaître avant après-demain. **C** part sur un exposé complet, hors de toute occasion réelle — l'inverse de partir de ce que la situation tend.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    "Entrer par ce qui se montre, ou par ce qu'on annonce",
                    "Les deux entrées se valent — aucune n'est un repli",
                    "Le critère : ce que la situation du jour te tend",
                ],
                note: "Ce même principe se retrouve dans le module « Comprendre, Observer, Protéger ».",
            },
            ],
        },
        ],
    },
    {
        id: 'comprendre-observer-proteger',
        numero: 2,
        titre: 'Comprendre, Observer, Protéger',
        accroche: 'La grille de lecture COPUN : trois angles sur un même sujet, dans l\'ordre que tu veux.',
        duree_min: 6,
        piles: [
        {
            titre: 'Trois angles, pas un escalier',
            acquis: 'Tu sais ce que chaque pilier apporte, sans les hiérarchiser.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Le même sujet, trois fois',
                texte: "COP n'est pas trois niveaux à franchir dans l'ordre. C'est trois façons de raconter la même chose : ce que c'est, ce qu'on en voit, ce qu'on en fait.\n\nUn sujet entier peut se dire dans un seul pilier, ou traverser les trois selon ce que la situation permet.",
                points: [
                    'Comprendre : ce qui explique le phénomène',
                    'Observer : ce qui se voit ou se vérifie sur le terrain',
                    'Protéger : ce que ça change dans un comportement',
                ],
            },
            ],
        },
        {
            titre: 'Un phénomène, trois portes',
            acquis: 'Tu as vu un même sujet raconté sous ses trois angles, avec de vraies fiches.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Comprendre : les marées',
                texte: "Pourquoi ça se passe comme ça. Le catalogue en a d'ailleurs le plus grand nombre : le pilier le plus facile à nourrir, pas forcément le plus important.",
                exemples: [
                    { texte: 'Pourquoi y a-t-il plusieurs marées par jour ?', source: 'Les marées' },
                    { texte: 'Pourquoi il est important de connaître le coefficient de marée ?', source: 'Les marées' },
                ],
            },
            {
                genre: 'procede',
                titre: 'Observer : les marées',
                texte: "Ce qu'on vérifie avec ses yeux, pas ce qu'on sait par cœur.",
                exemples: [
                    { texte: "Comment sait-on que l'eau monte et descend ?", source: 'Les marées' },
                    { texte: "Comment savoir où poser mon matériel quand j'arrive sur l'estran ?", source: 'Les marées' },
                ],
            },
            {
                genre: 'procede',
                titre: 'Protéger : les marées',
                texte: "Le pilier le plus rare sur ce sujet — une seule fiche sur seize. Ça ne veut pas dire qu'il compte moins, juste qu'il est plus difficile à formuler pour ce phénomène précis.",
                exemples: [
                    { texte: 'Pourquoi respecter les zones de reproduction selon les cycles de marée ?', source: 'Les marées' },
                ],
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Sur les marées, il y a moins de fiches Protéger parce que ce pilier compte moins pour ce sujet.",
                reponse: false,
                explication: "Faux. Le pilier le mieux nourri au catalogue n'est pas le plus important — Protéger est juste plus difficile à formuler pour ce phénomène précis.",
            },
            ],
        },
        {
            titre: 'Sans ordre imposé',
            acquis: 'Tu sais entrer par n\'importe quel pilier selon la situation.',
            cartes: [
            {
                genre: 'mecanisme',
                titre: 'Ce que COP t\'évite',
                pourquoi: "Sans cette grille, tu réinventes un angle à chaque fois — parfois toujours le même, parfois aucun. Avec elle, tu sais toujours par où continuer si le premier angle épuise l'attention du groupe : \"on vient de voir comment on le vérifie, voyons maintenant ce que ça change\".",
                attention: "Aucun pilier n'est un prérequis des deux autres. Tu peux ouvrir par Protéger si c'est ce qu'impose la situation — pas besoin d'avoir \"fait\" Comprendre avant.",
            },
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Un enfant demande directement : « Pourquoi il faut faire attention aux oiseaux qui nichent sur la plage ? »\n\nLa question arrive déjà par quel pilier ?",
                options: [
                    { cle: 'A', texte: "Comprendre, il faut d'abord expliquer ce qu'est un oiseau." },
                    { cle: 'B', texte: "Protéger — la question porte déjà sur un comportement à adopter." },
                    { cle: 'C', texte: "Aucun des trois avant d'avoir vu l'oiseau en vrai." },
                ],
                bonneReponse: 'B',
                correction: "**B**. La question porte sur « pourquoi faire attention » — c'est directement un enjeu de comportement, donc Protéger. Rien n'empêche d'ouvrir par ce pilier.\n\n**A** impose un détour par Comprendre qui n'est pas demandé — l'enfant sait déjà ce qu'est un oiseau. **C** attend une observation qui n'est pas nécessaire pour répondre à la question posée.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Trois angles sur un même sujet, jamais un ordre obligé',
                    'Le pilier le mieux nourri au catalogue n\'est pas le plus important',
                    'Tu entres par le pilier que la situation ou la question impose',
                ],
                note: "Les fiches de l'app indiquent toujours leur pilier — un repère pour savoir sous quel angle elles parlent, pas une case à cocher dans l'ordre.",
            },
            ],
        },
        ],
    },
    {
        id: 'gerer-imprevu',
        numero: 3,
        titre: 'Quand ça ne se passe pas comme prévu',
        accroche: 'Tu ne sais pas répondre, quelqu\'un conteste, personne n\'accroche : que faire.',
        duree_min: 6,
        piles: [
        {
            titre: 'Tu ne sais pas répondre',
            acquis: 'Tu as une réponse toute prête pour le moment où tu sèches.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Ça arrivera, et c\'est normal',
                texte: "Aucune fiche ne couvre tout. Un jour, un enfant pose une question à laquelle tu n'as pas de réponse. Le réflexe à éviter : improviser une explication approximative pour ne pas perdre la face.",
            },
            {
                genre: 'contraste',
                titre: 'Inventer, ou l\'assumer',
                texte: "La différence se joue en une phrase.",
                mauvais: "Euh... je crois que c'est à cause du sel, ou un truc comme ça.",
                bon: "Bonne question, je ne sais pas — on regarde ce soir et je te dis demain.",
                ecart: "La première invente une réponse fragile, qui peut se révéler fausse devant le groupe plus tard. La seconde est une réponse professionnelle : elle ne te dévalue pas, elle montre que tu prends la question au sérieux.",
            },
            ],
        },
        {
            titre: 'Quelqu\'un conteste',
            acquis: 'Tu sais réagir face à un enfant qui sait déjà, ou un parent qui doute.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Un enfant qui sait déjà',
                texte: "Il connaît la réponse, parfois mieux que ce que tu allais dire. Ce n'est pas un problème à gérer — c'est une ressource.",
                exemples: [
                    { texte: "Fais-le préciser devant le groupe : « Tu en sais plus que moi là-dessus, tu peux nous expliquer ? »", source: 'Posture' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi ça marche',
                pourquoi: "L'enfant devient ton assistant plutôt que ton concurrent, et le groupe entend la même idée dite par un pair — ça ancre différemment. Tu gardes la main en reformulant ensuite en une phrase simple.",
                attention: "Si un parent conteste une affirmation, ne débats pas sur le terrain de l'opinion : montre la fiche ou l'observation qui la fonde. Tu n'as pas à convaincre, juste à sourcer.",
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Face à un parent qui conteste, il faut débattre pour le convaincre.",
                reponse: false,
                explication: "Faux. Tu n'as pas à convaincre, juste à sourcer : montre la fiche ou l'observation qui fonde ton affirmation, sans entrer dans un débat d'opinion.",
            },
            ],
        },
        {
            titre: 'Personne n\'accroche',
            acquis: 'Tu sais t\'arrêter net plutôt que d\'insister.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Le réflexe à avoir',
                texte: "Tu lances une accroche, silence complet, regards ailleurs. N'insiste pas et n'explique pas quand même « pour que ce ne soit pas perdu ».\n\nArrête-toi. Deux minutes ratées ne coûtent rien ; dix minutes à parler dans le vide, si.",
            },
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Tu poses ton accroche sur les méduses, personne ne réagit, un enfant baille ostensiblement.\n\nQue fais-tu ?",
                options: [
                    { cle: 'A', texte: "Tu réexpliques différemment pour capter leur attention." },
                    { cle: 'B', texte: "Tu arrêtes là et tu reviens au programme de la séance." },
                    { cle: 'C', texte: "Tu hausses le ton pour qu'ils t'écoutent." },
                ],
                bonneReponse: 'B',
                correction: "**B**. Ce moment n'a pas pris, ce n'est pas grave — une autre occasion se présentera. Insister transforme un échec sans conséquence en dix minutes de séance perdues.\n\n**A** et **C** persistent sur un terrain qui ne prend pas, au lieu de couper court et de revenir plus tard sur un meilleur moment.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    "« Je ne sais pas, je regarde et je te dis » est une réponse professionnelle",
                    "Un enfant qui sait devient un assistant, pas un rival",
                    "Un silence qui ne prend pas se referme, il ne s'insiste pas",
                ],
                note: "Ces trois réflexes suffisent à couvrir presque tous les imprévus du terrain.",
            },
            ],
        },
        ],
    },
    {
        id: 'verifier-si-ca-a-pris',
        numero: 4,
        titre: 'Vérifier si ça a pris',
        accroche: 'Savoir si le message est passé, sans faire un contrôle.',
        duree_min: 5,
        piles: [
        {
            titre: 'Pas un contrôle',
            acquis: 'Tu sais pourquoi un contrôle direct ne dit presque rien.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Demander "vous avez compris ?" ne sert à rien',
                texte: "Un groupe répond toujours oui à cette question, qu'il ait suivi ou non. Ce n'est pas un mensonge : personne ne veut admettre publiquement ne pas avoir suivi.\n\nIl faut une autre façon de savoir, qui ne ressemble pas à une interrogation.",
            },
            {
                genre: 'contraste',
                titre: 'Interroger, ou faire reformuler',
                texte: "Deux façons de vérifier, avec des résultats très différents.",
                mauvais: "Alors, vous avez compris pourquoi les méduses ne nous attaquent pas ?",
                bon: "Explique à ton voisin pourquoi elles sont là aujourd'hui, toi.",
                ecart: "La première appelle un oui automatique. La seconde force à reformuler avec ses propres mots — si l'idée n'est pas passée, ça se voit tout de suite dans la reformulation.",
            },
            ],
        },
        {
            titre: 'Le vrai signal',
            acquis: 'Tu sais repérer si ça a pris sans rien demander directement.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Écouter ce qui revient plus tard',
                texte: "Le meilleur signal n'arrive jamais tout de suite. C'est quand l'idée ressort d'elle-même, plus tard dans la séance ou le lendemain, sans que tu l'aies redemandée.",
                exemples: [
                    { texte: "Un enfant qui redit spontanément « c'est à cause de la Lune » en désignant la mer, deux jours après.", source: 'Signal de terrain' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi c\'est le bon signal',
                pourquoi: "Une idée reformulée sur commande peut être du par-cœur récité sans être comprise. Une idée qui ressort spontanément, dans un contexte différent, prouve qu'elle s'est vraiment installée.",
                attention: "Ne cherche pas ce signal à tout prix — il vient ou il ne vient pas. L'absence de rappel spontané ne veut pas dire que rien n'est passé, juste que tu ne le sauras pas cette fois.",
            },
            ],
        },
        {
            titre: 'À toi de repérer',
            acquis: 'Tu sais reconnaître un vrai signal de compréhension.',
            cartes: [
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Lequel de ces trois moments te dit le plus clairement que ton explication sur les marées a pris ?",
                options: [
                    { cle: 'A', texte: "Un enfant répond « oui » quand tu demandes s'il a compris." },
                    { cle: 'B', texte: "Un enfant demande, deux jours plus tard sur une autre plage, si la marée y sera aussi haute." },
                    { cle: 'C', texte: "Le groupe reste silencieux quand tu poses la question." },
                ],
                bonneReponse: 'B',
                correction: "**B**. L'idée a été réutilisée spontanément, dans un contexte différent, sans qu'on la lui redemande — c'est le signal le plus fiable.\n\n**A** est la réponse automatique qui ne dit rien de la compréhension réelle. **C** ne renseigne sur rien : le silence peut venir d'une incompréhension comme d'une évidence qui ne mérite pas de réponse.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    '« Vous avez compris ? » ne mesure jamais rien',
                    'Faire reformuler avec ses mots révèle ce qui a vraiment pris',
                    'Le vrai signal : l\'idée qui ressort d\'elle-même, plus tard',
                ],
                note: "Ce module boucle le parcours de La méthode COPUN — tu as de quoi choisir le moment, tenir la méthode, gérer l'imprévu, et savoir si ça a marché.",
            },
            ],
        },
        ],
    },
    {
        id: 'observer-avant-expliquer',
        numero: 1,
        titre: 'Observer avant d\'expliquer',
        accroche: 'Poser une question et vraiment attendre la réponse — le silence comme outil.',
        duree_min: 5,
        piles: [
        {
            titre: 'Le réflexe à casser',
            acquis: 'Tu sais pourquoi combler le silence trop vite abîme la question posée.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Le silence qui gêne, mais qui sert',
                texte: "Tu poses une question, personne ne répond tout de suite, et le réflexe est de répondre soi-même pour combler le blanc.\n\nCe silence n'est pas un échec de l'accroche — c'est le temps dont le groupe a besoin pour vraiment regarder avant de répondre.",
            },
            {
                genre: 'contraste',
                titre: 'Combler, ou laisser chercher',
                texte: "Deux réactions possibles au même silence de trois secondes.",
                mauvais: "Personne ne dit rien ? Bon, en fait c'est parce que...",
                bon: "Prends ton temps, regarde bien avant de répondre.",
                ecart: "La première coupe l'observation avant qu'elle ait eu lieu. La seconde la prolonge — et c'est cette observation, pas ta phrase, qui va ancrer la réponse.",
            },
            ],
        },
        {
            titre: 'Faire regarder, pas seulement écouter',
            acquis: 'Tu sais transformer une question en consigne d\'observation précise.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Donner un point précis à observer',
                texte: "Une consigne vague (« regardez autour de vous ») ne produit rien. Une consigne précise — un détail, un comportement, un repère — oriente le regard et donne une vraie chance de trouver.",
                exemples: [
                    { texte: "Le comportement de l'animal : il se nourrit tranquillement, ou il s'arrête et nous fixe ?", source: 'Cohabitation avec le vivant' },
                    { texte: "D'où vient le vent par rapport à la plage : de la terre vers la mer, ou l'inverse ?", source: 'Le vent' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi préciser change tout',
                pourquoi: "Un regard sans cible se perd. Un regard avec une cible précise (« le comportement », « la direction ») trouve quelque chose en quelques secondes, et ce quelque chose devient la matière de ta explication — pas un fait que tu apportes de l'extérieur.",
                attention: "La précision ne veut pas dire donner la réponse. « Regardez si l'oiseau reste ou s'envole » oriente sans trahir ce qu'il faut en conclure.",
            },
            ],
        },
        {
            titre: 'À toi de tester',
            acquis: 'Tu sais transformer une explication en consigne d\'observation.',
            cartes: [
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Tu veux faire comprendre que la marée est en train de descendre. Quelle consigne fonctionne le mieux ?",
                options: [
                    { cle: 'A', texte: "Je vous explique : la marée descend, c'est la Lune qui fait ça." },
                    { cle: 'B', texte: "Regardez le niveau de l'eau contre ce rocher, puis regardez à nouveau dans dix minutes." },
                    { cle: 'C', texte: "Vous voyez bien que la mer descend, non ?" },
                ],
                bonneReponse: 'B',
                correction: "**B** donne une cible précise et un temps d'observation réel — le groupe va constater le mouvement par lui-même, pas juste l'entendre dire.\n\n**A** saute directement à l'explication sans observation. **C** prétend qu'une observation a déjà eu lieu, sans jamais l'avoir vraiment provoquée.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Le silence après une question est un temps utile, pas un échec',
                    'Une consigne précise oriente le regard sans donner la réponse',
                    'Ce que le groupe trouve lui-même ancre mieux que ce qu\'on lui dit',
                ],
                note: "Ce réflexe se combine naturellement avec « Faire faire, pas seulement dire », le module suivant de ce thème.",
            },
            ],
        },
        ],
    },
    {
        id: 'faire-faire',
        numero: 2,
        titre: 'Faire faire, pas seulement dire',
        accroche: 'Transformer une explication en une action concrète que le groupe réalise.',
        duree_min: 6,
        piles: [
        {
            titre: 'Deux familles d\'actions',
            acquis: 'Tu connais les deux formes d\'action qui remplacent une explication.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Dire s\'oublie, faire reste',
                texte: "Expliquer que le courant est plus fort à mi-marée se retient mal. Faire lâcher un objet flottant et voir la différence de vitesse se retient tout seul.\n\nChaque fiche de l'app propose une action, pas seulement un texte à réciter.",
                points: ['Produire : chercher, compter, rapporter', 'Confronter : prédire puis vérifier'],
            },
            ],
        },
        {
            titre: 'Produire',
            acquis: 'Tu sais fabriquer une consigne qui fait chercher et rapporter.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Faire chercher, faire rapporter',
                texte: "Une consigne courte, réalisable avec ce qu'on a sous la main, qui produit un résultat visible par tout le groupe.",
                exemples: [
                    { texte: "Faites lister les milieux traversés depuis chez eux jusqu'ici : mer, dune, plaine, bocage. La densité surprend.", source: 'Lecture du paysage' },
                    { texte: "Chacun choisit un caillou au bord de l'eau. On revient cinq minutes plus tard voir s'il est couvert.", source: 'Les marées' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi ça ancre',
                pourquoi: "Le groupe produit lui-même la preuve — une liste, un décompte, une observation notée. Ce n'est plus ta parole contre leur doute, c'est ce qu'ils viennent de constater.",
                attention: "Une bonne consigne « Produire » tient en une phrase et se fait en moins de cinq minutes. Si elle demande du matériel ou une longue explication préalable, elle a raté sa cible.",
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Une bonne consigne « Produire » peut demander une préparation matérielle avant la séance.",
                reponse: false,
                explication: "Faux. Elle tient en une phrase et se fait en moins de cinq minutes avec ce qu'on a déjà sous la main — si elle demande du matériel, elle a raté sa cible.",
            },
            ],
        },
        {
            titre: 'Confronter',
            acquis: 'Tu sais fabriquer une consigne qui fait prédire puis vérifier.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Faire parier, puis montrer',
                texte: "On demande une prédiction avant de révéler la réalité. L'écart entre les deux fait tout le travail de mémorisation.",
                exemples: [
                    { texte: "Faites voter entre marée haute, marée basse et mi-marée. La majorité se trompe : c'est à mi-marée.", source: 'Les marées' },
                    { texte: "Faites voter si le soleil suffit à décider de sortir. Le vent et la marée comptent bien plus.", source: 'Repères spatio-temporels' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi ça ancre',
                pourquoi: "Se tromper dans une prédiction publique crée un vrai moment de surprise — bien plus marquant que d'entendre juste la bonne réponse. Le groupe retient l'écart, pas seulement le fait.",
                attention: "Ne révèle jamais la réponse avant que chacun se soit positionné, même en silence. Sans prise de position, il n'y a pas d'écart à ressentir.",
            },
            ],
        },
        {
            titre: 'À toi de fabriquer',
            acquis: 'Tu sais choisir la bonne famille d\'action pour une situation donnée.',
            cartes: [
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Tu veux faire comprendre que le courant est plus fort à certains endroits qu'à d'autres, sans rien avoir apporté de spécial.",
                options: [
                    { cle: 'A', texte: "Tu expliques la théorie des courants marins pendant cinq minutes." },
                    { cle: 'B', texte: "Tu fais chercher la traînée d'écume derrière une bouée pour voir le sens du courant." },
                    { cle: 'C', texte: "Tu demandes si tout le monde a bien compris ce qu'est un courant." },
                ],
                bonneReponse: 'B',
                correction: "**B** — une consigne « Produire », réalisable sans rien apporter, qui fait chercher un indice visible sur place et le rapporter au groupe.\n\n**A** reste une explication, exactement ce que ce module propose de dépasser. **C** est le faux contrôle déjà vu dans le module « Vérifier si ça a pris » — ça ne fait rien produire ni prédire.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Produire : faire chercher, compter, rapporter',
                    'Confronter : faire prédire avant de révéler',
                    'Une bonne consigne tient en une phrase, moins de cinq minutes',
                ],
                note: "Les deux familles sont déjà écrites dans les actions de chaque fiche — tu n'as qu'à choisir laquelle correspond à ta situation.",
            },
            ],
        },
        ],
    },
    {
        id: 'adapter-exposition-groupe',
        numero: 3,
        titre: 'Adapter selon l\'exposition du groupe',
        accroche: 'Pas l\'âge : ce que le groupe a déjà vu ou pas du sujet.',
        duree_min: 6,
        piles: [
        {
            titre: 'Un repère mal nommé',
            acquis: 'Tu sais que le niveau des fiches ne mesure pas l\'âge, mais l\'exposition au sujet.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Pas une échelle de difficulté',
                texte: "Les fiches de l'app portent un niveau 1 à 3. Ce n'est pas une échelle d'âge ni de difficulté du texte — vérifié, la longueur ne varie que de 15% entre les niveaux.\n\nC'est un repère de PUBLIC : niveau 1 pour un stagiaire d'une semaine, sans exposition préalable ; niveaux 2-3 pour un groupe déjà sensibilisé, plusieurs saisons de pratique.",
            },
            {
                genre: 'texte',
                titre: 'Jamais une barrière',
                texte: "Un phénomène rare intéresse un groupe entier quel que soit son niveau. Le niveau reste un repère à consulter, jamais un filtre qui cache une fiche par défaut.",
                points: [
                    "Niveau 1 : premier contact avec le sujet",
                    "Niveau 2-3 : déjà sensibilisé, plusieurs saisons",
                    "Un repère, jamais une exclusion automatique",
                ],
            },
            ],
        },
        {
            titre: 'Un même sujet, trois profondeurs',
            acquis: 'Tu as vu comment le même phénomène se dit à trois profondeurs différentes.',
            cartes: [
            {
                genre: 'procede',
                titre: 'Premier contact',
                texte: "Le fait brut, sans mécanisme derrière — ce qui se voit et se nomme.",
                exemples: [
                    { texte: 'Pourquoi y a-t-il plusieurs marées par jour ?', source: 'Les marées, niveau 1' },
                    { texte: "Comment s'appelle la zone qui se couvre et se découvre avec la marée ?", source: 'Les marées, niveau 1' },
                ],
            },
            {
                genre: 'procede',
                titre: 'Déjà sensibilisé',
                texte: "Le pourquoi technique, et les conséquences pratiques du phénomène.",
                exemples: [
                    { texte: "Pourquoi il est important de connaître le coefficient de marée ?", source: 'Les marées, niveau 2' },
                    { texte: "Pourquoi le rythme des marées a des incidences sur le vivant et les activités humaines ?", source: 'Les marées, niveau 2' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Comment passer de l\'un à l\'autre',
                pourquoi: "Le niveau 1 nomme et montre. Le niveau 2 relie à un usage concret. Tu peux monter en profondeur avec le même groupe au fil de la semaine, en partant toujours du niveau 1 si le sujet est neuf pour eux.",
                attention: "Ne saute jamais le niveau 1 pour un groupe qui découvre le sujet, même s'il semble déjà grand ou dégourdi — l'exposition au sujet précis compte plus que l'âge général.",
            },
            {
                genre: 'vrai_faux',
                titre: 'À toi',
                affirmation: "Un groupe de jeunes déjà expérimentés en voile peut sauter le niveau 1 sur un sujet qu'ils découvrent.",
                reponse: false,
                explication: "Faux. Ne saute jamais le niveau 1 pour un groupe qui découvre le sujet précis, même s'il semble déjà grand ou dégourdi — c'est l'exposition au sujet qui compte, pas l'âge général.",
            },
            ],
        },
        {
            titre: 'À toi de juger',
            acquis: 'Tu sais choisir le bon niveau d\'entrée selon ce que le groupe connaît déjà.',
            cartes: [
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Un groupe de jeunes du club, présents toute la saison, n'a jamais spécifiquement abordé le sujet des marées. Par où commences-tu ?",
                options: [
                    { cle: 'A', texte: "Niveau 2 ou 3 directement, ils sont du club depuis longtemps." },
                    { cle: 'B', texte: "Niveau 1, parce que ce sujet précis est neuf pour eux." },
                    { cle: 'C', texte: "Tu évites le sujet, il est trop connu pour être intéressant." },
                ],
                bonneReponse: 'B',
                correction: "**B**. Le niveau suit l'exposition au SUJET précis, pas l'ancienneté générale au club. Des jeunes expérimentés en voile mais neufs sur les marées repartent du niveau 1.\n\n**A** confond ancienneté au club et exposition au sujet précis. **C** part du principe qu'un sujet est \"trop connu\" sans avoir vérifié s'il l'a réellement été abordé.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Le niveau mesure l\'exposition au sujet, pas l\'âge',
                    'Niveau 1 : premier contact, même pour un groupe expérimenté ailleurs',
                    'Jamais une barrière qui cache une fiche par défaut',
                ],
                note: "Ce repère complète « Choisir quoi transmettre » : une fois le sujet choisi, le niveau aide à calibrer l'entrée.",
            },
            ],
        },
        ],
    },
    {
        id: 'filer-sujet-semaine',
        numero: 4,
        titre: 'Filer un sujet sur la semaine',
        accroche: 'Revenir sur ce qu\'on a commencé lundi, sans que ça devienne un cours.',
        duree_min: 6,
        piles: [
        {
            titre: 'Une fois ne suffit pas',
            acquis: 'Tu sais pourquoi revenir sur un sujet ancre mieux qu\'une seule explication.',
            cartes: [
            {
                genre: 'texte',
                titre: 'Lundi, ça sort ; vendredi, c\'est oublié',
                texte: "Une idée expliquée une seule fois s'efface en quelques jours, même bien racontée. C'est vrai pour toi comme pour le groupe.\n\nRevenir dessus deux ou trois fois dans la semaine, brièvement, ancre bien plus qu'une longue explication unique le premier jour.",
            },
            {
                genre: 'texte',
                titre: 'Ce que l\'app garde en mémoire',
                texte: "Chaque sujet préparé compte ses révisions et la date de la dernière — ce n'est pas juste toi qui dois t'en souvenir, l'app garde la trace pour te le rappeler.",
                points: [
                    "Le sujet reste affiché toute la semaine, pas seulement le jour choisi",
                    "Chaque reprise est comptée",
                    "Un rappel réussi sans regarder la fiche vaut plus qu'une relecture",
                ],
            },
            ],
        },
        {
            titre: 'Revenir sans refaire un cours',
            acquis: 'Tu sais raviver un sujet en quelques secondes, sans le réexpliquer.',
            cartes: [
            {
                genre: 'procede',
                titre: 'La relance courte',
                texte: "Pas besoin de tout redire. Une phrase qui rappelle l'accroche du lundi suffit à relancer le sujet mercredi.",
                exemples: [
                    { texte: "On avait parlé des méduses lundi — vous vous souvenez pourquoi elles sont là certains jours et pas d'autres ?", source: 'Relance de sujet' },
                    { texte: "Le coefficient de marée, ça vous dit toujours quelque chose ?", source: 'Relance de sujet' },
                ],
            },
            {
                genre: 'mecanisme',
                titre: 'Pourquoi une relance courte suffit',
                pourquoi: "L'idée est déjà installée depuis lundi — tu ne repars pas de zéro, tu réactives. Une phrase qui rappelle le contexte suffit à faire ressurgir le reste, exactement comme le module « Vérifier si ça a pris » le décrit.",
                attention: "Si personne ne se souvient de rien, ne réexplique pas tout de suite — c'est un signal que le sujet n'a pas pris, à retenter autrement plus tard, pas à forcer sur place.",
            },
            ],
        },
        {
            titre: 'À toi de tenir le fil',
            acquis: 'Tu sais reconnaître le bon rythme de reprise sur une semaine.',
            cartes: [
            {
                genre: 'exercice',
                titre: 'À toi',
                enonce: "Tu as raconté un sujet le lundi. On est mercredi, l'occasion se présente à nouveau. Que fais-tu ?",
                options: [
                    { cle: 'A', texte: "Tu refais l'explication complète, comme si c'était la première fois." },
                    { cle: 'B', texte: "Tu relances en une phrase courte, et tu laisses le groupe compléter." },
                    { cle: 'C', texte: "Tu passes à un nouveau sujet, celui de lundi est déjà vu." },
                ],
                bonneReponse: 'B',
                correction: "**B**. La reprise courte réactive l'idée sans reprendre à zéro — c'est elle qui transforme une explication en connaissance qui reste.\n\n**A** ignore que le sujet est déjà installé et repart comme à zéro. **C** perd l'occasion de faire une deuxième passe, précisément ce qui ancre le mieux sur la durée d'une semaine.",
            },
            {
                genre: 'bilan',
                titre: 'Ce que tu retiens',
                retenir: [
                    'Une idée expliquée une fois s\'efface en quelques jours',
                    'La relance tient en une phrase, jamais un cours complet',
                    'Un rappel qui échoue est un signal, pas un échec à corriger sur place',
                ],
                note: "Ce module ferme le thème « Le faire vivre » — tu as de quoi faire observer, faire faire, adapter et tenir un sujet sur toute la semaine.",
            },
            ],
        },
        ],
    },
];

export function trouverLecon(id: string): LeconFormation | undefined {
    return LECONS_FORMATION.find(l => l.id === id);
}

/**
 * Le plan complet du parcours, contenu compris ou non.
 *
 * La liste `/formation` doit montrer où va le parcours, pas seulement ce qui est déjà
 * écrit — sans quoi un module esseulé donne l'impression d'un module isolé plutôt que
 * d'une formation en cours de construction. Chaque entrée du plan pointe vers une leçon
 * réelle de `LECONS_FORMATION` quand elle existe ; les autres sont annoncées « à venir »
 * et ne s'ouvrent pas.
 *
 * Structure en THÈMES, sur le modèle Google Primer (Stratégie, Contenu, Réseaux
 * sociaux…) : des catégories au même niveau, sans hiérarchie ni ordre entre elles — on
 * entre par celle qui répond à un besoin du moment, pas par un tronc commun suivi d'une
 * annexe. La première version de ce plan opposait un « socle » séquentiel à une « boîte à
 * outils » libre ; ça réintroduisait une hiérarchie (avant/après) que Primer n'a jamais
 * eue, et qui ne correspond à rien de réel ici — même les modules 1-2 (pourquoi
 * transmettre) n'ont pas besoin d'être lus avant les autres, ils gagnent juste à l'être.
 *
 * Seul ordre qui subsiste : au sein d'un même thème, les modules sont rangés dans un
 * ordre suggéré (numérotés en conséquence), mais rien ne les rend séquentiels — un
 * moniteur peut ouvrir « Gérer l'imprévu » sans être passé par « Repérer le bon moment ».
 */
export type ModulePlanifie = {
    /** Ordre d'affichage au sein de sa section — jamais un rang à respecter dans l'outillage. */
    numero: number;
    titre: string;
    accroche: string;
    duree_min: number;
    /** Présent seulement pour les modules déjà rédigés — voir `LECONS_FORMATION`. */
    leconId?: string;
};

export type SectionFormation = {
    id: 'pourquoi' | 'quoi-dire' | 'faire-vivre' | 'methode';
    titre: string;
    /** Ce que le thème couvre, en une phrase — pas un ordre à suivre. */
    description: string;
    modules: ModulePlanifie[];
};

export const PLAN_FORMATION: SectionFormation[] = [
    {
        id: 'pourquoi',
        titre: 'Pourquoi transmettre',
        description: 'Ce que ça change, pour le groupe et pour toi.',
        modules: [
            {
                numero: 1,
                titre: 'Ton terrain, c\'est déjà de l\'environnement',
                accroche: 'Pourquoi le milieu où tu encadres n\'est jamais un simple décor.',
                duree_min: 5,
                leconId: 'terrain-environnement',
            },
            {
                numero: 2,
                titre: 'Ce que ça change pour toi',
                accroche: 'Les temps morts remplis, le groupe qui accroche, le coût réel — deux minutes.',
                duree_min: 5,
                leconId: 'ce-que-ca-change',
            },
        ],
    },
    {
        id: 'quoi-dire',
        titre: 'Quoi dire',
        description: 'Choisir le sujet et la phrase qui le lance.',
        modules: [
            {
                numero: 1,
                titre: 'Choisir quoi transmettre',
                accroche: 'Sur 131 fiches, comment repérer les trois qui valent le coup cette semaine.',
                duree_min: 6,
                leconId: 'choisir-quoi-transmettre',
            },
            {
                numero: 2,
                titre: 'Fabriquer une accroche',
                accroche: 'Quatre formes de première phrase, chacune expliquée et illustrée.',
                duree_min: 7,
                leconId: 'fabriquer-accroche',
            },
            {
                numero: 3,
                titre: 'Retourner une idée reçue',
                accroche: 'La technique la plus efficace pour corriger une croyance sans vexer personne.',
                duree_min: 6,
                leconId: 'retourner-idee-recue',
            },
        ],
    },
    {
        id: 'faire-vivre',
        titre: 'Le faire vivre',
        description: 'Ce qui se passe une fois la phrase lancée.',
        modules: [
            {
                numero: 1,
                titre: 'Observer avant d\'expliquer',
                accroche: 'Poser une question et vraiment attendre la réponse — le silence comme outil.',
                duree_min: 5,
                leconId: 'observer-avant-expliquer',
            },
            {
                numero: 2,
                titre: 'Faire faire, pas seulement dire',
                accroche: 'Transformer une explication en une action concrète que le groupe réalise.',
                duree_min: 6,
                leconId: 'faire-faire',
            },
            {
                numero: 3,
                titre: 'Adapter selon l\'exposition du groupe',
                accroche: 'Pas l\'âge : ce que le groupe a déjà vu ou pas du sujet.',
                duree_min: 6,
                leconId: 'adapter-exposition-groupe',
            },
            {
                numero: 4,
                titre: 'Filer un sujet sur la semaine',
                accroche: 'Revenir sur ce qu\'on a commencé lundi, sans que ça devienne un cours.',
                duree_min: 6,
                leconId: 'filer-sujet-semaine',
            },
        ],
    },
    {
        id: 'methode',
        titre: 'La méthode COPUN',
        description: 'La grille de lecture, et ce qu\'elle ne dit pas toujours.',
        modules: [
            {
                numero: 1,
                titre: 'Repérer le bon moment pour en parler',
                accroche: 'Le milieu te tend l\'occasion : à toi de savoir la reconnaître et la saisir.',
                duree_min: 5,
                leconId: 'reperer-bon-moment',
            },
            {
                numero: 2,
                titre: 'Comprendre, Observer, Protéger',
                accroche: 'La grille de lecture COPUN : trois angles sur un même sujet, dans l\'ordre que tu veux.',
                duree_min: 6,
                leconId: 'comprendre-observer-proteger',
            },
            {
                numero: 3,
                titre: 'Quand ça ne se passe pas comme prévu',
                accroche: 'Tu ne sais pas répondre, quelqu\'un conteste, personne n\'accroche : que faire.',
                duree_min: 6,
                leconId: 'gerer-imprevu',
            },
            {
                numero: 4,
                titre: 'Vérifier si ça a pris',
                accroche: 'Savoir si le message est passé, sans faire un contrôle.',
                duree_min: 5,
                leconId: 'verifier-si-ca-a-pris',
            },
        ],
    },
];

/** Tous les modules planifiés, sections confondues — pour un accès direct par leconId. */
export function tousLesModules(): ModulePlanifie[] {
    return PLAN_FORMATION.flatMap(s => s.modules);
}
