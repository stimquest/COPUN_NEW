import { CoeffType, MeteoType } from './seasonal-context';

export type ObjectifId =
    | 'conditions'
    | 'marees'
    | 'meteo'
    | 'paysage'
    | 'biodiversite'
    | 'vivant'
    | 'cohabitation'
    | 'pollution'
    | 'protection'
    | 'responsable';

export type Objectif = {
    id: ObjectifId;
    label: string;
    description: string;
    tags: string[];
    icon: string;
    color: string;
    bg: string;
    border: string;
    activeBg: string;
};

const INTENTION_PREFIX = 'intention:';

/** Encode un ObjectifId pour le stocker parmi les suggested_thematics d'un stage. */
export function encodeIntention(id: ObjectifId): string {
    return `${INTENTION_PREFIX}${id}`;
}

/** Extrait l'ObjectifId éventuellement présent dans un tableau suggested_thematics. */
export function extractIntention(suggestedThematics: string[] | null | undefined): ObjectifId | null {
    const entry = (suggestedThematics ?? []).find(t => t.startsWith(INTENTION_PREFIX));
    if (!entry) return null;
    const id = entry.slice(INTENTION_PREFIX.length);
    return OBJECTIFS.some(o => o.id === id) ? (id as ObjectifId) : null;
}

const COEFF_PREFIX = 'coeff:';
const METEO_PREFIX = 'meteo:';

/** Encode le coefficient de marée et la tendance météo choisis pour la semaine. */
export function encodeConditions(coeff: CoeffType | null, meteo: MeteoType | null): string[] {
    const entries: string[] = [];
    if (coeff) entries.push(`${COEFF_PREFIX}${coeff}`);
    if (meteo) entries.push(`${METEO_PREFIX}${meteo}`);
    return entries;
}

/** Extrait le coefficient de marée éventuellement mémorisé dans suggested_thematics. */
export function extractCoeff(suggestedThematics: string[] | null | undefined): CoeffType | null {
    const entry = (suggestedThematics ?? []).find(t => t.startsWith(COEFF_PREFIX));
    return entry ? (entry.slice(COEFF_PREFIX.length) as CoeffType) : null;
}

/** Extrait la tendance météo éventuellement mémorisée dans suggested_thematics. */
export function extractMeteo(suggestedThematics: string[] | null | undefined): MeteoType | null {
    const entry = (suggestedThematics ?? []).find(t => t.startsWith(METEO_PREFIX));
    return entry ? (entry.slice(METEO_PREFIX.length) as MeteoType) : null;
}

/** Retire l'entrée intention d'un tableau suggested_thematics pour ne garder que les vrais ThematicTag. */
export function stripIntention(suggestedThematics: string[] | null | undefined): string[] {
    return (suggestedThematics ?? []).filter(t =>
        !t.startsWith(INTENTION_PREFIX) && !t.startsWith(COEFF_PREFIX) && !t.startsWith(METEO_PREFIX)
    );
}

