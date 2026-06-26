'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { closeStage } from '@/actions/stage-actions';
import { StageObjectiveReviewList } from '@/components/StageObjectiveReviewList';
import {
    createEmptyStageClosingMemo,
    parseStageClosingMemo,
    serializeStageClosingMemo,
    type StageClosingMemoDraft,
} from '@/lib/stage-closing-memo';
import { Button } from '@/components/ui/button';
import { StageObjectiveExecutionStatus, StageObjectiveReviewDraft, StageObjectiveReviewItem } from '@/types';

type Props = {
    stageId: string;
    stageTitle: string;
    objectiveItems: StageObjectiveReviewItem[];
    initialClosingNotes?: string | null;
};

function inferExecutionStatus(item: StageObjectiveReviewItem): StageObjectiveExecutionStatus | null {
    if (item.isValidated) return 'done';
    if (item.isPlaced) return 'partial';
    return null;
}

function buildDraftMap(items: StageObjectiveReviewItem[]) {
    return Object.fromEntries(
        items.map(item => {
            const hasExistingReview = item.review !== null;
            return [
                item.pedagogicalContent.id,
                {
                    pedagogicalContentId: item.pedagogicalContent.id,
                    executionStatus: hasExistingReview ? item.review!.executionStatus : inferExecutionStatus(item),
                    impactLevel: hasExistingReview ? item.review!.impactLevel : null,
                    note: hasExistingReview ? (item.review!.note ?? '') : '',
                } satisfies StageObjectiveReviewDraft,
            ];
        })
    ) as Record<string, StageObjectiveReviewDraft>;
}

