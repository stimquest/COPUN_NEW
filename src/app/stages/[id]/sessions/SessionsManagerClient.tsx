'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { linkCardToStep, unlinkCardFromStep, initializeStageSessions, createSession, updateSession, updateStep, addStep, deleteStep, applyTemplateToSession } from '@/actions/stage-actions';
import { Stage, Session, PedagogicalContent, SessionStep } from '@/types';
import { useRouter } from 'next/navigation';
import { SESSION_TEMPLATES, SessionTemplate } from '@/data/session-templates';
import CardDetailModal from '@/components/CardDetailModal';

type SessionWithSteps = Session & { steps: SessionStep[] };

export default function SessionsManagerClient({
    stage,
    initialSessions,
    fullPool,
    initialLinks
}: {
    stage: Stage,
    initialSessions: SessionWithSteps[],
    fullPool: PedagogicalContent[],
    initialLinks: { session_step_id: string, pedagogical_content_id: string }[]
}) {
    const router = useRouter();
    const [links, setLinks] = useState<Record<string, string[]>>(() => {
        const map: Record<string, string[]> = {};
        initialLinks.forEach(link => {
            if (!map[link.session_step_id]) map[link.session_step_id] = [];
            map[link.session_step_id].push(link.pedagogical_content_id);
        });
        return map;
    });

    const selectedPool = useMemo(() => {
        const selectedIds = stage.selected_content || [];
        return fullPool.filter(c => selectedIds.includes(c.id));
    }, [fullPool, stage.selected_content]);

    const [activeStepId, setActiveStepId] = useState<string | null>(null);
    const [stepToDelete, setStepToDelete] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [targetSessionId, setTargetSessionId] = useState<string | null>(null);
    const [selectedCardForDetail, setSelectedCardForDetail] = useState<PedagogicalContent | null>(null);

    const handleInitializeWeek = async () => {
        setIsInitializing(true);
        const res = await initializeStageSessions(stage.id);
        if (res.success) {
            router.refresh();
        } else {
            alert("Erreur d'initialisation : " + res.error);
        }
        setIsInitializing(false);
    };

    const handleApplyTemplate = async (templateId: string) => {
        if (!targetSessionId) return;
        setIsInitializing(true);
        const res = await applyTemplateToSession(targetSessionId, stage.id, templateId);
        if (res.success) {
            router.refresh();
            setShowTemplatePicker(false);
            setTargetSessionId(null);
        } else {
            alert("Erreur d'application : " + res.error);
        }
        setIsInitializing(false);
    };

    const handleAddSession = async (templateId: string) => {
        setIsInitializing(true);
        const order = initialSessions.length + 1;
        const res = await createSession(stage.id, templateId, order);
        if (res.success) {
            router.refresh();
            setShowTemplatePicker(false);
        } else {
            alert("Erreur creation : " + res.error);
        }
        setIsInitializing(false);
    };

    const handleToggleLink = async (stepId: string, cardId: string) => {
        const currentLinks = links[stepId] || [];
        const isLinked = currentLinks.includes(cardId);
        const nextLinks = isLinked ? currentLinks.filter(id => id !== cardId) : [...currentLinks, cardId];
        setLinks(prev => ({ ...prev, [stepId]: nextLinks }));
        try {
            if (isLinked) await unlinkCardFromStep(stepId, cardId);
            else await linkCardToStep(stepId, cardId);
        } catch (err) {
            console.error(err);
            setLinks(prev => ({ ...prev, [stepId]: currentLinks }));
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-32">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <Link href={`/stages/${stage.id}`} className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Étape 2</h1>
                    <p className="text-lg font-bold leading-none text-slate-900">Le Planning</p>
                </div>
            </header>

            <main className="px-5 py-8 max-w-xl md:max-w-4xl mx-auto w-full space-y-12">
                {initialSessions.length > 0 ? (
                    initialSessions.map(session => {
                        const steps = [...(session.steps || [])].sort((a, b) => a.step_order - b.step_order);
                        const firstStep = steps[0];
                        const lastStep = steps[steps.length - 1];
                        const activitySteps = steps.slice(1, -1);

                        const renderStep = (step: SessionStep, variant: 'FIXED' | 'ACTIVITY') => {
                            const linkedIds = links[step.id] || [];
                            const linkedCards = fullPool.filter(c => linkedIds.includes(c.id));
                            const isActivity = variant === 'ACTIVITY';

                            return (
                                <div key={step.id} className={clsx(
                                    "p-5 transition-all space-y-3",
                                    isActivity ? "bg-white" : "bg-slate-50 rounded-2xl border border-slate-100"
                                )}>
                                    <div className="flex justify-between items-start group/step">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-300 text-[18px]">
                                                    {step.step_order === 1 ? 'wb_sunny' : step.step_order === steps.length ? 'nights_stay' : 'sailing'}
                                                </span>
                                                <input
                                                    key={step.step_title}
                                                    className="text-sm font-black text-slate-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-100 rounded-md w-full"
                                                    defaultValue={step.step_title}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                                    onBlur={(e) => updateStep(step.id, stage.id, { step_title: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pl-7">
                                                <input
                                                    key={step.step_duration_minutes}
                                                    type="number"
                                                    className="text-[10px] font-bold text-slate-400 bg-transparent w-8 border-none outline-none focus:ring-2 focus:ring-indigo-100 rounded"
                                                    defaultValue={step.step_duration_minutes}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                                    onBlur={(e) => updateStep(step.id, stage.id, { step_duration_minutes: parseInt(e.target.value) })}
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">min</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isActivity && (
                                                <button
                                                    onClick={() => setStepToDelete(step.id)}
                                                    className="size-9 rounded-full border-2 border-red-50 bg-white text-red-300 flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95"
                                                    title="Supprimer l'étape"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setActiveStepId(step.id)}
                                                className={clsx(
                                                    "size-9 rounded-full border-2 flex items-center justify-center transition-all active:scale-95",
                                                    linkedCards.length > 0 ? "bg-indigo-600 text-white border-indigo-600 shadow-lg" : "bg-white text-indigo-400 border-indigo-50"
                                                )}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">link</span>
                                            </button>
                                        </div>
                                    </div>

                                    {linkedCards.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1 pl-7">
                                            {linkedCards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    onClick={() => setSelectedCardForDetail(card)}
                                                    className="bg-white border border-slate-200 pl-3 pr-1 py-1 rounded-lg flex items-center justify-between gap-3 shadow-sm hover:border-indigo-100 hover:bg-slate-50 transition-all cursor-pointer group active:scale-95 w-full max-w-[280px] md:max-w-sm"
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                        <span className={clsx("size-2 rounded-full shrink-0",
                                                            card.dimension === 'COMPRENDRE' ? "bg-amber-400" :
                                                                card.dimension === 'OBSERVER' ? "bg-blue-400" : "bg-emerald-400"
                                                        )}></span>
                                                        <span className="text-[11px] font-bold text-slate-700 truncate block" title={card.question}>{card.question}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleLink(step.id, card.id);
                                                        }}
                                                        className="size-6 rounded-md flex items-center justify-center shrink-0 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                        title="Retirer la notion"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        };

                        return (
                            <div key={session.id} className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50">
                                    <input
                                        key={session.title}
                                        className="text-xl font-black text-slate-900 uppercase bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-100 rounded-lg px-2 flex-1"
                                        defaultValue={session.title}
                                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                        onBlur={(e) => updateSession(session.id, stage.id, { title: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined text-slate-200 font-bold">drag_handle</span>
                                </div>

                                <div className="p-6 space-y-4">
                                    {steps.length === 0 ? (
                                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                            <div className="size-16 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm">
                                                <span className="material-symbols-outlined text-3xl">auto_fix</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 uppercase tracking-tight italic">Séance non définie</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Appliquez un modèle pour commencer.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setTargetSessionId(session.id);
                                                    setShowTemplatePicker(true);
                                                }}
                                                className="px-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 active:scale-95 transition-all shadow-sm"
                                            >
                                                Choisir un Squelette
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Sandwich: Briefing */}
                                            <div className="space-y-4">
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-4 px-2">
                                                    <span>Lancement</span>
                                                    <span className="h-px bg-slate-100 flex-1"></span>
                                                </div>
                                                {firstStep && renderStep(firstStep, 'FIXED')}
                                            </div>

                                            {/* Sandwich: Activity Zone */}
                                            <div className="space-y-4">
                                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-4 px-2 mt-4">
                                                    <span>Activité Navigation</span>
                                                    <span className="h-px bg-indigo-100 flex-1"></span>
                                                </div>
                                                <div className="bg-indigo-50/20 rounded-3xl border-2 border-dashed border-indigo-100/30 overflow-hidden divide-y divide-indigo-50/50">
                                                    {activitySteps.map(step => renderStep(step, 'ACTIVITY'))}
                                                    <button
                                                        onClick={() => addStep(session.id, stage.id, lastStep ? lastStep.step_order : 2)}
                                                        className="w-full py-4 bg-white/40 flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-600 transition-all text-[9px] font-black uppercase tracking-widest"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                                        Ajouter une étape
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sandwich: Debriefing */}
                                            <div className="space-y-4">
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-4 px-2 mt-4">
                                                    <span>Clôture</span>
                                                    <span className="h-px bg-slate-100 flex-1"></span>
                                                </div>
                                                {lastStep && lastStep !== firstStep && renderStep(lastStep, 'FIXED')}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                        <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <span className="material-symbols-outlined text-4xl">calendar_today</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase italic mb-2">Planning Vide</h2>
                        <p className="text-sm font-medium text-slate-500 mb-8">Aucune séance n&apos;est définie pour ce stage.</p>
                        <button
                            onClick={handleInitializeWeek}
                            className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-center px-4"
                        >
                            <span className="material-symbols-outlined">auto_fix</span>
                            Générer la structure (5 jours)
                        </button>
                    </div>
                )}
            </main>

            {initialSessions.length > 0 && (
                <div className="fixed bottom-24 md:bottom-8 right-6 z-40">
                    <button
                        onClick={() => {
                            setTargetSessionId(null);
                            setShowTemplatePicker(true);
                        }}
                        className="size-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </button>
                </div>
            )}

            <AnimatePresence>
                {showTemplatePicker && (
                    <TemplateSelectorModal
                        templates={SESSION_TEMPLATES}
                        onSelect={targetSessionId ? handleApplyTemplate : handleAddSession}
                        onClose={() => {
                            setShowTemplatePicker(false);
                            setTargetSessionId(null);
                        }}
                        isInitializing={isInitializing}
                        isBatch={false}
                    />
                )}
            </AnimatePresence>


            <AnimatePresence>
                {activeStepId && (
                    <CardSelectorModal
                        pool={selectedPool}
                        currentLinks={links[activeStepId] || []}
                        allStageLinks={links}
                        activeStepId={activeStepId}
                        onToggle={(cardId: string) => handleToggleLink(activeStepId, cardId)}
                        onClose={() => setActiveStepId(null)}
                        stageId={stage.id}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {stepToDelete && (
                    <ConfirmationModal
                        title="Supprimer l'étape ?"
                        description="Cette action est irréversible. L'étape sera retirée du planning."
                        confirmLabel="Supprimer"
                        onConfirm={() => {
                            if (stepToDelete) deleteStep(stepToDelete, stage.id);
                            setStepToDelete(null);
                        }}
                        onClose={() => setStepToDelete(null)}
                    />
                )}
            </AnimatePresence>

            <CardDetailModal
                isOpen={!!selectedCardForDetail}
                onClose={() => setSelectedCardForDetail(null)}
                content={selectedCardForDetail}
            />
        </div>
    );
}

function ConfirmationModal({ title, description, confirmLabel, onConfirm, onClose }: {
    title: string,
    description: string,
    confirmLabel: string,
    onConfirm: () => void,
    onClose: () => void
}) {
    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-6" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] p-8 text-center shadow-2xl max-w-sm w-full z-100 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="size-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">delete</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">{title}</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">{description}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 h-14 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-200 transition-colors">
                        Annuler
                    </button>
                    <button onClick={onConfirm} className="flex-1 h-14 bg-red-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg shadow-red-200 hover:bg-red-600 transition-colors">
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </>
    );
}

function TemplateSelectorModal({ templates, onSelect, onClose, isInitializing, isBatch }: {
    templates: SessionTemplate[],
    onSelect: (id: string) => void,
    onClose: () => void,
    isInitializing: boolean,
    isBatch: boolean
}) {
    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-70 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase italic">Choisir un Squelette</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {isBatch ? 'Initialiser la semaine complète' : 'Ajouter une session personnalisée'}
                        </p>
                    </div>
                    <button onClick={onClose} className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined font-bold">close</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => onSelect(t.id)}
                            disabled={isInitializing}
                            className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl text-left hover:border-indigo-600 hover:bg-indigo-50/30 transition-all group active:scale-[0.98] relative overflow-hidden disabled:opacity-50"
                        >
                            <div className="flex items-start gap-5 relative z-10">
                                <div className="size-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200">
                                    <span className="material-symbols-outlined text-3xl">{t.icon}</span>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-slate-900 uppercase leading-none">{t.label}</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{t.description}</p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {t.steps.map((s, idx) => (
                                            <span key={idx} className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                                                {s.title}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {isInitializing && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
                                    <span className="animate-spin material-symbols-outlined text-indigo-600">progress_activity</span>
                                </div>
                            )}
                        </button>
                    ))}
                    <div className="h-20" />
                </div>
            </motion.div>
        </>
    );
}

function CardSelectorModal({ pool, currentLinks, allStageLinks, activeStepId, onToggle, onClose, stageId }: {
    pool: PedagogicalContent[],
    currentLinks: string[],
    allStageLinks: Record<string, string[]>,
    activeStepId: string,
    onToggle: (cardId: string) => void,
    onClose: () => void,
    stageId: string
}) {
    const otherLinkedCardIds = useMemo(() => {
        const ids = new Set<string>();
        Object.entries(allStageLinks).forEach(([stepId, cardIds]) => {
            if (stepId !== activeStepId) {
                cardIds.forEach(id => ids.add(id));
            }
        });
        return ids;
    }, [allStageLinks, activeStepId]);

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-70 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase italic">Réservoir de Stage</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sélectionner les notions du jour</p>
                    </div>
                    <button onClick={onClose} className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined font-bold">close</span></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {pool.length > 0 ? (
                        pool.map((card) => {
                            const isLinkedHere = currentLinks.includes(card.id);
                            const isLinkedElsewhere = otherLinkedCardIds.has(card.id);

                            return (
                                <div
                                    key={card.id}
                                    onClick={() => onToggle(card.id)}
                                    className={clsx(
                                        "p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden",
                                        isLinkedHere ? "bg-indigo-50 border-indigo-600 shadow-md translate-x-1" : "bg-white border-slate-100"
                                    )}
                                >
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex gap-4 items-center flex-1">
                                            <div className={clsx("size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", card.dimension === 'COMPRENDRE' ? "bg-amber-100 text-amber-600" : card.dimension === 'OBSERVER' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600")}>
                                                <span className="material-symbols-outlined text-2xl">{card.dimension === 'COMPRENDRE' ? 'psychology' : card.dimension === 'OBSERVER' ? 'visibility' : 'nature'}</span>
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-black text-slate-900 leading-tight">{card.question}</h4>
                                                {isLinkedElsewhere && !isLinkedHere && (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-[12px]">history</span> Déjà utilisé
                                                    </span>
                                                )}
                                                {isLinkedHere && (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-[12px]">task_alt</span> Assigné ici
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={clsx("size-8 rounded-full flex items-center justify-center transition-all", isLinkedHere ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-50 text-slate-300")}>
                                            <span className="material-symbols-outlined text-[20px] font-bold">{isLinkedHere ? 'done' : 'add'}</span>
                                        </div>
                                    </div>
                                    {isLinkedElsewhere && !isLinkedHere && (
                                        <div className="absolute top-0 right-0 py-1 px-3 bg-indigo-100 rounded-bl-xl">
                                            <span className="text-[8px] font-black text-indigo-600 uppercase">Stage</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">inventory_2</span>
                            <p className="text-slate-400 font-bold mb-4">Vos objectifs (Étape 1) sont vides.</p>
                            <Link href={`/stages/${stageId}/program`} className="inline-block px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Choisir les objectifs</Link>
                        </div>
                    )}
                    <div className="h-32" />
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100 z-10">
                    <button onClick={onClose} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all">TERMINER LA SÉLECTION</button>
                </div>
            </motion.div>
        </>
    );
}
