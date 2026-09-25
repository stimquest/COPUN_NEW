import type { CarteFormation, LeconFormation } from './formation-methode';

/**
 * Le flux de cartes d'une leçon, respirations intercalées entre les piles.
 *
 * Isolé de `formation-methode.ts` (≈ 90 ko de contenus) : l'écran de formation n'a besoin
 * que de cette fonction côté navigateur. L'importer depuis le fichier des contenus y
 * embarquait toute la formation, déjà transmise par le serveur — deux fois le même poids.
 * N'importer ici que des types.
 */
export function cartesDe(lecon: LeconFormation): CarteFormation[] {
    return lecon.piles.flatMap((pile, i) => [
        ...pile.cartes,
        {
            genre: 'respiration' as const,
            titre: pile.titre,
            acquis: pile.acquis,
            suite: lecon.piles[i + 1]?.titre,
            numero: i + 1,
            total: lecon.piles.length,
        },
    ]);
}
