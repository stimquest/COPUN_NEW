'use client';

import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import type { StageObjectiveDashboardStats, ObservationsDashboardStats } from '@/services/data-service';
import { PILLARS } from '@/data/etages';

/** Referme une section repliée dès qu'on clique n'importe où en dehors d'elle — évite
 * d'avoir à retaper sur son en-tête une fois consultée. */
function useCollapseOnOutsideClick<T extends HTMLElement>(open: boolean, onClose: () => void) {
    const ref = useRef<T>(null);
    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: PointerEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('pointerdown', handleClickOutside);
        return () => document.removeEventListener('pointerdown', handleClickOutside);
    }, [open, onClose]);
    return ref;
}

export type MonitorRow = { monitor_id: string; full_name: string; club_name: string | null; total_points: number };
export type ClubRow = { club_id: string; club_name: string; total_points: number };

interface Props {
    monitors: MonitorRow[];
    clubs: ClubRow[];
    currentUserId: string | null;
    myPoints: number;
    objectiveDashboard: StageObjectiveDashboardStats;
    observationsDashboard: ObservationsDashboardStats;
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Paliers de connaissances — la même donnée que "catalogue exploré", mais présentée
// comme une progression personnelle valorisante plutôt que du reporting : l'acquisition
// des connaissances environnement devient un parcours, pas une obligation fédérale.
const KNOWLEDGE_LEVELS = [
    { min: 0, label: 'Moussaillon' },
    { min: 10, label: 'Matelot' },
    { min: 30, label: 'Second' },
    { min: 60, label: 'Capitaine' },
    { min: 100, label: 'Sentinelle' },
];

function KnowledgeProgressCard({ explored, total }: { explored: number; total: number }) {
    const levelIndex = KNOWLEDGE_LEVELS.reduce((acc, lvl, i) => (explored >= lvl.min ? i : acc), 0);
    const level = KNOWLEDGE_LEVELS[levelIndex];
    const next = KNOWLEDGE_LEVELS[levelIndex + 1] ?? null;
    const pct = next
        ? Math.round(((explored - level.min) / (next.min - level.min)) * 100)
        : 100;

    return (
        <div className="rounded-3xl p-4 ring-1 ring-black/5 bg-amber-100 text-amber-950">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Tes connaissances</p>
            <div className="mt-1 flex items-baseline gap-2">
                <p className="text-3xl font-black leading-none">{level.label}</p>
                <span className="material-symbols-outlined text-xl text-amber-600">workspace_premium</span>
            </div>
            <p className="mt-2 text-xs font-semibold opacity-75">{explored} notion{explored > 1 ? 's' : ''} explorée{explored > 1 ? 's' : ''} sur {total}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/60">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${Math.max(4, pct)}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] font-bold opacity-60">
                {next ? `Encore ${next.min - explored} pour passer ${next.label}` : 'Niveau max — vraie sentinelle de l\'Océan'}
            </p>
        </div>
    );
}

function MetricCard({ label, value, helper, className }: { label: string; value: string; helper: string; className: string }) {
    return (
        <div className={clsx('rounded-3xl p-4 ring-1 ring-black/5', className)}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
            <p className="mt-1 text-3xl font-black leading-none">{value}</p>
            <p className="mt-2 text-xs font-semibold opacity-75">{helper}</p>
        </div>
    );
}


export default function StatsClient({ monitors, clubs, currentUserId, myPoints, objectiveDashboard, observationsDashboard }: Props) {
    const [activeTab, setActiveTab] = useState<'CLUBS' | 'MONITEURS'>('MONITEURS');
    // Les 4 metric cards + derniers carnets restent visibles d'emblée ; le détail plus
    // long (orientations par mot-clé, suivi thème par thème) reste disponible mais replié
    // par défaut pour ne pas noyer l'essentiel dans un scroll interminable.
    const [showOrientations, setShowOrientations] = useState(false);
    const [showPillarDetail, setShowPillarDetail] = useState(false);
    const [showObservations, setShowObservations] = useState(false);
    const orientationsRef = useCollapseOnOutsideClick<HTMLDivElement>(showOrientations, () => setShowOrientations(false));
    const pillarDetailRef = useCollapseOnOutsideClick<HTMLDivElement>(showPillarDetail, () => setShowPillarDetail(false));
    const observationsRef = useCollapseOnOutsideClick<HTMLElement>(showObservations, () => setShowObservations(false));
    const hasObjectiveData = objectiveDashboard.summary.totalObjectives > 0;

    const rows: { id: string; name: string; sub?: string; points: number; isMe: boolean }[] =
        activeTab === 'CLUBS'
            ? clubs.map(c => ({ id: c.club_id, name: c.club_name, points: c.total_points, isMe: false }))
            : monitors.map(m => ({
                id: m.monitor_id,
                name: m.full_name,
                sub: m.club_name ?? undefined,
                points: m.total_points,
                isMe: m.monitor_id === currentUserId,
            }));

    const allThemes = objectiveDashboard.pillars.flatMap(p => p.themes);
    const workedThemesCount = allThemes.filter(t => t.occurrences > 0).length;

    // Répartition précise des choix par mot-clé (ex: marée, vent, houle…) — révèle si le
    // moniteur se concentre toujours sur les mêmes notions sans jamais explorer les autres.
    const keywords = objectiveDashboard.keywords;
    const totalKeywordOccurrences = keywords.reduce((sum, k) => sum + k.occurrences, 0);
    const keywordsByFocus = [...keywords].sort((a, b) => b.occurrences - a.occurrences);
    const neverExploredKeywords = keywordsByFocus.filter(k => k.occurrences === 0);
    const topKeyword = keywordsByFocus[0];
    const topKeywordShare = topKeyword && totalKeywordOccurrences > 0 ? Math.round((topKeyword.occurrences / totalKeywordOccurrences) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <header className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                    <h1 className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase mb-2">Impact Environnemental</h1>
                    <h2 className="text-4xl font-black uppercase leading-none">Le Podium<br /><span className="text-slate-500">Du Changement</span></h2>
                </div>
            </header>

            <main className="px-6 -mt-12 relative z-20 space-y-8">

                {/* Carnets de semaine */}
                <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white via-amber-50 to-sky-50 p-5 shadow-xl shadow-slate-200/70">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Carnets de semaine</p>
                            <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Progression pédagogique</h3>
                        </div>
                        <p className="text-xs font-bold text-slate-500">
                            {objectiveDashboard.stagesCount} semaine{objectiveDashboard.stagesCount > 1 ? 's' : ''} clôturée{objectiveDashboard.stagesCount > 1 ? 's' : ''}
                        </p>
                    </div>

                    {hasObjectiveData ? (
                        <div className="mt-5 space-y-5">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCard
                                    label="Fiches travaillées"
                                    value={`${objectiveDashboard.summary.doneCount + objectiveDashboard.summary.partialCount}/${objectiveDashboard.summary.totalObjectives}`}
                                    helper="Faites ou effleurées, sur les fiches sélectionnées"
                                    className="bg-emerald-100 text-emerald-950"
                                />
                                <MetricCard
                                    label="Impact fort"
                                    value={`${objectiveDashboard.summary.wellTransmittedCount}`}
                                    helper="Fiches faites où le groupe a vraiment accroché"
                                    className="bg-violet-100 text-violet-950"
                                />
                                <MetricCard
                                    label="Thèmes abordés"
                                    value={`${workedThemesCount}/${allThemes.length}`}
                                    helper="Sur les 9 thèmes COP'UN (3 par pilier)"
                                    className="bg-sky-100 text-sky-950"
                                />
                                <KnowledgeProgressCard
                                    explored={objectiveDashboard.catalogCoverage.selected}
                                    total={objectiveDashboard.catalogCoverage.total}
                                />
                            </div>

                            {totalKeywordOccurrences > 0 && (
                                <div ref={orientationsRef} className="rounded-3xl border border-white bg-white/80 p-4 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowOrientations(o => !o)}
                                        className="w-full flex items-center justify-between gap-2 text-left"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vos orientations</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Répartition précise de vos choix par notion — reste-t-on toujours sur les mêmes sujets (marée, vent…) ?</p>
                                        </div>
                                        <span className={clsx(
                                            'material-symbols-outlined text-slate-300 text-base shrink-0 transition-transform duration-200',
                                            showOrientations && 'rotate-180'
                                        )}>expand_more</span>
                                    </button>

                                    {topKeywordShare >= 30 && (
                                        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
                                            <span className="material-symbols-outlined text-amber-500 text-base shrink-0 mt-0.5">warning</span>
                                            <p className="text-xs font-semibold text-amber-800 leading-snug">
                                                {topKeywordShare}% de vos choix portent sur « {topKeyword.tag} ». Pensez à varier vers d&apos;autres notions.
                                            </p>
                                        </div>
                                    )}

                                    <AnimatePresence initial={false}>
                                        {showOrientations && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="space-y-2.5">
                                                    {keywordsByFocus.filter(k => k.occurrences > 0).map(keyword => {
                                                        const share = Math.round((keyword.occurrences / totalKeywordOccurrences) * 100);
                                                        return (
                                                            <div key={keyword.tag}>
                                                                <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 mb-1">
                                                                    <span className="truncate capitalize">{keyword.tag}</span>
                                                                    <span className="shrink-0 text-slate-500">{keyword.occurrences}× · {share}%</span>
                                                                </div>
                                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${share}%` }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {neverExploredKeywords.length > 0 && (
                                                    <div className="pt-3">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                                                            Jamais explorés ({neverExploredKeywords.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {neverExploredKeywords.map(keyword => (
                                                                <span key={keyword.tag} className="inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full capitalize">
                                                                    {keyword.tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {objectiveDashboard.pillars.length > 0 && (
                                <div ref={pillarDetailRef} className="rounded-3xl border border-white bg-white/80 p-4 space-y-5">
                                    <button
                                        type="button"
                                        onClick={() => setShowPillarDetail(o => !o)}
                                        className="w-full flex items-center justify-between gap-2"
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suivi par pilier</p>
                                        <span className={clsx(
                                            'material-symbols-outlined text-slate-300 text-base shrink-0 transition-transform duration-200',
                                            showPillarDetail && 'rotate-180'
                                        )}>expand_more</span>
                                    </button>
                                    {objectiveDashboard.pillars.map(pillarStat => {
                                        const pillar = PILLARS.find(p => p.id === pillarStat.pillarId);
                                        if (!pillar) return null;
                                        const pillarWorked = pillarStat.summary.doneCount + pillarStat.summary.partialCount;
                                        const pillarTotal = pillarStat.summary.totalObjectives;
                                        const pillarPct = pillarTotal > 0 ? Math.round((pillarWorked / pillarTotal) * 100) : 0;
                                        return (
                                            <div key={pillarStat.pillarId} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={clsx('size-6 rounded-lg flex items-center justify-center shrink-0', pillar.bg)}>
                                                        <span className="material-symbols-outlined text-white text-sm">{pillar.icon}</span>
                                                    </div>
                                                    <p className={clsx('text-xs font-black uppercase tracking-tight flex-1', pillar.color)}>{pillar.label}</p>
                                                    <span className="text-xs font-bold text-slate-500">
                                                        {pillarTotal > 0 ? `${pillarWorked}/${pillarTotal} travaillées` : 'Aucune fiche sélectionnée'}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                    <div className={clsx('h-full rounded-full', pillar.bg)} style={{ width: `${pillarPct}%` }} />
                                                </div>
                                                <AnimatePresence initial={false}>
                                                    {showPillarDetail && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="space-y-1.5 pt-1">
                                                                {pillarStat.themes.map(theme => (
                                                                    <div
                                                                        key={theme.id}
                                                                        className={clsx(
                                                                            'rounded-xl border px-3 py-2.5',
                                                                            theme.occurrences === 0 ? 'border-dashed border-slate-200 bg-slate-50/50' : 'border-white bg-white'
                                                                        )}
                                                                    >
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="material-symbols-outlined text-base text-slate-400 shrink-0 mt-0.5">{theme.icon}</span>
                                                                            <p className="text-xs font-bold text-slate-700 leading-snug flex-1">{theme.label}</p>
                                                                        </div>
                                                                        <div className="mt-1.5 pl-6.5 flex items-center gap-1.5 flex-wrap">
                                                                            {theme.occurrences === 0 ? (
                                                                                <span className="text-[10px] font-semibold text-slate-400">Jamais abordé</span>
                                                                            ) : (
                                                                                <>
                                                                                    <span className="text-[10px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded-full">
                                                                                        {theme.summary.doneCount + theme.summary.partialCount}/{theme.summary.totalObjectives} travaillées
                                                                                    </span>
                                                                                    {theme.observationCount > 0 && (
                                                                                        <span className="text-[10px] font-bold text-emerald-600">+{theme.observationCount} retour{theme.observationCount > 1 ? 's' : ''} terrain</span>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                            {theme.catalogCount > 0 && (
                                                                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                                                                                    {theme.selectedCount}/{theme.catalogCount} fiches explorées
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {objectiveDashboard.recentStages.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Derniers carnets</p>
                                    {objectiveDashboard.recentStages.map(stage => (
                                        <Link key={stage.id} href={`/stages/${stage.id}/bilan`} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-white transition hover:bg-white">
                                            <span className="min-w-0 truncate">{stage.title}</span>
                                            <span className="shrink-0 text-slate-950 text-xs">
                                                {stage.summary.doneCount + stage.summary.partialCount}/{stage.summary.totalObjectives} travaillées
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-3xl border border-dashed border-orange-200 bg-white/70 p-5 text-sm font-semibold text-slate-600">
                            Les premiers carnets clôturés alimenteront ici le suivi stage après stage.
                        </div>
                    )}
                </section>

                {/* Retours terrain */}
                <section ref={observationsRef} className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-sky-50 p-5 shadow-xl shadow-slate-200/70">
                    <button
                        type="button"
                        onClick={() => observationsDashboard.totalObservations > 0 && setShowObservations(o => !o)}
                        className="w-full flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between text-left"
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Sciences participatives</p>
                            <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Retours terrain</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-500">
                                {observationsDashboard.totalObservations} observation{observationsDashboard.totalObservations > 1 ? 's' : ''}
                            </p>
                            {observationsDashboard.totalObservations > 0 && (
                                <span className={clsx(
                                    'material-symbols-outlined text-slate-300 text-base shrink-0 transition-transform duration-200',
                                    showObservations && 'rotate-180'
                                )}>expand_more</span>
                            )}
                        </div>
                    </button>

                    {observationsDashboard.totalObservations > 0 ? (
                        <AnimatePresence initial={false}>
                            {showObservations && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-5 space-y-5">
                                        {observationsDashboard.byType.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {observationsDashboard.byType.map(t => (
                                                    <span key={t.type} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-white px-3 py-1.5 text-xs font-bold text-slate-700">
                                                        <span className="material-symbols-outlined text-sm text-emerald-600">{t.icon}</span>
                                                        {t.label}
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{t.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {observationsDashboard.topSpecies.length > 0 && (
                                            <div className="rounded-3xl border border-white bg-white/80 p-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Espèces / éléments les plus observés</p>
                                                <ul className="space-y-1.5">
                                                    {observationsDashboard.topSpecies.map(s => (
                                                        <li key={`${s.type}-${s.name}`} className="text-xs font-bold text-slate-700 flex justify-between items-center">
                                                            <span className="truncate">{s.name}</span>
                                                            <span className="text-[10px] font-black text-white bg-emerald-600 px-2 py-0.5 rounded-full shrink-0 ml-2">×{s.count}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <div className="mt-5 rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-5 text-sm font-semibold text-slate-600">
                            Les retours terrain enregistrés depuis l&apos;accueil des semaines alimenteront ici un suivi des observations.
                        </div>
                    )}
                </section>

                {/* Switcher */}
                <div className="bg-white p-1.5 rounded-2xl shadow-xl flex border border-slate-100">
                    <button
                        onClick={() => setActiveTab('MONITEURS')}
                        className={clsx("flex-1 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all", activeTab === 'MONITEURS' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
                    >
                        Moniteurs
                    </button>
                    <button
                        onClick={() => setActiveTab('CLUBS')}
                        className={clsx("flex-1 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all", activeTab === 'CLUBS' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
                    >
                        Clubs
                    </button>
                </div>

                {/* Leaderboard */}
                {rows.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-10 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">leaderboard</span>
                        <p className="text-sm font-bold text-slate-400 italic">
                            Pas encore de points enregistrés.<br />Les premiers défis validés feront vivre le classement !
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rows.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className={clsx(
                                    "p-4 sm:p-5 rounded-[2rem] border shadow-sm flex items-center gap-3 relative overflow-hidden",
                                    item.isMe ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-200" : "bg-white border-slate-100"
                                )}
                            >
                                {/* Rang */}
                                <div className={clsx(
                                    "size-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-black",
                                    index === 0 ? "bg-yellow-400 text-yellow-900" :
                                        index === 1 ? "bg-slate-200 text-slate-700" :
                                            index === 2 ? "bg-amber-600 text-amber-100" :
                                                "bg-slate-100 text-slate-400"
                                )}>
                                    {index + 1}
                                </div>

                                {/* Avatar */}
                                <div className={clsx(
                                    "size-11 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm",
                                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                                        index === 1 ? "bg-slate-100 text-slate-600" :
                                            index === 2 ? "bg-amber-100 text-amber-700" :
                                                "bg-indigo-50 text-indigo-500"
                                )}>
                                    {initials(item.name)}
                                </div>

                                {/* Nom + sous-titre — bloc qui rétrécit */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase leading-tight truncate">
                                            {item.name}
                                        </h3>
                                        {item.isMe && <span className="shrink-0 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full tracking-widest">VOUS</span>}
                                    </div>
                                    {item.sub && <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5 truncate">{item.sub}</p>}
                                </div>

                                {/* Points */}
                                <div className="text-right shrink-0 pl-1">
                                    <span className={clsx("text-xl sm:text-2xl font-black block leading-none", index < 3 ? "text-indigo-600" : "text-slate-900")}>{item.points}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Points</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <span className="material-symbols-outlined text-4xl mb-4">campaign</span>
                    <h3 className="text-xl font-black uppercase mb-2">Votre score : {myPoints} pts</h3>
                    <p className="text-sm font-medium opacity-80 mb-6 leading-relaxed">Chaque défi validé et chaque quiz de fin de semaine rapportent des points à votre club. Continuez à transmettre !</p>
                    <Link href="/classement" className="w-full h-14 bg-white text-indigo-600 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center">
                        Voir le barème détaillé
                    </Link>
                </div>
            </main>
        </div>
    );
}
