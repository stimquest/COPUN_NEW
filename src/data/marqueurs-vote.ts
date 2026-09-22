/**
 * Les cartons du vote : un marqueur au recto, les trois réponses au verso.
 *
 * L'enfant tourne son carton pour lire sa réponse à l'endroit ; le marqueur adopte du même
 * coup l'orientation correspondante côté caméra. Aucune consigne à donner — lire à
 * l'endroit, c'est déjà répondre.
 *
 * Les trois réponses sont disposées en triangle, à 120° l'une de l'autre. C'est l'écart
 * maximal que permettent trois positions : un carton tenu de travers de 30 ou 40° reste
 * sans ambiguïté, là où des positions à 90° basculeraient d'une réponse à l'autre pour la
 * même imprécision.
 *
 * Le dictionnaire est un ArUco 4×4 : chaque marqueur est une grille de 4×4 cases noires ou
 * blanches, entourée d'une bordure noire. Les motifs ci-dessous sont ceux du dictionnaire
 * standard DICT_4X4_50 — nécessaires tels quels, puisque c'est ce que la détection OpenCV
 * reconnaîtra. Leur asymétrie est ce qui permet de retrouver l'orientation : un marqueur
 * symétrique donnerait le même résultat dans les quatre sens.
 */

export type ReponseCarton = 'vrai' | 'faux' | 'incertain';

/** Angle de rotation du carton, en degrés, pour chaque réponse. */
export const ANGLES_REPONSE: Record<ReponseCarton, number> = {
    vrai: 0,
    faux: 120,
    incertain: 240,
};

export const LIBELLES_REPONSE: Record<ReponseCarton, string> = {
    vrai: 'VRAI',
    faux: 'FAUX',
    incertain: 'JE NE SAIS PLUS',
};

/**
 * Tolérance autour de chaque angle. Au-delà, le carton est compté comme « mal orienté »
 * plutôt que rattaché à la réponse la plus proche : mieux vaut demander au groupe de
 * relever ses cartons que d'inventer une réponse que personne n'a donnée.
 */
export const TOLERANCE_DEGRES = 40;

/** Nombre de cartons imprimés. Un par enfant, tous distincts : un carton non levé se voit,
 *  et le même carton ne peut pas être compté deux fois sur une photo. */
export const NB_CARTONS = 12;

/**
 * Les 12 premiers marqueurs de DICT_4X4, en grilles 4×4 — **1 = case BLANCHE**.
 *
 * La convention vient de la détection elle-même : sur l'image binarisée, `countNonZero`
 * compte les pixels blancs, et un bit vaut 1 quand la case est majoritairement blanche
 * (`aruco.js`, `getMarker`). L'inverser reviendrait à imprimer le négatif de chaque
 * marqueur — détecté comme un tout autre identifiant, ou pas détecté du tout.
 *
 * Valeurs extraites du dictionnaire OpenCV (via `js-aruco2`, fichier aruco_4x4_1000.js,
 * lui-même repris d'OpenCV sous licence BSD) : chaque marqueur y est stocké sur deux octets
 * dont les seize bits donnent la grille, lue ligne par ligne. Elles ne sont pas arbitraires
 * et ne doivent jamais être réécrites de mémoire — une première version approximative de ce
 * fichier ne correspondait à aucun marqueur réel, et rien n'aurait été détecté.
 */
export const MOTIFS_4X4: number[][][] = [
    [[1, 0, 1, 1], [0, 1, 0, 1], [0, 0, 1, 1], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [1, 1, 1, 1], [1, 0, 0, 1], [1, 0, 1, 0]],
    [[0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 0], [1, 1, 0, 1]],
    [[1, 0, 0, 1], [1, 0, 0, 1], [0, 1, 0, 0], [0, 1, 1, 0]],
    [[0, 1, 0, 1], [0, 1, 0, 0], [1, 0, 0, 1], [1, 1, 1, 0]],
    [[0, 1, 1, 1], [1, 0, 0, 1], [1, 1, 0, 0], [1, 1, 0, 1]],
    [[1, 0, 0, 1], [1, 1, 1, 0], [0, 0, 1, 0], [1, 1, 1, 0]],
    [[1, 1, 0, 0], [0, 1, 0, 0], [1, 1, 1, 1], [0, 0, 1, 0]],
    [[1, 1, 1, 1], [1, 1, 1, 0], [1, 1, 0, 1], [1, 0, 1, 0]],
    [[1, 1, 0, 0], [1, 1, 1, 1], [0, 1, 0, 1], [0, 1, 1, 0]],
    [[1, 1, 1, 1], [1, 0, 0, 1], [1, 0, 0, 1], [0, 0, 0, 1]],
    [[0, 0, 0, 1], [0, 0, 0, 1], [1, 0, 1, 0], [0, 1, 1, 1]],
];

/**
 * Le marqueur en SVG, bordure comprise.
 *
 * La bordure noire fait une case de large : c'est elle que la détection cherche en premier,
 * et un marqueur imprimé sans elle est invisible pour OpenCV. La marge blanche autour joue
 * le même rôle vis-à-vis du carton — sans contraste franc sur le pourtour, le contour ne se
 * referme pas.
 */
export function marqueurSvg(index: number, taille = 220): string {
    const motif = MOTIFS_4X4[index % MOTIFS_4X4.length];
    const cases = 6; // 4 de motif + 1 de bordure de chaque côté
    const pas = taille / cases;
    // Fond noir : il fait la bordure d'une case de large, que la détection cherche en
    // premier. Les cases blanches du motif (bit à 1) sont peintes par-dessus.
    const carres: string[] = [`<rect width="${taille}" height="${taille}" fill="#000"/>`];
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (motif[y][x] === 1) {
                carres.push(`<rect x="${(x + 1) * pas}" y="${(y + 1) * pas}" width="${pas}" height="${pas}" fill="#fff"/>`);
            }
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${taille} ${taille}" width="${taille}" height="${taille}" shape-rendering="crispEdges">${carres.join('')}</svg>`;
}
