export type SessionTemplateStep = {
    title: string;
    duration: number;
    description?: string;
};

export type SessionTemplate = {
    id: string;
    label: string;
    icon: string;
    description: string;
    steps: SessionTemplateStep[];
};

export const SESSION_TEMPLATES: SessionTemplate[] = [
    {
        id: 'standard',
        label: 'Navigation Classique',
        icon: 'sailing',
        description: 'Un seul grand bloc de navigation et exercices.',
        steps: [
            { title: 'Briefing & Préparation', duration: 20 },
            { title: 'Navigation & Exercices', duration: 90 },
            { title: 'Débriefing & Rangement', duration: 15 }
        ]
    },
    {
        id: 'ateliers',
        label: 'Ateliers Tournants',
        icon: 'widgets',
        description: 'La phase de navigation est divisée en 3 ateliers techniques.',
        steps: [
            { title: 'Briefing & Préparation', duration: 20 },
            { title: 'Atelier 1 : Technique', duration: 30 },
            { title: 'Atelier 2 : Manœuvres', duration: 30 },
            { title: 'Atelier 3 : Jeu / Défi', duration: 30 },
            { title: 'Débriefing & Rangement', duration: 15 }
        ]
    },
    {
        id: 'raid',
        label: 'Raid / Randonnée',
        icon: 'explore',
        description: 'La phase de navigation suit une timeline de trajet (Waypoints).',
        steps: [
            { title: 'Briefing & Préparation', duration: 20 },
            { title: 'Trajet Aller', duration: 40 },
            { title: 'Escale / Observation', duration: 20 },
            { title: 'Trajet Retour', duration: 40 },
            { title: 'Débriefing & Rangement', duration: 15 }
        ]
    },
    {
        id: 'repli',
        label: 'Théorie / Repli',
        icon: 'school',
        description: 'La navigation est remplacée par des ateliers à terre.',
        steps: [
            { title: 'Briefing & Accueil', duration: 20 },
            { title: 'Atelier 1 : Nœuds/Vitesse', duration: 45 },
            { title: 'Atelier 2 : Règles/Météo', duration: 45 },
            { title: 'Débriefing', duration: 15 }
        ]
    }
];
