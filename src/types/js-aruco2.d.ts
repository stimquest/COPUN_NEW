/**
 * `js-aruco2` est du JavaScript de navigateur sans types ni champ `exports` : ses modules
 * s'attachent à `self` (`CV`, `AR`, puis les dictionnaires qui s'enregistrent eux-mêmes).
 * Ces déclarations donnent juste de quoi les importer ; la forme réellement utilisée est
 * décrite dans `src/lib/detection-cartons.ts`, au plus près de l'usage.
 */
declare module 'js-aruco2/src/cv.js' {
    export const CV: unknown;
}

declare module 'js-aruco2/src/aruco.js' {
    export const AR: unknown;
}

/** Le dictionnaire n'exporte rien : il s'enregistre dans `AR.DICTIONARIES` au chargement. */
declare module 'js-aruco2/src/dictionaries/aruco_4x4_1000.js';
