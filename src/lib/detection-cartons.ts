import { ANGLES_REPONSE, TOLERANCE_DEGRES, type ReponseCarton } from '@/data/marqueurs-vote';

/**
 * Lecture des cartons sur une photo : quels marqueurs sont présents, et dans quel sens.
 *
 * Isolé de l'interface pour rester testable sans caméra — une image suffit. La détection
 * elle-même vient de `js-aruco2` (portage du détecteur ArUco d'OpenCV), chargée à la
 * demande : elle ne sert qu'à cet écran et n'a rien à faire dans le bundle des autres.
 */

export type CartonLu = {
    /** Identifiant du marqueur, donc du carton — un par enfant. */
    id: number;
    angle: number;
    /** `null` quand le carton est trop de travers pour être rattaché à une réponse. */
    reponse: ReponseCarton | null;
    /** Centre du marqueur dans l'image analysée, pour poser un cadre dessus à l'écran. */
    centre: { x: number; y: number };
    /** Côté approximatif du marqueur, même repère que `centre`. */
    taille: number;
};

export type LectureCartons = {
    cartons: CartonLu[];
    /** Décompte par réponse, prêt à être proposé au moniteur. */
    decompte: Record<ReponseCarton, number>;
    /** Cartons détectés mais illisibles : à faire relever plutôt qu'à deviner. */
    malOrientes: number;
};

type Coin = { x: number; y: number };
type MarqueurDetecte = { id: number; corners: Coin[] };
type Detecteur = { detect(image: ImageData): MarqueurDetecte[] };

let detecteur: Detecteur | null = null;

/**
 * Charge le détecteur une seule fois.
 *
 * `js-aruco2` est écrit pour le navigateur et s'attache à `self` plutôt que d'exporter des
 * modules : on lui fournit les globales qu'il attend avant de charger le dictionnaire, qui
 * s'enregistre lui-même dans `AR.DICTIONARIES`.
 */
async function chargerDetecteur(): Promise<Detecteur> {
    if (detecteur) return detecteur;
    const cv = await import('js-aruco2/src/cv.js');
    const aruco = await import('js-aruco2/src/aruco.js');
    const globales = globalThis as unknown as Record<string, unknown>;
    globales.CV = (cv as unknown as { CV: unknown }).CV ?? (cv as unknown as { default: { CV: unknown } }).default?.CV;
    const AR = (aruco as unknown as { AR: unknown }).AR ?? (aruco as unknown as { default: { AR: unknown } }).default?.AR;
    globales.AR = AR;
    await import('js-aruco2/src/dictionaries/aruco_4x4_1000.js');
    const Constructeur = (AR as { Detector: new (options: { dictionaryName: string }) => Detecteur }).Detector;
    detecteur = new Constructeur({ dictionaryName: 'ARUCO_4X4_1000' });
    return detecteur;
}

/**
 * L'angle du marqueur, d'après son bord supérieur (coin 0 vers coin 1).
 *
 * C'est la seule mesure dont on ait besoin : la détection renvoie les coins dans l'ordre
 * du marqueur, pas dans celui de l'image, donc leur orientation suit celle du carton.
 */
function angleDuMarqueur(corners: Coin[]): number {
    const [a, b] = corners;
    return (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 360) % 360;
}

/** Centre et côté du marqueur, d'après ses quatre coins. */
function geometrie(corners: Coin[]) {
    const x = corners.reduce((s, c) => s + c.x, 0) / corners.length;
    const y = corners.reduce((s, c) => s + c.y, 0) / corners.length;
    // Le côté est pris sur le bord supérieur : un marqueur vu de biais est plus étroit que
    // haut, et surdimensionner le cadre le ferait déborder sur les cartons voisins.
    const [a, b] = corners;
    return { centre: { x, y }, taille: Math.hypot(b.x - a.x, b.y - a.y) };
}

/** La réponse dont l'angle est le plus proche, ou `null` si aucune n'est assez proche. */
function reponsePourAngle(angle: number): ReponseCarton | null {
    let meilleure: ReponseCarton | null = null;
    let ecartMin = Infinity;
    for (const [reponse, cible] of Object.entries(ANGLES_REPONSE) as [ReponseCarton, number][]) {
        const brut = Math.abs(angle - cible);
        const ecart = Math.min(brut, 360 - brut);
        if (ecart < ecartMin) { ecartMin = ecart; meilleure = reponse; }
    }
    return ecartMin <= TOLERANCE_DEGRES ? meilleure : null;
}

/**
 * Lit les cartons d'une image.
 *
 * Un même carton ne peut être compté qu'une fois : les marqueurs étant tous distincts, un
 * doublon signale un reflet ou une double détection, jamais deux enfants.
 */
export async function lireCartons(image: ImageData): Promise<LectureCartons> {
    const detect = await chargerDetecteur();
    const vus = new Map<number, CartonLu>();

    for (const marqueur of detect.detect(image)) {
        if (vus.has(marqueur.id)) continue;
        const angle = angleDuMarqueur(marqueur.corners);
        const { centre, taille } = geometrie(marqueur.corners);
        vus.set(marqueur.id, { id: marqueur.id, angle, reponse: reponsePourAngle(angle), centre, taille });
    }

    const cartons = [...vus.values()].sort((a, b) => a.id - b.id);
    const decompte: Record<ReponseCarton, number> = { vrai: 0, faux: 0, incertain: 0 };
    let malOrientes = 0;
    for (const carton of cartons) {
        if (carton.reponse) decompte[carton.reponse] += 1;
        else malOrientes += 1;
    }

    return { cartons, decompte, malOrientes };
}
