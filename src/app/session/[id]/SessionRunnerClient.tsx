'use client';

import { useState, useOptimistic, useTransition, useSyncExternalStore, useRef } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { SessionStep, PedagogicalContent, StepTodo } from '@/types';
import { toggleValidation } from '@/actions/validation-actions';
import { updateStageExploitStatus, uploadDefiPhoto, saveClubSpot } from '@/actions/defi-actions';
import { updateStepTodo } from '@/actions/stage-actions';
import CardDetailModal from '@/components/CardDetailModal';
import FilRougeForm from '@/components/defis/FilRougeForm';

type Defi = {
    id: string;
    description: string;
    instruction: string;
    type_preuve: 'photo' | 'checkbox' | 'action' | 'quiz';
    icon: string;
    tags_theme: string[];
    stage_type: string[];
    spot_fixe: boolean;
    terrain_temps_reel: boolean;
    points: number;
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

type ClubSpot = {
    id: string;
    club_id: string;
    defi_id: string;
    gps_lat: number;
    gps_lng: number;
    bearing: number | null;
};

type ObservationTarget = { id: string; name: string; categorie: string };

type SpotGuidance = {
    defiId: string;
    defiDescription: string;
    isNew: boolean;
    lat: number;
    lng: number;
    distanceToRef?: number;
    bearingToRef?: number;
};

type Props = {
    steps: SessionStep[];
    contentPool: PedagogicalContent[];
    links: { session_step_id: string; pedagogical_content_id: string }[];
    initialValidations: string[];
    sessionId: string;
    stageId: string;
    allSessions: { id: string; title: string; order: number }[];
    assignedExploits: StageExploit[];
    clubSpots: ClubSpot[];
    clubObservationTargets: ObservationTarget[];
    todosByStep: Record<string, StepTodo[]>;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function bearingTo(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
        Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    return Math.round(((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360);
}

function compassLabel(deg: number) {
    return ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(deg / 45) % 8];
}

async function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error('GPS non supporté')); return; }
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true });
    });
}

const pointsBadgeColor = (points: number) => {
    if (points >= 5) return 'bg-amber-100 text-amber-700';
    if (points >= 3) return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-500';
};

const DIMENSION_STYLES = {
    COMPRENDRE: {
        border: 'border-l-amber-400', bgIcon: 'bg-amber-50', textIcon: 'text-amber-600',
        borderIcon: 'border-amber-100', textPill: 'text-amber-500', icon: 'psychology',
        bgSelected: 'bg-amber-500 border-amber-600 shadow-amber-500/30',
        hover: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'
    },
    OBSERVER: {
        border: 'border-l-blue-400', bgIcon: 'bg-blue-50', textIcon: 'text-blue-600',
        borderIcon: 'border-blue-100', textPill: 'text-blue-500', icon: 'visibility',
        bgSelected: 'bg-blue-500 border-blue-600 shadow-blue-500/30',
        hover: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
    },
    'PROTÉGER': {
        border: 'border-l-emerald-400', bgIcon: 'bg-emerald-50', textIcon: 'text-emerald-600',
        borderIcon: 'border-emerald-100', textPill: 'text-emerald-500', icon: 'shield',
        bgSelected: 'bg-emerald-500 border-emerald-600 shadow-emerald-500/30',
        hover: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
    }
};

function subscribe() { return () => { }; }

// ─── main component ───────────────────────────────────────────────────────────

