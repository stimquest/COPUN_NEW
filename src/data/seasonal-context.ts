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

// Weights for each thematic tag based on coefficient + meteo combination
// Higher number = stronger suggestion
type ThematicWeights = Partial<Record<ThematicTag, number>>;

function getCoeffWeights(coeff: CoeffType): ThematicWeights {
    switch (coeff) {
        case 'morte_eau':
            return {
                biodiversite_saisonnalite: 3,
                lecture_paysage: 2,
                cohabitation_vivant: 2,
            };
        case 'vive_eau':
            return {
                caracteristiques_littoral: 3,
                reperes_spatio_temporels: 3,
                interactions_climatiques: 2,
            };
        case 'entre_deux':
            return {
                reperes_spatio_temporels: 2,
                lecture_paysage: 2,
            };
    }
}

function getMeteoWeights(meteo: MeteoType): ThematicWeights {
    switch (meteo) {
        case 'beau_fixe':
            return {
                lecture_paysage: 3,
                cohabitation_vivant: 3,
                biodiversite_saisonnalite: 2,
            };
        case 'vent':
            return {
                interactions_climatiques: 3,
                reperes_spatio_temporels: 3,
                lecture_paysage: 2,
            };
        case 'instable':
            return {
                interactions_climatiques: 3,
                activites_humaines: 2,
                reperes_spatio_temporels: 2,
            };
        case 'tempete':
            return {
                interactions_climatiques: 3,
                caracteristiques_littoral: 3,
                impact_presence_humaine: 2,
            };
    }
}

function getPeriodWeights(periodId: string): ThematicWeights {
    switch (periodId) {
        case 'hiver_marin':
            return {
                biodiversite_saisonnalite: 2,
                caracteristiques_littoral: 2,
                sciences_participatives: 1,
            };
        case 'eveil_littoral':
            return {
                biodiversite_saisonnalite: 3,
                cohabitation_vivant: 2,
                reperes_spatio_temporels: 1,
            };
        case 'printemps_actif':
            return {
                cohabitation_vivant: 3,
                biodiversite_saisonnalite: 2,
                impact_presence_humaine: 1,
            };
        case 'haute_saison':
            return {
                impact_presence_humaine: 3,
                cohabitation_vivant: 3,
                activites_humaines: 2,
            };
        case 'transition_automnale':
            return {
                biodiversite_saisonnalite: 3,
                lecture_paysage: 2,
                sciences_participatives: 2,
            };
        case 'entree_hiver':
            return {
                caracteristiques_littoral: 2,
                biodiversite_saisonnalite: 2,
                interactions_climatiques: 2,
            };
        default:
            return {};
    }
}

export function getPeriodForMonth(month: number): SeasonalPeriod {
    return SEASONAL_PERIODS.find(p => p.months.includes(month)) ?? SEASONAL_PERIODS[0];
}

export function getSuggestedThematics(
    periodId: string,
    coeff: CoeffType,
    meteo: MeteoType,
    topN = 4
): ThematicTag[] {
    const scores: Partial<Record<ThematicTag, number>> = {};

    const addWeights = (weights: ThematicWeights) => {
        for (const [tag, weight] of Object.entries(weights) as [ThematicTag, number][]) {
            scores[tag] = (scores[tag] ?? 0) + weight;
        }
    };

    addWeights(getPeriodWeights(periodId));
    addWeights(getCoeffWeights(coeff));
    addWeights(getMeteoWeights(meteo));

    return (Object.entries(scores) as [ThematicTag, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([tag]) => tag);
}
