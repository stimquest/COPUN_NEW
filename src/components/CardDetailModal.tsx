'use client';

import { PedagogicalContent } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { useSyncExternalStore, useEffect, useState } from 'react';
import { getFichesMemoForCard } from '@/actions/fiche-memo-actions';
import type { FicheMemo } from '@/actions/fiche-memo-actions';

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
    const [relatedFiches, setRelatedFiches] = useState<FicheMemo[]>([]);

    useEffect(() => {
        if (!isOpen || !content) { setRelatedFiches([]); return; }
        let cancelled = false;
        getFichesMemoForCard(content.tags_theme ?? [], content.tags_filtre ?? []).then(fiches => {
            if (!cancelled) setRelatedFiches(fiches);
        });
        return () => { cancelled = true; };
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
                                <div className="space-y-6">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-snug">
                                        {content.objectif}
                                    </p>

                                    {content.explication && (
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ce qu&apos;il faut savoir</h3>
                                            <p className="text-lg font-medium text-slate-700 leading-relaxed">
                                                {content.explication}
                                            </p>
                                        </div>
                                    )}

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


                                {/* RIGHT COLUMN: Ressources */}
                                <div className="space-y-10">
                                    {/* RESSOURCES SECTION — liens posés à la main */}
                                    {content.ressources && content.ressources.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="size-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-lg">menu_book</span>
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ressources</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {content.ressources.map((r, idx) => (
                                                    r.type === 'url' ? (
                                                        <a
                                                            key={idx}
                                                            href={r.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition group"
                                                        >
                                                            <span className="material-symbols-outlined text-blue-500 text-base shrink-0">link</span>
                                                            <span className="text-sm font-semibold text-blue-800 flex-1 truncate">{r.label}</span>
                                                            <span className="material-symbols-outlined text-blue-300 text-sm group-hover:translate-x-0.5 transition-transform">open_in_new</span>
                                                        </a>
                                                    ) : (
                                                        <a
                                                            key={idx}
                                                            href={`/ressources/${r.fiche_memo_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl hover:bg-teal-100 transition group"
                                                        >
                                                            <span className="material-symbols-outlined text-teal-500 text-base shrink-0">article</span>
                                                            <span className="text-sm font-semibold text-teal-800 flex-1 truncate">{r.label}</span>
                                                            <span className="material-symbols-outlined text-teal-300 text-sm group-hover:translate-x-0.5 transition-transform">open_in_new</span>
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* FICHES MÉMO LIÉES — retrouvées automatiquement via les tags de la carte */}
                                    {relatedFiches.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-lg">auto_stories</span>
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">À lire dans le wiki</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {relatedFiches.map(fiche => (
                                                    <a
                                                        key={fiche.id}
                                                        href={`/ressources/${fiche.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition group"
                                                    >
                                                        <span className="material-symbols-outlined text-indigo-500 text-base shrink-0">article</span>
                                                        <span className="text-sm font-semibold text-indigo-800 flex-1 truncate">{fiche.titre}</span>
                                                        <span className="material-symbols-outlined text-indigo-300 text-sm group-hover:translate-x-0.5 transition-transform">open_in_new</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </section>
                                    )}
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
