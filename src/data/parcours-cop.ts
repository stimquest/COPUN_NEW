export type DomaineCop = {
    id: 'comprendre' | 'observer' | 'proteger';
    titre: string;
    intention: string;
    parcours: { id: string; titre: string; resume: string; icon: 'waves' | 'air' | 'leaf' | 'people' | 'eye' | 'compass' | 'bird' | 'shield'; disponible?: boolean }[];
};

/** COP est le repère. Chaque entrée est un parcours de formation distinct. */
export const PARCOURS_COP: DomaineCop[] = [
    { id: 'comprendre', titre: 'Comprendre un lieu géographique', intention: 'Ce qui façonne un littoral et ce qui y vit.', parcours: [
        { id: 'littoral-eau', titre: 'Le littoral change avec l’eau', resume: 'Marées, courants, vagues et sable : comprendre ce qui transforme le lieu.', icon: 'waves', disponible: true },
        { id: 'vent-meteo', titre: 'Le vent et la météo locale', resume: 'Relier ce que le ciel annonce à ce qui se passe autour du groupe.', icon: 'air' },
        { id: 'milieux-vivants', titre: 'Les milieux et leurs habitants', resume: 'Voir le littoral comme un milieu vivant, pas comme un décor.', icon: 'leaf' },
        { id: 'littoral-partage', titre: 'Un littoral partagé', resume: 'Comprendre les usages humains qui se croisent sur un même lieu.', icon: 'people' },
    ] },
    { id: 'observer', titre: 'Observer un espace d’évolution', intention: 'Des indices concrets à faire remarquer sur le terrain.', parcours: [
        { id: 'lire-eau', titre: 'Lire les mouvements de l’eau', resume: 'Faire regarder les marées, courants, vagues et état de la mer.', icon: 'eye' },
        { id: 'reperes', titre: 'Prendre ses repères', resume: 'Choisir les bons indices pour lire un espace qui évolue.', icon: 'compass' },
        { id: 'ciel-vent', titre: 'Observer le ciel et le vent', resume: 'Transformer le temps qu’il fait en occasion d’observer.', icon: 'air' },
        { id: 'traces-vivant', titre: 'Repérer le vivant et ses traces', resume: 'Faire voir les espèces, leurs passages et leurs habitats.', icon: 'bird' },
    ] },
    { id: 'proteger', titre: 'Protéger un site naturel', intention: 'Des gestes justes et des choix que le groupe peut comprendre.', parcours: [
        { id: 'sans-deranger', titre: 'Approcher sans déranger', resume: 'Adapter sa présence aux espèces et à leurs moments de vie.', icon: 'leaf' },
        { id: 'plages-dunes', titre: 'Préserver plages et dunes', resume: 'Comprendre ce qui fragilise le bord de mer et comment agir.', icon: 'waves' },
        { id: 'laisse-de-mer', titre: 'La laisse de mer', resume: 'Distinguer ce que la mer dépose des déchets à retirer.', icon: 'shield', disponible: true },
        { id: 'connaitre-site', titre: 'Participer à la connaissance du site', resume: 'Observer, signaler et partager des informations utiles.', icon: 'people' },
    ] },
];
