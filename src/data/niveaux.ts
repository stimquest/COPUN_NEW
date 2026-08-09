/**
 * Les 4 niveaux du catalogue pédagogique.
 *
 * Ce n'est pas une échelle de difficulté rédactionnelle — vérifié : la longueur moyenne
 * des explications ne varie que de 15 % entre niveau 1 et niveau 4. C'est un repère de
 * PUBLIC : le niveau 1 s'adresse à un stagiaire d'une semaine d'été, sans exposition
 * préalable au sujet ; les niveaux 3-4 supposent une sensibilisation déjà installée
 * (jeunes du club à l'année, plusieurs saisons de pratique).
 *
 * Le niveau n'est donc jamais un filtre qui exclut par défaut : un phénomène rare (un
 * Fata Morgana observé en début de saison) intéresse un groupe entier quel que soit son
 * niveau. Il reste utilisable comme filtre actif quand le moniteur en a besoin (groupe
 * homogène, ex. un stage débutants), mais s'affiche partout ailleurs comme un simple
 * repère sur la fiche — jamais comme une barrière qui la masque.
 */

export const NIVEAU_LABELS: Record<1 | 2 | 3 | 4, string> = {
    1: 'Découverte',
    2: 'Approfondi',
    3: 'Engagement',
    4: 'Expert',
};

/** Libellé complet, pour l'admin ou tout contexte qui bénéficie du numéro. */
export const NIVEAU_LABELS_LONGS: Record<1 | 2 | 3 | 4, string> = {
    1: 'N1 — Découverte',
    2: 'N2 — Approfondi',
    3: 'N3 — Engagement',
    4: 'N4 — Expert',
};

// Niveau 4 (Expert) retiré de la liste de filtrage : plus aucune fiche n'y est classée
// depuis la reclassification vers niveau 2/3 — reste dans NIVEAU_LABELS au cas où
// l'admin en aurait de nouveau besoin, mais n'apparaît plus dans les filtres.
export const NIVEAUX: Array<{ n: 1 | 2 | 3; label: string }> = [
    { n: 1, label: NIVEAU_LABELS[1] },
    { n: 2, label: NIVEAU_LABELS[2] },
    { n: 3, label: NIVEAU_LABELS[3] },
];

export function niveauRepere(niveau: number | null | undefined): string | null {
    if (!niveau) return null;
    return NIVEAU_LABELS[niveau as 1 | 2 | 3 | 4] ?? null;
}
