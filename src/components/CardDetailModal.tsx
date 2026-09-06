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
    /**
     * Retenir la question depuis la fiche ouverte. Optionnel : la modale sert aussi de
     * simple lecture (accueil, bilan) où garder n'a pas de sens. Quand elle est fournie,
     * le pied propose « Garder » (qui retient et ferme) à côté de « Fermer ».
     */
    onGarder?: () => void;
    /** Déjà retenue pour la semaine : le bouton devient un retrait. */
    retenue?: boolean;
    /**
     * Plafond de sélection atteint : le bouton est désactivé et le dit, plutôt que de
     * fermer la fiche sur une action sans effet.
     */
    plafondAtteint?: boolean;
};

function subscribe() {
    return () => { };
}

export default function CardDetailModal({ isOpen, onClose, content, onGarder, retenue = false, plafondAtteint = false }: CardDetailModalProps) {
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
                            /* En-tête sobre : fond blanc, pas d'aplat coloré qui écrase le
                               titre. La couleur du pilier tient dans un point et un mot,
                               pas dans un bandeau et une pastille encadrée. */
                            <div className="px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <span className="flex items-center gap-1.5">
                                            <span className={clsx(
                                                "size-1.5 rounded-full",
                                                content.dimension === 'COMPRENDRE' ? "bg-amber-500" :
                                                    content.dimension === 'OBSERVER' ? "bg-blue-500" : "bg-emerald-500"
                                            )} />
                                            <span className={clsx(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                content.dimension === 'COMPRENDRE' ? "text-amber-600" :
                                                    content.dimension === 'OBSERVER' ? "text-blue-600" : "text-emerald-600"
                                            )}>
                                                {content.dimension}
                                            </span>
                                        </span>
                                        <h2 className="text-[21px] sm:text-2xl font-black text-slate-900 leading-[1.2] mt-1.5 text-balance">
                                            {content.question}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Scrollable Body */}
                        <div className="px-5 sm:px-7 py-6 overflow-y-auto custom-scrollbar">
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
                            /* Un seul fil de lecture, pas deux colonnes qui s'empilent sur
                               mobile en une suite de blocs encadrés. Une seule zone est
                               accentuée — celle que le moniteur vient chercher : quoi dire.
                               Tout le reste est du texte simple, hiérarchisé par la taille
                               et la graisse, pas par un fond de couleur de plus. */
                            <div className="max-w-xl mx-auto space-y-7">

                                {content.explication && (
                                    <p className="text-[16px] text-slate-700 leading-relaxed">
                                        {content.explication}
                                    </p>
                                )}

                                {/* Le besoin n°1 remonté par les moniteurs : ils savent quoi
                                    savoir, pas quoi dire. Seul bloc mis en avant. */}
                                {content.accroche && (
                                    <div className="rounded-2xl bg-amber-50/70 border border-amber-100 p-5 space-y-4">
                                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                            Comment en parler
                                        </p>

                                        <p className="text-[18px] font-bold text-amber-950 leading-snug">
                                            «&nbsp;{content.accroche}&nbsp;»
                                        </p>

                                        {content.a_observer && (
                                            <p className="text-[14px] text-amber-900/90 leading-relaxed">
                                                <span className="font-black">À faire observer — </span>
                                                {content.a_observer}
                                            </p>
                                        )}

                                        {content.a_retenir && (
                                            <p className="text-[14px] text-amber-900/90 leading-relaxed">
                                                <span className="font-black">À retenir — </span>
                                                {content.a_retenir}
                                            </p>
                                        )}

                                        {content.erreur_frequente && (
                                            <p className="text-[14px] text-amber-900/90 leading-relaxed pt-3 border-t border-amber-200/70">
                                                <span className="font-black">Ils croient souvent que — </span>
                                                {content.erreur_frequente}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {content.tip && (
                                    <p className="text-[14px] text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-4">
                                        {content.tip}
                                    </p>
                                )}

                                {/* Ressources et wiki : à la suite du fil, plus dans une
                                    colonne parallèle qui se retrouvait tout en bas sur mobile. */}
                                <div className="space-y-6">
                                    {/* RESSOURCES SECTION — liens posés à la main */}
                                    {content.ressources && content.ressources.length > 0 && (
                                        <section>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Ressources
                                            </p>
                                            <div className="space-y-1.5">
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
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                À lire dans le wiki
                                            </p>
                                            <div className="space-y-1.5">
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
                        {/* « Garder » retient ET ferme : depuis une fiche ouverte, décider
                            de la garder termine la lecture — rester sur la fiche après coup
                            obligerait à un second geste pour rien. */}
                        <div className="px-5 sm:px-7 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className={clsx(
                                    'py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors',
                                    onGarder ? 'px-5 shrink-0' : 'px-6 ml-auto',
                                )}
                            >
                                Fermer
                            </button>

                            {onGarder && (
                                <button
                                    onClick={() => { onGarder(); onClose(); }}
                                    disabled={plafondAtteint && !retenue}
                                    className={clsx(
                                        'flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors',
                                        plafondAtteint && !retenue
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : retenue
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                                    )}
                                >
                                    <span className="material-symbols-outlined text-[19px]">
                                        {retenue ? 'check' : 'favorite'}
                                    </span>
                                    {retenue ? 'Gardée' : plafondAtteint ? 'Semaine complète' : 'Garder'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
