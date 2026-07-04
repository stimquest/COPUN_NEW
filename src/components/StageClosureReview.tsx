'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { closeStage } from '@/actions/stage-actions';
import { StageObjectiveReviewList } from '@/components/StageObjectiveReviewList';
import { StageDefisReview, DefiReview } from '@/components/StageDefisReview';
import { StageObservationsReview } from '@/components/StageObservationsReview';
import { StageObjectiveReviewDraft, StageObjectiveReviewItem, WeekObservation } from '@/types';

type QuizReview = {
    done: boolean;
    score: number | null;
    total: number | null;
};

type Props = {
    stageId: string;
    stageTitle: string;
    objectiveItems: StageObjectiveReviewItem[];
    initialClosingNotes?: string | null;
    defisAssigned: DefiReview[];
    observations: WeekObservation[];
    quizData: QuizReview | null;
    // Météo de la semaine défavorable — remonte la raison météo en tête des listes.
    weatherIsBad?: boolean;
};

// "Non abordé" n'a de sens qu'a posteriori — un objectif sans statut à la clôture n'a
// simplement pas été fait de la semaine. On le pré-remplit automatiquement plutôt que
// de forcer le moniteur à cliquer "non abordé" à la main pour chaque fiche non touchée.
function buildDraftMap(items: StageObjectiveReviewItem[]): Record<string, StageObjectiveReviewDraft> {
    return Object.fromEntries(
        items.map(item => {
            const existing = item.review;
            return [
                item.pedagogicalContent.id,
                {
                    pedagogicalContentId: item.pedagogicalContent.id,
                    executionStatus: existing ? existing.executionStatus : 'not_done',
                    impactLevel: existing ? existing.impactLevel : null,
                    reasons: existing?.reasons ?? [],
                    note: existing?.note ?? '',
                } satisfies StageObjectiveReviewDraft,
            ];
        })
    );
}

export function StageClosureReview({ stageId, stageTitle, objectiveItems, initialClosingNotes, defisAssigned, observations, quizData, weatherIsBad = false }: Props) {
    const router = useRouter();
    const [drafts, setDrafts] = useState<Record<string, StageObjectiveReviewDraft>>(() => buildDraftMap(objectiveItems));
    const [closingNote, setClosingNote] = useState(initialClosingNotes ?? '');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defisDone = defisAssigned.filter(d => d.status === 'complete').length;
    const defisTotal = defisAssigned.length;
    const quizDone = quizData?.done ?? false;

    // Le quiz (comme les défis) peut être impossible à faire pour des raisons hors du
    // contrôle du moniteur (groupe déjà reparti, conditions terrain…) — la clôture ne
    // doit jamais être bloquée par un élément externe, seulement rappelée si manquant.
    const canClose = true;

    const handleDraftChange = (contentId: string, patch: Partial<StageObjectiveReviewDraft>) => {
        setDrafts(prev => ({
            ...prev,
            [contentId]: { ...prev[contentId], ...patch },
        }));
    };

    const handleClose = async () => {
        setIsSubmitting(true);
        setError(null);

        const result = await closeStage(stageId, {
            closingNotes: closingNote,
            objectiveReviews: Object.values(drafts),
        });

        setIsSubmitting(false);
        if (!result.success) {
            setError(result.error ?? 'Erreur lors de la clôture');
            return;
        }
        router.push(`/stages/${stageId}/bilan`);
        router.refresh();
    };

    return (
        <div className="space-y-6">

            {/* Intro */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-1">Clôture de la semaine</p>
                <p className="text-sm font-semibold text-amber-900">{stageTitle}</p>
                <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                    Vos notes prises depuis l&apos;accueil sont reprises ici. Les objectifs restés sans note sont marqués « Non abordé » — corrigez-les si besoin avant de clôturer.
                </p>
            </div>

            {/* Objectifs */}
            <section>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                    Objectifs de la semaine
                </p>
                <StageObjectiveReviewList
                    items={objectiveItems}
                    editable
                    drafts={drafts}
                    onChangeDraft={handleDraftChange}
                    weatherIsBad={weatherIsBad}
                />
            </section>

            {/* Défis Terrain */}
            {defisTotal > 0 && (
                <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                        Défis terrain
                    </p>
                    <StageDefisReview defis={defisAssigned} />
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
            {quizData && (
                <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                        Quiz de fin de semaine
                    </p>
                    <div className={clsx(
                        'rounded-xl border px-4 py-3 flex items-center gap-3',
                        quizDone ? 'border-violet-200 bg-violet-50' : 'border-amber-200 bg-amber-50'
                    )}>
                        <span className={clsx(
                            'material-symbols-outlined text-xl',
                            quizDone ? 'text-violet-600' : 'text-amber-600'
                        )}>
                            {quizDone ? 'check_circle' : 'quiz'}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900">{quizDone ? 'Quiz validé' : 'Quiz pas encore fait'}</p>
                            {quizDone && quizData.score !== null && quizData.total !== null && (
                                <p className="text-[10px] text-slate-500">
                                    Score : {quizData.score}/{quizData.total}
                                </p>
                            )}
                            {!quizDone && (
                                <p className="text-[10px] text-slate-500">À faire avec le groupe avant de clôturer</p>
                            )}
                        </div>
                        {quizDone ? (
                            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-violet-600 text-white">
                                Terminé
                            </span>
                        ) : (
                            <Link
                                href={`/stages/${stageId}/quiz`}
                                className="text-[10px] font-black px-3 py-1.5 rounded-full bg-amber-600 text-white active:scale-95 transition shrink-0"
                            >
                                Faire le quiz
                            </Link>
                        )}
                    </div>
                </section>
            )}

            {/* Mémo libre */}
            <section>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                    Mémo moniteur <span className="font-semibold normal-case tracking-normal text-slate-300">— optionnel</span>
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <textarea
                        value={closingNote}
                        onChange={e => setClosingNote(e.target.value)}
                        placeholder="Ce qui a bien marché, ce qui a bloqué, une idée pour la prochaine fois…"
                        rows={5}
                        className="w-full resize-none px-4 py-4 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent focus:outline-none leading-relaxed"
                    />
                </div>
            </section>

            {/* Erreur */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Barre de clôture sticky */}
            <div className="sticky bottom-4 z-30">
                <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl shadow-slate-200/60 p-3 flex items-center gap-3">
                    <div className="flex-1">
                        {!quizDone ? (
                            <p className="text-xs font-semibold text-amber-600">Quiz pas fait — clôture possible quand même</p>
                        ) : (
                            <p className="text-xs font-semibold text-emerald-600">Tous les éléments sont renseignés</p>
                        )}
                    </div>
                    <Link
                        href="/stages"
                        className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 flex items-center hover:bg-slate-50 transition"
                    >
                        Annuler
                    </Link>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting || !canClose}
                        className={clsx(
                            'h-11 px-5 rounded-xl text-sm font-black text-white transition',
                            !canClose || isSubmitting
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-slate-700 active:scale-95'
                        )}
                    >
                        {isSubmitting ? 'Clôture…' : 'Clôturer le stage'}
                    </button>
                </div>
            </div>
        </div>
    );
}