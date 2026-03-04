'use client';

import { useState, useOptimistic, useTransition, useSyncExternalStore, useRef } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { SessionStep, PedagogicalContent } from '@/types';
import { toggleValidation } from '@/actions/validation-actions';
import { updateStageExploitStatus, uploadDefiPhoto } from '@/actions/defi-actions';
import CardDetailModal from '@/components/CardDetailModal';

type Defi = {
    id: string;
    description: string;
    instruction: string;
    type_preuve: 'photo' | 'checkbox' | 'action' | 'quiz';
    icon: string;
    tags_theme: string[];
    stage_type: string[];
};

type StageExploit = {
    id: string;
    stage_id: string;
    exploit_id: string;
    status: 'en_cours' | 'complete';
    completed_at: string | null;
    preuves_url: string[];
    defis: Defi;
};

type SessionRunnerClientProps = {
    steps: SessionStep[];
    contentPool: PedagogicalContent[];
    links: { session_step_id: string, pedagogical_content_id: string }[];
    initialValidations: string[]; // List of validated content IDs
    sessionId: string;
    allSessions: { id: string, title: string, order: number }[];
    assignedExploits: StageExploit[];
};

// Helper for useSyncExternalStore to detect client-side rendering
function subscribe() {
    return () => { };
}

export default function SessionRunnerClient({ steps, contentPool, links, initialValidations, sessionId, allSessions, assignedExploits }: SessionRunnerClientProps) {
    const [activeTab, setActiveTab] = useState<'running' | 'validation' | 'defis'>('running');
    const [validatedIds, setValidatedIds] = useState<string[]>(initialValidations);
    const [selectedCardForDetail, setSelectedCardForDetail] = useState<PedagogicalContent | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [isUploading, setIsUploading] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentDefiIdRef = useRef<string | null>(null);

    // Use useSyncExternalStore to determine if we are on the client
    const isClient = useSyncExternalStore(subscribe, () => true, () => false);

    // Optimistic UI updates
    const [optimisticValidations, addOptimisticValidation] = useOptimistic(
        validatedIds,
        (state, newValidationId: string) => {
            return state.includes(newValidationId)
                ? state.filter(id => id !== newValidationId)
                : [...state, newValidationId];
        }
    );

    const handleToggleValidation = async (contentId: string) => {
        startTransition(async () => {
            addOptimisticValidation(contentId);
            setValidatedIds(prev => prev.includes(contentId) ? prev.filter(id => id !== contentId) : [...prev, contentId]); // Sync local state
            await toggleValidation(contentId, sessionId);
        });
    };

    const handleCompleteDefi = (defiId: string, preuveUrl?: string) => {
        const stageId = assignedExploits[0]?.stage_id;
        if (!stageId) return;
        startTransition(async () => {
            await updateStageExploitStatus(stageId, defiId, 'complete', preuveUrl);
            router.refresh(); // Refresh page to secure new stats/images
        });
    };

    const handlePhotoClick = (defiId: string) => {
        currentDefiIdRef.current = defiId;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const defiId = currentDefiIdRef.current;
        if (!file || !defiId) return;

        setIsUploading(defiId);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadDefiPhoto(formData);

            if (result.success && result.url) {
                handleCompleteDefi(defiId, result.url);
            } else {
                alert('Erreur d\'upload : ' + result.error);
            }
        } finally {
            setIsUploading(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const DIMENSION_STYLES = {
        COMPRENDRE: {
            border: 'border-l-amber-400',
            bgIcon: 'bg-amber-50',
            textIcon: 'text-amber-600',
            borderIcon: 'border-amber-100',
            textPill: 'text-amber-500',
            icon: 'psychology',
            bgSelected: 'bg-amber-500 border-amber-600 shadow-amber-500/30',
            hover: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'
        },
        OBSERVER: {
            border: 'border-l-blue-400',
            bgIcon: 'bg-blue-50',
            textIcon: 'text-blue-600',
            borderIcon: 'border-blue-100',
            textPill: 'text-blue-500',
            icon: 'visibility',
            bgSelected: 'bg-blue-500 border-blue-600 shadow-blue-500/30',
            hover: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
        },
        PROTÉGER: {
            border: 'border-l-emerald-400',
            bgIcon: 'bg-emerald-50',
            textIcon: 'text-emerald-600',
            borderIcon: 'border-emerald-100',
            textPill: 'text-emerald-500',
            icon: 'shield',
            bgSelected: 'bg-emerald-500 border-emerald-600 shadow-emerald-500/30',
            hover: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
        }
    };

    const getContentForStep = (stepId: string) => {
        const linkIds = links.filter(l => l.session_step_id === stepId).map(l => l.pedagogical_content_id);
        return contentPool.filter(c => linkIds.includes(c.id));
    };

    // Render nothing on the server to avoid hydration mismatches if client-specific logic is involved
    if (!isClient) return null;

    return (
        <>
            {/* Session Switcher (Horizontal Scroll) */}
            {allSessions && allSessions.length > 1 && (
                <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 overflow-x-auto no-scrollbar">
                    <div className="flex px-5 py-3 gap-3 w-max">
                        {allSessions.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    if (s.id !== sessionId) {
                                        router.push(`/session/${s.id}`);
                                    }
                                }}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    s.id === sessionId
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                        : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                )}
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="sticky top-[81px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 pb-4 pt-4 md:pt-2">
                <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('running')}
                        className={clsx(
                            "flex-1 flex items-center justify-center py-3 rounded-[12px] text-xs font-black tracking-widest transition-all",
                            activeTab === 'running' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        SÉANCE
                    </button>
                    <button
                        onClick={() => setActiveTab('validation')}
                        className={clsx(
                            "flex-1 flex items-center justify-center py-3 rounded-[12px] text-xs font-black tracking-widest transition-all",
                            activeTab === 'validation' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        BILAN
                    </button>
                    <button
                        onClick={() => setActiveTab('defis')}
                        className={clsx(
                            "flex-1 flex items-center justify-center py-3 rounded-[12px] text-xs font-black tracking-widest transition-all",
                            activeTab === 'defis' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        DÉFIS
                    </button>
                </div>
            </div>

            <main className="px-5 py-6 max-w-md mx-auto min-h-[60vh]">
                {/* Hidden Photo Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                />
                {activeTab === 'running' && (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[20px] top-6 bottom-0 w-[3px] bg-slate-200 rounded-full"></div>

                        {steps.map((step) => {
                            const contents = getContentForStep(step.id);
                            const hasContent = contents.length > 0;

                            return (
                                <section key={step.id} className="relative pl-14 mb-12 last:mb-0">
                                    {/* Timeline Icon */}
                                    <div className={clsx(
                                        "absolute left-0 top-0 size-[42px] flex items-center justify-center rounded-full z-10 border-4 border-slate-50 shadow-sm",
                                        hasContent ? "bg-slate-900 text-white" : "bg-white text-slate-300 border-slate-100"
                                    )}>
                                        <span className="material-symbols-outlined text-[20px] font-bold">
                                            {hasContent ? 'explore' : 'schedule'}
                                        </span>
                                    </div>

                                    {/* Header Step */}
                                    <div className="flex flex-col gap-0.5 mb-4">
                                        <h2 className={clsx("text-base font-black uppercase tracking-tight", hasContent ? "text-slate-900" : "text-slate-400")}>
                                            {step.step_title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">timer</span>
                                            <span>{step.step_duration_minutes} min</span>
                                        </div>
                                    </div>

                                    {/* Cards (Notions) */}
                                    {hasContent ? (
                                        <div className="space-y-4">
                                            {contents.map(content => {
                                                const style = DIMENSION_STYLES[content.dimension] || DIMENSION_STYLES.COMPRENDRE;
                                                return (
                                                    <div key={content.id} className={clsx("bg-white rounded-2xl p-5 border-l-4 border-y border-r border-slate-200 shadow-sm active:scale-[0.98] transition-transform cursor-pointer", style.border)}>
                                                        <div className="flex gap-4 items-start">
                                                            <div className={clsx("size-14 rounded-xl flex items-center justify-center shrink-0 border", style.bgIcon, style.textIcon, style.borderIcon)}>
                                                                <span className="material-symbols-outlined text-3xl">
                                                                    {style.icon}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className={clsx("text-[10px] font-black uppercase tracking-[0.15em]", style.textPill)}>{content.dimension}</span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedCardForDetail(content);
                                                                        }}
                                                                        className="size-8 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white flex items-center justify-center transition-colors"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                                    </button>
                                                                </div>
                                                                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{content.question}</h3>
                                                                <p className="text-xs text-slate-600 font-medium">{content.objectif}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        // Empty state for simple steps
                                        <div className="bg-slate-100/50 border border-dashed border-slate-300 rounded-2xl p-4 opacity-70">
                                            <p className="text-sm text-slate-500 font-medium italic">Pas de fiche pédagogique associée.</p>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'validation' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
                            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">check_circle</span>
                            <h2 className="text-xl font-black text-slate-900 mb-2">Bilan de Séance</h2>
                            <p className="text-slate-500 text-sm">Validez les notions acquises par le groupe aujourd&apos;hui.</p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Notions du jour</h3>
                            {(() => {
                                // Filter content to only show what is used in this session
                                const sessionContentIds = new Set(
                                    links
                                        .filter(l => steps.some(s => s.id === l.session_step_id))
                                        .map(l => l.pedagogical_content_id)
                                );
                                const sessionContent = contentPool.filter(c => sessionContentIds.has(c.id));

                                if (sessionContent.length === 0) {
                                    return <p className="text-center text-sm text-slate-400 py-4 italic">Aucune fiche associée à cette séance.</p>;
                                }

                                return sessionContent.map(content => {
                                    const style = DIMENSION_STYLES[content.dimension] || DIMENSION_STYLES.COMPRENDRE;
                                    return (
                                        <div key={content.id} className="bg-white rounded-xl p-4 flex items-center justify-between border border-slate-200 shadow-sm">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{content.objectif}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {content.tags_filtre && content.tags_filtre.map(tag => (
                                                        <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleValidation(content.id)}
                                                    disabled={isPending}
                                                    className={clsx(
                                                        "size-10 rounded-full border flex items-center justify-center transition-all active:scale-95",
                                                        optimisticValidations.includes(content.id)
                                                            ? `${style.bgSelected} text-white`
                                                            : `bg-slate-50 border-slate-200 text-slate-300 ${style.hover}`
                                                    )}
                                                >
                                                    <span className="material-symbols-outlined">thumb_up</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'defis' && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100 text-center">
                            <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">workspace_premium</span>
                            <h2 className="text-xl font-black text-slate-900 mb-2">Défis Terrain</h2>
                            <p className="text-emerald-700 text-sm font-medium">Validez vos missions écologiques en direct sur l&apos;eau.</p>
                        </div>

                        {assignedExploits && assignedExploits.length === 0 ? (
                            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">mood_bad</span>
                                <p>Aucun défi n&apos;a été assigné pour ce stage depuis le tableau de bord.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignedExploits.map(exploit => (
                                    <div
                                        key={exploit.id}
                                        className={clsx(
                                            'p-5 rounded-2xl border-2 transition-all',
                                            exploit.status === 'complete'
                                                ? 'border-emerald-200 bg-emerald-50'
                                                : 'border-slate-200 bg-white shadow-sm'
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={clsx(
                                                'size-12 rounded-xl flex items-center justify-center shrink-0 border',
                                                exploit.status === 'complete' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-100 text-slate-500 border-slate-200'
                                            )}>
                                                <span className="material-symbols-outlined text-2xl">
                                                    {exploit.status === 'complete' ? 'task_alt' : exploit.defis.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 leading-tight pr-2">{exploit.defis.description}</h3>
                                                    {exploit.status === 'complete' && (
                                                        <span className="shrink-0 text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/50 px-2 py-1 rounded-lg">Validé</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium mb-3">{exploit.defis.instruction}</p>

                                                {/* Actions */}
                                                <div className="flex items-center gap-3">
                                                    {exploit.status !== 'complete' ? (
                                                        <>
                                                            {exploit.defis.type_preuve === 'checkbox' && (
                                                                <button
                                                                    onClick={() => handleCompleteDefi(exploit.exploit_id)}
                                                                    disabled={isPending}
                                                                    className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                                                                >
                                                                    Valider ce défi
                                                                </button>
                                                            )}
                                                            {exploit.defis.type_preuve === 'photo' && (
                                                                <button
                                                                    onClick={() => handlePhotoClick(exploit.exploit_id)}
                                                                    disabled={isPending || isUploading === exploit.exploit_id}
                                                                    className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20"
                                                                >
                                                                    {isUploading === exploit.exploit_id ? (
                                                                        <><span className="animate-spin inline-block size-4 border-2 border-white/40 border-t-white rounded-full" /> Envoi...</>
                                                                    ) : (
                                                                        <><span className="material-symbols-outlined text-[18px]">photo_camera</span> Prendre une photo</>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        exploit.preuves_url && exploit.preuves_url.length > 0 && (
                                                            <div className="flex gap-2">
                                                                {exploit.preuves_url.map((url, idx) => (
                                                                    <div key={idx} className="relative size-16 rounded-xl overflow-hidden border-2 border-emerald-200">
                                                                        <img src={url} alt="Preuve" className="size-full object-cover" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <CardDetailModal
                isOpen={!!selectedCardForDetail}
                onClose={() => setSelectedCardForDetail(null)}
                content={selectedCardForDetail}
            />
        </>
    );
}
