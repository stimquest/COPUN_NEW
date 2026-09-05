export type SeasonalPeriod = {
    id: string;
    months: number[]; // 1-12
    label: string;
    description: string;
    phenomena: string[];
};

export type CoeffType = 'morte_eau' | 'entre_deux' | 'vive_eau';
export type MeteoType = 'beau_fixe' | 'vent' | 'instable' | 'tempete';

// Thematic tags from the pedagogical content catalog
export type ThematicTag =
    | 'caracteristiques_littoral'
    | 'reperes_spatio_temporels'
    | 'interactions_climatiques'
    | 'biodiversite_saisonnalite'
    | 'activites_humaines'
    | 'lecture_paysage'
    | 'cohabitation_vivant'
    | 'impact_presence_humaine'
    | 'sciences_participatives';

export const SEASONAL_PERIODS: SeasonalPeriod[] = [
    {
        id: 'hiver_marin',
        months: [1, 2],
        label: 'Hiver marin',
        description: "Le site est au calme. C'est la période d'hivernage pour de nombreux oiseaux côtiers — plongeons, canards marins, limicoles. Les tempêtes et coups de vent sont fréquents. L'estran révèle ses secrets, peu fréquenté par les humains. Les laisses de mer sont riches après les tempêtes.",
        phenomena: ['Hivernage aviaire', 'Tempêtes et coups de vent', 'Houle et érosion', 'Laisse de mer chargée'],
    },
    {
        id: 'eveil_littoral',
        months: [3, 4],
        label: 'Éveil du littoral',
        description: "Le site se réveille. Les premiers oiseaux migrateurs arrivent. C'est le début de la reproduction pour certaines espèces côtières. Les conditions météo sont instables. Les grandes vives-eaux de printemps découvrent largement l'estran.",
        phenomena: ['Migrations de printemps', 'Début de reproduction', 'Grandes marées de vives-eaux', 'Météo instable'],
    },
    {
        id: 'printemps_actif',
        months: [5, 6],
        label: 'Printemps actif',
        description: "Période de nidification — la faune est particulièrement vulnérable au dérangement. La fréquentation du site commence à augmenter. Les brises thermiques s'installent l'après-midi. Les conditions sont généralement favorables à la pratique.",
        phenomena: ['Nidification en cours', 'Brises thermiques', 'Fréquentation croissante', 'Biodiversité au pic'],
    },
    {
        id: 'haute_saison',
        months: [7, 8],
        label: 'Haute saison',
        description: "Fréquentation maximale du littoral. La pression humaine sur le site est à son pic. La faune nicheuse est encore présente en début de période. Les brises thermiques sont quasi quotidiennes l'après-midi. L'impact de la présence humaine est le plus visible.",
        phenomena: ['Fréquentation maximale', 'Brises thermiques quotidiennes', 'Impact humain visible', 'Laisse de mer chargée de déchets'],
    },
    {
        id: 'transition_automnale',
        months: [9, 10],
        label: 'Transition automnale',
        description: "Le site se libère progressivement. Les migrations d'automne commencent — c'est une période riche en observations. Les conditions météo deviennent plus variables. Les premières tempêtes automnales peuvent arriver.",
        phenomena: ['Migrations d\'automne', 'Conditions changeantes', 'Premières tempêtes', 'Retour au calme progressif'],
    },
    {
        id: 'entree_hiver',
        months: [11, 12],
        label: 'Entrée en hiver',
        description: "La mer reprend ses droits. Coups de vent et houle fréquents. L'estran est peu fréquenté — idéal pour observer sans déranger. Les oiseaux hivernants s'installent. L'érosion du trait de côte peut être visible après les premières tempêtes.",
        phenomena: ['Houle et coups de vent', 'Oiseaux hivernants', 'Érosion du trait de côte', 'Observation sans dérangement'],
    },
];

