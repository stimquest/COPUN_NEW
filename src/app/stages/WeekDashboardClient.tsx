'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { WeekObservation, PedagogicalAction, PedagogicalContent, ObservationType } from '@/types';
import { StagePreparation } from '@/actions/preparation-actions';
import ProgrammeCondense from '@/components/ProgrammeCondense';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';
import { DEFAULT_WASTE_TYPES } from '@/data/littoral-species';
import { OBSERVATION_TYPES, SPECIES_CATEGORY_LABELS, SPECIES_CATEGORY_ORDER } from '@/data/observations';
import { PILLARS } from '@/data/etages';
import { parseStageDateRange } from '@/lib/stage-dates';
import { SPORT_FEATURES_ENABLED } from '@/lib/feature-flags';
import { addObservation, deleteObservation } from '@/actions/observation-actions';
import { saveObjectiveStatus, saveObjectiveImpact, clearObjectiveStatus, updateStagePool } from '@/actions/stage-actions';
import { updateStageExploitStatus, uploadDefiPhoto } from '@/actions/defi-actions';
import FilRougeForm from '@/components/defis/FilRougeForm';
import { DeleteStageButton } from '@/components/DeleteStageButton';
import CardDetailModal from '@/components/CardDetailModal';
import { HelpGuideModal } from '@/components/HelpGuideModal';
import { PointsGainedBadge, usePointsGainedBadge } from '@/components/PointsGainedBadge';
import { compressImage } from '@/lib/image-compression';
import { getStageObjectiveImpactOptions, getStageObjectiveReasonOptions } from '@/lib/stage-objective-review';

type DefiInfo = {
    id: string;
    description: string;
    instruction: string;
    type_preuve: 'photo' | 'checkbox' | 'action' | 'quiz';
    icon: string;
    points: number;
    spot_fixe: boolean;
};

type StageExploit = {
    id: string;
    stage_id: string;
    exploit_id: string;
    status: 'en_cours' | 'complete';
    completed_at: string | null;
    preuves_url: string[];
    structured_data: Record<string, unknown> | null;
    defis: DefiInfo;
};

type ObservationTarget = { id: string; name: string; categorie: string };

// Défis nécessitant une saisie structurée (catégorisation/comptage) plutôt qu'une simple photo
const STRUCTURED_DEFI_IDS = new Set(['defi_bio_2', 'defi_laisse_1', 'defi_erosion_1', 'defi_faune_1']);

// ── Exploit card (validation inline) ──────────────────────────────────────────

