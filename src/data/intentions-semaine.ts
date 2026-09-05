import { CoeffType, MeteoType, getPeriodForMonth } from './seasonal-context';

/**
 * Ce qui rend un phénomène concret pertinent cette semaine — repensé à zéro après
 * l'échec du système précédent (poids cumulés sur des tags abstraits, qui produisait
 * des non-sens du type « gros coefficient + vent → repères spatio-temporels »).
 *
 * Le principe qui a fonctionné, gardé ici : chaque axe (saison, coefficient, météo) est
 * traité INDÉPENDAMMENT, avec sa propre raison écrite à la main et vérifiable un par un.
 * Jamais de score additionné entre eux — un tableau croisé saison × coefficient × météo
 * ferait 72 entrées, trop pour rester vérifiables une par une ; ici, 6 + 3 + 4 = 13.
 *
 * Chaque contribution pointe vers un groupe de `groupes.ts` — un phénomène concret
 * qu'un moniteur reconnaît sur le terrain (« les marées », « la laisse de mer ») — jamais
 * vers un tag de classement abstrait (« caractéristiques du littoral »).
 */
export type ContributionIntention = { groupeId: string; raison: string };

// Ce que la saison rend disponible ou fragile sur le site, indépendamment de la semaine.
const PAR_SAISON: Record<string, ContributionIntention[]> = {
    hiver_marin: [
        { groupeId: 'oiseaux', raison: 'Oiseaux hivernants installés sur le site' },
        { groupeId: 'laisse_mer', raison: 'Laisses de mer riches après les tempêtes' },
    ],
    eveil_littoral: [
        { groupeId: 'oiseaux', raison: 'Premiers migrateurs de printemps de retour' },
        { groupeId: 'marees', raison: 'Grandes vives-eaux de printemps' },
    ],
    printemps_actif: [
        { groupeId: 'cohabiter', raison: 'Nidification en cours : discrétion près des zones sensibles' },
        { groupeId: 'vent', raison: 'Brises thermiques qui s\'installent l\'après-midi' },
    ],
    haute_saison: [
        { groupeId: 'activites', raison: 'Fréquentation maximale du littoral' },
        { groupeId: 'laisse_mer', raison: 'Laisse de mer chargée de déchets en pleine saison' },
    ],
    transition_automnale: [
        { groupeId: 'oiseaux', raison: 'Migrations d\'automne : période riche en observations' },
        { groupeId: 'meteo', raison: 'Conditions météo qui deviennent plus variables' },
    ],
    entree_hiver: [
        { groupeId: 'oiseaux', raison: 'Oiseaux hivernants qui s\'installent' },
        { groupeId: 'plage_dunes', raison: 'Érosion du trait de côte visible après les tempêtes' },
    ],
};

// Ce que le coefficient de marée change concrètement : l'étendue de l'estran découvert.
const PAR_COEFF: Record<CoeffType, ContributionIntention | null> = {
    vive_eau: { groupeId: 'marees', raison: 'Grande marée : l\'estran se découvre très largement' },
    morte_eau: { groupeId: 'vie_marine', raison: 'Faible marnage : plan d\'eau calme, propice à l\'observation' },
    entre_deux: null, // Rien de remarquable côté marée : pas de sujet forcé.
};

// Ce que la météo change concrètement : ce qui devient visible ou sensible dans l'instant.
const PAR_METEO: Record<MeteoType, ContributionIntention | null> = {
    beau_fixe: { groupeId: 'observer', raison: 'Grande visibilité : idéal pour apprendre à regarder' },
    vent: { groupeId: 'vent', raison: 'Vent au cœur de la semaine : direction, force, thermiques' },
    instable: { groupeId: 'meteo', raison: 'Ciel changeant : les nuages racontent ce qui arrive' },
    tempete: { groupeId: 'vagues', raison: 'Gros temps : houle et vagues, un phénomène à décrypter en direct' },
};

/**
 * Les groupes mis en avant cette semaine, chacun avec sa ou ses raisons — jamais fusionnés
 * en un score. Un groupe désigné par deux axes à la fois (ex. saison + météo) garde ses
 * deux raisons, jointes, pour rester vérifiable : c'est un vrai accord entre deux signaux
 * distincts, pas un hasard de calcul.
 */
export function groupesDeLaSemaine(params: {
    coeff: CoeffType | null;
    meteo: MeteoType | null;
    mois?: number;
}): Map<string, string[]> {
    const { coeff, meteo, mois = new Date().getMonth() + 1 } = params;
    const periode = getPeriodForMonth(mois);

    const contributions = [
        ...(PAR_SAISON[periode.id] ?? []),
        coeff ? PAR_COEFF[coeff] : null,
        meteo ? PAR_METEO[meteo] : null,
    ].filter((c): c is ContributionIntention => c !== null);

    const parGroupe = new Map<string, string[]>();
    for (const { groupeId, raison } of contributions) {
        const raisons = parGroupe.get(groupeId) ?? [];
        raisons.push(raison);
        parGroupe.set(groupeId, raisons);
    }
    return parGroupe;
}
