import type { Dimension, PedagogicalContent } from '@/types';
import { groupeDe } from './groupes';

/**
 * Les cartes qui complètent celle qu'on vient de retenir.
 *
 * Un moniteur qui choisit « pourquoi les nuages annoncent la météo » tient le *pourquoi*.
 * Ce qui lui manque pour en faire une séquence, c'est le *quoi regarder* et le *quoi en
 * faire* — pas douze autres cartes sur les nuages.
 *
 * D'où la règle : même sujet (le groupe de `groupes.ts`), mais l'angle COP qui manque. Onze
 * groupes sur quatorze offrent les trois dimensions, donc la proposition a presque toujours
 * de quoi se construire.
 *
 * Ce qui a été écarté :
 *
 *   - `tags_theme` et `tags_filtre` : trop pauvres et trop génériques pour relier deux
 *     cartes (la carte des nuages ne porte que « caracteristiques_littoral »), et vides sur
 *     une bonne partie du catalogue.
 *   - proposer toutes les cartes du groupe : « météo » en compte treize, dont onze
 *     COMPRENDRE. Ce serait une liste à trier, exactement ce que le moniteur cherche à
 *     éviter en fin de journée.
 */

/** L'ordre de la méthode : on comprend, on observe, on protège. */
const ORDRE_COP: Dimension[] = ['COMPRENDRE', 'OBSERVER', 'PROTÉGER'];

export type CarteConnexe = {
    carte: PedagogicalContent;
    /** L'angle qu'elle apporte — ce qui justifie de la proposer, et ce qu'on affiche. */
    angle: Dimension;
};

/**
 * Au plus deux suggestions : les deux angles qui manquent. En proposer davantage
 * transformerait l'aide en catalogue, et le moniteur repartirait chercher ailleurs.
 */
export function cartesConnexes(
    carte: PedagogicalContent,
    pool: PedagogicalContent[],
    /** Ce qui est déjà dans la semaine : inutile de reproposer ce qui est retenu. */
    dejaRetenues: string[] = [],
): CarteConnexe[] {
    const groupe = groupeDe(carte.id);
    if (!groupe) return [];

    const exclues = new Set([carte.id, ...dejaRetenues]);
    const freres = pool.filter(item =>
        !exclues.has(item.id)
        && item.source !== 'custom'
        && groupeDe(item.id)?.id === groupe.id,
    );

    return ORDRE_COP
        .filter(angle => angle !== carte.dimension)
        .map(angle => {
            const candidates = freres
                .filter(item => item.dimension === angle)
                // Le niveau le plus proche d'abord : un moniteur qui prépare du niveau 2 ne
                // veut pas qu'on lui propose une carte pensée pour des débutants d'un jour.
                .sort((a, b) => Math.abs(a.niveau - carte.niveau) - Math.abs(b.niveau - carte.niveau));
            return candidates[0] ? { carte: candidates[0], angle } : null;
        })
        .filter((item): item is CarteConnexe => item !== null);
}
