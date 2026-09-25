/**
 * Les emblèmes du sac à dos : légers, valorisants, jamais un palier qui bloque.
 *
 * Ils reconnaissent ce que le moniteur fait avec ses groupes, pas une expertise de
 * naturaliste (voir AGENTS.md). Ils servent aussi d'indicateur au club — sans niveau
 * ni classement.
 *
 * Les noms et les textes se modifient ici seulement ; la page profil les lit tels quels.
 */
export type BadgeId = 'jumelles' | 'boussole' | 'carte' | 'carnet' | 'sifflet' | 'sac';

export type BadgeDefinition = {
    id: BadgeId;
    nom: string;
    /** Ce qui l'a fait obtenir, dit simplement. */
    critere: string;
};

export const BADGES: BadgeDefinition[] = [
    { id: 'jumelles', nom: 'Jumelles', critere: 'Un premier module de formation parcouru' },
    { id: 'boussole', nom: 'Boussole', critere: 'Toute la formation générale parcourue' },
    { id: 'carte', nom: 'Carte', critere: 'Un parcours terminé' },
    { id: 'carnet', nom: 'Carnet', critere: 'Un premier bilan de semaine' },
    { id: 'sifflet', nom: 'Sifflet', critere: 'Une action confirmée par les enfants au quiz' },
    { id: 'sac', nom: 'Sac à dos', critere: 'Cinq semaines menées' },
];

export type ActiviteMoniteur = {
    modulesFaits: number;
    modulesRediges: number;
    parcoursTermines: number;
    semainesBouclees: number;
    actionsConfirmees: number;
};

/** Obtenu ou non, et combien de fois pour les emblèmes qui se cumulent. */
export function badgesObtenus(activite: ActiviteMoniteur): Record<BadgeId, number> {
    return {
        jumelles: activite.modulesFaits > 0 ? 1 : 0,
        boussole: activite.modulesRediges > 0 && activite.modulesFaits >= activite.modulesRediges ? 1 : 0,
        carte: activite.parcoursTermines,
        carnet: activite.semainesBouclees > 0 ? 1 : 0,
        sifflet: activite.actionsConfirmees > 0 ? 1 : 0,
        sac: activite.semainesBouclees >= 5 ? 1 : 0,
    };
}
