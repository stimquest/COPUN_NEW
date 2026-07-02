import { ObservationType } from '@/types';

// Labels partagés pour la saisie (dashboard) et la relecture (bilan) des retours terrain.
export const OBSERVATION_TYPES: { value: ObservationType; label: string; icon: string }[] = [
    { value: 'faune',             label: 'Faune',              icon: 'flutter_dash' },
    { value: 'flore',             label: 'Flore',              icon: 'grass' },
    { value: 'meteo_mer',         label: 'Météo / mer',        icon: 'air' },
    { value: 'pollution',         label: 'Pollution / déchets', icon: 'delete_sweep' },
    { value: 'activite_humaine',  label: 'Activité humaine',   icon: 'directions_boat' },
    { value: 'autre',             label: 'Autre',              icon: 'more_horiz' },
];

export const SPECIES_CATEGORY_LABELS: Record<string, string> = {
    mammifere_marin: 'Mammifères marins',
    oiseau: 'Oiseaux',
    poisson: 'Poissons',
    meduse: 'Méduses',
    invertebre: 'Mollusques, crustacés, invertébrés',
    flore: 'Algues et plantes',
    autre: 'Autre',
};

export const SPECIES_CATEGORY_ORDER = ['mammifere_marin', 'oiseau', 'poisson', 'meduse', 'invertebre', 'flore', 'autre'];
