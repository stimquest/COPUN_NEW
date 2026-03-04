export interface Defi {
    id: string;
    description: string;
    instruction: string;
    stage_type: string[];
    type_preuve: 'photo' | 'checkbox' | 'action' | 'quiz';
    icon: string;
    tags_theme: string[];
}

export const DEFIS: Defi[] = [
    {
        id: 'defi_littoral_1',
        description: "Cartographier l'estran",
        instruction: "Lors de la marée basse, identifiez les différentes zones de l'estran et dessinez un croquis rapide des types de sols rencontrés (sable, rochers, vase).",
        stage_type: ['Hebdomadaire', 'Journée'],
        type_preuve: 'photo',
        icon: 'map',
        tags_theme: ['caracteristiques_littoral', 'estran']
    },
    {
        id: 'defi_maree_1',
        description: "Observer la montée des eaux",
        instruction: "Placez un repère fixe au bord de l'eau et revenez 30 minutes plus tard pour mesurer la distance parcourue par la mer.",
        stage_type: ['Hebdomadaire', 'Journée', 'Libre'],
        type_preuve: 'photo',
        icon: 'straighten',
        tags_theme: ['reperes_spatio_temporels', 'marée']
    },
    {
        id: 'defi_vent_1',
        description: "Estimer le Beaufort",
        instruction: "Observez l'état de la mer (moutons, vagues) et estimez la force du vent sur l'échelle de Beaufort.",
        stage_type: ['Hebdomadaire', 'Journée', 'Libre'],
        type_preuve: 'action',
        icon: 'air',
        tags_theme: ['interactions_climatiques', 'vent']
    },
    {
        id: 'defi_dechets_1',
        description: "Collecte de la laisse de mer",
        instruction: "Ramassez 5 déchets d'origine humaine dans la laisse de mer sans toucher aux éléments naturels (algues, bois).",
        stage_type: ['Hebdomadaire', 'Journée', 'Libre', 'annuel'],
        type_preuve: 'photo',
        icon: 'delete',
        tags_theme: ['impact_presence_humaine', 'laisse de mer']
    }
];
