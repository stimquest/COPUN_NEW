/**
 * Motifs de bandeau pour les cartes sans photo.
 *
 * Toutes les cartes de formation n'ont pas de scène à montrer : une carte de règles ou de
 * mécanisme n'a pas d'équivalent photographiable. Sans bandeau elles se distinguaient
 * visuellement des cartes illustrées, et le contenu ne partait pas de la même hauteur.
 *
 * Ces motifs occupent donc exactement la zone des illustrations. Ils ne sont pas
 * décoratifs : chacun traduit l'idée de la carte qu'il coiffe — un flux qui s'enclenche
 * pour le mécanisme, deux moitiés opposées pour le contraste, une trame régulière pour les
 * règles. Abstraits, mais porteurs de sens.
 *
 * Dessinés en SVG plutôt qu'en images : ils fonctionnent hors ligne (un moniteur se forme
 * sur la plage), pèsent quelques centaines d'octets, et restent nets à toute densité.
 */

export type NomMotif = 'regles' | 'comprendre' | 'mecanisme' | 'contraste' | 'exercice' | 'bilan';

const Cadre = ({ children, fond }: { children: React.ReactNode; fond: string }) => (
    <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice"
         className="w-full h-full" role="presentation" aria-hidden>
        <rect width="400" height="160" fill={fond} />
        {children}
    </svg>
);

/** Les règles : une trame régulière, ordonnée — ce qui se pose et ne bouge plus. */
function MotifRegles() {
    return (
        <Cadre fond="#eef2ff">
            {[0, 1, 2].map(ligne => (
                <g key={ligne}>
                    {Array.from({ length: 9 }).map((_, i) => (
                        <rect
                            key={i}
                            x={30 + i * 42} y={42 + ligne * 34} width={26} height={8} rx={4}
                            fill="#6366f1"
                            opacity={i < 3 ? 0.55 - ligne * 0.12 : 0.16 - ligne * 0.03}
                        />
                    ))}
                </g>
            ))}
        </Cadre>
    );
}

/** À comprendre : un point qui rayonne — l'idée qui se diffuse. */
function MotifComprendre() {
    return (
        <Cadre fond="#eef2ff">
            {[26, 46, 66, 86].map((r, i) => (
                <circle key={r} cx={200} cy={80} r={r} fill="none"
                        stroke="#6366f1" strokeWidth={3} opacity={0.42 - i * 0.09} />
            ))}
            <circle cx={200} cy={80} r={11} fill="#6366f1" />
        </Cadre>
    );
}

/** Le mécanisme : des rouages engrenés — ce qui s'enclenche et produit un effet. */
function MotifMecanisme() {
    const dents = (cx: number, cy: number, r: number, n: number, o: number) =>
        Array.from({ length: n }).map((_, i) => {
            const a = (i / n) * Math.PI * 2;
            return (
                <rect
                    key={i}
                    x={cx - 4} y={cy - r - 9} width={8} height={11} rx={2}
                    fill="#10b981" opacity={o}
                    transform={`rotate(${(a * 180) / Math.PI} ${cx} ${cy})`}
                />
            );
        });

    return (
        <Cadre fond="#ecfdf5">
            <g>
                {dents(140, 80, 40, 10, 0.5)}
                <circle cx={140} cy={80} r={40} fill="none" stroke="#10b981" strokeWidth={7} opacity={0.5} />
                <circle cx={140} cy={80} r={13} fill="#10b981" opacity={0.55} />
            </g>
            <g>
                {dents(255, 80, 28, 8, 0.32)}
                <circle cx={255} cy={80} r={28} fill="none" stroke="#10b981" strokeWidth={6} opacity={0.32} />
                <circle cx={255} cy={80} r={9} fill="#10b981" opacity={0.35} />
            </g>
        </Cadre>
    );
}

/** Le contraste : deux moitiés qui s'opposent, séparées net. */
function MotifContraste() {
    return (
        <Cadre fond="#fff1f2">
            {/* Moitié gauche : ce qui ne marche pas — des traits épars, désalignés. */}
            {[
                { x: 34, y: 50, w: 74 }, { x: 46, y: 72, w: 52 }, { x: 30, y: 94, w: 66 },
            ].map(({ x, y, w }) => (
                <rect key={y} x={x} y={y} width={w} height={9} rx={4.5} fill="#f43f5e" opacity={0.32} />
            ))}
            {/* Séparation */}
            <line x1={200} y1={26} x2={200} y2={134} stroke="#fda4af" strokeWidth={3} strokeDasharray="9 8" strokeLinecap="round" />
            {/* Moitié droite : ce qui marche — aligné, régulier. */}
            {[50, 72, 94].map(y => (
                <rect key={y} x={244} y={y} width={122} height={9} rx={4.5} fill="#10b981" opacity={0.42} />
            ))}
        </Cadre>
    );
}

/** L'exercice : une cible — il y a une bonne réponse à trouver. */
function MotifExercice() {
    return (
        <Cadre fond="#eef2ff">
            {[52, 36, 20].map((r, i) => (
                <circle key={r} cx={200} cy={80} r={r} fill="none"
                        stroke="#6366f1" strokeWidth={5} opacity={0.2 + i * 0.12} />
            ))}
            <circle cx={200} cy={80} r={8} fill="#6366f1" />
            {/* Trois marques latérales : les options proposées. */}
            {[[70, 60], [70, 100], [330, 80]].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={7} fill="#6366f1" opacity={0.22} />
            ))}
        </Cadre>
    );
}

/** Le bilan : ce qui est acquis, coché et rangé. */
function MotifBilan() {
    return (
        <Cadre fond="#ecfdf5">
            {[44, 80, 116].map((y, i) => (
                <g key={y} opacity={0.65 - i * 0.14}>
                    <circle cx={116} cy={y} r={13} fill="#10b981" opacity={0.28} />
                    <path d={`M110 ${y} l4.5 5 8.5 -10`} stroke="#10b981" strokeWidth={4}
                          fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x={144} y={y - 5} width={140} height={10} rx={5} fill="#10b981" opacity={0.3} />
                </g>
            ))}
        </Cadre>
    );
}

const MOTIFS: Record<NomMotif, () => React.ReactElement> = {
    regles: MotifRegles,
    comprendre: MotifComprendre,
    mecanisme: MotifMecanisme,
    contraste: MotifContraste,
    exercice: MotifExercice,
    bilan: MotifBilan,
};

export function Motif({ nom }: { nom: NomMotif }) {
    const Dessin = MOTIFS[nom];
    return <Dessin />;
}
