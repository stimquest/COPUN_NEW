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
    firstSessionId: string | null;
};

const THEME_LABELS: Record<string, string> = {
    caracteristiques_littoral: 'Littoral',
    reperes_spatio_temporels: 'Repères',
    interactions_climatiques: 'Climat',
    biodiversite_saisonnalite: 'Biodiversité',
    activites_humaines: 'Activités humaines',
    lecture_paysage: 'Paysage',
    cohabitation_vivant: 'Cohabitation',
    impact_presence_humaine: 'Impact humain',
    sciences_participatives: 'Sciences part.',
};

type Props = { stage: DashboardStage; compact?: boolean };

export default function StageDashboardCard({ stage, compact }: Props) {
    const router = useRouter();
    const isWIP = stage.totalSessions === 0;

    const progressPerc = stage.contentCount > 0
        ? Math.min(Math.round((stage.validationCount / stage.contentCount) * 100), 100)
        : 0;

    const defisTotal   = stage.exploitsSummary.total;
    const defisOk      = stage.exploitsSummary.completed;
    const allDefisOk   = defisTotal > 0 && defisOk === defisTotal;

    if (compact) {
        return (
            <Link href={`/stages/${stage.id}`}>
                <div className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all">
                    <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <span className="material-symbols-outlined text-lg">archive</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-700 uppercase tracking-tight italic truncate">{stage.title}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{stage.dates} · {stage.level}</p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-slate-400">{progressPerc}%</p>
                        <p className="text-[10px] text-slate-300">progression</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-base group-hover:text-slate-500 transition-colors">chevron_right</span>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/stages/${stage.id}`}>
            <div className="group relative bg-white rounded-[2rem] border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 active:scale-[0.98] overflow-hidden shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_-8px_rgba(79,70,229,0.18)]">

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                            <span className={clsx(
                                'inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest mb-2',
                                isWIP
                                    ? 'bg-amber-50 text-amber-600'
                                    : progressPerc === 100
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-indigo-50 text-indigo-600'
                            )}>
                                <span className="relative flex size-1.5">
                                    {!isWIP && progressPerc < 100 && (
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                                    )}
                                    <span className={clsx(
                                        'relative inline-flex size-1.5 rounded-full',
                                        isWIP ? 'bg-amber-500' : progressPerc === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                    )} />
                                </span>
                                {isWIP ? 'En préparation' : progressPerc === 100 ? 'Terminé' : 'En cours'}
                            </span>
                            <h3 className="text-xl font-black text-slate-900 uppercase leading-tight italic truncate">
                                {stage.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-400">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                                    {stage.dates}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">school</span>
                                    {stage.level}
                                </span>
                            </div>
                        </div>

                        {!isWIP && (
                            <button
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.push(stage.firstSessionId ? `/session/${stage.firstSessionId}` : `/stages/${stage.id}`);
                                }}
                                className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0"
                                title="Lancer la séance"
                            >
                                <span className="material-symbols-outlined text-lg">play_arrow</span>
                            </button>
                        )}
                    </div>

                    {/* Métriques en ligne */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">

                        {/* Progression */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression</span>
                                <span className="text-[11px] font-black text-indigo-600">{progressPerc}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={clsx(
                                        'h-full rounded-full transition-all duration-700',
                                        progressPerc === 100 ? 'bg-emerald-400' : 'bg-indigo-500'
                                    )}
                                    style={{ width: `${progressPerc}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{stage.validationCount}/{stage.contentCount} notions</p>
                        </div>

                        <div className="w-px h-10 bg-slate-100 shrink-0" />

                        {/* Défis */}
                        <div className="shrink-0 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Défis</span>
                            <div className={clsx(
                                'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-sm font-black',
                                allDefisOk
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                            )}>
                                {defisOk}/{defisTotal}
                                {allDefisOk && <span className="material-symbols-outlined text-[13px] text-emerald-500">check_circle</span>}
                            </div>
                        </div>
                    </div>

                    {/* Thèmes — pleine largeur, lisibles */}
                    {stage.themes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Thèmes</span>
                            <div className="flex flex-wrap gap-1.5">
                                {stage.themes.map(t => (
                                    <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold">
                                        {THEME_LABELS[t] ?? t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
