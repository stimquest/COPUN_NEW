import { Dimension } from "@/types";

export interface Pillar {
    id: Dimension;
    label: string;
    description: string;
    color: string;
    bg: string;
    border: string;
    icon: string;
}

export const PILLARS: Pillar[] = [
    {
        id: 'COMPRENDRE',
        label: 'Comprendre',
        description: 'LE LIEU GÉOGRAPHIQUE',
        color: 'text-[#f59e0b]',
        bg: 'bg-amber-500',
        border: 'border-amber-200',
        icon: 'psychology'
    },
    {
        id: 'OBSERVER',
        label: 'Observer',
        description: 'L\'ESPACE D\'ÉVOLUTION',
        color: 'text-[#3b82f6]',
        bg: 'bg-blue-500',
        border: 'border-blue-200',
        icon: 'visibility'
    },
    {
        id: 'PROTÉGER',
        label: 'Protéger',
        description: 'LE SITE NATUREL',
        color: 'text-[#10b981]',
        bg: 'bg-emerald-500',
        border: 'border-emerald-200',
        icon: 'shield'
    },
];

export const THEMES_BY_PILLAR: Record<Dimension, { id: string, label: string, icon: string }[]> = {
    'COMPRENDRE': [
        { id: 'caracteristiques_littoral', label: 'Caractéristiques du littoral', icon: 'landscape' },
        { id: 'activites_humaines', label: 'Activités humaines', icon: 'anchor' },
        { id: 'biodiversite_saisonnalite', label: 'Biodiversité et saisonnalité', icon: 'flutter_dash' }
    ],
    'OBSERVER': [
        { id: 'lecture_paysage', label: 'Lecture du paysage', icon: 'terrain' },
        { id: 'reperes_spatio_temporels', label: 'Repères spatio-temporels', icon: 'explore' },
        { id: 'interactions_climatiques', label: 'Interactions des éléments climatiques', icon: 'air' }
    ],
    'PROTÉGER': [
        { id: 'impact_presence_humaine', label: 'Impact de la présence humaine', icon: 'delete' },
        { id: 'cohabitation_vivant', label: 'Cohabitation avec le vivant', icon: 'eco' },
        { id: 'sciences_participatives', label: 'Sciences participatives', icon: 'biotech' }
    ],
};
