import { unstable_noStore as noStore } from 'next/cache';
import { getStageById, getStageCockpitStats, getStageObjectiveReviewItems } from '@/services/data-service';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteStageButton } from '@/components/DeleteStageButton';
import { ReopenConfirmSheet } from '@/components/ReopenConfirmSheet';
import { StageObjectiveReviewList } from '@/components/StageObjectiveReviewList';

export default async function StagePage({ params }: { params: Promise<{ id: string }> }) {
    noStore();
    const { id } = await params;
    const stage = await getStageById(id);

    if (!stage) return notFound();

    const [stats, objectiveItems] = await Promise.all([
        getStageCockpitStats(id),
        getStageObjectiveReviewItems(id),
    ]);

    const isClosed = !!stage.closed_at;
    const prevu = objectiveItems.length;
    const fait = objectiveItems.filter(i => i.review?.executionStatus === 'done' || i.review?.executionStatus === 'partial').length;
    const pct = prevu > 0 ? Math.round((fait / prevu) * 100) : 0;
    const defisTotal = stats?.defisTotal ?? 0;
    const defisDone = stats?.defisDone ?? 0;
    const quizDone = stats?.quizDone ?? false;

    return (
        <div className="min-h-screen bg-slate-50 pb-32">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
                    <Link href="/stages" className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition active:scale-95 shrink-0">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fiche stage</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{stage.title}</p>
                    </div>
                    {isClosed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500 shrink-0">
                            <span className="size-1.5 rounded-full bg-slate-400" />
                            Archivé
                        </span>
                    ) : (
                        <DeleteStageButton stageId={stage.id} />
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

                {/* Infos stage */}
                <section className="bg-white rounded-2xl border border-slate-200 px-4 py-4">
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">{stage.title}</h1>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-300">sailing</span>
                            {stage.activity}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-300">calendar_month</span>
                            {stage.dates}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-300">school</span>
                            {stage.level}
                        </span>
                        {stage.nb_stagiaires && (
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-slate-300">group</span>
                                {stage.nb_stagiaires} stagiaires
                            </span>
                        )}
                    </div>

                    {/* Barre de progression */}
                    {prevu > 0 && (
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0">{fait}/{prevu} travaillés</span>
                        </div>
                    )}
                </section>

                {/* Actions rapides */}
                <div className="grid grid-cols-3 gap-2">
                    <Link href={`/stages/${id}/program`} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center hover:bg-slate-50 transition active:scale-95">
                        <span className="material-symbols-outlined text-xl text-sky-500 mb-1">track_changes</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Objectifs</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{prevu} fiches</span>
                    </Link>
                    <Link href={`/stages/${id}/defis`} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center hover:bg-slate-50 transition active:scale-95">
                        <span className="material-symbols-outlined text-xl text-emerald-500 mb-1">eco</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Défis</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{defisDone}/{defisTotal} validés</span>
                    </Link>
                    <Link href={`/stages/${id}/quiz`} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center hover:bg-slate-50 transition active:scale-95">
                        <span className="material-symbols-outlined text-xl text-violet-500 mb-1">quiz</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Quiz</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{quizDone ? 'Terminé ✓' : 'À faire'}</span>
                    </Link>
                </div>

                {/* CTA Bilan */}
                {!isClosed && (
                    <Link
                        href={`/stages/${id}/bilan`}
                        className="flex items-center justify-between bg-slate-900 text-white rounded-2xl px-4 py-4 hover:bg-slate-800 transition active:scale-95"
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Bilan de la semaine</p>
                            <p className="text-sm font-bold">Clôturer le stage</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-white/60">arrow_forward</span>
                    </Link>
                )}

                {/* Objectifs */}
                <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Objectifs de la semaine</p>
                    <StageObjectiveReviewList items={objectiveItems} />
                </section>

                {/* Mémo + actions si clôturé */}
                {isClosed && (
                    <>
                        {stage.closing_notes?.trim() && (
                            <section>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Mémo moniteur</p>
                                <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{stage.closing_notes}</p>
                                </div>
                            </section>
                        )}

                        <div className="flex gap-3">
                            <Link
                                href={`/stages/${id}/bilan`}
                                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 flex items-center justify-center hover:bg-slate-50 transition"
                            >
                                Voir le bilan complet
                            </Link>
                            <ReopenConfirmSheet stageId={stage.id} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
