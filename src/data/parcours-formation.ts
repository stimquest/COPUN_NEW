export const PARCOURS_LAISSE_DE_MER = {
    id: 'laisse-de-mer',
    titre: 'Conduire une séquence sur la laisse de mer',
    duree: '12 min',
    objectif: 'Transformer une remarque sur une plage « sale » en observation utile, sans simplifier le milieu ni prescrire un geste inadapté.',
    actionsTerrain: [
        { id: 'distinguer', titre: 'Faire distinguer naturel et déchet', consigne: 'Choisissez avec le groupe quelques éléments déposés et faites argumenter ce qui relève du vivant, de la mer ou d’une activité humaine.' },
        { id: 'observer', titre: 'Faire observer avant d’expliquer', consigne: 'Utilisez une carte-question pour partir de ce que le groupe voit avant d’apporter votre explication.' },
        { id: 'geste-adapte', titre: 'Choisir un geste adapté au site', consigne: 'À partir d’une carte-question, faites déterminer le geste pertinent en tenant compte des consignes locales.' },
    ],
    etapes: ['Cadrer', 'Analyser', 'S’entraîner', 'Valider', 'Essayer'],
    reperes: [
        {
            repere: 'Cadre professionnel',
            titre: 'Partir d’un diagnostic, pas d’une définition',
            texte: 'La laisse de mer est l’ensemble des éléments déposés au haut de l’estran. Sa composition varie selon la marée, la saison et le site. Pour un moniteur, l’enjeu n’est pas de réciter ce terme : il est de faire comprendre qu’un amas d’algues, de bois et de coquilles n’est pas, par principe, un déchet.',
            pratique: 'À retenir : distinguer l’aspect visuel du lieu de sa fonction écologique.',
        },
        {
            repere: 'Conduite de groupe',
            titre: 'Faire qualifier avant d’expliquer',
            texte: 'Une séquence courte fonctionne si le groupe observe d’abord des éléments concrets. Fais nommer ce qui est présent, demande ce qui semble venir de la mer ou d’une activité humaine, puis apporte le vocabulaire et le rôle du milieu. Cette progression évite le cours magistral et rend l’explication vérifiable sur place.',
            pratique: 'Trame utile : observer → distinguer → expliquer → choisir un geste adapté.',
        },
        {
            repere: 'Responsabilité',
            titre: 'Ne pas donner une consigne universelle',
            texte: 'Avant toute action de nettoyage, vérifie les consignes du gestionnaire, les protections locales, les conditions de sécurité et la présence éventuelle d’espèces sensibles. Le principe reste de retirer les déchets d’origine humaine sans dégrader les éléments naturels, mais l’action précise dépend toujours du site.',
            pratique: 'Réflexe métier : les règles du lieu priment sur une règle générale.',
        },
    ],
    entrainement: {
        situation: 'Lors d’un arrêt, un participant qualifie la plage de « sale » et propose de tout ramasser. Tu disposes de deux minutes avant de repartir avec le groupe.',
        options: [
            { id: 'recadrer', texte: 'Je corrige immédiatement : « Ce n’est pas sale, ce sont des algues utiles. »', correct: false, retour: 'Le fond est juste, mais tu fermes l’échange avant d’avoir rendu la distinction observable par le groupe.' },
            { id: 'faire-observer', texte: 'Je fais comparer quelques éléments visibles, j’identifie avec le groupe ce qui est naturel ou issu d’une activité humaine, puis je relie cette distinction au rôle de la laisse de mer.', correct: true, retour: 'C’est la bonne démarche : elle part du terrain, installe une observation commune et débouche sur une explication courte.' },
            { id: 'collecter', texte: 'J’organise une collecte immédiate de tout ce qui est déposé afin de répondre à la demande du groupe.', correct: false, retour: 'Cette réponse confond les déchets et les éléments naturels, et ignore les consignes propres au site.' },
        ],
    },
    questions: [
        { id: 'objectif', question: 'Dans une séquence de deux minutes, quel objectif est le plus pertinent ?', options: [{ id: 'inventaire', texte: 'Faire l’inventaire complet des espèces présentes' }, { id: 'distinction', texte: 'Faire comprendre la différence entre éléments naturels et déchets humains' }, { id: 'definition', texte: 'Faire mémoriser une définition technique complète' }], correct: 'distinction', retour: 'L’objectif est une distinction que le groupe peut constater et réutiliser, pas une restitution encyclopédique.' },
        { id: 'preparation', question: 'Que vérifies-tu avant de proposer une action sur la laisse de mer ?', options: [{ id: 'consignes', texte: 'Les consignes locales, les protections du site et les conditions de sécurité' }, { id: 'materiel', texte: 'Seulement la disponibilité de sacs de collecte' }, { id: 'duree', texte: 'Seulement le temps restant dans la séance' }], correct: 'consignes', retour: 'Une recommandation de terrain doit être située : gestionnaire, réglementation et conditions du moment comptent.' },
        { id: 'posture', question: 'Quelle progression soutient le mieux ton intervention ?', options: [{ id: 'observer', texte: 'Observer, distinguer, expliquer, puis choisir une action adaptée' }, { id: 'expliquer', texte: 'Expliquer, faire répéter, puis demander au groupe de chercher' }, { id: 'agir', texte: 'Agir d’abord, puis justifier le geste au retour' }], correct: 'observer', retour: 'Cette progression maintient le groupe dans l’observation et évite de plaquer un discours sur le lieu.' },
    ],
} as const;

