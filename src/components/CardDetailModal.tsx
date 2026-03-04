'use client';

import { PedagogicalContent } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { useSyncExternalStore, useState, useEffect } from 'react';
import GameCard from './games/GameCard';
import { GameCardDB } from './games/types';
// Server Actions
import { getGameCardsForContent } from '@/actions/game-actions';

type CardDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    content: PedagogicalContent | null;
};

function subscribe() {
    return () => { };
}

export default function CardDetailModal({ isOpen, onClose, content }: CardDetailModalProps) {
    const isClient = useSyncExternalStore(subscribe, () => true, () => false);

    // Dynamic Data State
    const [games, setGames] = useState<GameCardDB[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let ignore = false;

        async function loadContentData() {
            if (!isOpen || !content) return;

            // Avoid setting state immediately if it causes synchronous re-render loops
            // Using a microtask or just relying on the async flow
            setLoading(true);

            try {
                const fetchedGames = await getGameCardsForContent(content.id);

                if (!ignore) {
                    setGames(fetchedGames as GameCardDB[]);
                }
            } catch (err) {
                console.error("Error fetching detail data:", err);
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadContentData();

        return () => {
            ignore = true;
        };
    }, [isOpen, content]);

    if (!isClient) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && content && (
                <div className="fixed inset-0 z-200 flex items-center justify-center px-4 sm:px-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className={clsx(
                            "relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
                            "border-4",
                            content.dimension === 'COMPRENDRE' ? "border-amber-100" :
                                content.dimension === 'OBSERVER' ? "border-blue-100" :
                                    "border-emerald-100"
                        )}
                    >
                        {/* Header */}
                        <div className={clsx(
                            "px-8 py-6 border-b",
                            content.dimension === 'COMPRENDRE' ? "bg-amber-50 border-amber-100" :
                                content.dimension === 'OBSERVER' ? "bg-blue-50 border-blue-100" :
                                    "bg-emerald-50 border-emerald-100"
                        )}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className={clsx(
                                        "inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3",
                                        content.dimension === 'COMPRENDRE' ? "bg-amber-100 text-amber-700" :
                                            content.dimension === 'OBSERVER' ? "bg-blue-100 text-blue-700" :
                                                "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {content.dimension}
                                    </span>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight italic">
                                        {content.question}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-10 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* LEFT COLUMN: Basic Info */}
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Objectif</h3>
                                        <p className="text-lg font-medium text-slate-700 leading-relaxed">
                                            {content.objectif}
                                        </p>
                                    </div>

                                    {content.tip && (
                                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="material-symbols-outlined text-indigo-500">lightbulb</span>
                                                <h3 className="text-xs font-black text-indigo-800 uppercase tracking-widest">Le Conseil du Coach</h3>
                                            </div>
                                            <p className="text-sm font-medium text-indigo-900 leading-relaxed">
                                                {content.tip}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        {content.tags_theme?.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Thèmes</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {content.tags_theme.map(tag => (
                                                        <span key={`theme-${tag}`} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {content.tags_filtre?.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mots-clés</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {content.tags_filtre.map(tag => (
                                                        <span key={`filtre-${tag}`} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>


                                {/* RIGHT COLUMN: Jeux & Défis */}
                                <div className="space-y-10">
                                    {/* JEUX SECTION */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                                <span className="material-symbols-outlined text-lg">videogame_asset</span>
                                            </div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Jeux associés</h3>
                                        </div>

                                        {loading ? (
                                            <div className="p-4 text-center text-slate-400 text-xs italic">Chargement des jeux...</div>
                                        ) : games.length > 0 ? (
                                            <div className="space-y-4">
                                                {games.map(game => (
                                                    <GameCard key={game.id} game={game} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-10 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center bg-slate-50/50">
                                                <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                                                    <span className="material-symbols-outlined">extension_off</span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold italic max-w-[150px]">
                                                    Pas de jeu spécifique pour cette fiche.
                                                </p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Actions) */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
