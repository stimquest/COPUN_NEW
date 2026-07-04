'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    STAGE_OBJECTIVE_EXECUTION_OPTIONS,
    getStageObjectiveImpactOptions,
    getStageObjectiveReasonOptions,
    formatStageObjectiveTheme,
} from '@/lib/stage-objective-review';
import { StageObjectiveReviewDraft, StageObjectiveReviewItem, StageObjectiveImpactLevel } from '@/types';
import { PILLARS } from '@/data/etages';
import { SPORT_FEATURES_ENABLED } from '@/lib/feature-flags';

const STATUS_META = {
    done:     { label: 'Travaillé',   icon: 'check_circle',    bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50 border-emerald-200' },
    partial:  { label: 'Effleuré',    icon: 'timelapse',       bg: 'bg-amber-500',   text: 'text-amber-700',   light: 'bg-amber-50 border-amber-200' },
    not_done: { label: 'Non abordé',  icon: 'remove_circle',   bg: 'bg-slate-400',   text: 'text-slate-500',   light: 'bg-slate-50 border-slate-200' },
} as const;

// Le label/placeholder de la note dépend du statut ET du niveau d'impact choisi — un
// objectif "Travaillé" mais "Peu retenu" n'a rien de commun avec "Travaillé" + "Bien
// intégré", le champ ne doit pas dire "ce qui a bien marché" dans les deux cas.
const NOTE_PLACEHOLDER: Record<string, string> = {
    done_low: 'Ce qui a bloqué, un obstacle rencontré…',
    done_medium: 'Ce qui a fonctionné, ce qui reste à consolider…',
    done_high: 'Ce qui a bien marché, une idée à garder…',
    partial_low: 'Pourquoi ça n\'a pas accroché…',
    partial_medium: 'Ce qui a été retenu, ce qui reste fragile…',
    partial_high: 'Ce qui a suscité cet intérêt…',
    not_done: 'Pourquoi pas abordé ? Un obstacle rencontré…',
};

// Badges affichés en lecture seule (bilan clôturé) — même teinte émeraude que le slider.
const IMPACT_META = {
    high:   { label: 'Impact fort' },
    medium: { label: 'Impact moyen' },
    low:    { label: 'Impact faible' },
} as const;

type ImpactOption = { value: StageObjectiveImpactLevel; label: string; helper: string };

// 3 boutons à choix unique : un tap direct plutôt qu'un geste de précision, tout en
// gardant le même habillage soigné (couleur émeraude, relief) que l'ancien slider.
// Exporté pour être réutilisé depuis l'accueil (saisie à chaud le jour même).
export function ImpactToggle({
    options, value, onChange,
}: {
    options: ImpactOption[];
    value: StageObjectiveImpactLevel | null;
    onChange: (level: StageObjectiveImpactLevel | null) => void;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ce que le groupe a retenu
                </p>
                {!value && (
                    <span className="text-[10px] font-bold text-slate-300 italic">à évaluer</span>
                )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
                {options.map(opt => {
                    const selected = value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(selected ? value : opt.value)}
                            className={cn(
                                'rounded-xl border py-2.5 px-1.5 text-center transition active:scale-95',
                                selected
                                    ? 'bg-emerald-500 border-emerald-500 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_10px_rgba(16,185,129,0.25)]'
                                    : 'bg-white border-slate-200 hover:border-emerald-300'
                            )}
                        >
                            <span className={cn(
                                'text-xs font-bold leading-tight',
                                selected ? 'text-white' : 'text-slate-500'
                            )}>
                                {opt.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

type Props = {
    items: StageObjectiveReviewItem[];
    editable?: boolean;
    drafts?: Record<string, StageObjectiveReviewDraft>;
    onChangeDraft?: (contentId: string, patch: Partial<StageObjectiveReviewDraft>) => void;
    // Météo de la semaine défavorable ("instable"/"tempête") : remonte la raison météo
    // en tête des listes plutôt que de la laisser noyée parmi 4-5 autres raisons.
    weatherIsBad?: boolean;
};

function ReviewCard({
    item, editable, draft, onChangeDraft, weatherIsBad,
}: {
    item: StageObjectiveReviewItem;
    editable: boolean;
    draft: StageObjectiveReviewDraft;
    onChangeDraft?: (contentId: string, patch: Partial<StageObjectiveReviewDraft>) => void;
    weatherIsBad?: boolean;
}) {
    // La note reste repliée par défaut (texte libre, vraiment optionnel) — elle
    // s'ouvre automatiquement si elle contient déjà une valeur. L'impact, lui,
    // s'affiche systématiquement dès qu'un statut effleuré/travaillé est choisi.
    const [showNote, setShowNote] = useState(!!draft.note?.trim());

    const statusMeta = draft.executionStatus ? STATUS_META[draft.executionStatus] : null;
    const impactMeta = draft.impactLevel ? IMPACT_META[draft.impactLevel] : null;
    const impactOptions = getStageObjectiveImpactOptions(draft.executionStatus);
    const reasonOptions = getStageObjectiveReasonOptions(draft.executionStatus, draft.impactLevel, weatherIsBad);
    const themes = (item.pedagogicalContent.tags_theme ?? []).slice(0, 3);
    const isNotDone = draft.executionStatus === 'not_done';

    // Clé combinant statut + niveau d'impact (ex: "done_low") pour choisir le bon
    // label/placeholder — "Non abordé" n'a pas de niveau, donc reste sur sa propre clé.
    const noteKey = draft.executionStatus === 'not_done'
        ? 'not_done'
        : draft.executionStatus && draft.impactLevel
            ? `${draft.executionStatus}_${draft.impactLevel}`
            : null;

    const noteLabel = draft.executionStatus === 'not_done'
        ? 'Pourquoi non abordé ?'
        : draft.impactLevel === 'high'
            ? 'Ce qui a bien marché'
            : draft.impactLevel === 'low'
                ? 'Ce qui a bloqué'
                : draft.executionStatus === 'done'
                    ? 'Ce qui a fonctionné'
                    : 'Ce qui a été retenu';

    const notePlaceholder = noteKey ? NOTE_PLACEHOLDER[noteKey] ?? 'Ajoutez un commentaire…' : 'Choisissez d\'abord un niveau…';

    return (
        <article
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
                    {themes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {themes.map(t => (
                                <span key={t} className="text-[10px] font-semibold text-slate-300">{formatStageObjectiveTheme(t)}</span>
                            ))}
                        </div>
                    )}
                    <p className={cn(
                        'text-sm font-bold leading-snug',
                        isNotDone ? 'text-slate-400 line-through' : 'text-slate-900'
                    )}>
                        {item.pedagogicalContent.question}
                    </p>
                </div>
                {statusMeta && !editable && (
                    <span className={cn('shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full border', statusMeta.light, statusMeta.text)}>
                        {statusMeta.label}
                    </span>
                )}
            </div>

            {/* Zone éditable */}
            {editable && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-2.5 bg-white/60">

                    {/* Statut d'exécution — ligne compacte */}
                    <div className="flex gap-1.5">
                        {STAGE_OBJECTIVE_EXECUTION_OPTIONS.map(opt => {
                            const selected = draft.executionStatus === opt.value;
                            const meta = STATUS_META[opt.value];
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        const changingStatus = opt.value !== draft.executionStatus;
                                        onChangeDraft?.(item.pedagogicalContent.id, {
                                            executionStatus: opt.value,
                                            // Les niveaux d'impact ont un sens différent selon le
                                            // statut (ex: "faible" veut dire autre chose en Effleuré
                                            // qu'en Travaillé) — on repart à zéro si le statut change.
                                            impactLevel: opt.value === 'not_done' || changingStatus ? null : draft.impactLevel,
                                            reasons: changingStatus ? [] : draft.reasons,
                                            note: changingStatus ? '' : draft.note,
                                        });
                                        if (changingStatus) setShowNote(false);
                                    }}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1 rounded-xl border py-2 text-[11px] font-black transition active:scale-95',
                                        selected
                                            ? cn(meta.light, meta.text, 'border-current shadow-sm')
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                    )}
                                >
                                    <span className="material-symbols-outlined text-[15px]">{meta.icon}</span>
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Impact : 3 boutons à choix unique, affichés dès qu'un statut
                        effleuré/travaillé est choisi. */}
                    {!isNotDone && draft.executionStatus && (
                        <ImpactToggle
                            options={impactOptions}
                            value={draft.impactLevel}
                            onChange={level => {
                                const changingLevel = level !== draft.impactLevel;
                                onChangeDraft?.(item.pedagogicalContent.id, {
                                    impactLevel: level,
                                    // Les raisons et la note cochées appartiennent au niveau
                                    // précédent — elles n'ont plus de sens si le niveau change.
                                    reasons: changingLevel ? [] : draft.reasons,
                                    note: changingLevel ? '' : draft.note,
                                });
                                if (changingLevel) setShowNote(false);
                            }}
                        />
                    )}

                    {/* Raisons à cocher (mesurables), propres à chaque niveau du slider.
                        Case "Autre" ouvre la note libre. */}
                    {reasonOptions.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                {isNotDone ? 'Pourquoi non abordé ?' : 'Pourquoi ce niveau ?'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {reasonOptions.map(reason => {
                                    const selected = draft.reasons.includes(reason);
                                    return (
                                        <button
                                            key={reason}
                                            type="button"
                                            onClick={() => onChangeDraft?.(item.pedagogicalContent.id, {
                                                reasons: selected
                                                    ? draft.reasons.filter(r => r !== reason)
                                                    : [...draft.reasons, reason],
                                            })}
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-left transition active:scale-95',
                                                selected
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            )}
                                        >
                                            <span className={cn(
                                                'size-3.5 rounded border shrink-0 flex items-center justify-center',
                                                selected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                                            )}>
                                                {selected && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                                            </span>
                                            {reason}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Note : reste repliée, texte libre vraiment optionnel */}
                    {!showNote && (
                        <button
                            type="button"
                            onClick={() => setShowNote(true)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 px-2.5 py-1 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 transition"
                        >
                            <span className="material-symbols-outlined text-[13px]">add</span>
                            {reasonOptions.length > 0 ? 'Autre raison' : 'Note'}
                        </button>
                    )}

                    {/* Note contextuelle selon statut */}
                    {showNote && (
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                                {noteLabel}
                            </label>
                            <textarea
                                value={draft.note}
                                onChange={e => onChangeDraft?.(item.pedagogicalContent.id, { note: e.target.value })}
                                placeholder={notePlaceholder}
                                rows={2}
                                autoFocus
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Affichage lecture seule : impact + raisons + note si renseignés */}
            {!editable && (impactMeta || draft.reasons.length > 0 || draft.note?.trim()) && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                        {impactMeta && (
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold">
                                {impactMeta.label}
                            </span>
                        )}
                        {draft.reasons.map(reason => (
                            <span key={reason} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 px-2.5 py-0.5 text-[10px] font-semibold">
                                {reason}
                            </span>
                        ))}
                    </div>
                    {draft.note?.trim() && (
                        <p className="text-xs text-slate-500 italic leading-relaxed">{draft.note}</p>
                    )}
                </div>
            )}
        </article>
    );
}

export function StageObjectiveReviewList({ items, editable = false, drafts, onChangeDraft, weatherIsBad = false }: Props) {
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
            reasons: item.review?.reasons ?? [],
            note: item.review?.note ?? '',
        };
    };

    const done   = items.filter(i => getDraft(i).executionStatus === 'done').length;
    const partial = items.filter(i => getDraft(i).executionStatus === 'partial').length;
    const notDone = items.filter(i => getDraft(i).executionStatus === 'not_done').length;
    const unset  = items.filter(i => !getDraft(i).executionStatus).length;

    // Les fiches sportives créées par le moniteur (source==='custom') ne sont pas des
    // objectifs environnementaux COP'UN : elles sont regroupées à part, hors des piliers.
    const envItems = items.filter(i => i.pedagogicalContent.source !== 'custom');
    const sportItems = items.filter(i => i.pedagogicalContent.source === 'custom');

    const renderCard = (item: StageObjectiveReviewItem) => (
        <ReviewCard
            key={item.pedagogicalContent.id}
            item={item}
            editable={editable}
            draft={getDraft(item)}
            onChangeDraft={onChangeDraft}
            weatherIsBad={weatherIsBad}
        />
    );

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

            {/* Objectifs COP'UN groupés par pilier + objectifs sportifs à part */}
            <div className="space-y-5">
                {PILLARS.map(pillar => {
                    const pillarItems = envItems.filter(i => i.pedagogicalContent.dimension === pillar.id);
                    if (pillarItems.length === 0) return null;
                    return (
                        <div key={pillar.id} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <div className={cn('size-6 rounded-lg flex items-center justify-center shrink-0', pillar.bg)}>
                                    <span className="material-symbols-outlined text-white text-sm">{pillar.icon}</span>
                                </div>
                                <p className={cn('text-xs font-black uppercase tracking-tight', pillar.color)}>{pillar.label}</p>
                                <span className="text-[10px] font-bold text-slate-300">{pillarItems.length}</span>
                            </div>
                            <div className="space-y-2">{pillarItems.map(renderCard)}</div>
                        </div>
                    );
                })}
                {SPORT_FEATURES_ENABLED && sportItems.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <div className="size-6 rounded-lg flex items-center justify-center shrink-0 bg-indigo-500">
                                <span className="material-symbols-outlined text-white text-sm">sailing</span>
                            </div>
                            <p className="text-xs font-black uppercase tracking-tight text-indigo-600">Objectifs sportifs</p>
                            <span className="text-[10px] font-bold text-slate-300">{sportItems.length}</span>
                        </div>
                        <div className="space-y-2">{sportItems.map(renderCard)}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
