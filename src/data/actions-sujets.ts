/**
 * Actions de repli, par groupe de phénomène.
 *
 * Les actions propres à une fiche vivent DANS la fiche, en base
 * (`pedagogical_content.actions`) : ce sont du contenu pédagogique au même titre que
 * l'accroche ou l'idée à retenir, et elles doivent être corrigeables depuis
 * l'administration. Ce fichier ne garde que le repli — les 3 à 5 actions génériques d'un
 * groupe, servies aux fiches qui n'ont pas encore les leurs.
 *
 * Deux règles de conception, tirées de ce qui a échoué avant.
 *
 * D'abord le NOMBRE : trois à cinq propositions par groupe, jamais davantage. Une liste
 * de douze noie le choix et transforme la préparation en corvée ; passé cinq items, le
 * moniteur ne choisit plus, il subit. C'est la même contrainte que pour un quiz.
 *
 * Ensuite le RATTACHEMENT : les actions sont écrites pour un phénomène précis, pas pour
 * n'importe quel sujet. Les versions génériques successives — techniques d'animation,
 * angles narratifs, amorces de dialogue — échouaient toutes de la même façon : formulées
 * pour valoir partout, elles ne pouvaient qu'énoncer ce qu'un moniteur diplômé sait déjà
 * faire. Une action utile s'appuie sur ce que CE phénomène a de particulier : une idée
 * fausse tenace, un mécanisme contre-intuitif, un repère observable sur place.
 *
 * La clé est l'identifiant de groupe (`groupes.ts`) plutôt que l'identifiant de fiche :
 * 14 séries à rédiger restent tenables là où 131 ne le seraient pas, et une action sur
 * les marées vaut pour les dix-sept fiches du groupe.
 *
 * À ne pas confondre avec les défis stockés en base (`defis`) : ceux-là sont des
 * protocoles d'observation scientifique — inventaire du m², suivi de l'érosion — avec
 * preuve photographique et points.
 */

export type ActionSujet = {
    id: string;
    /** Ce qu'on fait, nommé simplement. */
    label: string;
    /** La consigne, reprenable telle quelle devant le groupe. */
    consigne: string;
};

