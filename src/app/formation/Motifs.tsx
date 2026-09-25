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

/**
 * `zoom` agrandit la bande autour de son centre : les pictogrammes n'occupent qu'un tiers de
 * leur bande, entourés de papier blanc, et restaient trop petits sur mobile. Le cadre garde
 * les proportions de la bande ; seul le papier autour du dessin est rogné.
 */
function BandePlanche({ planche, haut, zoom = 1, centre }: { planche: Planche; haut: number; zoom?: number; centre?: number }) {
    const { src, largeur, hauteur, bande } = planche;
    // Position CSS en pourcentage = décalage / (taille de l'image affichée − taille du cadre).
    // On vise centre (le milieu du dessin, en px dans la planche), par défaut le milieu de la bande.
    const vise = centre ?? haut + bande / 2;
    const y = (zoom * vise / bande - 0.5) / (zoom * hauteur / bande - 1);
    return <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#fbfaf6]">
        {/* Calé sur la hauteur du bandeau (plafonnée à 160 px) : calé sur la largeur, le cadre
            devenait plus haut que le bandeau sur grand écran et le haut du dessin était rogné.
            S'il est plus large que la carte, seul le papier des côtés est coupé. */}
        <div role="presentation" aria-hidden className="h-full max-w-none shrink-0"
            style={{
                aspectRatio: `${largeur} / ${bande}`,
                backgroundImage: `url(${src})`,
                backgroundSize: `${zoom * 100}% ${(hauteur / bande) * zoom * 100}%`,
                backgroundPosition: `50% ${y * 100}%`,
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

/** Milieu vertical du dessin de chaque pictogramme dans la planche (mesuré), pour centrer
 *  le zoom sur le personnage et non sur la bande. */
const CENTRE_PICTO: Partial<Record<NomMotif, number>> = {
    comprendre: 270, regles: 728, mecanisme: 1232, contraste: 1715, bilan: 2211,
};

/** Zoom des pictogrammes : un peu plus fort sur mobile, où le bandeau est étroit. À × 1,5 la
 *  fenêtre fait 333 px de haut autour du dessin, qui en mesure au plus 330 : rien n'est coupé.
 *  La course (exercice) est une scène pleine largeur, laissée entière. */
export function Motif({ nom }: { nom: NomMotif }) {
    const centre = CENTRE_PICTO[nom];
    if (centre === undefined) return <BandePlanche planche={PICTOS} haut={HAUT_PICTO[nom]}/>;
    // Validé à l'écran : bande calée sur la hauteur du bandeau, recadrée sur les côtés, plus
    // un léger zoom centré sur le dessin.
    // La carte a la même largeur maximale sur tous les écrans (440 px) : un seul réglage.
    return <BandePlanche planche={PICTOS} haut={HAUT_PICTO[nom]} zoom={1.5} centre={centre}/>;
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