function ExploitCard({ exploit, stageId, clubObservationTargets }: { exploit: StageExploit; stageId: string; clubObservationTargets: ObservationTarget[] }) {
    const [isPending, startTransition] = useTransition();
    const [localStatus, setLocalStatus] = useState(exploit.status);
    const [localPhotos, setLocalPhotos] = useState<string[]>(exploit.preuves_url ?? []);
    const [uploading, setUploading] = useState(false);
    const [showStructuredForm, setShowStructuredForm] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const defi = exploit.defis;
    const done = localStatus === 'complete';
    const isStructured = STRUCTURED_DEFI_IDS.has(exploit.exploit_id);
    const { points: pointsGained, triggerGain } = usePointsGainedBadge();
    const [flash, setFlash] = useState(false);

    const celebrate = (pointsAwarded: number) => {
        triggerGain(pointsAwarded);
        if (pointsAwarded > 0) {
            setFlash(true);
            setTimeout(() => setFlash(false), 700);
        }
    };

    const validate = () => {
        setLocalStatus('complete');
        startTransition(async () => {
            const res = await updateStageExploitStatus(stageId, exploit.exploit_id, 'complete');
            if (res.success) celebrate(res.pointsAwarded ?? 0);
        });
    };

    const unvalidate = () => {
        setLocalStatus('en_cours');
        startTransition(async () => {
            await updateStageExploitStatus(stageId, exploit.exploit_id, 'en_cours');
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const compressed = await compressImage(file);
        const fd = new FormData();
        fd.append('file', compressed);
        const res = await uploadDefiPhoto(fd);
        if (res.success && res.url) {
            const newUrl = res.url;
            setLocalPhotos(prev => [...prev, newUrl]);
            setLocalStatus('complete');
            startTransition(async () => {
                const statusRes = await updateStageExploitStatus(stageId, exploit.exploit_id, 'complete', newUrl);
                if (statusRes.success) celebrate(statusRes.pointsAwarded ?? 0);
            });
        }
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <motion.div
            animate={flash ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={clsx(
                'rounded-2xl overflow-hidden transition-colors shadow-sm shadow-slate-200/50',
                flash ? 'bg-amber-50' : done ? 'bg-emerald-50' : 'bg-white'
            )}>
            <div className="px-4 py-3 flex items-start gap-3">
                <div className={clsx(
                    'size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                    done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                )}>
                    <span className="material-symbols-outlined text-[18px]">
                        {done ? 'check' : defi.icon}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm font-bold leading-tight', done ? 'text-emerald-900' : 'text-slate-900')}>
                        {defi.description}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{defi.instruction}</p>

                    {/* Photos déjà uploadées */}
                    {localPhotos.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                            {localPhotos.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="preuve" className="size-12 rounded-lg object-cover border border-emerald-200" />
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Actions selon type_preuve */}
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        {isStructured ? (
                            <>
                                <button
                                    onClick={() => setShowStructuredForm(true)}
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                    {done ? 'Modifier le relevé' : 'Faire le relevé'}
                                </button>
                                {done && (
                                    <span className="flex items-center gap-1 h-8 px-3 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-black">
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                        Validé
                                    </span>
                                )}
                            </>
                        ) : defi.type_preuve === 'photo' ? (
                            <>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading || isPending}
                                    className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                                    {uploading ? 'Envoi…' : done ? 'Ajouter une photo' : 'Prendre en photo'}
                                </button>
                                {done && (
                                    <button
                                        onClick={unvalidate}
                                        disabled={isPending}
                                        className="flex items-center gap-1 h-8 px-3 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-black hover:bg-emerald-200 transition disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                        Validé
                                    </button>
                                )}
                            </>
                        ) : done ? (
                            <button
                                onClick={unvalidate}
                                disabled={isPending}
                                className="flex items-center gap-1 h-8 px-3 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-black hover:bg-emerald-200 transition disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                Validé
                            </button>
                        ) : (
                            <button
                                onClick={validate}
                                disabled={isPending}
                                className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                                Marquer comme fait
                            </button>
                        )}

                        <span className="ml-auto">
                            {pointsGained !== null ? (
                                <PointsGainedBadge points={pointsGained} />
                            ) : (
                                <span className="text-[10px] font-black text-slate-300">{defi.points} pts</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {showStructuredForm && (
                <FilRougeForm
                    defiId={exploit.exploit_id}
                    defiDescription={defi.description}
                    stageId={stageId}
                    clubTargets={clubObservationTargets}
                    existingData={exploit.structured_data}
                    existingPhotoUrl={localPhotos[localPhotos.length - 1] ?? null}
                    onClose={() => setShowStructuredForm(false)}
                    onSuccess={pointsAwarded => {
                        setLocalStatus('complete');
                        setShowStructuredForm(false);
                        celebrate(pointsAwarded);
                    }}
                />
            )}
        </motion.div>
    );
}

const DIM_COLORS: Record<'C' | 'O' | 'P', { bg: string; text: string; border: string; label: string }> = {
    C: { bg: 'bg-amber-500',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Comprendre' },
    O: { bg: 'bg-sky-500',     text: 'text-sky-700',     border: 'border-sky-200',     label: 'Observer' },
    P: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Protéger' },
};

// Thématique COP'UN déduite automatiquement du type d'observation — le moniteur n'a pas
// à savoir classer son retour dans le référentiel pédagogique, on le fait pour lui.
const OBSERVATION_TYPE_TO_THEMATIC: Record<ObservationType, ThematicTag | null> = {
    faune: 'biodiversite_saisonnalite',
    flore: 'biodiversite_saisonnalite',
    meteo_mer: 'interactions_climatiques',
    pollution: 'impact_presence_humaine',
    activite_humaine: 'activites_humaines',
    autre: null,
};

const PEDAGOGICAL_ACTIONS: { value: PedagogicalAction; label: string; icon: string }[] = [
    { value: 'expliquer',         label: 'Expliquer',          icon: 'school' },
    { value: 'montrer',           label: 'Montrer',            icon: 'visibility' },
    { value: 'questionner',       label: 'Questionner',        icon: 'help' },
    { value: 'laisser_decouvrir', label: 'Laisser découvrir',  icon: 'explore' },
];

// Format attendu par <input type="datetime-local"> : "YYYY-MM-DDTHH:mm", en heure locale.
function toDatetimeLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatObservedAt(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatRelative(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 2) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Sélecteur de fiches sportives pour la semaine ───────────────────────────────

function SportObjectivesPicker({
    allFiches,
    selectedIds,
    onClose,
    onSave,
}: {
    allFiches: PedagogicalContent[];
    selectedIds: string[];
    onClose: () => void;
    onSave: (selected: PedagogicalContent[]) => void;
}) {
    const [picked, setPicked] = useState<Set<string>>(new Set(selectedIds));
    const [saving, setSaving] = useState(false);

    const toggle = (id: string) => {
        setPicked(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(allFiches.filter(f => picked.has(f.id)));
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4 pt-4 pb-20">
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[75vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                        <p className="text-sm font-black text-slate-900">Objectifs sportifs de la semaine</p>
                        <p className="text-xs text-slate-400 mt-0.5">Piochez dans vos fiches perso</p>
                    </div>
                    <button onClick={onClose} className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-4 flex-1 space-y-2">
                    {allFiches.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <p className="text-sm font-bold">Aucune fiche sportive créée</p>
                            <Link href="/fiches" className="text-xs text-indigo-500 font-bold mt-2 inline-block">Créer une fiche →</Link>
                        </div>
                    ) : (
                        allFiches.map(f => {
                            const active = picked.has(f.id);
                            return (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => toggle(f.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all active:scale-95",
                                        active ? "border-indigo-500 bg-indigo-50" : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                >
                                    <span className={clsx(
                                        "size-5 rounded-md border-2 flex items-center justify-center shrink-0",
                                        active ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                                    )}>
                                        {active && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                                    </span>
                                    <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{f.question}</span>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-12 rounded-2xl bg-slate-900 text-white text-sm font-black disabled:opacity-40 transition"
                    >
                        {saving ? '…' : `Valider (${picked.size})`}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Composant principal ────────────────────────────────────────────────────────

type Props = {
    stageId: string;
    stageName: string;
    stageDates: string;
    objectives: PedagogicalContent[];
    technicalObjectives: PedagogicalContent[];
    sportFiches: PedagogicalContent[];
    /** Programme condensé : ce que le moniteur a préparé, lu en lecture depuis stage_preparations. */
    preparations: Record<string, StagePreparation>;
    initialObservations: WeekObservation[];
    initialExploits: StageExploit[];
    clubObservationTargets: ObservationTarget[];
    greeting: string;
    firstName: string;
    seasonGradient: string;
    seasonIcon: string;
    contentCount: number;
    archivedStages: { id: string; title: string; dates: string }[];
    upcomingStages: { id: string; title: string; dates: string }[];
    suggestedThematics: string[];
    quizDone: boolean;
    totalPoints: number;
    /** Rituels transversaux choisis pour la semaine (`src/data/actions-semaine.ts`). */
    actionsSemaine: string[];
};

export function WeekDashboardClient({
    stageId, stageName, stageDates, objectives, technicalObjectives, sportFiches,
    preparations, initialObservations, initialExploits, clubObservationTargets,
    greeting, firstName, seasonGradient, seasonIcon,
    contentCount, archivedStages, upcomingStages,
    suggestedThematics, quizDone, totalPoints, actionsSemaine,
}: Props) {
    const [technicalObjectiveList, setTechnicalObjectiveList] = useState<PedagogicalContent[]>(technicalObjectives);
    const [showSportPicker, setShowSportPicker] = useState(false);
    const [detailCard, setDetailCard] = useState<PedagogicalContent | null>(null);
    const [observations, setObservations] = useState<WeekObservation[]>(initialObservations);
    const [showAddObs, setShowAddObs] = useState(false);
    const [showAllUpcoming, setShowAllUpcoming] = useState(false);
    const [showAllArchived, setShowAllArchived] = useState(false);
    const [showHelpGuide, setShowHelpGuide] = useState(false);
    const [obsText, setObsText] = useState('');
    const [obsAction, setObsAction] = useState<PedagogicalAction | null>(null);
    const [obsType, setObsType] = useState<ObservationType | null>(null);
    const [obsSpeciesCategory, setObsSpeciesCategory] = useState<string | null>(null);
    const [obsTargetId, setObsTargetId] = useState<string | null>(null);
    const [obsSpeciesLabel, setObsSpeciesLabel] = useState('');
    const [obsSpeciesUncertain, setObsSpeciesUncertain] = useState(false);
    const [obsCount, setObsCount] = useState('');
    const [obsLocation, setObsLocation] = useState('');
    const [obsDate, setObsDate] = useState('');
    const [saving, setSaving] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (showAddObs && textRef.current) textRef.current.focus();
        // Un retour terrain se note presque toujours juste après l'avoir vécu : la date
        // est pré-remplie à maintenant (modifiable), pas un champ vide obligatoire.
        if (showAddObs) setObsDate(prev => prev || toDatetimeLocal(new Date()));
    }, [showAddObs]);

    // Sujets dont l'accroche est choisie : c'est le signal "prêt à raconter", au même
    // sens que sur l'écran de préparation — pas un statut d'exécution après coup.
    const validatedCount = objectives.filter(o => preparations[o.id]?.accroche_choisie).length;

    const defisDone = initialExploits.filter(e => e.status === 'complete').length;
    // Position dans la semaine : "Jour 2/5" si aujourd'hui est dans l'intervalle du stage.
    const now = new Date();
    const DAY_MS = 86_400_000;
    const weekRange = parseStageDateRange(stageDates, now);
    let dayIndex: number | null = null;
    let dayTotal: number | null = null;
    let weekOver = false;
    if (weekRange) {
        const startDay = new Date(weekRange.start);
        startDay.setHours(0, 0, 0, 0);
        dayTotal = Math.round((weekRange.end.getTime() - weekRange.start.getTime()) / DAY_MS) + 1;
        const diff = Math.floor((now.getTime() - startDay.getTime()) / DAY_MS);
        if (diff >= 0 && diff < dayTotal) dayIndex = diff + 1;
        weekOver = diff >= dayTotal;
    }

    // Sur les deux derniers jours de la semaine, le header rappelle le quiz puis le bilan.
    // Le reste du temps il reste compact : les objectifs sont juste en dessous.
    const isLateWeek = dayIndex !== null && dayTotal !== null && dayIndex >= dayTotal - 1;
    const todayCard: { kind: 'quiz' | 'bilan' } | null =
        (isLateWeek || weekOver) && !quizDone
            ? { kind: 'quiz' }
        : weekOver || (isLateWeek && quizDone)
            ? { kind: 'bilan' }
            : null;

    // Rappel du défi de la semaine : libellé si unique, fraction sinon.
    const defiSingle = initialExploits.length === 1 ? initialExploits[0] : null;
    const allDefisDone = initialExploits.length > 0 && defisDone === initialExploits.length;

    const resetObsForm = () => {
        setObsText('');
        setObsAction(null);
        setObsType(null);
        setObsSpeciesCategory(null);
        setObsTargetId(null);
        setObsSpeciesLabel('');
        setObsSpeciesUncertain(false);
        setObsCount('');
        setObsLocation('');
        setObsDate('');
        setShowAddObs(false);
    };

    const canSubmitObs = obsText.trim() && obsDate;

    const handleAddObs = async () => {
        if (!canSubmitObs) return;
        setSaving(true);
        const target = clubObservationTargets.find(t => t.id === obsTargetId);
        // Les espèces de la liste par défaut (non persistées en base) ont des ids factices
        // "default-N" : on ne les envoie pas comme target_id (colonne UUID), on garde juste le nom.
        const isRealTarget = !!obsTargetId && !obsTargetId.startsWith('default-');
        const res = await addObservation({
            stageId,
            text: obsText,
            pedagogicalAction: obsAction,
            linkedThematic: obsType ? OBSERVATION_TYPE_TO_THEMATIC[obsType] : null,
            observationType: obsType,
            targetId: isRealTarget ? obsTargetId : null,
            speciesLabel: target?.name ?? (obsSpeciesLabel || null),
            speciesUncertain: obsSpeciesUncertain,
            individualCount: obsCount ? Number(obsCount) : null,
            locationNote: obsLocation || null,
            observedAt: new Date(obsDate).toISOString(),
        });
        if (res.success && res.observation) {
            setObservations(prev => [res.observation as WeekObservation, ...prev]);
            resetObsForm();
        } else if (!res.success) {
            alert('Impossible d\'enregistrer le retour terrain : ' + (res.error ?? 'erreur inconnue'));
        }
        setSaving(false);
    };

    const handleDeleteObs = async (id: string) => {
        setObservations(prev => prev.filter(o => o.id !== id));
        await deleteObservation(id);
    };

    const handleSaveSportSelection = async (selected: PedagogicalContent[]) => {
        const envIds = objectives.map(c => c.id);
        const sportIds = selected.map(c => c.id);
        const res = await updateStagePool(stageId, [...envIds, ...sportIds]);
        if (res.success) {
            setTechnicalObjectiveList(selected);
            setShowSportPicker(false);
        } else {
            alert('Erreur : ' + res.error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-32">

            {/* Header saisonnier — cockpit de la semaine */}
            <header className={`relative bg-linear-to-br ${seasonGradient} overflow-hidden`}>
                <div className="relative z-10 px-5 pt-10 pb-3 flex items-center justify-between gap-3">
                    <p className="text-white/80 text-sm font-semibold min-w-0 truncate">
                        {greeting}, <span className="font-black text-white italic">{firstName}.</span>
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Score global, cliquable vers le classement */}
                        <Link href="/classement" className="flex items-center gap-1 h-9 px-3 rounded-full bg-white/20 border border-white/30 text-white active:scale-95 transition">
                            <span className="material-symbols-outlined text-[15px] text-amber-300">emoji_events</span>
                            <span className="text-xs font-black">{totalPoints}<span className="font-bold text-white/60"> pts</span></span>
                        </Link>
                        <button
                            onClick={() => setShowHelpGuide(true)}
                            className="size-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white active:scale-95 transition"
                            title="Comment ça marche ?"
                        >
                            <span className="material-symbols-outlined text-lg">help</span>
                        </button>
                        <Link href="/profil" className="size-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-lg">{seasonIcon}</span>
                        </Link>
                    </div>
                </div>

                <div className="relative z-10 mx-4 mb-5">
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Cette semaine</p>
                            {dayIndex !== null && (
                                <span className="text-[10px] font-black text-white/80 bg-white/15 px-2 py-0.5 rounded-full shrink-0">
                                    Jour {dayIndex}/{dayTotal}
                                </span>
                            )}
                        </div>
                        <p className="text-lg font-black text-white leading-tight">{stageName}</p>
                        <p className="text-xs text-white/50 mt-0.5">{stageDates}</p>

                        {/* Une seule carte : action du jour (préparer / quiz / bilan) en tête,
                            puis Programme et Défi en lignes fines juste en dessous si présents.
                            Avant, ces trois blocs étaient des cartes/pastilles séparées — sur
                            une semaine sans contenu ça laissait un gros bouton blanc isolé. */}
                        {(contentCount > 0 || initialExploits.length > 0) && (
                            <div className="mt-3.5 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden divide-y divide-slate-900/5">
                                {/* Préparer : l'app ne suit pas le moniteur sur l'eau (pas de
                                    téléphone en séance), son travail est donc de lui mettre le
                                    discours en tête avant. Visible tant que la semaine n'est pas
                                    en phase de clôture. */}
                                {contentCount > 0 && todayCard?.kind !== 'quiz' && todayCard?.kind !== 'bilan' && (
                                    <Link
                                        href={`/stages/${stageId}/preparer`}
                                        className="flex items-center gap-3 px-3.5 py-3 active:bg-slate-900/5 transition"
                                    >
                                        <span className="size-9 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[18px]">psychology</span>
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Avant d&apos;aller sur l&apos;eau</span>
                                            <span className="block text-sm font-black text-slate-900 leading-snug">Préparer le fil de ma semaine</span>
                                        </span>
                                        <span className="material-symbols-outlined text-slate-300 shrink-0">arrow_forward</span>
                                    </Link>
                                )}

                                {/* Fin de semaine : rappel quiz puis bilan — rien le reste du temps */}
                                {todayCard?.kind === 'quiz' && (
                                    <Link
                                        href={`/stages/${stageId}/quiz`}
                                        className="flex items-center gap-3 px-3.5 py-3 active:bg-slate-900/5 transition"
                                    >
                                        <span className="size-9 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[18px]">quiz</span>
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Fin de semaine</span>
                                            <span className="block text-sm font-black text-slate-900 leading-snug">Fais le quiz avec ton groupe</span>
                                        </span>
                                        <span className="material-symbols-outlined text-slate-300 shrink-0">arrow_forward</span>
                                    </Link>
                                )}
                                {todayCard?.kind === 'bilan' && (
                                    <Link
                                        href={`/stages/${stageId}/bilan`}
                                        className="flex items-center gap-3 px-3.5 py-3 active:bg-slate-900/5 transition"
                                    >
                                        <span className="size-9 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[18px]">article</span>
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Fin de semaine</span>
                                            <span className="block text-sm font-black text-slate-900 leading-snug">Fais le bilan de ta semaine</span>
                                        </span>
                                        <span className="material-symbols-outlined text-slate-300 shrink-0">arrow_forward</span>
                                    </Link>
                                )}

                                {/* Où on en est : objectifs faits / restants (une pastille par fiche) + rappel défi */}
                                {contentCount > 0 && (
                                    <a href="#programme" className="flex items-center gap-2.5 px-3.5 py-2.5 active:bg-slate-900/5 transition">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Programme</span>
                                        <span className="flex items-center gap-1.5">
                                            {objectives.map(o => (
                                                <span
                                                    key={o.id}
                                                    className={clsx(
                                                        'size-2.5 rounded-full',
                                                        preparations[o.id]?.accroche_choisie ? 'bg-emerald-400' : 'bg-slate-200'
                                                    )}
                                                />
                                            ))}
                                        </span>
                                        <span className="ml-auto text-[11px] font-black text-slate-900 shrink-0">
                                            {validatedCount}/{contentCount}
                                            <span className="text-slate-400 font-bold"> prêt{validatedCount > 1 ? 's' : ''}</span>
                                        </span>
                                    </a>
                                )}
                                {initialExploits.length > 0 && (
                                    <a href="#defis" className="flex items-center gap-2.5 px-3.5 py-2.5 active:bg-slate-900/5 transition">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Défi</span>
                                        <span className="flex-1 min-w-0 text-[11px] font-bold text-slate-700 truncate">
                                            {defiSingle ? defiSingle.defis.description : `${defisDone}/${initialExploits.length} validés`}
                                        </span>
                                        <span className={clsx(
                                            'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0',
                                            allDefisDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        )}>
                                            {allDefisDone ? 'Validé' : 'En cours'}
                                        </span>
                                    </a>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                <svg viewBox="0 0 1440 20" className="w-full -mb-px" preserveAspectRatio="none">
                    <path d="M0 20 C360 0 1080 0 1440 20 L1440 20 L0 20Z" fill="#f8fafc" />
                </svg>
            </header>

            <main className="flex-1 px-4 pt-6 space-y-9 max-w-2xl mx-auto w-full">

                {/* Programme de la semaine — condensé, en lecture. Remplace l'ancienne liste
                    par pilier où chaque fiche portait un statut à cocher (fait / partiel /
                    pas fait) : ce modèle traitait les fiches comme des tâches, alors
                    qu'elles servent à construire un discours. Voir ProgrammeCondense. */}
                <section id="programme" className="scroll-mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-black tracking-tight text-slate-900">Le fil de ma semaine</h2>
                        <Link href={`/stages/${stageId}/program`} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                            Modifier
                        </Link>
                    </div>
                    <ProgrammeCondense stageId={stageId} contents={objectives} preparations={preparations} actionsSemaine={actionsSemaine} />
                </section>

                {/* Objectifs sportifs — fiches créées par le moniteur, indépendantes du programme environnemental COP'UN */}
                {SPORT_FEATURES_ENABLED && (technicalObjectiveList.length > 0 || sportFiches.length > 0) && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-indigo-500">sailing</span>
                                Objectifs sportifs
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowSportPicker(true)}
                                    className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                                >
                                    Ajouter
                                </button>
                                <Link href="/fiches" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                                    Mes fiches
                                </Link>
                            </div>
                        </div>

                        {technicalObjectiveList.length === 0 ? (
                            <button
                                onClick={() => setShowSportPicker(true)}
                                className="block w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center hover:border-indigo-300 transition-colors"
                            >
                                <p className="text-sm font-bold text-slate-400">Aucun objectif sportif choisi</p>
                                <p className="text-xs text-slate-300 mt-1">Piocher dans mes fiches →</p>
                            </button>
                        ) : (
                            <div className="space-y-2">
                                {technicalObjectiveList.map(card => (
                                    <button
                                        key={card.id}
                                        onClick={() => setDetailCard(card)}
                                        className="w-full flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-left hover:border-indigo-300 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-indigo-400 text-xl shrink-0">sailing</span>
                                        <span className="flex-1 min-w-0 text-sm font-bold text-slate-800 truncate">{card.question}</span>
                                        <span className="material-symbols-outlined text-slate-300 text-base shrink-0">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {SPORT_FEATURES_ENABLED && showSportPicker && (
                    <SportObjectivesPicker
                        allFiches={sportFiches}
                        selectedIds={technicalObjectiveList.map(c => c.id)}
                        onClose={() => setShowSportPicker(false)}
                        onSave={handleSaveSportSelection}
                    />
                )}

                {/* Défis de la semaine */}
                {initialExploits.length > 0 && (
                    <section id="defis" className="scroll-mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-black tracking-tight text-slate-900">
                                Défis terrain
                                {initialExploits.filter(e => e.status === 'complete').length > 0 && (
                                    <span className="ml-2 text-xs font-bold text-emerald-500 align-middle">
                                        {initialExploits.filter(e => e.status === 'complete').length}/{initialExploits.length} validés
                                    </span>
                                )}
                            </h2>
                            <Link href={`/stages/${stageId}/defis`} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                                Gérer
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {initialExploits.map(exploit => (
                                <ExploitCard key={exploit.id} exploit={exploit} stageId={stageId} clubObservationTargets={clubObservationTargets} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Retours terrain */}
                <section id="retours" className="scroll-mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-black tracking-tight text-slate-900">Retours terrain</h2>
                        {observations.length > 0 && (
                            <span className="text-xs font-bold text-slate-300">{observations.length} moment{observations.length > 1 ? 's' : ''}</span>
                        )}
                    </div>

                    <AnimatePresence>
                        {showAddObs && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-3 overflow-hidden"
                            >
                                <div className="bg-white rounded-2xl p-4 space-y-4 shadow-sm shadow-slate-200/60">

                                    {/* Type d'observation */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Type d&apos;observation</p>
                                        <div className="flex flex-wrap gap-2">
                                            {OBSERVATION_TYPES.map(t => (
                                                <button
                                                    key={t.value}
                                                    type="button"
                                                    onClick={() => setObsType(prev => prev === t.value ? null : t.value)}
                                                    className={clsx(
                                                        "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95",
                                                        obsType === t.value
                                                            ? "bg-indigo-600 border-indigo-600 text-white"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                    )}
                                                >
                                                    <span className="material-symbols-outlined text-[16px] shrink-0">{t.icon}</span>
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Espèce — parcours en 2 temps : catégorie d'abord, puis seulement les espèces de cette catégorie */}
                                    {(obsType === 'faune' || obsType === 'flore') && (() => {
                                        const relevantCategories = obsType === 'flore' ? ['flore'] : SPECIES_CATEGORY_ORDER.filter(c => c !== 'flore');
                                        const categoriesWithTargets = relevantCategories.filter(cat =>
                                            clubObservationTargets.some(t => t.categorie === cat)
                                        );
                                        const activeCategory = obsType === 'flore' ? 'flore' : obsSpeciesCategory;
                                        const targetsInCategory = activeCategory
                                            ? clubObservationTargets.filter(t => t.categorie === activeCategory)
                                            : [];

                                        return (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Espèce</p>
                                                    {obsType === 'faune' && activeCategory && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { setObsSpeciesCategory(null); setObsTargetId(null); }}
                                                            className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-0.5"
                                                        >
                                                            <span className="material-symbols-outlined text-[13px]">arrow_back</span>
                                                            Changer de catégorie
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Étape 1 : choix de la catégorie (faune uniquement, flore n'en a qu'une) */}
                                                {obsType === 'faune' && !activeCategory && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {categoriesWithTargets.map(cat => (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => setObsSpeciesCategory(cat)}
                                                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-slate-300 transition-all active:scale-95"
                                                            >
                                                                {SPECIES_CATEGORY_LABELS[cat] ?? cat}
                                                            </button>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => { setObsSpeciesUncertain(true); setObsTargetId(null); }}
                                                            className={clsx(
                                                                "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1",
                                                                obsSpeciesUncertain
                                                                    ? "bg-amber-500 border-amber-500 text-white"
                                                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                            )}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">help</span>
                                                            Espèce non identifiée
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Étape 2 : choix de l'espèce dans la catégorie sélectionnée */}
                                                {activeCategory && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {targetsInCategory.map(t => (
                                                            <button
                                                                key={t.id}
                                                                type="button"
                                                                onClick={() => { setObsTargetId(prev => prev === t.id ? null : t.id); setObsSpeciesUncertain(false); }}
                                                                className={clsx(
                                                                    "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95",
                                                                    obsTargetId === t.id
                                                                        ? "bg-slate-900 border-slate-900 text-white"
                                                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                                )}
                                                            >
                                                                {t.name}
                                                            </button>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => { setObsSpeciesUncertain(prev => !prev); setObsTargetId(null); }}
                                                            className={clsx(
                                                                "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1",
                                                                obsSpeciesUncertain
                                                                    ? "bg-amber-500 border-amber-500 text-white"
                                                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                            )}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">help</span>
                                                            Non identifiée
                                                        </button>
                                                    </div>
                                                )}

                                                {(activeCategory || obsSpeciesUncertain) && !obsTargetId && (
                                                    <input
                                                        type="text"
                                                        value={obsSpeciesLabel}
                                                        onChange={e => setObsSpeciesLabel(e.target.value)}
                                                        placeholder={obsSpeciesUncertain ? "Ex : dauphin (espèce non identifiée)…" : "Ou précisez l'espèce…"}
                                                        className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl px-3 text-xs font-semibold text-slate-800 placeholder:text-slate-300 focus:border-slate-300 outline-none transition"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Type de déchet — liste rapide + libre */}
                                    {obsType === 'pollution' && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type de déchet</p>
                                            <div className="flex flex-wrap gap-2">
                                                {DEFAULT_WASTE_TYPES.map(w => (
                                                    <button
                                                        key={w}
                                                        type="button"
                                                        onClick={() => setObsSpeciesLabel(prev => prev === w ? '' : w)}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95",
                                                            obsSpeciesLabel === w
                                                                ? "bg-slate-900 border-slate-900 text-white"
                                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                        )}
                                                    >
                                                        {w}
                                                    </button>
                                                ))}
                                            </div>
                                            {!DEFAULT_WASTE_TYPES.includes(obsSpeciesLabel) && (
                                                <input
                                                    type="text"
                                                    value={obsSpeciesLabel}
                                                    onChange={e => setObsSpeciesLabel(e.target.value)}
                                                    placeholder="Ou précisez le déchet…"
                                                    className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl px-3 text-xs font-semibold text-slate-800 placeholder:text-slate-300 focus:border-slate-300 outline-none transition"
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Nombre d'individus + lieu */}
                                    {obsType && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                                    Nombre
                                                    <span className="font-semibold normal-case tracking-normal text-slate-300 ml-1">— optionnel</span>
                                                </p>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={obsCount}
                                                    onChange={e => setObsCount(e.target.value)}
                                                    placeholder="Ex : 3"
                                                    className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl px-3 text-xs font-semibold text-slate-800 placeholder:text-slate-300 focus:border-slate-300 outline-none transition"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                                    Lieu
                                                    <span className="font-semibold normal-case tracking-normal text-slate-300 ml-1">— optionnel</span>
                                                </p>
                                                <input
                                                    type="text"
                                                    value={obsLocation}
                                                    onChange={e => setObsLocation(e.target.value)}
                                                    placeholder="Ex : pointe du Roc"
                                                    className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl px-3 text-xs font-semibold text-slate-800 placeholder:text-slate-300 focus:border-slate-300 outline-none transition"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Date et heure de l'observation */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Date et heure de l&apos;observation
                                                <span className="text-red-400 ml-1">*</span>
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setObsDate(toDatetimeLocal(new Date()))}
                                                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                                            >
                                                Maintenant
                                            </button>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={obsDate}
                                            onChange={e => setObsDate(e.target.value)}
                                            className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl px-3 text-xs font-semibold text-slate-800 focus:border-slate-300 outline-none transition"
                                        />
                                    </div>

                                    {/* Ce qui s'est passé */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ce que j&apos;ai observé / vécu</p>
                                        <textarea
                                            ref={textRef}
                                            value={obsText}
                                            onChange={e => setObsText(e.target.value)}
                                            placeholder="Ex : cormorans en plongée à 20m du bord, vent force 4 soudain, groupe qui découvre l'estran découvert…"
                                            className="w-full min-h-20 resize-none text-sm text-slate-800 placeholder:text-slate-300 bg-slate-50 rounded-xl px-3 py-2.5 outline-none leading-relaxed border border-slate-100 focus:border-slate-300 transition"
                                        />
                                    </div>

                                    {/* Ce que ça a permis */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">J&apos;en ai profité pour…</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {PEDAGOGICAL_ACTIONS.map(a => (
                                                <button
                                                    key={a.value}
                                                    type="button"
                                                    onClick={() => setObsAction(prev => prev === a.value ? null : a.value)}
                                                    className={clsx(
                                                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 text-left",
                                                        obsAction === a.value
                                                            ? "bg-slate-900 border-slate-900 text-white"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                    )}
                                                >
                                                    <span className="material-symbols-outlined text-[16px] shrink-0">{a.icon}</span>
                                                    {a.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={resetObsForm}
                                            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleAddObs}
                                            disabled={!canSubmitObs || saving}
                                            className="flex-1 h-10 rounded-xl bg-slate-900 text-sm font-black text-white disabled:opacity-40 transition"
                                        >
                                            {saving ? '…' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!showAddObs && (
                        <button
                            onClick={() => setShowAddObs(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all mb-3"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span className="text-sm font-semibold">Ajouter un retour terrain…</span>
                        </button>
                    )}

                    <AnimatePresence initial={false}>
                        {observations.map(obs => {
                            const action = PEDAGOGICAL_ACTIONS.find(a => a.value === obs.pedagogical_action);
                            const thematic = obs.linked_thematic ? THEMATIC_LABELS[obs.linked_thematic as ThematicTag] : null;
                            const dim = thematic ? DIM_COLORS[thematic.dimension] : null;
                            const obsTypeInfo = OBSERVATION_TYPES.find(t => t.value === obs.observation_type);
                            const speciesLabel = obs.species_label
                                ? `${obs.species_label}${obs.species_uncertain ? ' (?)' : ''}`
                                : (obs.species_uncertain ? 'Espèce non identifiée' : null);
                            return (
                                <motion.div
                                    key={obs.id}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="group relative bg-white rounded-2xl px-4 py-3 mb-2 shadow-sm shadow-slate-200/50"
                                >
                                    <div className="flex items-start gap-3">
                                        {dim ? (
                                            <span className={clsx("mt-0.5 text-[10px] font-black rounded-md px-1.5 py-0.5 shrink-0 text-white", dim.bg)}>
                                                {thematic!.dimension}
                                            </span>
                                        ) : (
                                            <span className="mt-2 size-2 rounded-full bg-slate-200 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <p className="text-sm text-slate-700 leading-relaxed">{obs.text}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {obsTypeInfo && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-[11px]">{obsTypeInfo.icon}</span>
                                                        {speciesLabel || obsTypeInfo.label}
                                                    </span>
                                                )}
                                                {obs.individual_count !== null && (
                                                    <span className="inline-flex items-center text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                                                        ×{obs.individual_count}
                                                    </span>
                                                )}
                                                {obs.location_note && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-[11px]">location_on</span>
                                                        {obs.location_note}
                                                    </span>
                                                )}
                                                {action && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-[11px]">{action.icon}</span>
                                                        {action.label}
                                                    </span>
                                                )}
                                                {thematic && dim && (
                                                    <span className={clsx("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border", `bg-white ${dim.text} ${dim.border}`)}>
                                                        {thematic.label}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-300">
                                                {obs.observed_at ? formatObservedAt(obs.observed_at) : formatRelative(obs.created_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteObs(obs.id)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all shrink-0 mt-0.5"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {observations.length === 0 && !showAddObs && (
                        <p className="text-center text-xs text-slate-300 py-4">
                            Notez ce que vous avez observé, expliqué ou vécu en sortie.
                        </p>
                    )}
                </section>

                {/* Pied de page : accès rapides + création + archives — une seule pile de
                    boutons pleine largeur au rythme uniforme, pas trois sections disjointes */}
                <section className="space-y-3">
                    <Link
                        href={`/stages/${stageId}/quiz`}
                        className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm shadow-slate-200/60 hover:bg-slate-50 active:scale-[0.98] transition"
                    >
                        <span className="size-11 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">quiz</span>
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block text-sm font-black text-slate-900 leading-snug">Quiz de la semaine</span>
                            <span className="block text-[11px] text-slate-400 mt-0.5">{quizDone ? 'Déjà fait — revoir ou refaire' : 'À faire avec ton groupe'}</span>
                        </span>
                        <span className="material-symbols-outlined text-slate-300 shrink-0">arrow_forward</span>
                    </Link>
                    <Link
                        href={`/stages/${stageId}/bilan`}
                        className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm shadow-slate-200/60 hover:bg-slate-50 active:scale-[0.98] transition"
                    >
                        <span className="size-11 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">article</span>
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block text-sm font-black text-slate-900 leading-snug">Bilan de la semaine</span>
                            <span className="block text-[11px] text-slate-400 mt-0.5">Vérifier, compléter et clôturer</span>
                        </span>
                        <span className="material-symbols-outlined text-slate-300 shrink-0">arrow_forward</span>
                    </Link>

                    {upcomingStages.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-sm font-bold text-slate-500">Semaines préparées à l&apos;avance</p>
                            {(showAllUpcoming ? upcomingStages : upcomingStages.slice(0, 3)).map(s => (
                                <div key={s.id} className="flex items-center gap-1 bg-white rounded-xl shadow-sm shadow-indigo-100/60 pl-3 pr-1.5 py-1.5">
                                    <Link href={`/stages/${s.id}/program`} className="flex items-center gap-3 flex-1 min-w-0 py-1 active:scale-95 transition">
                                        <span className="material-symbols-outlined text-indigo-300 text-base shrink-0">event_upcoming</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-600 truncate">{s.title}</p>
                                            <p className="text-[10px] text-slate-400">{s.dates}</p>
                                        </div>
                                    </Link>
                                    <DeleteStageButton stageId={s.id} size="sm" />
                                </div>
                            ))}
                            {!showAllUpcoming && upcomingStages.length > 3 && (
                                <button
                                    onClick={() => setShowAllUpcoming(true)}
                                    className="block w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 py-1 transition"
                                >
                                    Voir les {upcomingStages.length - 3} autres
                                </button>
                            )}
                        </div>
                    )}
                    <Link
                        href="/stages/new"
                        className="flex items-center justify-between bg-slate-900 text-white rounded-2xl px-4 py-3.5 hover:bg-slate-800 transition active:scale-95"
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Semaine suivante</p>
                            <p className="text-sm font-bold">Créer une nouvelle semaine</p>
                        </div>
                        <span className="material-symbols-outlined text-xl text-white/60">add_circle</span>
                    </Link>

                    {/* Archives en toute fin de page, repliées : utile à garder sous la main,
                        mais pas une info du quotidien — ne doit pas peser visuellement */}
                    {archivedStages.length > 0 && (
                        <div>
                            <button
                                onClick={() => setShowAllArchived(o => !o)}
                                className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/50 hover:bg-slate-50 active:scale-[0.98] transition"
                            >
                                <span className="material-symbols-outlined text-base text-slate-400">archive</span>
                                <span className="text-sm font-bold text-slate-600">Semaines passées</span>
                                <span className="text-xs font-semibold text-slate-300">{archivedStages.length}</span>
                                <span className={clsx(
                                    'material-symbols-outlined text-base text-slate-300 ml-auto transition-transform duration-200',
                                    showAllArchived && 'rotate-180'
                                )}>expand_more</span>
                            </button>
                            <AnimatePresence initial={false}>
                                {showAllArchived && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-1.5 pt-1">
                                            {archivedStages.map(s => (
                                                <Link key={s.id} href={`/stages/${s.id}/bilan`} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm shadow-slate-200/50 hover:bg-slate-50 transition active:scale-95">
                                                    <span className="material-symbols-outlined text-slate-300 text-base shrink-0">archive</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-600 truncate">{s.title}</p>
                                                        <p className="text-[10px] text-slate-400">{s.dates}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-300 text-sm shrink-0">chevron_right</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </section>

            </main>

            <CardDetailModal
                isOpen={!!detailCard}
                onClose={() => setDetailCard(null)}
                content={detailCard}
            />
            <HelpGuideModal isOpen={showHelpGuide} onClose={() => setShowHelpGuide(false)} />
        </div>
    );
}
