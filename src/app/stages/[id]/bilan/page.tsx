import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ReopenConfirmSheet } from '@/components/ReopenConfirmSheet';
import { StageClosureReview } from '@/components/StageClosureReview';
import { StageObjectiveReviewList } from '@/components/StageObjectiveReviewList';
import {
    StageClosingNotes,
    StageReviewHighlights,
    formatStageClosedAt,
} from '@/components/StageReviewBlocks';
import { getStageById, getStageCockpitStats, getStageObjectiveReviewItems } from '@/services/data-service';

function pluralize(value: number, singular: string, plural?: string) {
    return `${value} ${value > 1 ? (plural ?? `${singular}s`) : singular}`;
}

export default async function StageBilanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [stage, stats, objectiveItems] = await Promise.all([
        getStageById(id),
        getStageCockpitStats(id),
        getStageObjectiveReviewItems(id),
    ]);

    if (!stage) return notFound();

    const isClosed = !!stage.closed_at;
    if (!isClosed && !stats?.quizDone) {
        redirect(`/stages/${id}`);
    }

    const closedAtLabel = formatStageClosedAt(stage.closed_at);

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-slate-50 to-slate-50">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
                    <Link href={`/stages/${id}`} className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all shrink-0">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Carnet de stage</p>
                        <h1 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">{stage.title}</h1>
                    </div>
                    {isClosed && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Clôturé
                        </span>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-6 pb-10 sm:px-6">
                <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white via-amber-50 to-sky-50 px-6 py-7 text-slate-950 shadow-sm sm:px-8 sm:py-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
                                {isClosed ? 'Carnet archivé' : 'Carnet de stage'}
                            </p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight">
                                {isClosed ? 'La trace du stage est conservée' : 'Objectifs, mémo, clôture'}
                            </h2>
                            <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
                                {isClosed ? 'À relire avant un prochain groupe.' : 'Un format court pour garder ce qui compte.'}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:max-w-sm lg:grid-cols-1">
                            <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activité</p>
                                <p className="mt-1 text-sm font-bold">{stage.activity}</p>
                            </div>
                            <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Repère</p>
                                <p className="mt-1 text-sm font-bold">{stage.dates}</p>
                            </div>
                            <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Groupe</p>
                                <p className="mt-1 text-sm font-bold">
                                    {stage.nb_stagiaires ? pluralize(stage.nb_stagiaires, 'stagiaire') : stage.level}
                                </p>
                            </div>
                        </div>
                    </div>

                    {closedAtLabel && (
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                            <span className="material-symbols-outlined text-[16px]">event_available</span>
                            Clôturé le {closedAtLabel}
                        </div>
                    )}
                </section>

                <div className="mt-6 space-y-6">
                    {isClosed ? (
                        <>
                            <StageObjectiveReviewList
                                items={objectiveItems}
                                title="Objectifs"
                                intro="La trace objectif par objectif : ce qui a été travaillé, effleuré ou non abordé, et ce que le groupe en a retenu."
                            />
                            {stage.closing_notes
                                ? <StageClosingNotes notes={stage.closing_notes} title="Mémo moniteur" />
                                : (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm leading-relaxed text-slate-600">
                                        Aucune note de bilan n’a été enregistrée lors de la clôture de ce stage.
                                    </div>
                                )}

                            <StageReviewHighlights stats={stats} closedAt={stage.closed_at} />

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <Link
                                    href={`/stages/${id}`}
                                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Retour à la fiche stage
                                </Link>
                                <ReopenConfirmSheet stageId={stage.id} />
                            </div>
                        </>
                    ) : (
                        <StageClosureReview
                            stageId={stage.id}
                            stageTitle={stage.title}
                            objectiveItems={objectiveItems}
                            initialClosingNotes={stage.closing_notes}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}