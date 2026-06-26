'use client';

import {
    STAGE_OBJECTIVE_EXECUTION_OPTIONS,
    formatStageObjectiveTheme,
    getStageObjectiveImpactMeta,
    getStageObjectiveImpactOptions,
    getStageObjectiveImpactPrompt,
} from '@/lib/stage-objective-review';
import { cn } from '@/lib/utils';
import { StageObjectiveReviewDraft, StageObjectiveReviewItem } from '@/types';

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
    return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold', className)}>{children}</span>;
}

function selectedTone(value: 'not_done' | 'partial' | 'done' | 'low' | 'medium' | 'high') {
    if (value === 'done') return 'border-emerald-500 bg-emerald-500 text-white shadow-sm';
    if (value === 'partial') return 'border-orange-500 bg-orange-500 text-white shadow-sm';
    if (value === 'not_done') return 'border-slate-900 bg-slate-900 text-white shadow-sm';
    if (value === 'high') return 'border-violet-500 bg-violet-500 text-white shadow-sm';
    if (value === 'medium') return 'border-sky-500 bg-sky-500 text-white shadow-sm';
    return 'border-rose-500 bg-rose-500 text-white shadow-sm';
}

type Props = {
    items: StageObjectiveReviewItem[];
    editable?: boolean;
    drafts?: Record<string, StageObjectiveReviewDraft>;
    onChangeDraft?: (contentId: string, patch: Partial<StageObjectiveReviewDraft>) => void;
    title?: string;
    intro?: string;
};

