'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { closeStage } from '@/actions/stage-actions';
import { StageObjectiveReviewList } from '@/components/StageObjectiveReviewList';
import { StageObjectiveReviewDraft, StageObjectiveReviewItem } from '@/types';

type Props = {
    stageId: string;
    stageTitle: string;
    objectiveItems: StageObjectiveReviewItem[];
    initialClosingNotes?: string | null;
};

function buildDraftMap(items: StageObjectiveReviewItem[]): Record<string, StageObjectiveReviewDraft> {
    return Object.fromEntries(
        items.map(item => {
            const existing = item.review;
            return [
                item.pedagogicalContent.id,
                {
                    pedagogicalContentId: item.pedagogicalContent.id,
                    executionStatus: existing ? existing.executionStatus : null,
                    impactLevel: existing ? existing.impactLevel : null,
                    note: existing?.note ?? '',
                } satisfies StageObjectiveReviewDraft,
            ];
        })
    );
}

export function StageClosureReview({ stageId, stageTitle, objectiveItems, initialClosingNotes }: Props) {
    const router = useRouter();
    const [drafts, setDrafts] = useState<Record<string, StageObjectiveReviewDraft>>(() => buildDraftMap(objectiveItems));
    const [closingNote, setClosingNote] = useState(initialClosingNotes ?? '');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const unset = objectiveItems.filter(item => !drafts[item.pedagogicalContent.id]?.executionStatus).length;

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
                <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-1">Clôture du stage</p>
                <p className="text-sm font-semibold text-amber-900">{stageTitle}</p>
                <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                    Les statuts sont pré-remplis depuis l'accueil et vos séances. Vérifiez, ajustez si besoin, puis clôturez.
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
                />
            </section>

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
                        {unset > 0 ? (
                            <p className="text-xs font-semibold text-amber-600">
                                {unset} objectif{unset > 1 ? 's' : ''} sans statut
                            </p>
                        ) : (
                            <p className="text-xs font-semibold text-emerald-600">Tous les objectifs sont renseignés</p>
                        )}
                    </div>
                    <Link
                        href={`/stages/${stageId}`}
                        className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 flex items-center hover:bg-slate-50 transition"
                    >
                        Annuler
                    </Link>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting || unset > 0}
                        className={clsx(
                            'h-11 px-5 rounded-xl text-sm font-black text-white transition',
                            unset > 0 || isSubmitting
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
