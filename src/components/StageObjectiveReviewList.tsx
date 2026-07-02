'use client';

import { cn } from '@/lib/utils';
import {
    STAGE_OBJECTIVE_EXECUTION_OPTIONS,
    getStageObjectiveImpactOptions,
    formatStageObjectiveTheme,
} from '@/lib/stage-objective-review';
import { StageObjectiveReviewDraft, StageObjectiveReviewItem } from '@/types';

const STATUS_META = {
    done:     { label: 'Travaillé',   icon: 'check_circle',    bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50 border-emerald-200' },
    partial:  { label: 'Effleuré',    icon: 'timelapse',       bg: 'bg-amber-500',   text: 'text-amber-700',   light: 'bg-amber-50 border-amber-200' },
    not_done: { label: 'Non abordé',  icon: 'remove_circle',   bg: 'bg-slate-400',   text: 'text-slate-500',   light: 'bg-slate-50 border-slate-200' },
} as const;

const NOTE_PLACEHOLDER: Record<string, string> = {
    done: 'Ce qui a bien marché, une idée à garder…',
    partial: 'Pourquoi seulement effleuré ? Ce qui a bloqué…',
    not_done: 'Pourquoi pas abordé ? Un obstacle rencontré…',
};

const IMPACT_META = {
    high:   { label: 'Impact fort',   color: 'text-violet-700 bg-violet-50 border-violet-200' },
    medium: { label: 'Impact moyen',  color: 'text-sky-700 bg-sky-50 border-sky-200' },
    low:    { label: 'Impact faible', color: 'text-rose-600 bg-rose-50 border-rose-200' },
} as const;

type Props = {
    items: StageObjectiveReviewItem[];
    editable?: boolean;
    drafts?: Record<string, StageObjectiveReviewDraft>;
    onChangeDraft?: (contentId: string, patch: Partial<StageObjectiveReviewDraft>) => void;
};

export function StageObjectiveReviewList({ items, editable = false, drafts, onChangeDraft }: Props) {
    if (items.length === 0) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300">assignment</span>
                <p className="mt-2 text-sm font-semibold text-slate-400">Aucun objectif sélectionné pour cette semaine</p>
            </div>
        );
    }

    const getDraft = (item: StageObjectiveReviewItem): StageObjectiveReviewDraft => {
        if (editable && drafts?.[item.pedagogicalContent.id]) return drafts[item.pedagogicalContent.id];
        return {
            pedagogicalContentId: item.pedagogicalContent.id,
            executionStatus: item.review?.executionStatus ?? null,
            impactLevel: item.review?.impactLevel ?? null,
            note: item.review?.note ?? '',
        };
    };

    const done   = items.filter(i => getDraft(i).executionStatus === 'done').length;
    const partial = items.filter(i => getDraft(i).executionStatus === 'partial').length;
    const notDone = items.filter(i => getDraft(i).executionStatus === 'not_done').length;
    const unset  = items.filter(i => !getDraft(i).executionStatus).length;

    return (
        <div className="space-y-3">
            {/* Synthèse rapide */}
            {(done + partial + notDone) > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                    {done > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {done} travaillé{done > 1 ? 's' : ''}
                        </span>
                    )}
                    {partial > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                            <span className="material-symbols-outlined text-sm">timelapse</span>
                            {partial} effleuré{partial > 1 ? 's' : ''}
                        </span>
                    )}
                    {notDone > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                            <span className="material-symbols-outlined text-sm">remove_circle</span>
                            {notDone} non abordé{notDone > 1 ? 's' : ''}
                        </span>
                    )}
                    {unset > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-bold text-orange-600">
                            <span className="material-symbols-outlined text-sm">pending</span>
                            {unset} à renseigner
                        </span>
                    )}
                </div>
            )}

            {/* Liste des objectifs */}
            {items.map(item => {
                const draft = getDraft(item);
                const statusMeta = draft.executionStatus ? STATUS_META[draft.executionStatus] : null;
                const impactMeta = draft.impactLevel ? IMPACT_META[draft.impactLevel] : null;
                const impactOptions = getStageObjectiveImpactOptions(draft.executionStatus);
                const themes = (item.pedagogicalContent.tags_theme ?? []).slice(0, 3);
                const isNotDone = draft.executionStatus === 'not_done';

                const noteLabel = draft.executionStatus === 'done'
                    ? 'Ce qui a bien marché'
                    : draft.executionStatus === 'partial'
                        ? 'Pourquoi effleuré ?'
                        : 'Pourquoi non abordé ?';

                const notePlaceholder = draft.executionStatus ? NOTE_PLACEHOLDER[draft.executionStatus] ?? 'Ajoutez un commentaire…' : 'Sélectionnez d\'abord un statut…';

                return (
                    <article
                        key={item.pedagogicalContent.id}
                        className={cn(
                            'rounded-2xl border bg-white overflow-hidden transition-all',
                            statusMeta ? statusMeta.light : 'border-slate-200'
                        )}
                    >
                        {/* En-tête : question + statut */}
                        <div className="flex items-start gap-3 px-4 py-3">
                            {statusMeta ? (
                                <span className={cn('material-symbols-outlined text-xl mt-0.5 shrink-0', statusMeta.text)}>
                                    {statusMeta.icon}
                                </span>
                            ) : (
                                <span className="material-symbols-outlined text-xl mt-0.5 shrink-0 text-slate-300">radio_button_unchecked</span>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.pedagogicalContent.dimension}</span>
                                    {themes.map(t => (
                                        <span key={t} className="text-[10px] font-semibold text-slate-300">· {formatStageObjectiveTheme(t)}</span>
                                    ))}
                                </div>
                                <p className={cn(
                                    'text-sm font-bold leading-snug',
                                    isNotDone ? 'text-slate-400 line-through' : 'text-slate-900'
                                )}>
                                    {item.pedagogicalContent.question}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{item.pedagogicalContent.objectif}</p>
                            </div>
                            {statusMeta && !editable && (
                                <span className={cn('shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full border', statusMeta.light, statusMeta.text)}>
                                    {statusMeta.label}
                                </span>
                            )}
                        </div>

                        {/* Zone éditable */}
                        {editable && (
                            <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-white/60">

                                {/* Statut d'exécution */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Comment ça s'est passé ?</p>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {STAGE_OBJECTIVE_EXECUTION_OPTIONS.map(opt => {
                                            const selected = draft.executionStatus === opt.value;
                                            const meta = STATUS_META[opt.value];
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => onChangeDraft?.(item.pedagogicalContent.id, {
                                                        executionStatus: opt.value,
                                                        impactLevel: opt.value === 'not_done' ? null : draft.impactLevel,
                                                    })}
                                                    className={cn(
                                                        'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-black transition active:scale-95',
                                                        selected
                                                            ? cn(meta.light, meta.text, 'border-current shadow-sm')
                                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                                    )}
                                                >
                                                    <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Impact (optionnel, sauf not_done) */}
                                {!isNotDone && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Ce que le groupe en a retenu <span className="font-semibold normal-case tracking-normal text-slate-300">— optionnel</span>
                                        </p>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {impactOptions.map(opt => {
                                                const selected = draft.impactLevel === opt.value;
                                                const meta = IMPACT_META[opt.value as keyof typeof IMPACT_META];
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => onChangeDraft?.(item.pedagogicalContent.id, {
                                                            impactLevel: selected ? null : opt.value,
                                                        })}
                                                        className={cn(
                                                            'rounded-xl border py-2 px-1 text-xs font-bold text-center transition active:scale-95',
                                                            selected
                                                                ? cn(meta.color, 'shadow-sm')
                                                                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Note contextuelle selon statut */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                        {noteLabel} <span className="font-semibold normal-case tracking-normal text-slate-300">— optionnel</span>
                                    </label>
                                    <textarea
                                        value={draft.note}
                                        onChange={e => onChangeDraft?.(item.pedagogicalContent.id, { note: e.target.value })}
                                        placeholder={notePlaceholder}
                                        rows={2}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Affichage lecture seule : impact + note si renseignés */}
                        {!editable && (impactMeta || draft.note?.trim()) && (
                            <div className="border-t border-slate-100 px-4 py-3 flex flex-wrap gap-2 items-center">
                                {impactMeta && (
                                    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold', impactMeta.color)}>
                                        {impactMeta.label}
                                    </span>
                                )}
                                {draft.note?.trim() && (
                                    <p className="text-xs text-slate-500 italic leading-relaxed">{draft.note}</p>
                                )}
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
}