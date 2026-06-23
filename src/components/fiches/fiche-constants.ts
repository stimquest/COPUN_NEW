import type { ThematicTag } from '@/data/seasonal-context';

export const THEMATIC_TAG_LABELS: Record<ThematicTag, string> = {
    caracteristiques_littoral: 'Caractéristiques du littoral',
    reperes_spatio_temporels: 'Repères spatio-temporels',
    interactions_climatiques: 'Interactions climatiques',
    biodiversite_saisonnalite: 'Biodiversité & saisonnalité',
    activites_humaines: 'Activités humaines',
    lecture_paysage: 'Lecture du paysage',
    cohabitation_vivant: 'Cohabitation du vivant',
    impact_presence_humaine: 'Impact présence humaine',
    sciences_participatives: 'Sciences participatives',
};

export const SAISON_LABELS: Record<string, string> = {
    hiver_marin: 'Hiver marin',
    eveil_littoral: 'Éveil du littoral',
    printemps_actif: 'Printemps actif',
    haute_saison: 'Haute saison',
    transition_automnale: 'Transition automnale',
    entree_hiver: 'Entrée en hiver',
};

export const ALL_THEMATIC_TAGS: ThematicTag[] = [
    'caracteristiques_littoral',
    'reperes_spatio_temporels',
    'interactions_climatiques',
    'biodiversite_saisonnalite',
    'activites_humaines',
    'lecture_paysage',
    'cohabitation_vivant',
    'impact_presence_humaine',
    'sciences_participatives',
];

export const ALL_SAISON_IDS = Object.keys(SAISON_LABELS);
