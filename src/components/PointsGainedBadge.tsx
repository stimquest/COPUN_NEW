'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** State + timer prêts à l'emploi : appeler triggerGain(points) affiche le badge puis
 * l'efface tout seul après ~1.6s — évite de dupliquer la gestion du timeout partout. */
export function usePointsGainedBadge() {
    const [points, setPoints] = useState<number | null>(null);

    useEffect(() => {
        if (points === null) return;
        const timer = setTimeout(() => setPoints(null), 1600);
        return () => clearTimeout(timer);
    }, [points]);

    const triggerGain = (amount: number) => {
        if (amount > 0) setPoints(amount);
    };

    return { points, triggerGain };
}

type Props = {
    // Nombre de points à afficher — le composant s'affiche/se ré-anime à chaque fois
    // que cette valeur passe à une valeur > 0 (voir usePointsGainedBadge ci-dessus).
    points: number | null;
};

/** Badge "+N pts" avec un vrai rebond (spring) et un format plus marqué qu'un simple
 * tag discret — feedback de gain qui se sent, réutilisable partout où une action
 * rapporte des points (défi, quiz, retour terrain…). */
export function PointsGainedBadge({ points }: Props) {
    return (
        <AnimatePresence>
            {points !== null && points > 0 && (
                <motion.span
                    key={points + Math.random()}
                    initial={{ opacity: 0, y: 6, scale: 0.3, rotate: -8 }}
                    animate={{ opacity: 1, y: -6, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, y: -22, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-amber-950 px-3.5 py-1.5 text-base font-black shadow-lg shadow-amber-400/40 shrink-0"
                >
                    <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                    +{points} pts
                </motion.span>
            )}
        </AnimatePresence>
    );
}
