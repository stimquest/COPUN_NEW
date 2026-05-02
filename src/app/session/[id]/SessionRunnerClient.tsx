'use client';

import { useState, useOptimistic, useTransition, useSyncExternalStore, useRef } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { SessionStep, PedagogicalContent } from '@/types';
import { toggleValidation } from '@/actions/validation-actions';
import { updateStageExploitStatus, uploadDefiPhoto, saveClubSpot } from '@/actions/defi-actions';
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

type SessionRunnerClientProps = {
    steps: SessionStep[];
    contentPool: PedagogicalContent[];
    links: { session_step_id: string, pedagogical_content_id: string }[];
    initialValidations: string[];
    sessionId: string;
    allSessions: { id: string, title: string, order: number }[];
    assignedExploits: StageExploit[];
    clubSpots: ClubSpot[];
    clubObservationTargets: ObservationTarget[];
};

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

function subscribe() { return () => { }; }

export default function SessionRunnerClient({
    steps, contentPool, links, initialValidations, sessionId,
    allSessions, assignedExploits, clubSpots, clubObservationTargets
}: SessionRunnerClientProps) {
    const [activeTab, setActiveTab] = useState<'running' | 'validation' | 'defis'>('running');
    const [validatedIds, setValidatedIds] = useState<string[]>(initialValidations);
    const [selectedCardForDetail, setSelectedCardForDetail] = useState<PedagogicalContent | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

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

    const handleToggleValidation = async (contentId: string) => {
        startTransition(async () => {
            addOptimisticValidation(contentId);
            setValidatedIds(prev => prev.includes(contentId) ? prev.filter(id => id !== contentId) : [...prev, contentId]);
            await toggleValidation(contentId, sessionId);
        });
    };

    const stageId = assignedExploits[0]?.stage_id;

    const handleCompleteDefi = (defiId: string, preuveUrl?: string) => {
        if (!stageId) return;
        startTransition(async () => {
            await updateStageExploitStatus(stageId, defiId, 'complete', preuveUrl);
            router.refresh();
        });
    };

    // For spot_fixe défis: GPS check → SpotGuidance → FilRougeForm
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
            // GPS unavailable — open form directly
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

    // For non-spot_fixe photo défis
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

    const getContentForStep = (stepId: string) => {
        const linkIds = links.filter(l => l.session_step_id === stepId).map(l => l.pedagogical_content_id);
        return contentPool.filter(c => linkIds.includes(c.id));
    };

    if (!isClient) return null;

    return (
        <>
            {/* Hidden inputs / overlays */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

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

            {spotGuidance && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 pt-4 pb-20">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-600">location_on</span>
                            </div>
                            <div>
                                <p className="font-black text-slate-900">
                                    {spotGuidance.isNew ? 'Première observation' : 'Spot de référence'}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">{spotGuidance.defiDescription}</p>
                            </div>
                        </div>

                        {spotGuidance.isNew ? (
                            <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-sm text-emerald-800 font-medium">
                                    Cette saisie va créer le spot de référence GPS de votre club. Les prochaines observations devront être faites au même endroit.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 font-medium">Distance au spot</span>
                                    <span className={clsx("text-sm font-black",
                                        (spotGuidance.distanceToRef ?? 0) < 20 ? "text-emerald-600" :
                                            (spotGuidance.distanceToRef ?? 0) < 50 ? "text-amber-600" : "text-red-500"
                                    )}>
                                        {spotGuidance.distanceToRef}m
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 font-medium">Direction</span>
                                    <span className="text-sm font-black text-slate-900">
                                        {spotGuidance.bearingToRef}° ({compassLabel(spotGuidance.bearingToRef ?? 0)})
                                    </span>
                                </div>
                                {(spotGuidance.distanceToRef ?? 0) > 50 && (
                                    <p className="text-xs text-amber-600">Rapprochez-vous du spot pour une meilleure correspondance</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => setSpotGuidance(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">
                                Annuler
                            </button>
                            <button onClick={handleConfirmSpot} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">edit_note</span>
                                Saisir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Session Switcher — hidden on défis tab (défis are stage-level, not per-session) */}
            {allSessions && allSessions.length > 1 && activeTab !== 'defis' && (
                <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 overflow-x-auto no-scrollbar">
                    <div className="flex px-5 py-3 gap-3 w-max">
                        {allSessions.map((s) => (
                            <button key={s.id}
                                onClick={() => { if (s.id !== sessionId) router.push(`/session/${s.id}`); }}
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

            <div className="sticky top-20.25 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 pb-4 pt-4 md:pt-2">
                <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                    {(['running', 'validation', 'defis'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "flex-1 flex items-center justify-center py-3 rounded-[12px] text-xs font-black tracking-widest transition-all",
                                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab === 'running' ? 'SÉANCE' : tab === 'validation' ? 'BILAN' : 'DÉFIS'}
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-5 py-6 max-w-md mx-auto min-h-[60vh]">

                {/* SÉANCE tab */}
                {activeTab === 'running' && (
                    <div className="relative">
                        <div className="absolute left-5 top-6 bottom-0 w-0.75 bg-slate-200 rounded-full"></div>
                        {steps.map((step) => {
                            const contents = getContentForStep(step.id);
                            const hasContent = contents.length > 0;
                            return (
                                <section key={step.id} className="relative pl-14 mb-12 last:mb-0">
                                    <div className={clsx(
                                        "absolute left-0 top-0 size-10.5 flex items-center justify-center rounded-full z-10 border-4 border-slate-50 shadow-sm",
                                        hasContent ? "bg-slate-900 text-white" : "bg-white text-slate-300 border-slate-100"
                                    )}>
                                        <span className="material-symbols-outlined text-[20px] font-bold">
                                            {hasContent ? 'explore' : 'schedule'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mb-4">
                                        <h2 className={clsx("text-base font-black uppercase tracking-tight", hasContent ? "text-slate-900" : "text-slate-400")}>
                                            {step.step_title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">timer</span>
                                            <span>{step.step_duration_minutes} min</span>
                                        </div>
                                    </div>
                                    {hasContent ? (
                                        <div className="space-y-4">
                                            {contents.map(content => {
                                                const style = DIMENSION_STYLES[content.dimension as keyof typeof DIMENSION_STYLES] || DIMENSION_STYLES.COMPRENDRE;
                                                return (
                                                    <div key={content.id} className={clsx("bg-white rounded-2xl p-5 border-l-4 border-y border-r border-slate-200 shadow-sm active:scale-[0.98] transition-transform cursor-pointer", style.border)}>
                                                        <div className="flex gap-4 items-start">
                                                            <div className={clsx("size-14 rounded-xl flex items-center justify-center shrink-0 border", style.bgIcon, style.textIcon, style.borderIcon)}>
                                                                <span className="material-symbols-outlined text-3xl">{style.icon}</span>
                                                            </div>
                                                            <div className="flex flex-col flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className={clsx("text-[10px] font-black uppercase tracking-[0.15em]", style.textPill)}>{content.dimension}</span>
                                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedCardForDetail(content); }}
                                                                        className="size-8 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-white flex items-center justify-center transition-colors">
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
                                        <div className="bg-slate-100/50 border border-dashed border-slate-300 rounded-2xl p-4 opacity-70">
                                            <p className="text-sm text-slate-500 font-medium italic">Pas de fiche pédagogique associée.</p>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}

                {/* BILAN tab */}
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
                                const sessionContentIds = new Set(
                                    links.filter(l => steps.some(s => s.id === l.session_step_id)).map(l => l.pedagogical_content_id)
                                );
                                const sessionContent = contentPool.filter(c => sessionContentIds.has(c.id));
                                if (sessionContent.length === 0) {
                                    return <p className="text-center text-sm text-slate-400 py-4 italic">Aucune fiche associée à cette séance.</p>;
                                }
                                return sessionContent.map(content => {
                                    const style = DIMENSION_STYLES[content.dimension as keyof typeof DIMENSION_STYLES] || DIMENSION_STYLES.COMPRENDRE;
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
                                            <button onClick={() => handleToggleValidation(content.id)} disabled={isPending}
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
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {/* DÉFIS tab — stage-level objectives */}
                {activeTab === 'defis' && (
                    <div className="space-y-5">
                        {/* Stage-level banner */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">eco</span>
                            </div>
                            <div>
                                <p className="font-black text-slate-900 text-sm">Objectifs du Stage</p>
                                <p className="text-xs text-emerald-700">Ces défis s&apos;appliquent à toute la semaine — pas seulement à aujourd&apos;hui.</p>
                            </div>
                        </div>

                        {assignedExploits.length === 0 ? (
                            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">mood_bad</span>
                                <p className="text-sm">Aucun défi assigné depuis le tableau de bord.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignedExploits.map(exploit => (
                                    <div key={exploit.id} className={clsx(
                                        'p-5 rounded-2xl border-2 transition-all',
                                        exploit.status === 'complete' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white shadow-sm'
                                    )}>
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
                                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                    <h3 className="font-bold text-slate-900 leading-tight">{exploit.defis.description}</h3>
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
                                                <p className="text-sm text-slate-600 font-medium mb-3">{exploit.defis.instruction}</p>

                                                {exploit.status !== 'complete' ? (
                                                    <div className="flex items-center gap-2">
                                                        {exploit.defis.spot_fixe ? (
                                                            <button
                                                                onClick={() => handleSaisirClick(exploit.exploit_id, exploit.defis.description)}
                                                                disabled={isPending || isLocating === exploit.exploit_id}
                                                                className="flex-1 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                {isLocating === exploit.exploit_id
                                                                    ? <><span className="animate-spin inline-block size-4 border-2 border-white/30 border-t-white rounded-full" />GPS…</>
                                                                    : <><span className="material-symbols-outlined text-[18px]">edit_note</span>Saisir l&apos;observation</>
                                                                }
                                                            </button>
                                                        ) : exploit.defis.type_preuve === 'photo' ? (
                                                            <button
                                                                onClick={() => handlePhotoClick(exploit.exploit_id)}
                                                                disabled={isPending || isUploading === exploit.exploit_id}
                                                                className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20"
                                                            >
                                                                {isUploading === exploit.exploit_id
                                                                    ? <><span className="animate-spin inline-block size-4 border-2 border-white/40 border-t-white rounded-full" />Envoi…</>
                                                                    : <><span className="material-symbols-outlined text-[18px]">photo_camera</span>Photo</>
                                                                }
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCompleteDefi(exploit.exploit_id)}
                                                                disabled={isPending}
                                                                className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                                                            >
                                                                Valider ce défi
                                                            </button>
                                                        )}
                                                    </div>
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
