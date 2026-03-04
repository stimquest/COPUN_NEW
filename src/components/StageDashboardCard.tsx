'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export type DashboardStage = {
    id: string;
    title: string;
    level: string;
    dates: string;
    selected_content: string[] | null;
    created_at: string;
    exploitsSummary: { completed: number; total: number };
    validationCount: number;
    contentCount: number;
    themes: string[];
    totalSessions: number;
};

type Props = {
    stage: DashboardStage;
};

export default function StageDashboardCard({ stage }: Props) {
    const router = useRouter();
    const isWIP = stage.totalSessions === 0;

    // Calculate Progress
    const progressPerc = stage.contentCount > 0
        ? Math.round((stage.validationCount / stage.contentCount) * 100)
        : 0;

    const cappedProgress = Math.min(progressPerc, 100);

    return (
        <Link href={`/stages/${stage.id}`}>
            <div className="group relative bg-white rounded-[2.5rem] border-2 border-slate-100 p-6 sm:p-8 shadow-xl shadow-slate-200/50 hover:border-indigo-500 transition-all active:scale-[0.98] overflow-hidden flex flex-col gap-6">

                {/* Background Icon */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-8xl">sailing</span>
                </div>

                {/* Header (Identity) */}
                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className={clsx(
                            "inline-block text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                            isWIP
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                            {isWIP ? 'En Préparation' : 'En Cours'}
                        </span>

                        {/* Session Shortcut if active */}
                        {!isWIP && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.push(`/session/${stage.id}`);
                                }}
                                className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm cursor-pointer"
                                title="Lancer la séance"
                            >
                                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                            </button>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase leading-tight italic">
                        {stage.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_month</span> {stage.dates}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">school</span> {stage.level}</span>
                    </div>
                </div>

                {/* Body (Metrics) */}
                <div className="relative z-10 grid gap-4 bg-slate-50 rounded-3xl p-4 sm:p-5 border border-slate-100">

                    {/* Progression Pédagogique */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">menu_book</span> Progression
                            </span>
                            <span className="text-xs font-bold text-indigo-600">{cappedProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${cappedProgress}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">{stage.validationCount} notions vues sur {stage.contentCount}</p>
                    </div>

                    <div className="h-px w-full bg-slate-200"></div>

                    {/* Themes & Defis */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-4 justify-between items-center">
                        <div className="flex-1">
                            <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                <span className="material-symbols-outlined text-[14px]">eco</span> L&apos;ADN du Stage
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {stage.themes.length > 0 ? (
                                    stage.themes.map(t => (
                                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold uppercase truncate max-w-[100px]">
                                            {t}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10px] text-slate-400 italic">Non défini</span>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end border-l border-slate-200 pl-4">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">workspace_premium</span> Défis
                            </span>
                            <div className={clsx(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border",
                                stage.exploitsSummary.total > 0 && stage.exploitsSummary.completed === stage.exploitsSummary.total
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-700"
                            )}>
                                <span className="font-black text-sm">{stage.exploitsSummary.completed}/{stage.exploitsSummary.total}</span>
                                {stage.exploitsSummary.total > 0 && stage.exploitsSummary.completed === stage.exploitsSummary.total && (
                                    <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Link>
    );
}