export const PARCOURS_LITTORAL_EAU = {
    id: 'littoral-eau',
    titre: 'Expliquer comment l’eau transforme le littoral',
    duree: '14 min',
    objectif: 'Donner au groupe des repères pour lire un rivage mobile, sans réduire son évolution à un seul phénomène ni annoncer une règle générale.',
    actionsTerrain: [
        { id: 'lire-indice', titre: 'Faire lire un indice du rivage', consigne: 'Choisissez une carte-question et faites décrire un indice visible avant de proposer une interprétation.' },
        { id: 'comparer', titre: 'Faire comparer deux zones', consigne: 'À l’aide des cartes choisies, faites comparer deux lignes, niveaux ou matières visibles sur le site.' },
        { id: 'situer', titre: 'Situer ce qui est observé', consigne: 'Utilisez une carte-question pour relier l’observation aux conditions du jour et aux informations locales.' },
    ],
    etapes: ['Cadrer', 'Analyser', 'S’entraîner', 'Valider', 'Essayer'],
    reperes: [
        { repere: 'Cadre professionnel', titre: 'Faire lire un système, pas un décor', texte: 'Le trait de côte est le résultat d’interactions entre la marée, les vagues, les courants, le vent et les matériaux disponibles. Ces forces ne produisent pas le même effet partout ni au même moment. L’enjeu n’est donc pas de dire que « la mer mange la plage », mais d’aider le groupe à repérer ce qui bouge et à relier ces indices à une dynamique.', pratique: 'À retenir : décrire ce qui est observable avant de nommer une cause.' },
        { repere: 'Conduite de groupe', titre: 'Choisir un indice qui se voit vraiment', texte: 'Une ligne de laisse, une zone humide, une marche d’érosion, des galets triés ou une dune entamée peuvent devenir des points de départ. Choisis un seul indice, laisse le groupe formuler ce qu’il remarque, puis propose une hypothèse. Le rôle du moniteur est de guider l’attention et de distinguer une observation d’une interprétation.', pratique: 'Trame utile : « Qu’est-ce qui vous le fait dire ? » avant « Pourquoi cela arrive-t-il ? »' },
        { repere: 'Responsabilité', titre: 'Situer son propos dans le temps et le lieu', texte: 'Une plage observée aujourd’hui ne résume pas son évolution. La marée, la météo récente, la saison et les aménagements modifient ce qui est visible. Évite les prédictions rapides et appuie-toi sur les informations locales quand le groupe interroge l’érosion, la sécurité ou les usages du site.', pratique: 'Réflexe métier : dater l’observation et préciser ses limites.' },
    ],
    entrainement: {
        situation: 'Sur une plage, un participant remarque une marche de sable et conclut : « La mer a encore détruit la côte. » Tu as quelques minutes pour répondre sans transformer l’arrêt en cours de géomorphologie.',
        options: [
            { id: 'confirmer', texte: 'Je confirme que la mer détruit la plage et je donne une explication générale sur l’érosion.', correct: false, retour: 'Tu valides une interprétation sans partir de l’indice observé ni tenir compte du contexte du site.' },
            { id: 'observer', texte: 'Je demande ce qui permet de voir que le sable a bougé, je fais comparer les zones visibles, puis j’explique que plusieurs forces agissent ensemble et que leur effet dépend du moment.', correct: true, retour: 'La réponse met le groupe en position d’enquête et apporte une explication proportionnée à ce qui est observable.' },
            { id: 'eviter', texte: 'Je change de sujet : l’érosion est trop complexe pour être abordée pendant une sortie.', correct: false, retour: 'Le sujet est abordable si tu limites l’ambition : un indice, une question, une explication située.' },
        ],
    },
    questions: [
        { id: 'objectif', question: 'Quel objectif convient à une intervention courte sur un rivage qui change ?', options: [{ id: 'cause', texte: 'Attribuer immédiatement chaque changement à une cause unique' }, { id: 'indice', texte: 'Faire repérer un indice et relier son évolution à plusieurs forces possibles' }, { id: 'cours', texte: 'Présenter un cours complet sur la géomorphologie côtière' }], correct: 'indice', retour: 'Un indice concret ouvre une compréhension juste sans faire croire à une explication définitive.' },
        { id: 'posture', question: 'Quelle question soutient le mieux une observation de groupe ?', options: [{ id: 'nom', texte: 'Quel est le nom scientifique exact de ce phénomène ?' }, { id: 'preuve', texte: 'Qu’est-ce qui vous fait penser que le rivage a changé ici ?' }, { id: 'memoire', texte: 'Qui connaît déjà la réponse ?' }], correct: 'preuve', retour: 'Demander la preuve ramène le groupe au terrain et sépare l’observation de l’interprétation.' },
        { id: 'limite', question: 'Quel réflexe évite une affirmation trop générale ?', options: [{ id: 'situer', texte: 'Préciser le moment, les conditions observées et les informations locales disponibles' }, { id: 'affirmer', texte: 'Conclure à partir de l’aspect de la plage ce jour-là' }, { id: 'omettre', texte: 'Éviter toute explication sur les changements du littoral' }], correct: 'situer', retour: 'Situer l’observation rend le propos plus fiable et plus utile au groupe.' },
    ],
} as const;

export const PARCOURS_FORMATION = [PARCOURS_LAISSE_DE_MER, PARCOURS_LITTORAL_EAU] as const;
export type ParcoursFormation = (typeof PARCOURS_FORMATION)[number];
export type ParcoursId = ParcoursFormation['id'];
