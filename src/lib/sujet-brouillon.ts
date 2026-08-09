import { PedagogicalContent } from '@/types';

/**
 * Fabrique un brouillon de sujet à partir des questions retenues.
 *
 * Le moniteur ne part pas d'une page blanche : les fiches qui portent la couche
 * transmission fournissent déjà une accroche, des points et une idée à retenir. Il
 * n'a plus qu'à ajuster — ce qui reste un acte d'appropriation sans imposer d'écrire.
 *
 * Calcul pur, volontairement hors des server actions : il tourne côté client à chaque
 * (dé)sélection d'une question pour recomposer le brouillon sans aller-retour réseau.
 */
export function composerBrouillon(fiches: PedagogicalContent[]): {
    accroche: string;
    points_cles: string;
    a_retenir: string;
} {
    const avecAccroche = fiches.find(f => f.accroche);
    // Les points reprennent l'angle de chaque question retenue : c'est ce que le
    // moniteur a choisi d'aborder, dans l'ordre où il l'a choisi. Repli sur `objectif`
    // pour les fiches sans couche transmission — le texte sera à retravailler, mais
    // mieux vaut une base imparfaite qu'un champ vide.
    const points = fiches
        .map(f => f.a_observer || f.objectif)
        .filter(Boolean)
        .map(p => `• ${p}`)
        .join('\n');
    const retenir = fiches.map(f => f.a_retenir).filter(Boolean).join(' ');

    return {
        accroche: avecAccroche?.accroche ?? '',
        points_cles: points,
        a_retenir: retenir,
    };
}