/**
 * Une suggestion de thème, motivée par une phrase vérifiable — jamais un score.
 *
 * Avant, chaque axe (coefficient, météo, saison, activité, niveau) distribuait des
 * points à plusieurs thèmes à la fois, et le calcul additionnait tout : la suggestion
 * finale gagnait par accumulation de petits bonus dispersés, sans qu'aucun lien de
 * cause à conséquence ne soit vérifiable. Exemple constaté : « grande marée » + « vent »
 * faisait gagner « Repères spatio-temporels », un thème sans rapport direct ni avec la
 * marée ni avec le vent — juste le sous-produit du calcul.
 *
 * Ici, chaque axe répond à UNE seule question : « qu'est-ce que ça change concrètement
 * sur le terrain, et quel thème en découle directement ? ». Un coefficient moyen ou une
 * activité neutre ne motivent rien — pas de thème forcé faute de lien réel.
 */
export type ThematicSuggestion = { tag: ThematicTag; reason: string };

// Ce que le coefficient de marée change concrètement : l'étendue de l'estran découvert.
function getCoeffSuggestion(coeff: CoeffType): ThematicSuggestion | null {
    switch (coeff) {
        case 'vive_eau':
            // L'estran se découvre très largement : on peut aller voir ce qui vit
            // normalement immergé — lien direct avec le littoral lui-même.
            return { tag: 'caracteristiques_littoral', reason: 'Grande marée : l\'estran se découvre très largement' };
        case 'morte_eau':
            // Peu de mouvement d'eau, plan d'eau calme : propice à observer le vivant
            // en douceur, sans que la marée elle-même soit le phénomène marquant.
            return { tag: 'biodiversite_saisonnalite', reason: 'Faible marnage : plan d\'eau calme, propice à l\'observation' };
        case 'entre_deux':
            // Rien de remarquable côté marée cette semaine : pas de thème forcé.
            return null;
    }
}

// Ce que la météo change concrètement : ce qui devient visible ou sensible dans l'instant.
function getMeteoSuggestion(meteo: MeteoType): ThematicSuggestion | null {
    switch (meteo) {
        case 'beau_fixe':
            // Grande visibilité, calme : le paysage se lit dans le détail.
            return { tag: 'lecture_paysage', reason: 'Beau fixe : grande visibilité pour lire le littoral' };
        case 'vent':
            // Le vent lui-même est le phénomène du jour — thermiques, direction, force.
            return { tag: 'interactions_climatiques', reason: 'Vent au cœur de la semaine : direction, force, thermiques' };
        case 'instable':
            // Ciel changeant : même famille de phénomène à décrypter en direct.
            return { tag: 'interactions_climatiques', reason: 'Ciel changeant : les éléments climatiques se lisent en direct' };
        case 'tempete':
            // Gros temps : le phénomène météo, en version intense, reste le sujet —
            // pas un thème sur l'impact humain, qui n'a pas de lien direct ici.
            return { tag: 'interactions_climatiques', reason: 'Gros temps : houle, rafales, un phénomène à décrypter en direct' };
    }
}

// Ce que la saison rend disponible ou fragile sur le site, indépendamment de la semaine.
function getPeriodSuggestion(periodId: string): ThematicSuggestion | null {
    switch (periodId) {
        case 'hiver_marin':
        case 'entree_hiver':
            // Oiseaux hivernants installés : la biodiversité du moment est le lien direct.
            return { tag: 'biodiversite_saisonnalite', reason: 'Oiseaux hivernants installés sur le site' };
        case 'eveil_littoral':
        case 'printemps_actif':
            // Nidification en cours : la faune est vulnérable au dérangement.
            return { tag: 'cohabitation_vivant', reason: 'Nidification en cours : discrétion près des zones sensibles' };
        case 'haute_saison':
            // Fréquentation maximale : l'impact humain est le plus visible.
            return { tag: 'impact_presence_humaine', reason: 'Fréquentation estivale maximale : l\'impact humain est visible' };
        case 'transition_automnale':
            // Migrations d'automne : la biodiversité de passage est observable.
            return { tag: 'biodiversite_saisonnalite', reason: 'Migrations d\'automne : période riche en observations' };
        default:
            return null;
    }
}

