import type { Dimension, PedagogicalContent } from '@/types';
import { GROUPES } from './groupes';

export const ENTREES_DECOUVERTE = [
    { id: 'comprendre', dimension: 'COMPRENDRE', title: 'Comprendre un lieu géographique', subtitle: 'Ce qui façonne le littoral où vous naviguez.', themes: [
        { id: 'littoral-eau', title: 'Un littoral façonné par l’eau', groups: ['marees', 'courants', 'vagues', 'plage_dunes'], icon: 'waves' },
        { id: 'meteo-locale', title: 'Le vent et la météo locale', groups: ['vent', 'meteo', 'etat_mer'], icon: 'air' },
        { id: 'milieux-vivants', title: 'Les milieux et leurs habitants', groups: ['vie_marine', 'oiseaux', 'cohabiter', 'laisse_mer'], icon: 'flutter_dash' },
        { id: 'littoral-partage', title: 'Un littoral partagé', groups: ['activites'], icon: 'groups' },
    ] },
    { id: 'observer', dimension: 'OBSERVER', title: 'Observer un espace d’évolution', subtitle: 'Des indices à faire repérer au groupe pendant la sortie.', themes: [
        { id: 'lire-eau', title: 'Lire l’eau avant de partir', groups: ['marees', 'courants', 'vagues', 'etat_mer'], icon: 'water' },
        { id: 'reperes', title: 'Prendre ses repères', groups: ['observer', 'plage_dunes'], icon: 'explore' },
        { id: 'ciel-vent', title: 'Décrypter le ciel et le vent', groups: ['vent', 'meteo'], icon: 'cloud' },
        { id: 'traces-vivant', title: 'Repérer le vivant et ses traces', groups: ['vie_marine', 'oiseaux', 'cohabiter', 'laisse_mer'], icon: 'pets' },
    ] },
    { id: 'proteger', dimension: 'PROTÉGER', title: 'Protéger un site naturel', subtitle: 'Des gestes adaptés aux fragilités du lieu.', themes: [
        { id: 'sans-deranger', title: 'Approcher sans déranger', groups: ['cohabiter', 'oiseaux', 'vie_marine', 'marees'], icon: 'eco' },
        { id: 'plages-dunes', title: 'Préserver les plages et les dunes', groups: ['plage_dunes', 'vagues'], icon: 'landscape' },
        { id: 'dechets', title: 'Réduire les déchets', groups: ['laisse_mer'], icon: 'recycling' },
        { id: 'connaitre-site', title: 'Participer à la connaissance du site', ids: ['80', '81', '111', '112'], groups: [], icon: 'biotech' },
    ] },
] satisfies { id: string; dimension: Dimension; title: string; subtitle: string; themes: { id: string; title: string; groups: string[]; ids?: string[]; icon: string }[] }[];

export function cartesDuTheme(pool: PedagogicalContent[], dimension: Dimension, theme: { groups: string[]; ids?: string[] }) {
    const ids = new Set(theme.ids ?? GROUPES.filter(group => theme.groups.includes(group.id)).flatMap(group => group.fiches.map(String)));
    return pool.filter(card => card.source !== 'custom' && card.dimension === dimension && ids.has(card.id));
}
