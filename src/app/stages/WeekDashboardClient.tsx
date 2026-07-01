'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { WeekObservation, PedagogicalAction, PedagogicalContent, StageObjectiveExecutionStatus } from '@/types';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';
import { ThematicSelect } from '@/components/ThematicSelect';
import { addObservation, deleteObservation } from '@/actions/observation-actions';
import { saveObjectiveStatus } from '@/actions/stage-actions';
import { updateStageExploitStatus, uploadDefiPhoto } from '@/actions/defi-actions';

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
    defis: DefiInfo;
};

// ── Exploit card (validation inline) ──────────────────────────────────────────

function ExploitCard({ exploit, stageId }: { exploit: StageExploit; stageId: string }) {
    const [isPending, startTransition] = useTransition();
    const [localStatus, setLocalStatus] = useState(exploit.status);
    const [localPhotos, setLocalPhotos] = useState<string[]>(exploit.preuves_url ?? []);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const defi = exploit.defis;
    const done = localStatus === 'complete';

    const validate = () => {
        setLocalStatus('complete');
        startTransition(async () => {
            await updateStageExploitStatus(stageId, exploit.exploit_id, 'complete');
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
        const fd = new FormData();
        fd.append('file', file);
        const res = await uploadDefiPhoto(fd);
        if (res.success && res.url) {
            const newUrl = res.url;
            setLocalPhotos(prev => [...prev, newUrl]);
            setLocalStatus('complete');
            startTransition(async () => {
                await updateStageExploitStatus(stageId, exploit.exploit_id, 'complete', newUrl);
            });
        }
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className={clsx(
            'rounded-2xl border-2 overflow-hidden transition-all',
            done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
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
                        {defi.type_preuve === 'photo' ? (
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

                        <span className="text-[10px] font-black text-slate-300 ml-auto">
                            {defi.points} pts
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DIM_COLORS: Record<'C' | 'O' | 'P', { bg: string; text: string; border: string; label: string }> = {
    C: { bg: 'bg-amber-500',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Comprendre' },
    O: { bg: 'bg-sky-500',     text: 'text-sky-700',     border: 'border-sky-200',     label: 'Observer' },
    P: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Protéger' },
};

const PEDAGOGICAL_ACTIONS: { value: PedagogicalAction; label: string; icon: string }[] = [
    { value: 'expliquer',         label: 'Expliquer',          icon: 'school' },
    { value: 'montrer',           label: 'Montrer',            icon: 'visibility' },
    { value: 'questionner',       label: 'Questionner',        icon: 'help' },
    { value: 'laisser_decouvrir', label: 'Laisser découvrir',  icon: 'explore' },
];

const EXECUTION_OPTIONS: { value: StageObjectiveExecutionStatus; label: string; icon: string; active: string }[] = [
    { value: 'not_done', label: 'Non abordé', icon: 'remove_circle',  active: 'bg-slate-100 text-slate-600 border-slate-300' },
    { value: 'partial',  label: 'Effleuré',   icon: 'timelapse',      active: 'bg-amber-100 text-amber-700 border-amber-300' },
    { value: 'done',     label: 'Travaillé',  icon: 'check_circle',   active: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
];

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

// ── Accordéon objectif ────────────────────────────────────────────────────────

function ObjectiveRow({
    card,
    status,
    stageId,
    onStatusChange,
}: {
    card: PedagogicalContent;
    status: StageObjectiveExecutionStatus | null;
    stageId: string;
    onStatusChange: (cardId: string, s: StageObjectiveExecutionStatus) => void;
}) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const pillar = card.dimension ? DIM_COLORS[card.dimension as 'C' | 'O' | 'P'] : null;

    const handleStatus = async (val: StageObjectiveExecutionStatus) => {
        if (saving) return;
        setSaving(true);
        onStatusChange(card.id, val);
        await saveObjectiveStatus(stageId, card.id, val);
        setSaving(false);
        if (val !== 'not_done') setOpen(false);
    };

    const statusMeta = status ? EXECUTION_OPTIONS.find(o => o.value === status) : null;

    return (
        <div className={clsx(
            "rounded-2xl border overflow-hidden transition-all",
            status === 'done' ? "border-emerald-100 bg-emerald-50/40" :
            status === 'partial' ? "border-amber-100 bg-amber-50/30" :
            status === 'not_done' ? "border-slate-100 bg-white opacity-60" :
            "border-slate-200 bg-white"
        )}>
            {/* Header ligne */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
                <div className={clsx("size-2 rounded-full shrink-0", pillar?.bg ?? "bg-slate-300")} />
                <span className={clsx(
                    "flex-1 text-sm font-semibold leading-snug",
                    status === 'not_done' ? "line-through text-slate-400" : "text-slate-800"
                )}>
                    {card.question}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                    {statusMeta && (
                        <span className={clsx(
                            "text-[10px] font-black px-2 py-0.5 rounded-full border",
                            statusMeta.active
                        )}>
                            {statusMeta.label}
                        </span>
                    )}
                    <span className={clsx(
                        "material-symbols-outlined text-slate-300 text-base transition-transform duration-200",
                        open && "rotate-180"
                    )}>
                        expand_more
                    </span>
                </div>
            </button>

            {/* Corps accordéon */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-3">
                            {/* Objectif pédagogique */}
                            <p className="text-xs text-slate-500 leading-relaxed">{card.objectif}</p>

                            {/* Tip si présent */}
                            {card.tip && (
                                <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700 leading-relaxed">
                                    <span className="font-bold">Conseil : </span>{card.tip}
                                </div>
                            )}

                            {/* Statut */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Comment ça s&apos;est passé ?</p>
                                <div className="flex gap-2">
                                    {EXECUTION_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleStatus(opt.value)}
                                            disabled={saving}
                                            className={clsx(
                                                "flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95",
                                                status === opt.value
                                                    ? opt.active + " border-current"
                                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            <span className="material-symbols-outlined text-base">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Composant principal ────────────────────────────────────────────────────────

type Props = {
    stageId: string;
    stageName: string;
    stageDates: string;
    objectives: PedagogicalContent[];
    initialStatuses: Record<string, StageObjectiveExecutionStatus>;
    initialObservations: WeekObservation[];
    initialExploits: StageExploit[];
    greeting: string;
    firstName: string;
    seasonGradient: string;
    seasonIcon: string;
    contentCount: number;
    validatedCount: number;
    archivedStages: { id: string; title: string; dates: string }[];
};

export function WeekDashboardClient({
    stageId, stageName, stageDates, objectives,
    initialStatuses, initialObservations, initialExploits,
    greeting, firstName, seasonGradient, seasonIcon,
    contentCount, validatedCount: initialValidatedCount, archivedStages,
}: Props) {
    const [statuses, setStatuses] = useState<Record<string, StageObjectiveExecutionStatus>>(initialStatuses);
    const [observations, setObservations] = useState<WeekObservation[]>(initialObservations);
    const [showAddObs, setShowAddObs] = useState(false);
    const [obsText, setObsText] = useState('');
    const [obsAction, setObsAction] = useState<PedagogicalAction | null>(null);
    const [obsThematic, setObsThematic] = useState<ThematicTag | null>(null);
    const [saving, setSaving] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (showAddObs && textRef.current) textRef.current.focus();
    }, [showAddObs]);

    const handleStatusChange = (cardId: string, s: StageObjectiveExecutionStatus) => {
        setStatuses(prev => ({ ...prev, [cardId]: s }));
    };

    const validatedCount = Object.values(statuses).filter(s => s === 'done' || s === 'partial').length;
    const pct = contentCount > 0 ? Math.round((validatedCount / contentCount) * 100) : 0;

    const resetObsForm = () => {
        setObsText('');
        setObsAction(null);
        setObsThematic(null);
        setShowAddObs(false);
    };

    const handleAddObs = async () => {
        if (!obsText.trim()) return;
        setSaving(true);
        const res = await addObservation(stageId, obsText, obsAction, obsThematic);
        if (res.success && res.observation) {
            setObservations(prev => [res.observation as WeekObservation, ...prev]);
            resetObsForm();
        }
        setSaving(false);
    };

    const handleDeleteObs = async (id: string) => {
        setObservations(prev => prev.filter(o => o.id !== id));
        await deleteObservation(id);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-32">

            {/* Header saisonnier */}
            <header className={`relative bg-linear-to-br ${seasonGradient} overflow-hidden`}>
                <div className="relative z-10 px-5 pt-12 pb-5 flex items-start justify-between">
                    <div>
                        <p className="text-white/60 text-sm font-semibold">{greeting},</p>
                        <h1 className="text-3xl font-black text-white italic tracking-tight leading-tight mt-0.5">{firstName}.</h1>
                    </div>
                    <Link href="/profil" className="size-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-xl">{seasonIcon}</span>
                    </Link>
                </div>

                <div className="relative z-10 mx-4 mb-5">
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Cette semaine</p>
                        <p className="text-lg font-black text-white leading-tight">{stageName}</p>
                        <p className="text-xs text-white/50 mt-0.5">{stageDates}</p>
                        {contentCount > 0 && (
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-white/60 shrink-0">{validatedCount}/{contentCount} travaillés</span>
                            </div>
                        )}
                    </div>
                </div>

                <svg viewBox="0 0 1440 20" className="w-full -mb-px" preserveAspectRatio="none">
                    <path d="M0 20 C360 0 1080 0 1440 20 L1440 20 L0 20Z" fill="#f8fafc" />
                </svg>
            </header>

            <main className="flex-1 px-4 pt-5 space-y-6 max-w-2xl mx-auto w-full">

                {/* Objectifs de la semaine */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Objectifs de la semaine</p>
                        <Link href={`/stages/${stageId}/program`} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                            Modifier
                        </Link>
                    </div>

                    {objectives.length === 0 ? (
                        <Link href={`/stages/${stageId}/program`} className="block rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center hover:border-indigo-300 transition-colors">
                            <p className="text-sm font-bold text-slate-400">Aucun objectif choisi</p>
                            <p className="text-xs text-slate-300 mt-1">Choisir les fiches de la semaine →</p>
                        </Link>
                    ) : (
                        <div className="space-y-2">
                            {objectives.map(card => (
                                <ObjectiveRow
                                    key={card.id}
                                    card={card}
                                    status={statuses[card.id] ?? null}
                                    stageId={stageId}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Défis de la semaine */}
                {initialExploits.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Défis terrain
                                {initialExploits.filter(e => e.status === 'complete').length > 0 && (
                                    <span className="ml-2 text-emerald-500">
                                        {initialExploits.filter(e => e.status === 'complete').length}/{initialExploits.length} validés
                                    </span>
                                )}
                            </p>
                            <Link href={`/stages/${stageId}/defis`} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                                Gérer
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {initialExploits.map(exploit => (
                                <ExploitCard key={exploit.id} exploit={exploit} stageId={stageId} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Retours terrain */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Retours terrain</p>
                        {observations.length > 0 && (
                            <span className="text-[10px] font-bold text-slate-300">{observations.length} moment{observations.length > 1 ? 's' : ''}</span>
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
                                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm">

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

                                    {/* Thématique */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Thématique liée
                                            <span className="font-semibold normal-case tracking-normal text-slate-300 ml-1">— optionnel</span>
                                        </p>
                                        <ThematicSelect value={obsThematic} onChange={setObsThematic} />
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
                                            disabled={!obsText.trim() || saving}
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
                            return (
                                <motion.div
                                    key={obs.id}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="group relative bg-white rounded-2xl border border-slate-100 px-4 py-3 mb-2 shadow-sm"
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
                                            <p className="text-[10px] text-slate-300">{formatRelative(obs.created_at)}</p>
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

                {/* Accès rapides */}
                <section className="grid grid-cols-3 gap-2">
                    <Link href={`/stages/${stageId}/quiz`} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center gap-1 hover:bg-slate-50 transition">
                        <span className="material-symbols-outlined text-xl text-violet-500">quiz</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Quiz</span>
                    </Link>
                    <Link href={`/stages/${stageId}/defis`} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center gap-1 hover:bg-slate-50 transition">
                        <span className="material-symbols-outlined text-xl text-emerald-500">eco</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Défis</span>
                    </Link>
                    <Link href={`/stages/${stageId}/bilan`} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center gap-1 hover:bg-slate-50 transition">
                        <span className="material-symbols-outlined text-xl text-amber-500">article</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Bilan</span>
                    </Link>
                </section>

                {/* Historique + nouvelle semaine */}
                <section className="space-y-2">
                    {archivedStages.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Semaines passées</p>
                            {archivedStages.slice(0, 3).map(s => (
                                <Link key={s.id} href={`/stages/${s.id}/bilan`} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition active:scale-95">
                                    <span className="material-symbols-outlined text-slate-300 text-base shrink-0">archive</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-600 truncate">{s.title}</p>
                                        <p className="text-[10px] text-slate-400">{s.dates}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 text-sm shrink-0">chevron_right</span>
                                </Link>
                            ))}
                            {archivedStages.length > 3 && (
                                <Link href="/stages/historique" className="block text-center text-xs font-bold text-slate-400 hover:text-slate-600 py-1 transition">
                                    Voir tout l'historique ({archivedStages.length})
                                </Link>
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
                </section>

            </main>
        </div>
    );
}