export function StageClosureReview({ stageId, stageTitle, objectiveItems, initialClosingNotes }: Props) {
    const router = useRouter();
    const [memo, setMemo] = useState<StageClosingMemoDraft>(() => parseStageClosingMemo(initialClosingNotes));
    const [objectiveDrafts, setObjectiveDrafts] = useState<Record<string, StageObjectiveReviewDraft>>(() => buildDraftMap(objectiveItems));
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const neverPlacedObjectives = objectiveItems.filter(item => !item.isPlaced).length;

    const hasIncompleteObjectives = objectiveItems.some(item => {
        const draft = objectiveDrafts[item.pedagogicalContent.id];
        if (!draft?.executionStatus) return true;
        if (draft.executionStatus !== 'not_done' && !draft.impactLevel) return true;
        return false;
    });

    const handleObjectiveDraftChange = (contentId: string, patch: Partial<StageObjectiveReviewDraft>) => {
        setObjectiveDrafts(current => {
            const previous = current[contentId] ?? {
                pedagogicalContentId: contentId,
                executionStatus: null,
                impactLevel: null,
                note: '',
            };

            return {
                ...current,
                [contentId]: {
                    ...previous,
                    ...patch,
                },
            };
        });
    };

    const handleMemoChange = (key: keyof StageClosingMemoDraft, value: string) => {
        setMemo(current => ({
            ...current,
            [key]: value,
        }));
    };

    const handleResetMemo = () => {
        setMemo(createEmptyStageClosingMemo());
    };

    const handleCloseStage = async () => {
        setIsSubmitting(true);
        setError(null);

        const result = await closeStage(stageId, {
            closingNotes: serializeStageClosingMemo(memo),
            objectiveReviews: Object.values(objectiveDrafts),
        });

        setIsSubmitting(false);
        if (!result.success) {
            setError(result.error || 'Erreur lors de la clôture du stage');
            return;
        }

        router.push(`/stages/${stageId}`);
        router.refresh();
    };

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">Carnet de stage</p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{stageTitle}</h2>
                        <p className="mt-2 text-sm font-medium text-slate-600">Relisez les objectifs prévus, notez ce qui s’est réellement passé, puis gardez trois repères utiles.</p>
                    </div>

                    <a
                        href="#analyse-pedagogique"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                    >
                        Remplir les objectifs
                        <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                    </a>
                </div>

                {neverPlacedObjectives > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                        <span className="material-symbols-outlined text-[16px] text-amber-500">info</span>
                        {neverPlacedObjectives} objectif{neverPlacedObjectives > 1 ? 's' : ''} choisi{neverPlacedObjectives > 1 ? 's' : ''} mais jamais placé{neverPlacedObjectives > 1 ? 's' : ''}
                    </div>
                )}
            </section>

            <div id="analyse-pedagogique">
                <StageObjectiveReviewList
                    items={objectiveItems}
                    editable
                    drafts={objectiveDrafts}
                    onChangeDraft={handleObjectiveDraftChange}
                    title="Objectifs"
                    intro="Les statuts sont pré-remplis depuis vos séances — vérifiez, ajustez si besoin, puis qualifiez ce que le groupe en a retenu."
                />
            </div>

            <section className="rounded-[2rem] border border-fuchsia-100 bg-gradient-to-br from-white via-fuchsia-50/60 to-orange-50 p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-fuchsia-500">Mémo moniteur</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Trois repères à garder</h3>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetMemo}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
                    >
                        <span className="material-symbols-outlined text-[18px]">ink_eraser</span>
                        Vider
                    </button>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
                        <label className="block text-sm font-black text-slate-950">À garder</label>
                        <textarea
                            value={memo.whatWorked}
                            onChange={(e) => handleMemoChange('whatWorked', e.target.value)}
                            placeholder="Ce qui a bien pris, ce que je referais tel quel…"
                            className="mt-3 min-h-[150px] w-full resize-y rounded-2xl border border-slate-200 bg-emerald-50/40 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        />
                    </div>

                    <div className="rounded-3xl border border-amber-100 bg-white p-4 shadow-sm">
                        <label className="block text-sm font-black text-slate-950">À ajuster</label>
                        <textarea
                            value={memo.blockers}
                            onChange={(e) => handleMemoChange('blockers', e.target.value)}
                            placeholder="Ce qui a bloqué, ce que je simplifierais…"
                            className="mt-3 min-h-[150px] w-full resize-y rounded-2xl border border-slate-200 bg-amber-50/50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                        />
                    </div>

                    <div className="rounded-3xl border border-sky-100 bg-white p-4 shadow-sm">
                        <label className="block text-sm font-black text-slate-950">Prochaine fois</label>
                        <textarea
                            value={memo.nextTime}
                            onChange={(e) => handleMemoChange('nextTime', e.target.value)}
                            placeholder="Une idée concrète à tester au prochain stage…"
                            className="mt-3 min-h-[150px] w-full resize-y rounded-2xl border border-slate-200 bg-sky-50/50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                        />
                    </div>
                </div>

                <div className="mt-4 rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm">
                    <label className="block text-sm font-black text-slate-950">Note libre <span className="font-semibold text-slate-400">optionnelle</span></label>
                    <textarea
                        value={memo.extraNote}
                        onChange={(e) => handleMemoChange('extraNote', e.target.value)}
                        placeholder="Ambiance, détail de groupe, repère perso…"
                        className="mt-3 min-h-[95px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100"
                    />
                </div>
            </section>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {hasIncompleteObjectives && objectiveItems.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Confirmez le statut de chaque objectif et qualifiez ce que le groupe en a retenu avant de clôturer.
                </div>
            )}

            <div className="sticky bottom-3 z-30 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/70 backdrop-blur sm:flex sm:items-center sm:justify-between">
                <p className="mb-3 text-sm font-semibold text-slate-600 sm:mb-0">
                    {hasIncompleteObjectives ? 'Objectifs à compléter.' : 'Carnet prêt.'}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                    href={`/stages/${stageId}`}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Retour au cockpit
                </Link>
                <Button
                    onClick={handleCloseStage}
                    disabled={isSubmitting || hasIncompleteObjectives}
                    className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-slate-800"
                >
                    {isSubmitting ? 'Clôture en cours…' : 'Clôturer le stage'}
                </Button>
                </div>
            </div>
        </div>
    );
}