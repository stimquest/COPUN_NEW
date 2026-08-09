'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { PedagogicalContent } from '@/types';
import { THEMES_BY_PILLAR } from '@/data/etages';

type Props = {
    open: boolean;
    onClose: () => void;
    pool: PedagogicalContent[];
    selection: string[];
    onToggle: (tag: string) => void;
    onReset: () => void;
    /** Nombre de fiches correspondant à la sélection courante, affiché en continu. */
    resultCount: number;
};

/** Slugs de thématiques COP — structurels, déjà couverts par les filtres de dimension. */
const SLUGS_THEMES = new Set(Object.values(THEMES_BY_PILLAR).flat().map(t => t.id));

/**
 * Vue d'ensemble des mots-clés.
 *
 * Complète la recherche : on ne sait pas toujours quoi taper, mais on reconnaît un mot
 * quand on le voit. Utile aussi pour découvrir des angles auxquels on n'aurait pas pensé.
 *
 * Le champ `tags_filtre` contient des données hétérogènes (variantes de casse, slugs de
 * thèmes, et des fragments de phrases échappés d'un import). Le nettoyage est fait ici,
 * à l'affichage, pour ne pas dépendre d'une correction en base — mais celle-ci reste
 * souhaitable, voir `scripts/tags-a-nettoyer.mjs`.
 */
export default function TagsPanel({ open, onClose, pool, selection, onToggle, onReset, resultCount }: Props) {
    const [recherche, setRecherche] = useState('');

    const tags = useMemo(() => {
        // Regroupement insensible à la casse : « Vent » et « vent » sont le même mot-clé.
        // La forme affichée est la plus fréquente, à égalité la première rencontrée.
        const paries = new Map<string, { formes: Map<string, number>; total: number }>();

        for (const fiche of pool) {
            for (const brut of fiche.tags_filtre ?? []) {
                const t = String(brut).trim();
                if (!t) continue;
                // Fragments de phrases échappés de l'import : trop longs, ou ponctués.
                if (t.length > 28 || /[.!]|\)\s*$/.test(t)) continue;
                if (SLUGS_THEMES.has(t)) continue;

                const cle = t.toLocaleLowerCase('fr');
                const e = paries.get(cle) ?? { formes: new Map(), total: 0 };
                e.formes.set(t, (e.formes.get(t) ?? 0) + 1);
                e.total += 1;
                paries.set(cle, e);
            }
        }

        return Array.from(paries.entries())
            .map(([cle, e]) => ({
                cle,
                label: [...e.formes.entries()].sort((a, b) => b[1] - a[1])[0][0],
                count: e.total,
            }))
            .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fr'));
    }, [pool]);

    const visibles = recherche.trim()
        ? tags.filter(t => t.cle.includes(recherche.toLocaleLowerCase('fr')))
        : tags;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70]"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                        className="fixed inset-x-0 bottom-0 z-[71] bg-[#EBF0F7] rounded-t-[2rem] max-h-[85vh] flex flex-col shadow-2xl"
                    >
                        <div className="px-5 pt-5 pb-3 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Tous les mots-clés
                                    </p>
                                    <p className="text-lg font-black text-slate-900 leading-tight">
                                        {selection.length > 0
                                            ? `${resultCount} question${resultCount > 1 ? 's' : ''}`
                                            : 'Parcourir par mot-clé'}
                                    </p>
                                </div>
                                {selection.length > 0 && (
                                    <button
                                        onClick={onReset}
                                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition shrink-0"
                                    >
                                        Effacer
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="size-9 rounded-full bg-white flex items-center justify-center text-slate-400 active:scale-90 transition shrink-0"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            <div className="relative mt-3">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[18px]">
                                    search
                                </span>
                                <input
                                    value={recherche}
                                    onChange={e => setRecherche(e.target.value)}
                                    placeholder="Filtrer les mots-clés…"
                                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-white text-sm font-medium text-slate-800 placeholder:text-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-6">
                            <div className="flex flex-wrap gap-2">
                                {visibles.map(t => {
                                    const actif = selection.includes(t.cle);
                                    return (
                                        <button
                                            key={t.cle}
                                            onClick={() => onToggle(t.cle)}
                                            className={clsx(
                                                'inline-flex items-center gap-1.5 pl-3 pr-2.5 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-95',
                                                actif
                                                    ? 'bg-slate-900 text-white shadow-sm'
                                                    : 'bg-white text-slate-600 shadow-sm',
                                            )}
                                        >
                                            {t.label}
                                            <span className={clsx(
                                                'text-[10px] font-black tabular-nums',
                                                actif ? 'text-white/50' : 'text-slate-300',
                                            )}>
                                                {t.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {visibles.length === 0 && (
                                <p className="text-center text-sm text-slate-400 py-10">Aucun mot-clé ne correspond.</p>
                            )}
                        </div>

                        {selection.length > 0 && (
                            <div className="px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] shrink-0 bg-[#EBF0F7]">
                                <button
                                    onClick={onClose}
                                    className="w-full h-14 rounded-2xl bg-slate-900 text-white text-xs font-black tracking-[0.15em] uppercase shadow-lg active:scale-[0.98] transition"
                                >
                                    Voir les {resultCount} question{resultCount > 1 ? 's' : ''}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