/** Actions indexées par identifiant de groupe (`src/data/groupes.ts`). */
export const ACTIONS_PAR_GROUPE: Record<string, ActionSujet[]> = {

    marees: [
        {
            id: 'marees_baton',
            label: 'Le bâton planté',
            consigne: 'Faites planter un bâton là où chacun pense que l’eau arrivera en fin de séance. On vérifie avant de partir.',
        },
        {
            id: 'marees_lune',
            label: 'La colle de la Lune',
            consigne: 'Demandez si c’est la Lune qui fait monter la mer. Quand ils disent oui : « alors pourquoi ça monte deux fois par jour ? »',
        },
        {
            id: 'marees_tableau',
            label: 'La lecture du tableau',
            consigne: 'Faites lire l’horaire d’aujourd’hui et celui de demain sur le tableau du club, et chercher combien de temps sépare les deux.',
        },
        {
            id: 'marees_echouage',
            label: 'Le bateau resté au sec',
            consigne: 'Racontez un bateau qui n’a pas pu repartir. Faites-leur trouver ce qui a été mal calculé.',
        },
    ],

    courants: [
        {
            id: 'courants_clocher',
            label: 'Vise le clocher',
            consigne: 'Faites viser un point fixe à terre et tenir le cap dessus. Au bout de cinq minutes, demandez pourquoi ils ont dérivé.',
        },
        {
            id: 'courants_objet',
            label: 'L’objet lâché',
            consigne: 'Lâchez un objet flottant et regardez-le partir. Faites-leur dire dans quelle direction et à quelle vitesse.',
        },
        {
            id: 'courants_retour',
            label: 'L’aller-retour',
            consigne: 'Faites le même trajet dans les deux sens et comparez le temps mis. L’écart, c’est le courant.',
        },
    ],

    vagues: [
        {
            id: 'vagues_bouchon',
            label: 'L’objet qui n’avance pas',
            consigne: 'Montrez un objet qui flotte : il monte et descend sans dériver. Demandez pourquoi, si la vague avance.',
        },
        {
            id: 'vagues_compter',
            label: 'Le comptage des séries',
            consigne: 'Faites compter les vagues entre deux grosses. Demandez si le nombre se répète.',
        },
        {
            id: 'vagues_origine',
            label: 'D’où elle vient',
            consigne: 'Faites-leur estimer depuis combien de jours et de kilomètres la houle du jour voyage.',
        },
    ],

    etat_mer: [
        {
            id: 'etat_avant_partir',
            label: 'Le pari d’avant-départ',
            consigne: 'Avant la mise à l’eau, faites-leur annoncer ce que sera la mer. Comparez avec ce qu’ils trouvent une fois dessus.',
        },
        {
            id: 'etat_deux_zones',
            label: 'Les deux zones',
            consigne: 'Montrez un endroit abrité et un endroit exposé. Faites décrire ce qui change entre les deux.',
        },
        {
            id: 'etat_decrire',
            label: 'Décris-moi la mer',
            consigne: 'Demandez à chacun de décrire la mer en trois mots. Comparez les mots employés : ce sont les critères.',
        },
    ],

    vent: [
        {
            id: 'vent_doigt',
            label: 'Montrez d’où il vient',
            consigne: 'Tous en même temps, chacun pointe du doigt d’où vient le vent. Comparez les doigts, puis tranchez.',
        },
        {
            id: 'vent_heure',
            label: 'Le pari sur l’heure',
            consigne: 'Faites parier sur l’heure à laquelle le vent va monter. Notez les paris, vérifiez dans l’après-midi.',
        },
        {
            id: 'vent_indices',
            label: 'La chasse aux indices',
            consigne: 'Faites chercher tout ce qui montre le vent sans qu’on le voie : drapeau, rides sur l’eau, fumée, arbres penchés.',
        },
        {
            id: 'vent_dos',
            label: 'Le vent dans le dos',
            consigne: 'Faites-leur se mettre dos au vent et dire ce qu’ils ont devant. Le repère tient toute la séance.',
        },
    ],

    meteo: [
        {
            id: 'meteo_ciel_matin',
            label: 'Le ciel de ce matin',
            consigne: 'Faites décrire le ciel du matin, puis celui de maintenant. Ce qui a changé annonce la suite.',
        },
        {
            id: 'meteo_nuage_nom',
            label: 'Nomme ce nuage',
            consigne: 'Désignez un nuage et faites-leur dire ce qu’il annonce. Vérifiez en fin de séance.',
        },
        {
            id: 'meteo_prevision',
            label: 'La prévision contre le réel',
            consigne: 'Lisez la prévision du jour au départ, comparez à ce qu’on a vraiment eu au retour.',
        },
        {
            id: 'meteo_bulletin',
            label: 'Leur bulletin météo',
            consigne: 'Chargez deux d’entre eux d’annoncer la météo de demain au groupe, avec leurs mots.',
        },
    ],

    plage_dunes: [
        {
            id: 'dunes_racines',
            label: 'Qui tient qui ?',
            consigne: 'Demandez si c’est la dune qui fait pousser l’herbe ou l’inverse. Puis faites dégager un peu de sable pour voir les racines.',
        },
        {
            id: 'dunes_traces',
            label: 'Les traces du vent',
            consigne: 'Faites chercher sur le sable tout ce qui montre que ça a bougé : rides, accumulations derrière les obstacles.',
        },
        {
            id: 'dunes_avant_apres',
            label: 'Le même point de vue',
            consigne: 'Choisissez un repère fixe et revenez-y en fin de semaine. Faites dire ce qui a changé.',
        },
    ],

    laisse_mer: [
        {
            id: 'laisse_tri',
            label: 'On ramasse ou on laisse ?',
            consigne: 'Montrez algues, bois, plastique et demandez ce qu’il faut enlever. Le désaccord entre eux est le sujet.',
        },
        {
            id: 'laisse_ligne',
            label: 'La ligne qui dit la marée',
            consigne: 'Montrez la ligne d’algues et demandez ce qu’elle indique. Puis : « et l’eau, elle sera où tout à l’heure ? »',
        },
        {
            id: 'laisse_inventaire',
            label: 'Cinq choses en deux minutes',
            consigne: 'Chacun rapporte cinq objets différents trouvés sur la laisse. On regarde tout ensemble et on classe.',
        },
        {
            id: 'laisse_origine',
            label: 'D’où ça vient ?',
            consigne: 'Prenez un déchet et faites-leur imaginer son trajet jusqu’ici. Combien de temps, depuis où ?',
        },
    ],

    vie_marine: [
        {
            id: 'vie_a_quoi_sert',
            label: 'À quoi ça sert ?',
            consigne: 'Posez la question franchement sur l’espèce du jour. Laissez venir « à rien », puis demandez qui la mange et ce qu’elle mange.',
        },
        {
            id: 'vie_survivre',
            label: 'Tu tiendrais combien de temps ?',
            consigne: 'Sous l’eau, puis à sec, puis plein de sel. Faites lister ce qu’il leur faudrait pour y survivre une journée.',
        },
        {
            id: 'vie_chaine',
            label: 'La chaîne à l’envers',
            consigne: 'Partez d’un poisson qu’ils connaissent et remontez : qui mange qui, jusqu’à ce qu’on ne voie plus rien.',
        },
        {
            id: 'vie_toucher',
            label: 'Ce qu’on peut toucher',
            consigne: 'Faites la liste de ce qui se touche et de ce qui ne se touche pas, avec la raison à chaque fois.',
        },
    ],

    oiseaux: [
        {
            id: 'oiseaux_ou_dormi',
            label: 'Où il a dormi cette année',
            consigne: 'Demandez dans combien de pays cet oiseau a dormi depuis janvier. La Normandie n’est qu’une escale.',
        },
        {
            id: 'oiseaux_envol',
            label: 'Le coût d’un envol',
            consigne: 'Quand un oiseau s’envole à votre passage, faites remarquer qu’il recommence son repas. Demandez ce que ça donne sur dix fois.',
        },
        {
            id: 'oiseaux_comptage',
            label: 'Le comptage de dix minutes',
            consigne: 'Depuis un point fixe, faites compter les espèces vues en dix minutes. Comparez avec un autre jour.',
        },
        {
            id: 'oiseaux_bec',
            label: 'Le bec dit le repas',
            consigne: 'Faites observer la forme du bec et deviner ce que l’oiseau mange. Vérifiez ensuite.',
        },
    ],

    cohabiter: [
        {
            id: 'cohabiter_distance',
            label: 'À partir de quand il part',
            consigne: 'Approchez doucement d’un animal posé et faites dire stop quand il s’agite. C’est lui qui fixe la distance.',
        },
        {
            id: 'cohabiter_invite',
            label: 'Vous êtes chez lui',
            consigne: 'Demandez-leur ce qu’ils diraient si quelqu’un traversait leur chambre. Puis faites le parallèle avec le site.',
        },
        {
            id: 'cohabiter_traces',
            label: 'Ce qu’on laisse derrière',
            consigne: 'En fin de séance, faites chercher les traces de votre propre passage. Ce qui reste ne devrait pas rester.',
        },
    ],

    observer: [
        {
            id: 'observer_silence',
            label: 'Une minute sans parler',
            consigne: 'Tout le monde se tait et regarde. Puis chacun dit une chose que les autres n’ont pas vue.',
        },
        {
            id: 'observer_repere',
            label: 'Le repère à terre',
            consigne: 'Faites choisir un repère fixe à chacun. Revenez-y en fin de séance pour situer où on en est.',
        },
        {
            id: 'observer_decrire',
            label: 'Décris sans nommer',
            consigne: 'Un stagiaire décrit ce qu’il voit sans dire le mot. Les autres devinent.',
        },
        {
            id: 'observer_carte',
            label: 'Le dessin de mémoire',
            consigne: 'De retour à terre, faites dessiner le plan du site de mémoire. Ce qui manque montre ce qu’on n’a pas regardé.',
        },
    ],

    activites: [
        {
            id: 'activites_qui_utilise',
            label: 'Qui utilise cet endroit ?',
            consigne: 'Faites lister tous ceux qui se servent du même plan d’eau : pêcheurs, plaisanciers, baigneurs, commerce.',
        },
        {
            id: 'activites_dilemme',
            label: 'Le dilemme',
            consigne: 'Posez un choix qui n’a pas de bonne réponse — pêcher ou protéger, accueillir ou préserver. Faites argumenter, puis voter.',
        },
        {
            id: 'activites_avant_apres',
            label: 'C’était comment avant ?',
            consigne: 'Faites imaginer le site il y a cent ans, puis dans cinquante ans. Qu’est-ce qui a changé, qui a décidé ?',
        },
    ],

    protection: [
        {
            id: 'protection_ce_qui_reste',
            label: 'Ce qu’on a encore le droit de faire',
            consigne: 'Faites lister ce qui est interdit dans une zone protégée, puis tout ce qui reste possible. La deuxième liste est plus longue.',
        },
        {
            id: 'protection_qui_decide',
            label: 'Qui a décidé ça ?',
            consigne: 'Demandez qui, à leur avis, décide qu’un endroit est protégé. Faites-les chercher avant de répondre.',
        },
        {
            id: 'protection_geste',
            label: 'Le geste de la semaine',
            consigne: 'Faites choisir au groupe un geste concret à tenir jusqu’à la fin du stage. On fait le point le dernier jour.',
        },
    ],
};

