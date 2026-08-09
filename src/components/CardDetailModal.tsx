'use client';

import { PedagogicalContent } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { useSyncExternalStore, useEffect, useState } from 'react';
import { getFichesMemoForCard, getFicheMemoById } from '@/actions/fiche-memo-actions';
import type { FicheMemo } from '@/actions/fiche-memo-actions';
import { THEMATIC_TAG_LABELS, SAISON_LABELS } from '@/components/fiches/fiche-constants';
import FicheContent from '@/components/fiches/FicheContent';

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
    // Fiche wiki actuellement ouverte à l'intérieur du modal — reste dans le même
    // contexte plutôt que de naviguer ou d'ouvrir un nouvel onglet, pour ne pas
    // faire perdre le fil de l'accueil.
    const [viewingFicheId, setViewingFicheId] = useState<string | null>(null);
    const [viewingFiche, setViewingFiche] = useState<FicheMemo | null>(null);
    const [loadingFiche, setLoadingFiche] = useState(false);

    useEffect(() => {
        if (!isOpen || !content) { setRelatedFiches([]); return; }
        let cancelled = false;
        getFichesMemoForCard(content.tags_theme ?? [], content.tags_filtre ?? []).then(fiches => {
            if (!cancelled) setRelatedFiches(fiches);
        });
        return () => { cancelled = true; };
    }, [isOpen, content]);

    useEffect(() => {
        if (!viewingFicheId) { setViewingFiche(null); return; }
        let cancelled = false;
        setLoadingFiche(true);
        getFicheMemoById(viewingFicheId).then(fiche => {
            if (!cancelled) { setViewingFiche(fiche); setLoadingFiche(false); }
        });
        return () => { cancelled = true; };
    }, [viewingFicheId]);

    // Réinitialise la vue fiche quand le modal se ferme ou change de carte
    useEffect(() => {
        if (!isOpen) setViewingFicheId(null);
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
                        {viewingFicheId ? (
                            <div className="px-6 sm:px-8 py-5 border-b border-indigo-100 bg-indigo-50">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <button
                                        onClick={() => setViewingFicheId(null)}
                                        className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:text-indigo-800 transition-colors shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-base">arrow_back</span>
                                        Retour à la fiche
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="size-9 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-indigo-400 hover:text-indigo-900 transition-colors shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                    </button>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-indigo-950 leading-tight">
                                    {loadingFiche ? 'Chargement…' : (viewingFiche?.titre ?? 'Fiche introuvable')}
                                </h2>
                            </div>
                        ) : (
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
                        )}

                        {/* Scrollable Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {viewingFicheId ? (
                                loadingFiche ? (
                                    <div className="flex items-center justify-center py-20">
                                        <span className="animate-spin material-symbols-outlined text-3xl text-indigo-300">progress_activity</span>
                                    </div>
                                ) : viewingFiche ? (
                                    <div className="max-w-2xl mx-auto space-y-6">
                                        {(viewingFiche.tags_thematiques.length > 0 || viewingFiche.tags_saisons.length > 0) && (
                                            <div className="flex flex-wrap gap-2">
                                                {viewingFiche.tags_thematiques.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100">
                                                        {THEMATIC_TAG_LABELS[tag] ?? tag}
                                                    </span>
                                                ))}
                                                {viewingFiche.tags_saisons.map(saison => (
                                                    <span key={saison} className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">
                                                        {SAISON_LABELS[saison] ?? saison}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {viewingFiche.resume && (
                                            <p className="text-base font-semibold text-slate-600 leading-relaxed border-l-4 border-indigo-200 pl-4">
                                                {viewingFiche.resume}
                                            </p>
                                        )}
                                        <div className="pt-2 border-t border-slate-100">
                                            <FicheContent html={viewingFiche.contenu} />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-slate-400 py-20">Fiche introuvable.</p>
                                )
                            ) : (
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

                                    {/* Comment en parler aux enfants — le besoin n°1 remonté par les
                                        moniteurs : ils savent quoi savoir, pas quoi dire. Placé avant le
                                        conseil d'animation car c'est ce qu'ils viennent chercher. */}
                                    {content.accroche && (
                                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-amber-600">record_voice_over</span>
                                                <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">Comment en parler aux enfants</h3>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-black text-amber-700/70 uppercase tracking-widest block mb-1">On lance comme ça</span>
                                                <p className="text-base font-bold text-amber-950 leading-relaxed italic">
                                                    «&nbsp;{content.accroche}&nbsp;»
                                                </p>
                                            </div>

                                            {content.a_observer && (
                                                <div>
                                                    <span className="text-[10px] font-black text-amber-700/70 uppercase tracking-widest block mb-1">À leur faire observer</span>
                                                    <p className="text-sm font-medium text-amber-900 leading-relaxed">{content.a_observer}</p>
                                                </div>
                                            )}

                                            {content.a_retenir && (
                                                <div>
                                                    <span className="text-[10px] font-black text-amber-700/70 uppercase tracking-widest block mb-1">Ce qu&apos;ils doivent retenir</span>
                                                    <p className="text-sm font-bold text-amber-950 leading-relaxed">{content.a_retenir}</p>
                                                </div>
                                            )}

                                            {content.erreur_frequente && (
                                                <div className="pt-3 border-t border-amber-200">
                                                    <span className="text-[10px] font-black text-amber-700/70 uppercase tracking-widest block mb-1">L&apos;erreur classique à corriger</span>
                                                    <p className="text-sm font-medium text-amber-900 leading-relaxed">{content.erreur_frequente}</p>
                                                </div>
                                            )}
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
                                                        <button
                                                            key={idx}
                                                            onClick={() => setViewingFicheId(r.fiche_memo_id)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl hover:bg-teal-100 transition group text-left"
                                                        >
                                                            <span className="material-symbols-outlined text-teal-500 text-base shrink-0">article</span>
                                                            <span className="text-sm font-semibold text-teal-800 flex-1 min-w-0 leading-snug">{r.label}</span>
                                                            <span className="material-symbols-outlined text-teal-300 text-sm shrink-0 group-hover:translate-x-0.5 transition-transform">chevron_right</span>
                                                        </button>
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
                                                    <button
                                                        key={fiche.id}
                                                        onClick={() => setViewingFicheId(fiche.id)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition group text-left"
                                                    >
                                                        <span className="material-symbols-outlined text-indigo-500 text-base shrink-0">article</span>
                                                        <span className="text-sm font-semibold text-indigo-800 flex-1 min-w-0 leading-snug">{fiche.titre}</span>
                                                        <span className="material-symbols-outlined text-indigo-300 text-sm shrink-0 group-hover:translate-x-0.5 transition-transform">chevron_right</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                            )}
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
