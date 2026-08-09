/**
 * Bilan de semaine : un ressenti global, pas un statut par fiche.
 *
 * Remplace `stage_objective_reviews`, qui faisait cocher exécution + impact + raisons
 * pour CHAQUE fiche sélectionnée — jusqu'à 15 fois le même formulaire pour clôturer une
 * semaine. Les fiches construisent un discours, elles ne sont pas des tâches : leur
 * réussite se juge à l'échelle de la semaine, pas fiche par fiche.
 *
 * Les raisons restent à cocher (mesurables, agrégeables pour le club), mais portent sur
 * l'ensemble de la semaine plutôt que sur un sujet précis.
 */

export type RessentiNiveau = 'largement' | 'en_partie' | 'pas_vraiment';

export const RESSENTI_OPTIONS: Array<{ value: RessentiNiveau; label: string; helper: string; icon: string }> = [
    { value: 'largement', label: 'Oui, largement', helper: 'Le programme prévu est passé, dans l’ensemble.', icon: 'sentiment_very_satisfied' },
    { value: 'en_partie', label: 'En partie', helper: 'Une partie est passée, une partie est restée de côté.', icon: 'sentiment_neutral' },
    { value: 'pas_vraiment', label: 'Pas vraiment', helper: 'Peu de choses ont pu être transmises cette semaine.', icon: 'sentiment_dissatisfied' },
];

/** Raisons à cocher, spécifiques à chaque niveau — cohérent avec les +/− de la semaine. */
export const RESSENTI_RAISONS: Record<RessentiNiveau, string[]> = {
    largement: [
        'Groupe réceptif et curieux',
        'Bonnes conditions météo pour observer',
        'Sujets bien choisis pour ce groupe',
        'Assez de temps entre les activités',
    ],
    en_partie: [
        'Pas eu le temps sur certains sujets',
        'Groupe inégal (âges ou niveaux mélangés)',
        'Conditions météo moyennes',
        'Groupe changeant en cours de semaine',
        'Trop de sujets prévus pour la semaine',
    ],
    pas_vraiment: [
        'Météo défavorable la majeure partie de la semaine',
        'Groupe peu réceptif',
        'Programme trop ambitieux pour le temps disponible',
        'Contraintes techniques ou de sécurité prioritaires',
        'Groupe trop nombreux pour un vrai suivi',
    ],
};

export function isRessentiNiveau(v: unknown): v is RessentiNiveau {
    return v === 'largement' || v === 'en_partie' || v === 'pas_vraiment';
}

export type StageRessenti = {
    niveau: RessentiNiveau;
    raisons: string[];
    note: string;
};
