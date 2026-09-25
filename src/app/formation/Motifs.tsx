/**
 * Bandeaux des cartes sans photo : un pictogramme aquarelle par type de carte.
 *
 * Chaque type de carte (à comprendre, règles, mécanisme, contraste, exercice, bilan) a son
 * personnage, toujours le même : le moniteur reconnaît d'un coup d'œil ce que la carte lui
 * demande.
 *
 * Les pictogrammes viennent d'une seule planche (sprite sheet) : `public/formation/Picto.webp`,
 * 1448 × 4000 px, huit bandes de 1448 × 500 empilées. Un seul fichier, chargé une fois et mis
 * en cache pour toutes les cartes ; chaque carte n'en montre que sa bande. Le cadre garde les
 * proportions exactes d'une bande, pour qu'elle ne soit jamais déformée ni rognée.
 */
export type NomMotif = 'regles' | 'comprendre' | 'mecanisme' | 'contraste' | 'exercice' | 'bilan';

const LARGEUR = 1448, HAUTEUR = 4000, BANDE = 500;
/** Haut de chaque bande dans la planche, en pixels. Mesuré sur l'image plutôt que calculé
 *  (rang × 500) : les scènes du bas ne tombent pas exactement sur la grille — la course
 *  commence à 2946 px, la bande du poulpe aux nœuds à 3446. Les bandes non utilisées (la
 *  scène des enfants, le poulpe aux nœuds) ne servent pas aux cartes pour l'instant. */
const HAUT: Record<NomMotif, number> = {
    comprendre: 0,
    regles: 500,
    mecanisme: 1000,
    contraste: 1500,
    bilan: 1960, // la scène des enfants commence à 2465 : la bande s'arrête avant
    exercice: 2946,
};

export function Motif({ nom }: { nom: NomMotif }) {
    return <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#fbfaf6]">
        <div role="presentation" aria-hidden className="w-full"
            style={{
                aspectRatio: `${LARGEUR} / ${BANDE}`,
                backgroundImage: 'url(/formation/Picto.webp)',
                backgroundSize: `100% ${(HAUTEUR / BANDE) * 100}%`,
                // En CSS, un pourcentage de position vaut (haut / (hauteur image − hauteur cadre)).
                backgroundPosition: `0 ${(HAUT[nom] / (HAUTEUR - BANDE)) * 100}%`,
                backgroundRepeat: 'no-repeat',
            }}/>
    </div>;
}