export default function SessionRunnerClient({
    steps, contentPool, links, initialValidations, sessionId, stageId,
    allSessions, assignedExploits, clubSpots, clubObservationTargets, todosByStep,
}: Props) {
    const [activeTab, setActiveTab] = useState<'plan' | 'bilan' | 'defis'>('plan');
    const [validatedIds, setValidatedIds] = useState<string[]>(initialValidations);
    const [localTodosByStep, setLocalTodosByStep] = useState<Record<string, StepTodo[]>>(todosByStep);
    const [selectedCardForDetail, setSelectedCardForDetail] = useState<PedagogicalContent | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Défi photo / GPS state
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState<string | null>(null);
    const [spotGuidance, setSpotGuidance] = useState<SpotGuidance | null>(null);
    const [filRougeForm, setFilRougeForm] = useState<{
        defiId: string;
        defiDescription: string;
        isFirstSpot: boolean;
        gpsCoords: { lat: number; lng: number } | null;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentDefiIdRef = useRef<string | null>(null);
    const isClient = useSyncExternalStore(subscribe, () => true, () => false);

    const spotsByDefiId = new Map(clubSpots.map(s => [s.defi_id, s]));

    const [optimisticValidations, addOptimisticValidation] = useOptimistic(
        validatedIds,
        (state, newId: string) => state.includes(newId) ? state.filter(id => id !== newId) : [...state, newId]
    );

    const getContentForStep = (stepId: string) => {
        const linkIds = links.filter(l => l.session_step_id === stepId).map(l => l.pedagogical_content_id);
        return contentPool.filter(c => linkIds.includes(c.id));
    };

    const handleToggleValidation = async (contentId: string) => {
        startTransition(async () => {
            addOptimisticValidation(contentId);
            setValidatedIds(prev => prev.includes(contentId) ? prev.filter(id => id !== contentId) : [...prev, contentId]);
            await toggleValidation(contentId, sessionId);
        });
    };

    const handleToggleTodoDone = async (stepId: string, todo: StepTodo) => {
        const next = !todo.done;
        setLocalTodosByStep(prev => ({
            ...prev,
            [stepId]: (prev[stepId] ?? []).map(t => t.id === todo.id ? { ...t, done: next } : t),
        }));
        await updateStepTodo(todo.id, stageId, { done: next });
    };

    // Défi handlers
    const handleCompleteDefi = (defiId: string, preuveUrl?: string) => {
        startTransition(async () => {
            await updateStageExploitStatus(stageId, defiId, 'complete', preuveUrl);
            router.refresh();
        });
    };

    const handleSaisirClick = async (defiId: string, defiDescription: string) => {
        setIsLocating(defiId);
        try {
            const pos = await getCurrentPosition();
            const { latitude: lat, longitude: lng } = pos.coords;
            const existing = spotsByDefiId.get(defiId);
            if (existing) {
                const dist = haversineDistance(lat, lng, existing.gps_lat, existing.gps_lng);
                const cap = bearingTo(lat, lng, existing.gps_lat, existing.gps_lng);
                setSpotGuidance({ defiId, defiDescription, isNew: false, lat, lng, distanceToRef: dist, bearingToRef: cap });
            } else {
                setSpotGuidance({ defiId, defiDescription, isNew: true, lat, lng });
            }
        } catch {
            setFilRougeForm({ defiId, defiDescription, isFirstSpot: false, gpsCoords: null });
        } finally {
            setIsLocating(null);
        }
    };

    const handleConfirmSpot = () => {
        if (!spotGuidance) return;
        const { defiId, defiDescription, isNew, lat, lng } = spotGuidance;
        setSpotGuidance(null);
        setFilRougeForm({ defiId, defiDescription, isFirstSpot: isNew, gpsCoords: { lat, lng } });
    };

    const handleFilRougeSuccess = async () => {
        if (filRougeForm?.isFirstSpot && filRougeForm.gpsCoords) {
            await saveClubSpot(filRougeForm.defiId, filRougeForm.gpsCoords.lat, filRougeForm.gpsCoords.lng, null);
        }
        setFilRougeForm(null);
        router.refresh();
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
                alert('Erreur upload : ' + result.error);
            }
        } finally {
            setIsUploading(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Totals for badge counts
    const sessionContentIds = new Set(
        links.filter(l => steps.some(s => s.id === l.session_step_id)).map(l => l.pedagogical_content_id)
    );
    const sessionContent = contentPool.filter(c => sessionContentIds.has(c.id));
    const validatedCount = sessionContent.filter(c => optimisticValidations.includes(c.id)).length;

    const allTodos = steps.flatMap(s => localTodosByStep[s.id] ?? []);
    const doneTodosCount = allTodos.filter(t => t.done).length;

    const completedDefis = assignedExploits.filter(e => e.status === 'complete').length;

    if (!isClient) return null;

    return (
        <>
            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

            {/* FilRouge overlay */}
            {filRougeForm && (
                <FilRougeForm
                    defiId={filRougeForm.defiId}
                    defiDescription={filRougeForm.defiDescription}
                    stageId={stageId}
                    clubTargets={clubObservationTargets}
                    onClose={() => setFilRougeForm(null)}
                    onSuccess={handleFilRougeSuccess}
                />
            )}

            {/* Spot guidance overlay */}
            {spotGuidance && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 pt-4 pb-20">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-600">location_on</span>
                            </div>
                            <div>
                                <p className="font-black text-slate-900">{spotGuidance.isNew ? 'Première observation' : 'Spot de référence'}</p>
                                <p className="text-xs text-slate-500 font-medium">{spotGuidance.defiDescription}</p>
                            </div>
                        </div>
                        {spotGuidance.isNew ? (
                            <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-sm text-emerald-800 font-medium">Cette saisie va créer le spot de référence GPS de votre club.</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 font-medium">Distance au spot</span>
                                    <span className={clsx("text-sm font-black",
                                        (spotGuidance.distanceToRef ?? 0) < 20 ? "text-emerald-600" :
                                            (spotGuidance.distanceToRef ?? 0) < 50 ? "text-amber-600" : "text-red-500"
                                    )}>{spotGuidance.distanceToRef}m</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 font-medium">Direction</span>
                                    <span className="text-sm font-black text-slate-900">{spotGuidance.bearingToRef}° ({compassLabel(spotGuidance.bearingToRef ?? 0)})</span>
                                </div>
                                {(spotGuidance.distanceToRef ?? 0) > 50 && (
                                    <p className="text-xs text-amber-600">Rapprochez-vous du spot pour une meilleure correspondance</p>
                                )}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setSpotGuidance(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Annuler</button>
                            <button onClick={handleConfirmSpot} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">edit_note</span>Saisir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Session switcher */}
            {allSessions.length > 1 && (
                <div className="bg-white border-b border-slate-100 overflow-x-auto no-scrollbar">
                    <div className="flex px-5 py-3 gap-2 w-max">
                        {allSessions.map(s => (
                            <button key={s.id}
                                onClick={() => { if (s.id !== sessionId) router.push(`/session/${s.id}`); }}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    s.id === sessionId
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                )}
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab bar */}
            <div className="sticky top-17.25 z-40 bg-white border-b border-slate-100 px-4 py-3">
                <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                    <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon="list_alt" label="PLAN" />
                    <TabButton active={activeTab === 'bilan'} onClick={() => setActiveTab('bilan')} icon="task_alt" label="BILAN"
                        badge={sessionContent.length > 0 ? `${validatedCount}/${sessionContent.length}` : undefined}
                    />
                    <TabButton active={activeTab === 'defis'} onClick={() => setActiveTab('defis')} icon="eco" label="DÉFIS"
                        badge={assignedExploits.length > 0 ? `${completedDefis}/${assignedExploits.length}` : undefined}
                    />
                </div>
            </div>

            <main className="px-4 py-6 max-w-lg mx-auto w-full min-h-[60vh]">

                {/* ── PLAN ── */}
                {activeTab === 'plan' && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4">
                            Rappel de votre préparation — consultez avant la séance
                        </p>
                        {steps.map((step, idx) => {
                            const contents = getContentForStep(step.id);
                            const todos = localTodosByStep[step.id] ?? [];
                            const isFirst = idx === 0;
                            const isLast = idx === steps.length - 1;
                            return (
                                <div key={step.id} className={clsx(
                                    "bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm",
                                )}>
                                    {/* Step header */}
                                    <div className={clsx(
                                        "flex items-center gap-3 px-5 py-4 border-b border-slate-50",
                                        isFirst ? "bg-sky-50" : isLast ? "bg-slate-50" : "bg-white"
                                    )}>
                                        <div className={clsx(
                                            "size-8 rounded-full flex items-center justify-center shrink-0",
                                            isFirst ? "bg-sky-100 text-sky-600" : isLast ? "bg-slate-200 text-slate-500" : "bg-indigo-100 text-indigo-600"
                                        )}>
                                            <span className="material-symbols-outlined text-[16px]">
                                                {isFirst ? 'wb_sunny' : isLast ? 'nights_stay' : 'sailing'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-slate-900">{step.step_title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{step.step_duration_minutes} min</p>
                                        </div>
                                    </div>

                                    {/* Cartes pédagogiques */}
                                    {contents.length > 0 && (
                                        <div className="px-5 pt-4 pb-3 space-y-2">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Notions</p>
                                            {contents.map(content => {
                                                const style = DIMENSION_STYLES[content.dimension as keyof typeof DIMENSION_STYLES] || DIMENSION_STYLES.COMPRENDRE;
                                                return (
                                                    <button key={content.id}
                                                        onClick={() => setSelectedCardForDetail(content)}
                                                        className={clsx("w-full text-left bg-slate-50 rounded-xl px-4 py-3 border-l-4 flex items-center gap-3 hover:bg-slate-100 transition-colors", style.border)}
                                                    >
                                                        <span className={clsx("material-symbols-outlined text-[18px] shrink-0", style.textIcon)}>{style.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{content.dimension}</p>
                                                            <p className="text-xs font-bold text-slate-800 truncate">{content.question}</p>
                                                        </div>
                                                        <span className="material-symbols-outlined text-slate-300 text-[16px] shrink-0">chevron_right</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Todos en lecture seule */}
                                    {todos.length > 0 && (
                                        <div className="px-5 pt-2 pb-4 space-y-1">
                                            {contents.length > 0 && <div className="h-px bg-slate-50 mb-3" />}
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Points de cours</p>
                                            {todos.map(todo => (
                                                <div key={todo.id} className="flex items-start gap-2.5 py-1">
                                                    <span className="size-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5" />
                                                    <p className="text-xs font-medium text-slate-600 leading-snug">{todo.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {contents.length === 0 && todos.length === 0 && (
                                        <div className="px-5 py-4">
                                            <p className="text-xs text-slate-400 italic">Aucun contenu préparé pour cette étape.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── BILAN ── */}
                {activeTab === 'bilan' && (
                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                            À remplir après la séance, au calme
                        </p>

                        {/* Todos check par étape */}
                        {steps.some(s => (localTodosByStep[s.id] ?? []).length > 0) && (
                            <section className="space-y-3">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">checklist</span>
                                    Points de cours réalisés
                                </h3>
                                {steps.map(step => {
                                    const todos = localTodosByStep[step.id] ?? [];
                                    if (todos.length === 0) return null;
                                    const doneCount = todos.filter(t => t.done).length;
                                    return (
                                        <div key={step.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 bg-slate-50">
                                                <p className="text-xs font-black text-slate-700">{step.step_title}</p>
                                                <span className={clsx(
                                                    "text-[10px] font-black px-2 py-0.5 rounded-full",
                                                    doneCount === todos.length ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {doneCount}/{todos.length}
                                                </span>
                                            </div>
                                            <div className="px-5 py-3 space-y-2">
                                                {todos.map(todo => (
                                                    <button
                                                        key={todo.id}
                                                        onClick={() => handleToggleTodoDone(step.id, todo)}
                                                        className={clsx(
                                                            "w-full flex items-start gap-3 py-2.5 px-3 rounded-xl text-left transition-all active:scale-[0.98]",
                                                            todo.done ? "bg-emerald-50" : "hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "size-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all",
                                                            todo.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                                                        )}>
                                                            {todo.done && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                                                        </div>
                                                        <span className={clsx(
                                                            "text-sm font-medium leading-snug",
                                                            todo.done ? "text-emerald-700 line-through" : "text-slate-700"
                                                        )}>
                                                            {todo.text}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        )}

                        {/* Validation des notions */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">school</span>
                                Notions acquises par le groupe
                            </h3>
                            {sessionContent.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                                    <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">menu_book</span>
                                    <p className="text-sm text-slate-400 italic">Aucune fiche associée à cette séance.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {sessionContent.map(content => {
                                        const style = DIMENSION_STYLES[content.dimension as keyof typeof DIMENSION_STYLES] || DIMENSION_STYLES.COMPRENDRE;
                                        const isValidated = optimisticValidations.includes(content.id);
                                        return (
                                            <div key={content.id} className={clsx(
                                                "bg-white rounded-2xl border-l-4 border-y border-r transition-all shadow-sm",
                                                style.border,
                                                isValidated ? "bg-slate-50 opacity-80" : "border-slate-100"
                                            )}>
                                                <div className="flex items-center gap-4 px-4 py-4">
                                                    <div className={clsx("size-10 rounded-xl flex items-center justify-center shrink-0 border", style.bgIcon, style.textIcon, style.borderIcon)}>
                                                        <span className="material-symbols-outlined text-xl">{style.icon}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={clsx("text-[10px] font-black uppercase tracking-wide mb-0.5", style.textPill)}>{content.dimension}</p>
                                                        <p className="text-sm font-bold text-slate-900 leading-snug">{content.objectif}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleValidation(content.id)}
                                                        disabled={isPending}
                                                        className={clsx(
                                                            "size-11 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 shrink-0 disabled:opacity-50",
                                                            isValidated
                                                                ? `${style.bgSelected} text-white shadow-lg`
                                                                : `bg-slate-50 border-slate-200 text-slate-300 ${style.hover}`
                                                        )}
                                                    >
                                                        <span className="material-symbols-outlined text-xl">thumb_up</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* ── DÉFIS ── */}
                {activeTab === 'defis' && (
                    <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">eco</span>
                            </div>
                            <div>
                                <p className="font-black text-slate-900 text-sm">Défis du Stage</p>
                                <p className="text-xs text-emerald-700">Objectifs à réaliser sur toute la semaine.</p>
                            </div>
                        </div>

                        {assignedExploits.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">flag</span>
                                <p className="text-sm text-slate-400">Aucun défi assigné à ce stage.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {assignedExploits.map(exploit => (
                                    <div key={exploit.id} className={clsx(
                                        'rounded-2xl border-2 transition-all overflow-hidden',
                                        exploit.status === 'complete' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white shadow-sm'
                                    )}>
                                        <div className="flex items-start gap-4 p-5">
                                            <div className={clsx(
                                                'size-11 rounded-xl flex items-center justify-center shrink-0 border',
                                                exploit.status === 'complete'
                                                    ? 'bg-emerald-500 text-white border-emerald-600'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                            )}>
                                                <span className="material-symbols-outlined text-2xl">
                                                    {exploit.status === 'complete' ? 'task_alt' : exploit.defis.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                    <h3 className="font-bold text-slate-900 leading-tight text-sm">{exploit.defis.description}</h3>
                                                    {exploit.defis.spot_fixe && (
                                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            <span className="material-symbols-outlined text-xs">location_on</span>Spot
                                                        </span>
                                                    )}
                                                    <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded", pointsBadgeColor(exploit.defis.points))}>
                                                        {exploit.defis.points} pts
                                                    </span>
                                                    {exploit.status === 'complete' && (
                                                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">Validé</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mb-3 leading-snug">{exploit.defis.instruction}</p>

                                                {exploit.status !== 'complete' ? (
                                                    <div className="flex gap-2">
                                                        {exploit.defis.spot_fixe ? (
                                                            <button
                                                                onClick={() => handleSaisirClick(exploit.exploit_id, exploit.defis.description)}
                                                                disabled={isPending || isLocating === exploit.exploit_id}
                                                                className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                {isLocating === exploit.exploit_id
                                                                    ? <><span className="animate-spin inline-block size-4 border-2 border-white/30 border-t-white rounded-full" />GPS…</>
                                                                    : <><span className="material-symbols-outlined text-[16px]">edit_note</span>Saisir</>}
                                                            </button>
                                                        ) : exploit.defis.type_preuve === 'photo' ? (
                                                            <button
                                                                onClick={() => handlePhotoClick(exploit.exploit_id)}
                                                                disabled={isPending || isUploading === exploit.exploit_id}
                                                                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                {isUploading === exploit.exploit_id
                                                                    ? <><span className="animate-spin inline-block size-4 border-2 border-white/40 border-t-white rounded-full" />Envoi…</>
                                                                    : <><span className="material-symbols-outlined text-[16px]">photo_camera</span>Photo</>}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCompleteDefi(exploit.exploit_id)}
                                                                disabled={isPending}
                                                                className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                                                            >
                                                                Valider
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    exploit.preuves_url?.length > 0 && (
                                                        <div className="flex gap-2 flex-wrap">
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

function TabButton({ active, onClick, icon, label, badge }: {
    active: boolean;
    onClick: () => void;
    icon: string;
    label: string;
    badge?: string;
}) {
    return (
        <button onClick={onClick} className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-3 rounded-[10px] text-[11px] font-black tracking-widest transition-all relative",
            active ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
        )}>
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            {label}
            {badge && (
                <span className={clsx(
                    "absolute top-1.5 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none",
                    active ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-500"
                )}>
                    {badge}
                </span>
            )}
        </button>
    );
}
