/**
 * Regroupement des fiches par phénomène.
 *
 * Le catalogue est en réalité une matrice : chaque phénomène (les marées, le vent…)
 * est traité successivement en Comprendre → Observer → Protéger. Cette structure
 * existait déjà dans le contenu, elle n'était simplement nommée nulle part — d'où un
 * catalogue de 128 fiches à plat, impossible à aborder sans savoir ce qu'on cherche.
 *
 * Le phénomène sert d'entrée (c'est ainsi qu'un moniteur pense : « il y a du vent »),
 * COP structure l'intérieur de chaque groupe et reste visible comme progression
 * pédagogique — ce n'est pas une catégorie qu'on choisit, c'est un arc qu'on parcourt.
 *
 * Les IDs sont figés ici plutôt que déduits des tags : les tags_theme sont conçus pour
 * le filtrage transversal et ne découpent pas le catalogue en parties disjointes. La
 * couverture est vérifiée par `scripts/verifier-groupes.mjs` (128 fiches, sans doublon).
 */

export type Groupe = {
    id: string;
    label: string;
    /** Ce que le moniteur reconnaît sur le terrain — sert aussi d'amorce à l'aide au choix. */
    accroche: string;
    icon: string;
    /** Famille de rattachement, pour l'entonnoir d'aide. */
    milieu: 'eau' | 'ciel' | 'bord' | 'vivant' | 'posture' | 'humain';
    fiches: number[];
};

const plage = (de: number, a: number) => Array.from({ length: a - de + 1 }, (_, i) => de + i);

export const GROUPES: Groupe[] = [
    {
        id: 'marees',
        label: 'Les marées',
        accroche: 'La mer monte et descend',
        icon: 'waves',
        milieu: 'eau',
        fiches: [...plage(1, 16), 91],
    },
    {
        id: 'courants',
        label: 'Les courants',
        accroche: 'L’eau qui file',
        icon: 'swap_horiz',
        milieu: 'eau',
        fiches: [...plage(24, 29), 89, 118, 119],
    },
    {
        id: 'vagues',
        label: 'Les vagues et la houle',
        accroche: 'Ça bouge sous le bateau',
        icon: 'water',
        milieu: 'eau',
        fiches: [...plage(30, 37), 90, 104, 108, 122, 123, 124],
    },
    {
        id: 'etat_mer',
        label: 'L’état de la mer',
        accroche: 'Lire la mer avant de partir',
        icon: 'sailing',
        milieu: 'eau',
        fiches: [96, 97, 107, 113],
    },
    {
        id: 'vent',
        label: 'Le vent',
        accroche: 'D’où il vient, ce qu’il annonce',
        icon: 'air',
        milieu: 'ciel',
        fiches: [...plage(17, 23), 85, 102, 121],
    },
    {
        id: 'meteo',
        label: 'La météo et les nuages',
        accroche: 'Le ciel change',
        icon: 'cloud',
        milieu: 'ciel',
        fiches: [...plage(38, 43), 82, 83, 84, 99, 100, 101, 114, 115],
    },
    {
        id: 'plage_dunes',
        label: 'La plage et les dunes',
        accroche: 'Le sable bouge, la côte recule',
        icon: 'landscape',
        milieu: 'bord',
        fiches: plage(44, 49),
    },
    {
        id: 'laisse_mer',
        label: 'La laisse de mer',
        accroche: 'Ce que la mer dépose',
        icon: 'grass',
        milieu: 'bord',
        fiches: [...plage(50, 56), 110],
    },
    // « Le vivant » regroupait 21 fiches — le plus gros bloc, et un milieu qui ne
    // proposait qu'un seul choix dans l'aide. Découpé par type de vivant, comme un
    // moniteur le formule sur le terrain (« on a vu des oiseaux », « une méduse »).
    {
        id: 'vie_marine',
        label: 'La vie dans l’eau',
        accroche: 'Poissons, méduses, mammifères marins',
        icon: 'set_meal',
        milieu: 'vivant',
        // 200-202 : sujet méduses, ajouté après le découpage initial du catalogue.
        fiches: [58, 59, 60, 88, 128, 200, 201, 202],
    },
    {
        id: 'oiseaux',
        label: 'Les oiseaux',
        accroche: 'Migrations, escales en Normandie',
        icon: 'flutter_dash',
        milieu: 'vivant',
        fiches: [86, 87, 103, 116, 117],
    },
    {
        id: 'cohabiter',
        label: 'Observer sans déranger',
        accroche: 'Partager le lieu de vie des espèces',
        icon: 'eco',
        milieu: 'vivant',
        fiches: [57, ...plage(61, 67)],
    },
    {
        id: 'observer',
        label: 'Observer et se repérer',
        accroche: 'Apprendre à regarder',
        icon: 'visibility',
        milieu: 'posture',
        fiches: [...plage(68, 74), 92, 93, 94, 95, 105, 106, 120],
    },
    {
        id: 'activites',
        label: 'Les activités humaines',
        accroche: 'Ce qu’on fait du littoral',
        icon: 'groups',
        milieu: 'humain',
        fiches: [...plage(75, 81), 109, 125, 126, 127],
    },
    {
        id: 'protection',
        label: 'Protéger le territoire',
        accroche: 'Enjeux et zones protégées',
        icon: 'shield',
        milieu: 'humain',
        fiches: [98, 111, 112],
    },
];

/** Familles pour l'entonnoir d'aide : premier niveau, quand on ne sait pas par où commencer. */
export const MILIEUX = [
    { id: 'eau', label: 'L’eau bouge', detail: 'Marées, courants, vagues', icon: 'waves' },
    { id: 'ciel', label: 'Le ciel et l’air', detail: 'Vent, météo, nuages', icon: 'air' },
    { id: 'bord', label: 'Le bord', detail: 'Plage, dunes, laisse de mer', icon: 'landscape' },
    { id: 'vivant', label: 'Le vivant', detail: 'Oiseaux, espèces, saisons', icon: 'pets' },
    { id: 'posture', label: 'Apprendre à observer', detail: 'Regarder, se repérer', icon: 'visibility' },
    { id: 'humain', label: 'Notre impact', detail: 'Activités humaines, protection', icon: 'groups' },
] as const;

const INDEX = new Map<string, Groupe>();
GROUPES.forEach(g => g.fiches.forEach(f => INDEX.set(String(f), g)));

/** Groupe d'appartenance d'une fiche — null pour les fiches personnelles (hors catalogue). */
export function groupeDe(ficheId: string): Groupe | null {
    return INDEX.get(ficheId) ?? null;
}

export function groupesDuMilieu(milieu: string): Groupe[] {
    return GROUPES.filter(g => g.milieu === milieu);
}
