'use client';

import Link from 'next/link';
import clsx from 'clsx';

export type DashboardStage = {
    id: string;
    title: string;
    level: string;
    activity: string;
    dates: string;
    closed_at: string | null;
    created_at: string;
    contentCount: number;
    workedCount: number;
    exploitsSummary: { completed: number; total: number };
    quiz: { done: boolean; score: number; total: number } | null;
};

type Props = { stage: DashboardStage };

export default function StageDashboardCard({ stage }: Props) {
    const { contentCount, workedCount, exploitsSummary, quiz, closed_at } = stage;
    const isClosed = !!closed_at;
    const pct = contentCount > 0 ? Math.min(Math.round((workedCount / contentCount) * 100), 100) : 0;
    const allDefisOk = exploitsSummary.total > 0 && exploitsSummary.completed === exploitsSummary.total;

    return (
        <Link href={`/stages/${stage.id}`}>
            <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.99] overflow-hidden">
                <div className="px-4 py-4">
                    {/* Titre + badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-black text-base text-slate-900 italic truncate">{stage.title}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{stage.dates} · {stage.level}</p>
                        </div>
                        {isClosed ? (
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                                <span className="size-1.5 rounded-full bg-slate-400" />
                                Archivé
                            </span>
                        ) : (
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                En cours
                            </span>
                        )}
                    </div>

                    {/* Objectifs — stat principale */}
                    {contentCount > 0 && (
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objectifs</span>
                                <span className="text-[10px] font-bold text-slate-500">{workedCount}/{contentCount} travaillés</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={clsx('h-full rounded-full transition-all duration-500', pct === 100 ? 'bg-emerald-500' : 'bg-amber-400')}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Stats secondaires */}
                    <div className="flex gap-2 flex-wrap">
                        {exploitsSummary.total > 0 && (
                            <span className={clsx(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold',
                                allDefisOk
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                            )}>
                                <span className="material-symbols-outlined text-[12px]">eco</span>
                                {exploitsSummary.completed}/{exploitsSummary.total} défis
                            </span>
                        )}
                        {quiz && (
                            <span className={clsx(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold',
                                quiz.done
                                    ? 'bg-violet-50 border-violet-200 text-violet-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                            )}>
                                <span className="material-symbols-outlined text-[12px]">quiz</span>
                                {quiz.done ? `${quiz.score}/${quiz.total}` : 'Quiz à faire'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
