import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteStageButton } from '@/components/DeleteStageButton';
import { ReopenConfirmSheet } from '@/components/ReopenConfirmSheet';
import { StageClosureReview } from '@/components/StageClosureReview';
import { StageDefisReview, DefiReview } from '@/components/StageDefisReview';
import { StageObservationsReview } from '@/components/StageObservationsReview';
import ProgrammeCondense from '@/components/ProgrammeCondense';
import { getStageById, getStageCockpitStats, getPedagogicalPool } from '@/services/data-service';
import { getStageExploits } from '@/actions/defi-actions';
import { getStageQuiz } from '@/actions/quiz-actions';
import { getStagePreparations } from '@/actions/preparation-actions';
import { getObservationsForStage } from '@/actions/observation-actions';
import { RESSENTI_OPTIONS, isRessentiNiveau } from '@/lib/stage-ressenti';
import { parseStageDateRange } from '@/lib/stage-dates';
import { PedagogicalContent } from '@/types';

export default async function StageBilanPage({ params }: { params: Promise<{ id: string }> }) {
    noStore();
    const { id } = await params;

    const [stage, stats, copunPool, defisAssigned, quizData, observations, preparations] = await Promise.all([
        getStageById(id),
        getStageCockpitStats(id),
        getPedagogicalPool(),
        getStageExploits(id),
        getStageQuiz(id),
        getObservationsForStage(id),
        getStagePreparations(id),
    ]);

    if (!stage) return notFound();

    const selectedIds: string[] = stage.selected_content ?? [];
    const objectives = selectedIds
        .map(cid => copunPool.find((c: PedagogicalContent) => c.id === cid))
        .filter((c): c is PedagogicalContent => Boolean(c) && c.source !== 'custom');

    const isClosed = !!stage.closed_at;

    const totalPts = stats?.stageTotalPoints ?? 0;
    const quizScore = stats?.quizScore ?? 0;
    const quizTotal = stats?.quizTotal ?? 0;
    const defisDone = stats?.defisDone ?? 0;
    const defisTotal = stats?.defisTotal ?? 0;

    const closedDate = stage.closed_at
        ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(stage.closed_at))
        : null;

    const quizReviewData = quizData ? {
        done: !!quizData.completed_at,
        score: quizData.score_correct,
        total: quizData.score_total,
    } : null;

    // Le bilan est accessible toute la semaine (bouton permanent sur l'accueil), mais
    // avant le dernier jour le programme n'est pas encore complet — on prévient plutôt
    // que de laisser croire à une clôture prématurée.
    let earlyWarning: string | null = null;
    if (!isClosed) {
        const range = parseStageDateRange(stage.dates, new Date());
        if (range) {
            const DAY_MS = 86_400_000;
            const startDay = new Date(range.start);
            startDay.setHours(0, 0, 0, 0);
            const dayTotal = Math.round((range.end.getTime() - range.start.getTime()) / DAY_MS) + 1;
            const diff = Math.floor((Date.now() - startDay.getTime()) / DAY_MS);
            if (diff < 0) {
                earlyWarning = "Cette semaine n'a pas encore commencé.";
            } else if (diff < dayTotal - 1) {
                earlyWarning = `Jour ${diff + 1}/${dayTotal} — la semaine n'est pas terminée. Le bilan se fait normalement le dernier jour.`;
            }
        }
    }

    const defiReviews: DefiReview[] = defisAssigned.map(e => ({
        id: e.exploit_id,
        description: e.defis.description,
        status: e.status,
        points: e.defis.points,
        terrain_temps_reel: e.defis.terrain_temps_reel,
        structured_data: e.structured_data ?? null,
        preuves_url: e.preuves_url ?? [],
    }));

    // Ressenti de clôture, tel qu'enregistré par closeStage — src/lib/stage-ressenti.ts.
    const ressenti = stage.ressenti && isRessentiNiveau(stage.ressenti.niveau)
        ? stage.ressenti
        : null;
    const ressentiOption = ressenti ? RESSENTI_OPTIONS.find(o => o.value === ressenti.niveau) : null;

    return (
        <div className="min-h-screen bg-slate-50 pb-32">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
                    <Link
                        href="/stages"
                        className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition active:scale-95 shrink-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bilan</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{stage.title}</p>
                    </div>
                    {isClosed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-black text-emerald-700 shrink-0">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Clôturé
                        </span>
                    ) : (
                        <DeleteStageButton stageId={stage.id} redirectTo="/stages" />
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-5 space-y-6">

                {isClosed ? (
                    <>
                        {/* Hero clôturé */}
                        <section className="rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 p-5 text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Semaine archivée</p>
                            <h1 className="text-xl font-black leading-tight">{stage.title}</h1>
                            <p className="text-sm text-white/50 mt-0.5">{stage.dates}</p>

                            {closedDate && (
                                <p className="mt-3 text-xs text-white/40">
                                    <span className="material-symbols-outlined text-[13px] align-middle mr-1">event_available</span>
                                    Clôturé le {closedDate}
                                </p>
                            )}

                            {/* Ressenti global, mis en avant — c'est le vrai bilan de la semaine */}
                            {ressentiOption && (
                                <div className="mt-4 rounded-xl bg-white/10 px-3.5 py-3 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-2xl text-white/70 shrink-0">{ressentiOption.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-white/40 font-semibold">Avez-vous pu raconter ce qui était prévu ?</p>
                                        <p className="text-sm font-black mt-0.5">{ressentiOption.label}</p>
                                    </div>
                                </div>
                            )}

                            {/* Stats en ligne */}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-xl bg-white/10 px-3 py-2.5">
                                    <p className="text-[10px] text-white/40 font-semibold">Sujets préparés</p>
                                    <p className="text-lg font-black mt-0.5">
                                        {objectives.filter(o => preparations[o.id]?.accroche_choisie).length}
                                        <span className="text-white/40 text-sm font-semibold">/{objectives.length}</span>
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white/10 px-3 py-2.5">
                                    <p className="text-[10px] text-white/40 font-semibold">Points cumulés</p>
                                    <p className="text-lg font-black mt-0.5">+{totalPts}</p>
                                </div>
                                {quizTotal > 0 && (
                                    <div className="rounded-xl bg-white/10 px-3 py-2.5">
                                        <p className="text-[10px] text-white/40 font-semibold">Quiz final</p>
                                        <p className="text-lg font-black mt-0.5">{quizScore}/{quizTotal}</p>
                                    </div>
                                )}
                                {defisTotal > 0 && (
                                    <div className="rounded-xl bg-white/10 px-3 py-2.5">
                                        <p className="text-[10px] text-white/40 font-semibold">Défis terrain</p>
                                        <p className="text-lg font-black mt-0.5">{defisDone}/{defisTotal}</p>
                                    </div>
                                )}
                            </div>

                            {ressenti && ressenti.raisons.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {ressenti.raisons.map((r: string) => (
                                        <span key={r} className="text-[10px] font-semibold text-white/70 bg-white/10 px-2 py-1 rounded-full">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Programme de la semaine */}
                        {objectives.length > 0 && (
                            <section>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Ce qui a été raconté</p>
                                <ProgrammeCondense stageId={stage.id} contents={objectives} preparations={preparations} />
                            </section>
                        )}

                        {/* Défis terrain */}
                        {defisTotal > 0 && (
                            <section>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Défis terrain</p>
                                <StageDefisReview defis={defiReviews} />
                            </section>
                        )}

                        {/* Retours terrain */}
                        {observations.length > 0 && (
                            <section>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                                    Retours terrain
                                    <span className="ml-2 text-slate-300">{observations.length}</span>
                                </p>
                                <StageObservationsReview observations={observations} />
                            </section>
                        )}

                        {/* Quiz de fin de semaine */}
                        {quizTotal > 0 && (
                            <section>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Quiz de fin de semaine</p>
                                <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-xl text-violet-600">check_circle</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900">Quiz validé</p>
                                        <p className="text-[10px] text-slate-500">Score : {quizScore}/{quizTotal}</p>
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-violet-600 text-white">
                                        Terminé
                                    </span>
                                </div>
                            </section>
                        )}

                        {/* Mémo moniteur */}
                        {stage.closing_notes?.trim() && (
                            <section>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Mémo moniteur</p>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{stage.closing_notes}</p>
                                </div>
                            </section>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Link
                                href="/stages"
                                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 flex items-center justify-center hover:bg-slate-50 transition"
                            >
                                Retour
                            </Link>
                            <ReopenConfirmSheet stageId={stage.id} />
                        </div>
                    </>
                ) : (
                    /* Formulaire de clôture */
                    <StageClosureReview
                        stageId={stage.id}
                        stageTitle={stage.title}
                        objectives={objectives}
                        preparations={preparations}
                        initialClosingNotes={stage.closing_notes}
                        initialNbStagiaires={stage.nb_stagiaires}
                        defisAssigned={defiReviews}
                        observations={observations}
                        quizData={quizReviewData}
                        earlyWarning={earlyWarning}
                    />
                )}
            </main>
        </div>
    );
}