export function StageObjectiveReviewList({
    items,
    editable = false,
    drafts,
    onChangeDraft,
    title = 'Analyse des objectifs fixés',
    intro,
}: Props) {
    if (items.length === 0) {
        return (
            <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Carnet de stage</p>
                <h3 className="mt-2 text-xl font-black text-slate-900">Aucun objectif sélectionné</h3>
                <p className="mt-2 text-sm text-slate-600">Ajoutez des fiches pédagogiques pour alimenter le carnet.</p>
            </section>
        );
    }

    const currentReviewOf = (item: StageObjectiveReviewItem) => {
        if (editable) {
            return drafts?.[item.pedagogicalContent.id] ?? {
                pedagogicalContentId: item.pedagogicalContent.id,
                executionStatus: null,
                impactLevel: null,
                note: '',
            };
        }

        return {
            pedagogicalContentId: item.pedagogicalContent.id,
            executionStatus: item.review?.executionStatus ?? null,
            impactLevel: item.review?.impactLevel ?? null,
            note: item.review?.note ?? '',
        };
    };

    return (
        <section className="rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-500">Carnet de stage</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{title}</h3>
            {intro && <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">{intro}</p>}

            <div className="mt-6 space-y-4">
                {items.map(item => {
                    const review = currentReviewOf(item);
                    const executionMeta = STAGE_OBJECTIVE_EXECUTION_OPTIONS.find(option => option.value === review.executionStatus);
                    const impactMeta = getStageObjectiveImpactMeta(review.executionStatus, review.impactLevel);
                    const impactOptions = getStageObjectiveImpactOptions(review.executionStatus);
                    const impactPrompt = getStageObjectiveImpactPrompt(review.executionStatus);
                    const themes = (item.pedagogicalContent.tags_theme ?? []).slice(0, 3);
                    const impactDisabled = !review.executionStatus || review.executionStatus === 'not_done';

                    return (
                        <article key={item.pedagogicalContent.id} className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm sm:p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Chip className="bg-slate-900 text-white">{item.pedagogicalContent.dimension}</Chip>
                                        {themes.map(theme => (
                                            <Chip key={theme} className="bg-white text-slate-600 border border-slate-200">{formatStageObjectiveTheme(theme)}</Chip>
                                        ))}
                                    </div>
                                    <h4 className="text-lg font-black leading-tight text-slate-900">{item.pedagogicalContent.question}</h4>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.pedagogicalContent.objectif}</p>
                                </div>

                                {!editable && executionMeta && (
                                    <Chip className={cn(
                                        executionMeta.value === 'done' && 'bg-emerald-100 text-emerald-700',
                                        executionMeta.value === 'partial' && 'bg-amber-100 text-amber-700',
                                        executionMeta.value === 'not_done' && 'bg-slate-200 text-slate-700',
                                    )}>
                                        {executionMeta.label}
                                    </Chip>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {item.isPlaced ? (
                                    <Chip className="bg-amber-100 text-amber-700">
                                        <span className="mr-1">📅</span>Planifié · {item.placedSessions.map(s => s.title).join(', ')}
                                    </Chip>
                                ) : (
                                    <Chip className="bg-slate-100 text-slate-500">Hors planning</Chip>
                                )}
                                {item.isValidated ? (
                                    <Chip className="bg-emerald-100 text-emerald-700">
                                        <span className="mr-1">✓</span>Fait en séance · {item.validatedSessions.map(s => s.title).join(', ')}
                                    </Chip>
                                ) : item.isPlaced ? (
                                    <Chip className="bg-rose-100 text-rose-600">Non coché en séance</Chip>
                                ) : (
                                    <Chip className="bg-slate-100 text-slate-400">Pas en séance</Chip>
                                )}
                            </div>

                            {editable ? (
                                <>
                                    <div className="mt-5 grid gap-5 xl:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Ce qui s’est passé</p>
                                            <div className="mt-2 grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1">
                                                {STAGE_OBJECTIVE_EXECUTION_OPTIONS.map(option => {
                                                    const selected = review.executionStatus === option.value;
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => onChangeDraft?.(item.pedagogicalContent.id, {
                                                                executionStatus: option.value,
                                                                impactLevel: option.value === 'not_done' || option.value !== review.executionStatus ? null : review.impactLevel,
                                                            })}
                                                            className={cn(
                                                                'rounded-xl border border-transparent px-3 py-2.5 text-center text-sm font-black transition active:scale-[0.98]',
                                                                selected ? selectedTone(option.value) : 'bg-white text-slate-600 hover:text-slate-950'
                                                            )}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {executionMeta && (
                                                <p className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium leading-relaxed text-slate-600 ring-1 ring-slate-200">
                                                    {executionMeta.helper}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{impactPrompt.label}</p>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-500">{impactPrompt.helper}</p>
                                            <div className="mt-2 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                                                {impactOptions.map(option => {
                                                    const selected = review.impactLevel === option.value;
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            disabled={impactDisabled}
                                                            onClick={() => onChangeDraft?.(item.pedagogicalContent.id, { impactLevel: option.value })}
                                                            className={cn(
                                                                'rounded-2xl border px-3.5 py-3 text-left transition active:scale-[0.98]',
                                                                impactDisabled && 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-300',
                                                                !impactDisabled && selected && selectedTone(option.value),
                                                                !impactDisabled && !selected && 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                            )}
                                                        >
                                                            <p className="text-sm font-black leading-tight">{option.label}</p>
                                                            <p className={cn('mt-1 text-[11px] leading-4', selected ? 'text-white/80' : 'text-slate-500')}>
                                                                {option.helper}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {impactDisabled && (
                                                <div className="mt-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-500">
                                                    Pas de résultat à qualifier pour un objectif non mené.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-2">Mémo court <span className="font-semibold normal-case tracking-normal text-slate-400">optionnel</span></label>
                                        <textarea
                                            value={review.note}
                                            onChange={(event) => onChangeDraft?.(item.pedagogicalContent.id, { note: event.target.value })}
                                            placeholder="Ce qui explique le choix, ou une idée à garder…"
                                            className="min-h-[86px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Sort sur le terrain</p>
                                        <p className="mt-1 text-sm font-bold text-slate-900">{executionMeta?.label ?? 'Non renseigné'}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{executionMeta?.helper ?? 'Aucune analyse enregistrée pour cet objectif.'}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{impactPrompt.label}</p>
                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                            {impactMeta?.label ?? (review.executionStatus === 'not_done' ? 'Sans objet' : 'Non renseigné')}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                            {impactMeta?.helper ?? (review.executionStatus === 'not_done'
                                                ? 'Pas d’évaluation de résultat pour un objectif non mené.'
                                                : 'Aucune évaluation qualitative enregistrée.')}
                                        </p>
                                    </div>
                                    {review.note.trim().length > 0 && (
                                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 md:col-span-2">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Note du moniteur</p>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.note}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}