// Ce que le support nautique change dans ce que le groupe perçoit en pratiquant.
function getActivitySuggestion(activities: string[]): ThematicSuggestion | null {
    const lower = activities.map(a => a.toLowerCase());
    // Vent et allure sont le sujet quotidien de la planche/wing/kite.
    if (lower.some(a => a.includes('planche') || a.includes('wing') || a.includes('kite'))) {
        return { tag: 'interactions_climatiques', reason: 'En planche/wing/kite, le vent est au centre de chaque séance' };
    }
    // Silencieux et lent : le kayak/SUP amène près de la faune sans la déranger.
    if (lower.some(a => a.includes('kayak') || a.includes('sup') || a.includes('paddle'))) {
        return { tag: 'cohabitation_vivant', reason: 'En kayak/SUP, on approche la faune sans la déranger' };
    }
    return null;
}

export const THEMATIC_LABELS: Record<ThematicTag, { label: string; dimension: 'C' | 'O' | 'P'; icon: string }> = {
    // COMPRENDRE
    caracteristiques_littoral:  { label: 'Caractéristiques du littoral',          dimension: 'C', icon: 'landscape' },
    activites_humaines:         { label: 'Activités humaines',                    dimension: 'C', icon: 'anchor' },
    biodiversite_saisonnalite:  { label: 'Biodiversité et saisonnalité',          dimension: 'C', icon: 'flutter_dash' },
    // OBSERVER
    lecture_paysage:            { label: 'Lecture du paysage',                    dimension: 'O', icon: 'terrain' },
    reperes_spatio_temporels:   { label: 'Repères spatio-temporels',              dimension: 'O', icon: 'explore' },
    interactions_climatiques:   { label: 'Interactions des éléments climatiques', dimension: 'O', icon: 'air' },
    // PROTÉGER
    impact_presence_humaine:    { label: 'Impact de la présence humaine',         dimension: 'P', icon: 'delete' },
    cohabitation_vivant:        { label: 'Cohabitation avec le vivant',           dimension: 'P', icon: 'eco' },
    sciences_participatives:    { label: 'Sciences participatives',               dimension: 'P', icon: 'biotech' },
};

export function getPeriodForMonth(month: number): SeasonalPeriod {
    return SEASONAL_PERIODS.find(p => p.months.includes(month)) ?? SEASONAL_PERIODS[0];
}

export type SuggestionContext = {
    periodId: string;
    coeff: CoeffType;
    meteo: MeteoType;
    activities?: string[];
    topN?: number;
};

/**
 * Jusqu'à 4 suggestions, une par axe (coefficient, météo, saison, activité), chacune
 * motivée par sa propre raison — jamais combinées en un score. Un même thème peut
 * revenir de deux axes différents (ex. météo et activité pointent tous deux vers les
 * interactions climatiques) : c'est alors un vrai accord entre deux raisons distinctes,
 * gardé comme une seule suggestion mais avec les deux raisons jointes — pas un hasard de
 * calcul comme avant.
 */
export function getSuggestedThematics(ctx: SuggestionContext): ThematicSuggestion[] {
    const { periodId, coeff, meteo, activities = [], topN = 4 } = ctx;

    const brutes = [
        getCoeffSuggestion(coeff),
        getMeteoSuggestion(meteo),
        getPeriodSuggestion(periodId),
        getActivitySuggestion(activities),
    ].filter((s): s is ThematicSuggestion => s !== null);

    const parTag = new Map<ThematicTag, string[]>();
    for (const s of brutes) {
        const raisons = parTag.get(s.tag) ?? [];
        raisons.push(s.reason);
        parTag.set(s.tag, raisons);
    }

    return [...parTag.entries()]
        .map(([tag, raisons]) => ({ tag, reason: raisons.join(' — ') }))
        .slice(0, topN);
}
