'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useSyncExternalStore } from 'react';

type Step = {
    title: string;
    body: string;
    detail?: string;
    where?: string;
};

const STEPS: Step[] = [
    {
        title: 'Créez votre semaine',
        body: "Dates, niveau du groupe, support de pratique, et les conditions attendues : coefficient de marée et tendance météo.",
        where: 'Accueil → Nouvelle semaine',
    },
    {
        title: 'Choisissez un objectif',
        body: "Selon la marée et la météo indiquées, l'app propose 2-3 objectifs pédagogiques avec leur raison. Ce sont des suggestions — vous pouvez en prendre un autre ou l'ignorer.",
        detail: "La suggestion vaut pour toute la semaine, pas pour une journée précise. Si la météo change en cours de route, vous pouvez corriger les conditions manuellement (voir plus bas).",
    },
    {
        title: 'Transmettez pendant la sortie',
        body: "Sur le tableau de bord de la semaine : des fiches liées à votre objectif, à glisser dans la conversation quand l'occasion se présente en mer.",
        where: 'Tableau de bord → Objectifs',
    },
    {
        title: 'Relevez des défis terrain',
        body: "Une liste de défis est proposée selon les thèmes de votre semaine (identifier des espèces, estimer le vent, ramasser des déchets ciblés...). Assignez-les à la semaine, puis validez-les un par un avec une preuve simple : photo, case à cocher, confirmation, ou petit quiz.",
        where: 'Tableau de bord → Défis terrain → Gérer',
    },
    {
        title: 'Jouez un quiz avec le groupe',
        body: "En complément, un quiz rapide sur les mêmes thèmes — pour le groupe, pas pour vous noter. Il renforce ce qui vient d'être dit à l'oral.",
        where: 'Tableau de bord → Jeux',
    },
    {
        title: 'Consultez le bilan',
        body: "À la clôture de la semaine, tout ce qui a été fait est résumé automatiquement — rien à ressaisir.",
        where: 'Semaine archivée → Bilan',
    },
];

const MANAGE_CARDS = [
    {
        title: 'Corriger la marée ou la météo',
        pill: 'Modifiable',
        body: "Les conditions saisies à la création ne sont pas figées. Si la météo annoncée ne correspond plus à la réalité, ouvrez le panneau des conditions depuis le tableau de bord pour les corriger — l'objectif suggéré peut alors changer.",
    },
    {
        title: 'Suivre où vous en êtes',
        pill: 'Repère',
        body: 'Le tableau de bord affiche votre position dans la semaine (ex. "Jour 3/5") et le nombre d\'objectifs traités, de défis validés, et si le quiz a été fait.',
    },
    {
        title: 'Marquer chaque objectif',
        pill: 'Statut',
        body: "Indiquez si un objectif a été traité en entier, partiellement, ou pas du tout — et son impact réel avec le groupe. Rien n'est obligatoire : un objectif non renseigné reste neutre dans le bilan.",
    },
    {
        title: 'Ajouter des retours terrain',
        pill: 'Libre',
        body: "À tout moment, notez une observation (espèce vue, déchet trouvé, remarque du groupe) — la date se pré-remplit à maintenant mais reste modifiable.",
    },
    {
        title: 'Gérer plusieurs semaines',
        pill: 'Organisation',
        body: 'Préparez une semaine à l\'avance : elle apparaît en "prévue" jusqu\'à sa date de début, puis devient automatiquement la semaine active. Les semaines passées restent consultables en archive avec leur bilan.',
    },
];

function subscribe() {
    return () => {};
}

export function HelpGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const isClient = useSyncExternalStore(subscribe, () => true, () => false);
    if (!isClient) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-200 flex items-center justify-center px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-4 border-indigo-100"
                    >
                        {/* Header */}
                        <div className="px-6 sm:px-8 py-6 border-b bg-indigo-50 border-indigo-100 shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 bg-indigo-100 text-indigo-700">
                                        Guide rapide
                                    </span>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                        Comment fonctionne COP&apos;UN
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-10 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shrink-0"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable body */}
                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-8">
                            {/* Parcours en étapes */}
                            <div className="space-y-5">
                                {STEPS.map((step, i) => (
                                    <div key={step.title} className="flex gap-3.5">
                                        <div className="flex flex-col items-center shrink-0">
                                            <span className="size-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                                                {i + 1}
                                            </span>
                                            {i < STEPS.length - 1 && <span className="w-px flex-1 bg-slate-100 mt-1.5" />}
                                        </div>
                                        <div className="pb-1.5 min-w-0">
                                            <h3 className="text-base font-black text-slate-900 mb-1">{step.title}</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
                                            {step.detail && (
                                                <div className="mt-2 bg-slate-50 border-l-2 border-indigo-300 rounded-r-lg px-3 py-2">
                                                    <p className="text-xs text-slate-500 leading-relaxed">{step.detail}</p>
                                                </div>
                                            )}
                                            {step.where && (
                                                <span className="inline-block mt-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                                                    {step.where}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Gérer sa semaine au quotidien */}
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">En détail</h3>
                                <p className="text-lg font-black text-slate-900 mb-4">Gérer sa semaine au quotidien</p>
                                <div className="space-y-2.5">
                                    {MANAGE_CARDS.map(card => (
                                        <div key={card.title} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-black text-slate-800">{card.title}</h4>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                    {card.pill}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">{card.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* À retenir */}
                            <div className="bg-slate-900 rounded-2xl px-5 py-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">À retenir</p>
                                <div className="space-y-2.5">
                                    <div>
                                        <p className="text-xs font-black text-white">Fréquence</p>
                                        <p className="text-xs text-white/60">Un passage en début de semaine, un coup d&apos;œil pendant la sortie — pas un usage quotidien.</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white">Qui décide</p>
                                        <p className="text-xs text-white/60">Vous, toujours. L&apos;app suggère un cadre ; elle ne l&apos;impose pas.</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white">Ce qui est tracé</p>
                                        <p className="text-xs text-white/60">Uniquement ce que vous cochez ou photographiez — rien d&apos;automatique en arrière-plan.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
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
