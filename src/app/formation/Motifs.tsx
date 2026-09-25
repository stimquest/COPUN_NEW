/**
 * Bandeaux des cartes de formation, tirés de planches aquarelle (sprite sheets).
 *
 * Une planche = un seul fichier, chargé une fois et mis en cache pour toutes les cartes ;
 * chaque carte n'en montre qu'une bande. Le cadre garde les proportions exactes de la bande,
 * pour qu'elle ne soit jamais déformée ni rognée. Les positions sont mesurées sur l'image
 * (haut de chaque bande, en pixels) plutôt que calculées : les bandes générées ne tombent pas
 * toujours pile sur une grille régulière.
 */
type Planche = { src: string; largeur: number; hauteur: number; bande: number };

function BandePlanche({ planche, haut }: { planche: Planche; haut: number }) {
    const { src, largeur, hauteur, bande } = planche;
    return <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#fbfaf6]">
        <div role="presentation" aria-hidden className="w-full"
            style={{
                aspectRatio: `${largeur} / ${bande}`,
                backgroundImage: `url(${src})`,
                backgroundSize: `100% ${(hauteur / bande) * 100}%`,
                // En CSS, un pourcentage de position vaut (haut / (hauteur image − hauteur cadre)).
                backgroundPosition: `0 ${(haut / (hauteur - bande)) * 100}%`,
                backgroundRepeat: 'no-repeat',
            }}/>
    </div>;
}

// ── Pictogrammes par type de carte ───────────────────────────────────────────

export type NomMotif = 'regles' | 'comprendre' | 'mecanisme' | 'contraste' | 'exercice' | 'bilan';

/** `Picto.webp` : huit bandes de 1448 × 500. La scène des enfants et le poulpe aux nœuds ne
 *  servent pas pour l'instant. */
const PICTOS: Planche = { src: '/formation/Picto.webp', largeur: 1448, hauteur: 4000, bande: 500 };
const HAUT_PICTO: Record<NomMotif, number> = {
    comprendre: 0,
    regles: 500,
    mecanisme: 1000,
    contraste: 1500,
    bilan: 1960, // la scène des enfants commence à 2465 : la bande s'arrête avant
    exercice: 2946,
};

export function Motif({ nom }: { nom: NomMotif }) {
    return <BandePlanche planche={PICTOS} haut={HAUT_PICTO[nom]}/>;
}

// ── Scènes propres à une carte ───────────────────────────────────────────────

/** `illustration.webp` : les cinq scènes du module « Fabriquer une accroche », repérées par
 *  le nom de fichier déclaré dans les cartes (`illustration.fichier`). */
const SCENES: Planche = { src: '/formation/illustration.webp', largeur: 1448, hauteur: 2387, bande: 470 };
const HAUT_SCENE: Record<string, number> = {
    'decrochage.jpg': 8,
    'pari.jpg': 510,
    'piege.jpg': 985,
    'constat.jpg': 1456,
    'choix.jpg': 1891,
};

/** La scène de la planche qui remplace ce fichier, s'il y en a une. */
export function sceneDePlanche(fichier: string) {
    const haut = HAUT_SCENE[fichier];
    return haut === undefined ? null : <BandePlanche planche={SCENES} haut={haut}/>;
}
