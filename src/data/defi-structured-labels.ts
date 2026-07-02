// Labels partagés pour l'affichage/saisie des données structurées des défis fil rouge
// (FilRougeForm.tsx pour la saisie, bilan de semaine pour la relecture).
export type Abundance = 'absent' | 'quelques' | 'abondant';
export type Frequency = 'habituel' | 'peu_commun' | 'inhabituel' | 'exceptionnel' | '';

export const ABUNDANCE_OPTIONS: { value: Abundance; label: string }[] = [
    { value: 'absent', label: 'Absent' },
    { value: 'quelques', label: 'Quelques' },
    { value: 'abondant', label: 'Abondant' },
];
export const ABUNDANCE_LABELS: Record<Abundance, string> = {
    absent: 'Absent',
    quelques: 'Quelques',
    abondant: 'Abondant',
};

export const INVENTAIRE_GROUPES: { key: string; label: string; exemple: string }[] = [
    { key: 'algues', label: 'Algues', exemple: 'ulves, fucus, laminaires…' },
    { key: 'mollusques', label: 'Mollusques', exemple: 'bigorneaux, moules, huîtres, patelles…' },
    { key: 'crustaces', label: 'Crustacés', exemple: 'crabes, crevettes, balanes…' },
    { key: 'vers', label: 'Vers / invertébrés', exemple: 'annélides, anémones…' },
    { key: 'echinodermes', label: 'Échinodermes', exemple: 'oursins, étoiles de mer…' },
];

export const LAISSE_CATEGORIES: { key: string; label: string; exemple: string }[] = [
    { key: 'dechets_plastiques', label: 'Déchets plastiques', exemple: 'bouteilles, sacs, mégots, fragments, filets…' },
    { key: 'dechets_autres', label: 'Déchets autres matières', exemple: 'verre, métal, textile, bois traité…' },
    { key: 'algues', label: 'Algues échouées', exemple: 'laminaires, fucales, algues vertes…' },
    { key: 'bois_flotte', label: 'Bois flotté / débris végétaux', exemple: 'branches, troncs, feuilles…' },
    { key: 'coquilles_vides', label: 'Coquilles vides', exemple: 'bivalves, gastéropodes, tests d\'oursins…' },
    { key: 'faune_vivante', label: 'Faune vivante échouée', exemple: 'puces de mer, crustacés, invertébrés actifs…' },
    { key: 'indices_ecologiques', label: 'Indices écologiques particuliers', exemple: 'pontes, œufs, méduses, espèce remarquable…' },
];

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
    { value: 'habituel', label: 'Habituel' },
    { value: 'peu_commun', label: 'Peu commun' },
    { value: 'inhabituel', label: 'Inhabituel' },
    { value: 'exceptionnel', label: 'Exceptionnel' },
];
export const FREQUENCY_LABELS: Record<string, string> = {
    habituel: 'Habituel',
    peu_commun: 'Peu commun',
    inhabituel: 'Inhabituel',
    exceptionnel: 'Exceptionnel',
};

export const COVERAGE_OPTIONS = ['0–25%', '25–50%', '50–75%', '75–100%'];
export const ETAT_OPTIONS = ['bon', 'moyen', 'dégradé'];

export const CATEGORIE_OPTIONS = [
    { value: 'oiseau', label: 'Oiseau' },
    { value: 'mammifere_marin', label: 'Mammifère marin' },
    { value: 'poisson', label: 'Poisson' },
    { value: 'meduse', label: 'Méduse' },
    { value: 'invertebre', label: 'Mollusque / crustacé / invertébré' },
    { value: 'flore', label: 'Algue / plante' },
    { value: 'autre', label: 'Autre' },
];