/**
 * Actions à proposer pour une fiche : les siennes (portées par la fiche en base) si elles
 * existent, sinon celles de son groupe.
 */
export function actionsPourFiche(
    propres: ActionSujet[] | null | undefined,
    groupeId: string | undefined,
): ActionSujet[] {
    if (propres?.length) return propres;
    if (!groupeId) return [];
    return ACTIONS_PAR_GROUPE[groupeId] ?? [];
}

export function actionsDuGroupe(groupeId: string | undefined): ActionSujet[] {
    if (!groupeId) return [];
    return ACTIONS_PAR_GROUPE[groupeId] ?? [];
}

/**
 * Retrouve une action retenue par son identifiant.
 *
 * Cherche d'abord dans la fiche — c'est là que vivent les actions spécifiques — puis dans
 * les replis de groupe. Un identifiant absent des deux correspond à une action supprimée
 * depuis que le moniteur l'a retenue.
 */
export function actionSujetParId(
    id: string,
    propres?: ActionSujet[] | null,
): ActionSujet | undefined {
    const dansLaFiche = propres?.find(a => a.id === id);
    if (dansLaFiche) return dansLaFiche;

    for (const liste of Object.values(ACTIONS_PAR_GROUPE)) {
        const trouvee = liste.find(a => a.id === id);
        if (trouvee) return trouvee;
    }
    return undefined;
}
