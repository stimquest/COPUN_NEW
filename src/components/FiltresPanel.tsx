'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';

type Props = {
    open: boolean;
    onClose: () => void;
    selectedLevel: 1 | 2 | 3;
    setSelectedLevel: (l: 1 | 2 | 3) => void;
    selectedThemes: string[];
    toggleTheme: (id: string) => void;
    availableTags: string[];
    selectedTags: string[];
    toggleTag: (t: string) => void;
    tagSearch: string;
    setTagSearch: (s: string) => void;
    resultCount: number;
    onReset: () => void;
};

// Niveaux d'implication COP'UN. Le détail (« C'est quoi ? ») remplace l'ancienne
// modale d'aide : même contenu, mais accessible là où on choisit, pas ailleurs.
const NIVEAUX = [
    { lvl: 1 as const, label: 'N1', sub: 'Découverte', detail: 'Découverte : le stagiaire observe, s’interroge, prend conscience du milieu. Éveil et curiosité.' },
    { lvl: 2 as const, label: 'N2', sub: 'Approfondissement', detail: 'Approfondissement : il adapte ses gestes et comprend pourquoi certaines pratiques protègent le littoral.' },
    { lvl: 3 as const, label: 'N3', sub: 'Engagement', detail: 'Engagement : il devient acteur — anticipe les impacts, partage, s’implique (sciences participatives).' },
];

/**
 * Filtres en panneau escamotable.
 *
 * Ils occupaient auparavant tout le haut de l'écran en permanence (niveau + 9
 * thématiques + mots-clés), avant même la première fiche : le moniteur devait régler
 * des paramètres sans voir leur effet, et finissait par cliquer au hasard. Ici ils ne
 * s'ouvrent que sur demande, par-dessus les résultats, avec le nombre de fiches
 * correspondantes affiché en continu — on voit ce qu'on filtre pendant qu'on filtre.
 */
export default function FiltresPanel({
    open, onClose,
    selectedLevel, setSelectedLevel,
    selectedThemes, toggleTheme,
    availableTags, selectedTags, toggleTag,
    tagSearch, setTagSearch,
    resultCount, onReset,
}: Props) {
    const [showNiveauInfo, setShowNiveauInfo] = useState(false);

    const filteredTags = availableTags
        .filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()))
        .filter(t => !selectedTags.includes(t));

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-[61] bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl"
                    >
                        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center gap-3 shrink-0">
                            <div className="flex-1">
                                <p className="text-sm font-black text-slate-900">Affiner</p>
                                <p className="text-[11px] text-slate-400">{resultCount} fiche{resultCount > 1 ? 's' : ''} correspondent</p>
                            </div>
                            <button onClick={onReset} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition">
                                Tout effacer
                            </button>
                            <button onClick={onClose} className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-95 transition">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau</p>
                                    <button
                                        onClick={() => setShowNiveauInfo(v => !v)}
                                        className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition"
                                    >
                                        {showNiveauInfo ? 'Masquer' : 'C’est quoi ?'}
                                    </button>
                                </div>
                                {showNiveauInfo && (
                                    <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                                        {NIVEAUX.map(({ lvl, label, detail }) => (
                                            <p key={lvl} className="text-[11px] text-slate-600 leading-snug">
                                                <span className="font-black text-slate-900">{label}</span> — {detail}
                                            </p>
                                        ))}
                                    </div>
                                )}
                                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                                    {NIVEAUX.map(({ lvl, label, sub }) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setSelectedLevel(lvl)}
                                            className={clsx(
                                                'flex-1 flex flex-col items-center py-2.5 px-1 rounded-lg transition-all',
                                                selectedLevel === lvl ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400',
                                            )}
                                        >
                                            <span className="text-[12px] font-black">{label}</span>
                                            <span className="text-[9px] font-bold text-center leading-tight mt-0.5 opacity-70">{sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thématiques</p>
                                {PILLARS.map(pillar => (
                                    <div key={pillar.id} className="space-y-1.5">
                                        <p className={clsx('text-[9px] font-black uppercase tracking-[0.15em]', pillar.color)}>{pillar.label}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {THEMES_BY_PILLAR[pillar.id].map(theme => {
                                                const active = selectedThemes.includes(theme.id);
                                                return (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => toggleTheme(theme.id)}
                                                        className={clsx(
                                                            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                                                            active ? `${pillar.bg} text-white` : 'bg-slate-100 text-slate-500',
                                                        )}
                                                    >
                                                        <span className="material-symbols-outlined text-[13px]">{theme.icon}</span>
                                                        {theme.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {availableTags.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mots-clés</p>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-base">search</span>
                                        <input
                                            type="text"
                                            placeholder="Filtrer les mots-clés…"
                                            value={tagSearch}
                                            onChange={e => setTagSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
                                        />
                                    </div>
                                    {selectedTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {selectedTags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => toggleTag(tag)}
                                                    className="bg-slate-800 text-white pl-2.5 pr-1.5 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1"
                                                >
                                                    {tag}<span className="material-symbols-outlined text-[12px]">close</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                        {filteredTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-4 border-t border-slate-100 shrink-0 pb-[max(env(safe-area-inset-bottom),1rem)]">
                            <button
                                onClick={onClose}
                                className="w-full h-12 bg-slate-900 text-white rounded-xl font-black text-sm active:scale-[0.98] transition"
                            >
                                Voir les {resultCount} fiche{resultCount > 1 ? 's' : ''}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
