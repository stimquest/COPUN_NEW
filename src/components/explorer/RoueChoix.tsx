'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';

export type OptionRoue = {
    id: string;
    label: string;
    icon?: string;
    /** Couleur pleine de la pilule active, ex. '#f59e0b' (ambre COMPRENDRE). */
    couleur?: string;
};

type Props = {
    /** Première position = « aucun choix » (ex. tous niveaux). */
    options: OptionRoue[];
    valeur: string | null;
    onChange: (id: string | null) => void;
};

const HAUTEUR = 46;
const ECART = 8;
const SEUIL_VITESSE = 500;

/**
 * Une piste à faire glisser au doigt — la pilule centrée, en couleur pleine et portée par
 * une ombre de sa teinte, est la valeur choisie ; les voisines sont de simples contours,
 * assez lisibles pour ne pas naviguer à l'aveugle, assez discrets pour ne pas concurrencer
 * l'accent. Position 0 = « aucun choix ».
 *
 * Chaque pilule prend la largeur de son propre libellé : « Repères spatio-temporels » et
 * « Tous » n'ont pas à tenir dans la même case. Le centrage est donc calculé à partir des
 * largeurs réellement mesurées après rendu, et non d'un pas fixe — c'est ce qui évite à la
 * fois les libellés tronqués et les pilules qui débordent du panneau.
 */
export default function RoueChoix({ options, valeur, onChange }: Props) {
    const toutes: (OptionRoue | null)[] = [null, ...options];
    const index = valeur ? options.findIndex(o => o.id === valeur) + 1 : 0;

    const pilules = useRef<(HTMLButtonElement | null)[]>([]);
    const [largeurs, setLargeurs] = useState<number[]>([]);
    const [traine, setTraine] = useState(0);

    // Mesure après rendu : les largeurs dépendent du texte et de la police, on ne peut pas
    // les deviner. Re-mesuré quand la liste change (le thème change avec le pilier).
    useLayoutEffect(() => {
        setLargeurs(pilules.current.map(el => el?.offsetWidth ?? 0));
    }, [options]);

    /** Décalage à appliquer pour amener le centre de la pilule `i` au centre de la piste. */
    const centrer = (i: number) => {
        if (largeurs.length !== toutes.length) return 0;
        let avant = 0;
        for (let k = 0; k < i; k++) avant += largeurs[k] + ECART;
        return -(avant + largeurs[i] / 2);
    };

    const allerA = (i: number) => {
        const borne = Math.max(0, Math.min(toutes.length - 1, i));
        onChange(borne === 0 ? null : (toutes[borne] as OptionRoue).id);
    };

    /** Index dont le centre est le plus proche de la position relâchée. */
    const plusProcheDe = (decalage: number) => {
        let meilleur = 0;
        let ecartMin = Infinity;
        for (let i = 0; i < toutes.length; i++) {
            const ecart = Math.abs(centrer(i) - decalage);
            if (ecart < ecartMin) { ecartMin = ecart; meilleur = i; }
        }
        return meilleur;
    };

    const surFinDeGlissement = (_: unknown, info: PanInfo) => {
        setTraine(0);
        // Un geste rapide vaut un cran, même court : c'est la sensation attendue d'une molette.
        if (Math.abs(info.velocity.x) > SEUIL_VITESSE) {
            allerA(index - Math.sign(info.velocity.x));
            return;
        }
        allerA(plusProcheDe(centrer(index) + info.offset.x));
    };

    return (
        <div className="relative overflow-x-clip touch-pan-y" style={{ height: HAUTEUR }}>
            <motion.div
                drag="x"
                dragElastic={0.1}
                dragMomentum={false}
                onDrag={(_, info) => setTraine(info.offset.x)}
                onDragEnd={surFinDeGlissement}
                animate={{ x: centrer(index) + traine }}
                transition={traine === 0 ? { type: 'spring', stiffness: 420, damping: 38 } : { duration: 0 }}
                className="absolute inset-y-0 left-1/2 flex items-center cursor-grab active:cursor-grabbing select-none"
                style={{ gap: ECART }}
            >
                {toutes.map((opt, i) => {
                    const enJeu = i === index;
                    const couleur = opt?.couleur;

                    return (
                        <button
                            key={opt?.id ?? '_aucun'}
                            ref={el => { pilules.current[i] = el; }}
                            type="button"
                            onClick={() => Math.abs(traine) < 4 && allerA(i)}
                            className="shrink-0 flex items-center gap-1.5 rounded-full whitespace-nowrap transition-all"
                            style={{
                                // Écart franc entre choisi et non-choisi : la pilule active est
                                // plus haute, en couleur pleine, portée par une ombre de sa
                                // propre teinte. Les autres sont blanches — sur un fond teinté,
                                // un contour transparent se noierait dans la couleur.
                                height: enJeu ? 34 : 28,
                                paddingInline: enJeu ? 16 : 13,
                                background: enJeu ? couleur ?? '#334155' : 'rgba(255,255,255,.85)',
                                boxShadow: enJeu && couleur
                                    ? `0 3px 10px -2px ${couleur}80`
                                    : '0 1px 2px rgba(15,23,42,.06)',
                            }}
                        >
                            {opt?.icon && (
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: enJeu ? 17 : 15, color: enJeu ? '#fff' : '#94a3b8' }}
                                >
                                    {opt.icon}
                                </span>
                            )}
                            <span
                                className={enJeu ? 'font-extrabold leading-none' : 'font-semibold leading-none'}
                                style={{ fontSize: enJeu ? 12.5 : 11.5, color: enJeu ? '#fff' : '#64748b' }}
                            >
                                {opt ? opt.label : 'Tous'}
                            </span>
                        </button>
                    );
                })}
            </motion.div>
        </div>
    );
}
