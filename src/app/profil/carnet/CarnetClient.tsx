'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { PracticeJournal, FicheTrajectory, JournalWeek } from '@/services/practice-journal';
import { StageObjectiveExecutionStatus, StageObjectiveImpactLevel } from '@/types';

const STATUS_LABELS: Record<StageObjectiveExecutionStatus, string> = {
    not_done: 'Non abordé',
    partial: 'Effleuré',
    done: 'Travaillé',
};

/** Couleur d'une pastille de tentative : gris → ambre → vert → vert plein (fort impact). */
function attemptDotClass(status: StageObjectiveExecutionStatus, impact: StageObjectiveImpactLevel | null): string {
    if (status === 'not_done') return 'bg-slate-300';
    if (status === 'partial') return 'bg-amber-400';
    if (impact === 'high') return 'bg-emerald-600';
    return 'bg-emerald-300';
}

function formatClosedAt(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ── Trajectoire d'une fiche : une ligne dépliable ────────────────────────────

function TrajectoryRow({ trajectory }: { trajectory: FicheTrajectory }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
            <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
                <span className="flex-1 min-w-0 text-xs font-bold text-slate-700 leading-snug">{trajectory.question}</span>
                <span className="flex items-center gap-1 shrink-0">
                    {trajectory.attempts.map((a, i) => (
                        <span key={i} className={clsx('size-2.5 rounded-full', attemptDotClass(a.status, a.impact))} />
                    ))}
                </span>
                <span className={clsx('material-symbols-outlined text-slate-300 text-base shrink-0 transition-transform', open && 'rotate-180')}>
                    expand_more
                </span>
            </button>
            {open && (
                <div className="border-t border-slate-100 px-3 py-2.5 space-y-2">
                    {trajectory.attempts.map((a, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className={clsx('mt-1 size-2 rounded-full shrink-0', attemptDotClass(a.status, a.impact))} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-slate-600">
                                    {a.weekTitle} · {formatClosedAt(a.closedAt)} — {STATUS_LABELS[a.status]}
                                    {a.status === 'done' && a.impact === 'high' && ', fort impact'}
                                </p>
                                {a.note?.trim() && <p className="text-[11px] text-slate-500 italic mt-0.5">« {a.note.trim()} »</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Page de journal d'une semaine ────────────────────────────────────────────

function WeekEntry({ week }: { week: JournalWeek }) {
    const [open, setOpen] = useState(false);
    const hasDetail = week.ficheNotes.length > 0;

    const summaryParts = [
        `${week.workedCount} objectif${week.workedCount > 1 ? 's' : ''} travaillé${week.workedCount > 1 ? 's' : ''} sur ${week.totalCount}`,
    ];
    if (week.highImpactCount > 0) summaryParts.push(`${week.highImpactCount} fort${week.highImpactCount > 1 ? 's' : ''} impact${week.highImpactCount > 1 ? 's' : ''}`);
    if (week.quizScore !== null && week.quizTotal !== null) summaryParts.push(`quiz ${week.quizScore}/${week.quizTotal}`);

    return (
        <article className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="px-4 pt-3.5 pb-3">
                <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-black text-slate-900 truncate">{week.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 shrink-0">clôturée le {formatClosedAt(week.closedAt)}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">{summaryParts.join(' · ')}</p>
                {week.closingNote && (
                    <p className="mt-2 text-xs text-slate-600 italic leading-relaxed border-l-2 border-slate-200 pl-3">
                        {week.closingNote}
                    </p>
                )}
            </div>
            {hasDetail && (
                <>
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="w-full flex items-center justify-center gap-1 border-t border-slate-100 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition"
                    >
                        {open ? 'Masquer' : `Mes notes de bilan (${week.ficheNotes.length})`}
                        <span className={clsx('material-symbols-outlined text-sm transition-transform', open && 'rotate-180')}>expand_more</span>
                    </button>
                    {open && (
                        <div className="border-t border-slate-100 px-4 py-3 space-y-2.5 bg-slate-50/50">
                            {week.ficheNotes.map((n, i) => (
                                <div key={i}>
                                    <p className="text-[11px] font-bold text-slate-600">{n.question} — {STATUS_LABELS[n.status]}</p>
                                    <p className="text-[11px] text-slate-500 italic mt-0.5">« {n.note} »</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </article>
    );
}

// ── Carnet complet ───────────────────────────────────────────────────────────

export function CarnetClient({ journal }: { journal: PracticeJournal }) {
    const [showAllWeeks, setShowAllWeeks] = useState(false);
    const visibleWeeks = showAllWeeks ? journal.weeks : journal.weeks.slice(0, 5);
    const maxTotal = Math.max(...journal.evolution.map(e => e.total), 1);

    return (
        <div className="space-y-6">

            {/* Observations */}
            {journal.insights.length > 0 && (
                <section className="rounded-2xl bg-slate-900 p-5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Ce que ton carnet raconte</p>
                    {journal.insights.map((insight, i) => (
                        <p key={i} className="text-sm text-white/90 leading-relaxed flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-indigo-400 text-base shrink-0 mt-0.5">arrow_forward</span>
                            {insight}
                        </p>
                    ))}
                </section>
            )}

            {/* Rappel */}
            {journal.reminder && (
                <section className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1.5">Tu avais noté</p>
                    <p className="text-sm text-amber-900 italic leading-relaxed">« {journal.reminder.note} »</p>
                    <p className="text-xs text-amber-700 mt-1.5">
                        Sur « {journal.reminder.question} », il y a {journal.reminder.weeksAgo} semaine{journal.reminder.weeksAgo > 1 ? 's' : ''} — pas reprise depuis.
                    </p>
                </section>
            )}

            {/* Évolution */}
            {journal.evolution.length >= 2 && (
                <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Ton évolution</p>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2.5">
                        {journal.evolution.map((e, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between gap-3 mb-1">
                                    <span className="text-[11px] font-bold text-slate-600 truncate">{e.weekTitle}</span>
                                    <span className="text-[11px] font-bold text-slate-500 shrink-0">{e.worked}/{e.total}</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                                    {/* Barre proportionnelle au nombre de fiches prévues, remplie selon ce qui a été travaillé */}
                                    <div
                                        className="h-full bg-emerald-500 rounded-l-full"
                                        style={{ width: `${(e.worked / maxTotal) * 100}%` }}
                                    />
                                    <div
                                        className="h-full bg-slate-200"
                                        style={{ width: `${((e.total - e.worked) / maxTotal) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        <p className="text-[10px] text-slate-400 pt-1">
                            <span className="inline-block size-2 rounded-full bg-emerald-500 mr-1 align-middle" />travaillé
                            <span className="inline-block size-2 rounded-full bg-slate-200 ml-3 mr-1 align-middle" />prévu mais pas fait
                        </p>
                    </div>
                </section>
            )}

            {/* Fiches en progression / qui résistent */}
            {(journal.progressing.length > 0 || journal.resisting.length > 0) && (
                <section className="space-y-4">
                    {journal.progressing.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 mb-2">En progression</p>
                            <div className="space-y-1.5">
                                {journal.progressing.map(t => <TrajectoryRow key={t.contentId} trajectory={t} />)}
                            </div>
                        </div>
                    )}
                    {journal.resisting.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 mb-2">Ça résiste</p>
                            <div className="space-y-1.5">
                                {journal.resisting.map(t => <TrajectoryRow key={t.contentId} trajectory={t} />)}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Fil des semaines */}
            <section>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Le fil de tes semaines</p>
                <div className="space-y-2.5">
                    {visibleWeeks.map(week => <WeekEntry key={week.id} week={week} />)}
                </div>
                {!showAllWeeks && journal.weeks.length > 5 && (
                    <button
                        onClick={() => setShowAllWeeks(true)}
                        className="block w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 py-2.5 transition"
                    >
                        Voir les {journal.weeks.length - 5} semaines plus anciennes
                    </button>
                )}
            </section>
        </div>
    );
}
