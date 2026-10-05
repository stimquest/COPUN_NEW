import { PARCOURS_FORMATION } from './parcours-formation';

export type DomaineCop = {
    id: 'comprendre' | 'observer' | 'proteger';
    titre: string;
    intention: string;
    parcours: { id: string; titre: string; resume: string; icon: 'waves' | 'air' | 'leaf' | 'people' | 'eye' | 'compass' | 'bird' | 'shield'; disponible?: boolean }[];
};

/** COP est le repère. Chaque entrée est un parcours de formation distinct. */
export const PARCOURS_COP: DomaineCop[] = [
    { id: 'comprendre', titre: 'Comprendre un lieu géographique', intention: 'Ce qui façonne un littoral et ce qui y vit.', parcours: [
        { id: 'vent-meteo', titre: 'La situation géographique du lieu', resume: 'Faire lire le site dans son littoral : paysages, milieux voisins et activités.', icon: 'compass' },
        { id: 'littoral-eau', titre: 'Le littoral sous l’influence des marées', resume: 'Marées, courants, vagues et sable : comprendre ce qui transforme le lieu.', icon: 'waves', disponible: true },
        { id: 'milieux-vivants', titre: 'La biodiversité locale en fonction des saisons', resume: 'Comprendre comment les saisons changent ce qui vit sur le littoral.', icon: 'leaf' },
        { id: 'littoral-partage', titre: 'Les activités humaines au fil des jours', resume: 'Comprendre les usages humains qui se croisent sur un même lieu.', icon: 'people' },
    ] },
    { id: 'observer', titre: 'Observer un espace d’évolution', intention: 'Des indices concrets à prélever avec les sens.', parcours: [
        { id: 'lire-eau', titre: 'Lire les mouvements de l’eau', resume: 'Faire regarder les marées, courants, vagues et état de la mer.', icon: 'eye' },
        { id: 'reperes', titre: 'Prendre ses repères', resume: 'Choisir les bons indices pour lire un espace qui évolue.', icon: 'compass' },
        { id: 'ciel-vent', titre: 'Observer le ciel et le vent', resume: 'Transformer le temps qu’il fait en occasion d’observer.', icon: 'air' },
        { id: 'traces-vivant', titre: 'Repérer le vivant et ses traces', resume: 'Lire les indices de vie et faire observer leur lien avec le milieu pendant la séance.', icon: 'bird' },
    ] },
    { id: 'proteger', titre: 'Protéger un site naturel', intention: 'Des gestes justes et des choix que le groupe peut comprendre.', parcours: [
        { id: 'sans-deranger', titre: 'Approcher sans déranger', resume: 'Adapter sa présence aux espèces et à leurs moments de vie.', icon: 'leaf' },
        { id: 'plages-dunes', titre: 'Préserver plages et dunes', resume: 'Comprendre ce qui fragilise le bord de mer et comment agir.', icon: 'waves' },
        { id: 'laisse-de-mer', titre: 'Réduire l’impact humain', resume: 'Préserver les dépôts naturels de la mer et retirer les déchets adaptés.', icon: 'shield', disponible: true },
        { id: 'connaitre-site', titre: 'Participer à la connaissance du site', resume: 'Observer, signaler et partager des informations utiles.', icon: 'people' },
    ] },
];

// La disponibilité suit les cours rédigés, sans deuxième liste à maintenir.
PARCOURS_COP.forEach(domaine => domaine.parcours.forEach(parcours => {
    parcours.disponible = PARCOURS_FORMATION.some(cours => cours.id === parcours.id);
}));