export const OBJECTIFS: Objectif[] = [
    { id: 'conditions', label: 'Lire les conditions avant de naviguer', description: 'Marées, courants, vent — comprendre pour naviguer en sécurité', tags: ['marée', 'courant', 'vent', 'coefficient', 'sécurité'], icon: 'navigation', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', activeBg: 'bg-blue-600' },
    { id: 'marees', label: 'Comprendre les rythmes de la marée', description: 'Cycles, coefficients, flot et jusant', tags: ['marée', 'coefficient', 'courant', 'vocabulaire'], icon: 'waves', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', activeBg: 'bg-cyan-600' },
    { id: 'meteo', label: 'Décrypter la météo marine', description: 'Vent, nuages, houle et thermiques', tags: ['météo', 'vent', 'nuage', 'thermique', 'houle', 'vague'], icon: 'partly_cloudy_day', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', activeBg: 'bg-sky-600' },
    { id: 'paysage', label: 'Observer et décrire le paysage littoral', description: 'Lecture du terrain, dunes, repères visuels', tags: ['repères visuels', 'dune', 'vague', 'érosion', 'observation'], icon: 'landscape', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', activeBg: 'bg-amber-600' },
    { id: 'biodiversite', label: 'Découvrir la biodiversité du site', description: 'Faune, flore, laisse de mer et écosystème', tags: ['faune', 'écosystème', 'laisse de mer', 'zone sensible', 'flore'], icon: 'flutter_dash', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', activeBg: 'bg-emerald-600' },
    { id: 'vivant', label: 'Comprendre les interactions du vivant', description: 'Cycles biologiques, adaptation, migration', tags: ['écosystème', 'adaptation', 'reproduction', 'migration'], icon: 'account_tree', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', activeBg: 'bg-green-600' },
    { id: 'cohabitation', label: 'Apprendre à cohabiter avec la faune', description: 'Dérangement, zones sensibles, discrétion', tags: ['faune', 'zone sensible'], icon: 'diversity_3', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', activeBg: 'bg-teal-600' },
    { id: 'pollution', label: 'Agir contre la pollution', description: 'Déchets, laisse de mer, gestes concrets', tags: ['pollution', 'laisse de mer', 'éco-geste'], icon: 'delete_sweep', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', activeBg: 'bg-orange-600' },
    { id: 'protection', label: 'Devenir acteur de la protection du site', description: 'Sciences participatives, signalement, engagement', tags: ['action citoyenne', 'éco-geste', 'zone sensible'], icon: 'shield', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', activeBg: 'bg-rose-600' },
    { id: 'responsable', label: 'Adopter des comportements responsables', description: 'Gestes en navigation, adaptation, respect du milieu', tags: ['sécurité', 'adaptation', 'zone sensible', 'éco-geste'], icon: 'self_improvement', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', activeBg: 'bg-violet-600' },
];

/* ─── Suggestions d'intention selon les conditions ──────────────────────────
   Le choix de l'intention reste au moniteur (c'est son geste pédagogique), mais
   on lui montre lesquelles les conditions de la semaine favorisent, avec la
   raison — il choisit informé au lieu de choisir à l'aveugle parmi 10 options. */

export type IntentionSuggestion = { id: ObjectifId; reason: string };

// Pool d'intentions pertinentes par saison — 3 par saison, en rotation hebdomadaire pour
// varier les suggestions d'une semaine à l'autre. Toutes les intentions du référentiel
// sont couvertes quelque part dans l'année (les 5 restantes viennent des conditions
// marée/météo : marees, conditions, meteo, paysage, biodiversite).
const SEASON_INTENTION_POOLS: Record<string, IntentionSuggestion[]> = {
    eveil_littoral: [
        { id: 'cohabitation', reason: 'Début de nidification : discrétion près des zones sensibles' },
        { id: 'biodiversite', reason: 'Le vivant se réveille : premières observations de la saison' },
        { id: 'protection', reason: 'Sciences participatives : les comptages de printemps démarrent' },
    ],
    printemps_actif: [
        { id: 'cohabitation', reason: 'Pleine nidification : discrétion près des zones sensibles' },
        { id: 'vivant', reason: 'Reproduction partout : les cycles du vivant sont visibles' },
        { id: 'protection', reason: 'Sciences participatives : signaler ses observations compte' },
    ],
    haute_saison: [
        { id: 'pollution', reason: 'Forte fréquentation estivale : déchets et pression humaine visibles' },
        { id: 'responsable', reason: 'Plein été sur l\'eau : les bons gestes en navigation comptent double' },
        { id: 'cohabitation', reason: 'Fréquentation maximale : limiter le dérangement de la faune' },
    ],
    transition_automnale: [
        { id: 'vivant', reason: 'Migrations d\'automne : les cycles du vivant sont observables' },
        { id: 'paysage', reason: 'Premières tempêtes : le littoral commence à se remodeler' },
        { id: 'protection', reason: 'Observatoires d\'automne : signalements et comptages utiles' },
    ],
    entree_hiver: [
        { id: 'paysage', reason: 'Tempêtes hivernales : érosion et laisses de mer racontent le littoral' },
        { id: 'protection', reason: 'Oiseaux hivernants : les comptages d\'hiver ont besoin d\'yeux' },
        { id: 'meteo', reason: 'Saison des dépressions : la météo marine se lit en continu' },
    ],
    hiver_marin: [
        { id: 'meteo', reason: 'Cœur de l\'hiver : dépressions et coups de vent à décrypter' },
        { id: 'paysage', reason: 'Littoral remodelé par les tempêtes : lecture du terrain à chaud' },
        { id: 'protection', reason: 'Oiseaux hivernants : les comptages d\'hiver ont besoin d\'yeux' },
    ],
};

export function getSuggestedIntentions(params: {
    periodId: string;
    coeff: CoeffType | null;
    meteo: MeteoType | null;
    // Index de semaine (déterministe) pour faire tourner les suggestions saisonnières —
    // deux semaines consécutives de la même saison ne proposent pas les mêmes intentions.
    weekSeed?: number;
}): IntentionSuggestion[] {
    const { periodId, coeff, meteo, weekSeed = 0 } = params;
    const out: IntentionSuggestion[] = [];
    const add = (id: ObjectifId, reason: string) => {
        if (out.length < 3 && !out.some(s => s.id === id)) out.push({ id, reason });
    };

    // Marée d'abord : c'est le phénomène le plus structurant de la semaine.
    if (coeff === 'vive_eau') {
        add('marees', 'Grandes marées : cycles et coefficients très visibles cette semaine');
        add('conditions', 'Estran très découvert, courants marqués — lire avant de naviguer');
    } else if (coeff === 'morte_eau') {
        add('biodiversite', 'Faible marnage : plan d\'eau calme, idéal pour observer le milieu');
    }

    // Météo ensuite.
    if (meteo === 'tempete') {
        add('meteo', 'Semaine agitée : la météo marine se vit en direct');
        add('conditions', 'Conditions engagées — comprendre pour naviguer en sécurité');
    } else if (meteo === 'vent') {
        add('meteo', 'Le vent au cœur de la semaine : thermiques, risées, adaptation');
    } else if (meteo === 'instable') {
        add('meteo', 'Ciel changeant : parfait pour apprendre à décrypter les nuages');
    } else if (meteo === 'beau_fixe') {
        add('paysage', 'Grande visibilité : conditions idéales pour lire le littoral');
    }

    // Saison enfin : on complète jusqu'à 3 avec le pool saisonnier, en rotation par
    // semaine pour la variété.
    const pool = SEASON_INTENTION_POOLS[periodId] ?? [];
    for (let i = 0; i < pool.length && out.length < 3; i++) {
        const pick = pool[(weekSeed + i) % pool.length];
        add(pick.id, pick.reason);
    }

    return out;
}
