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

/** Retire l'entrée intention d'un tableau suggested_thematics pour ne garder que les vrais ThematicTag. */
export function stripIntention(suggestedThematics: string[] | null | undefined): string[] {
    return (suggestedThematics ?? []).filter(t => !t.startsWith(INTENTION_PREFIX));
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
