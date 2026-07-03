'use client';

import { useState, useRef, useCallback } from 'react';
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

// Slider glissable à 3 crans : le geste de déplacer le curseur aide à mentaliser le
// niveau choisi. Se resnap sur l'un des 3 crans au relâchement.
function ImpactSlider({
    options, value, onChange,
}: {
    options: ImpactOption[];
    value: StageObjectiveImpactLevel | null;
    onChange: (level: StageObjectiveImpactLevel | null) => void;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragging, setDragging] = useState(false);

    const selectedIndex = value ? options.findIndex(o => o.value === value) : -1;
    const displayIndex = dragging && dragIndex !== null ? dragIndex : selectedIndex;

    const indexFromClientX = useCallback((clientX: number) => {
        const track = trackRef.current;
        if (!track) return 0;
        const rect = track.getBoundingClientRect();
        const ratio = (clientX - rect.left) / rect.width;
        return Math.min(2, Math.max(0, Math.round(ratio * 2)));
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setDragging(true);
        setDragIndex(indexFromClientX(e.clientX));
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragging) return;
        setDragIndex(indexFromClientX(e.clientX));
    };

    const handlePointerUp = () => {
        if (dragging && dragIndex !== null) {
            const next = options[dragIndex]?.value ?? null;
            onChange(next === value ? value : next);
        }
        setDragging(false);
        setDragIndex(null);
    };

    // Position exprimée comme calc(1rem + ratio * (100% - 2rem)) : le rail utile va de
    // 1rem (rayon du curseur) à 100%-1rem, les crans se répartissent dessus.
    const posStyle = (ratio: number) => `calc(1rem + ${ratio} * (100% - 2rem))`;

    const hasValue = displayIndex >= 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ce que le groupe a retenu
                </p>
                {!hasValue && (
                    <span className="text-[10px] font-bold text-slate-300 italic">à évaluer — glissez le curseur</span>
                )}
            </div>
            <div
                ref={trackRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative h-14 flex items-center cursor-pointer touch-none select-none"
            >
                {/* Rail creusé — ombre intérieure pour donner une vraie sensation de profondeur */}
                <div className="absolute left-4 right-4 h-3 rounded-full bg-slate-100 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.12)]" />
                {hasValue && (
                    <div
                        className="absolute left-4 h-3 rounded-full bg-emerald-500 transition-all"
                        style={{ width: `calc(${posStyle(displayIndex / 2)} - 1rem)` }}
                    />
                )}
                {/* Repères de crans, toujours visibles sous le rail */}
                {options.map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            'absolute size-1.5 rounded-full -translate-x-1/2 transition-colors',
                            hasValue && i <= displayIndex ? 'bg-emerald-200' : 'bg-white/80 ring-1 ring-slate-300'
                        )}
                        style={{ left: posStyle(i / 2) }}
                    />
                ))}
                {/* Poignée : relief marqué (gradient + double ombre) pour qu'elle se lise
                    comme un vrai objet à saisir, pas un simple contour */}
                {hasValue ? (
                    <div
                        className={cn(
                            'absolute size-9 rounded-full -translate-x-1/2 transition-transform',
                            'bg-linear-to-b from-white to-slate-50',
                            'border-2 border-emerald-500',
                            'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.18)]',
                            dragging && 'scale-115 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_6px_16px_rgba(0,0,0,0.25)]'
                        )}
                        style={{ left: posStyle(displayIndex / 2) }}
                    >
                        <div className="absolute inset-1.5 rounded-full bg-emerald-500" />
                    </div>
                ) : (
                    // État vide : poignée fantôme centrée, invite claire à saisir
                    <div
                        className={cn(
                            'absolute size-9 rounded-full -translate-x-1/2 left-1/2',
                            'bg-white border-2 border-dashed border-slate-300',
                            dragging && 'scale-110 border-emerald-400'
                        )}
                    />
                )}
            </div>
            {/* Labels alignés exactement sur la position de leur cran (pas justify-between,
                qui décale le libellé du milieu dès que les textes ont des largeurs différentes) */}
            <div className="relative h-8 -mt-1">
                {options.map((opt, i) => (
                    <span
                        key={opt.value}
                        className={cn(
                            'absolute top-0 text-xs font-bold leading-tight w-24',
                            i === 0 ? 'text-left' : i === 2 ? 'text-right' : 'text-center',
                            displayIndex === i ? 'text-emerald-600' : 'text-slate-400'
                        )}
                        style={{
                            left: posStyle(i / 2),
                            transform: i === 0 ? 'none' : i === 2 ? 'translateX(-100%)' : 'translateX(-50%)',
                        }}
                    >
                        {opt.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

type Props = {
    items: StageObjectiveReviewItem[];
    editable?: boolean;
    drafts?: Record<string, StageObjectiveReviewDraft>;
    onChangeDraft?: (contentId: string, patch: Partial<StageObjectiveReviewDraft>) => void;
};

function ReviewCard({
    item, editable, draft, onChangeDraft,
}: {
    item: StageObjectiveReviewItem;
    editable: boolean;
    draft: StageObjectiveReviewDraft;
    onChangeDraft?: (contentId: string, patch: Partial<StageObjectiveReviewDraft>) => void;
}) {
    // La note reste repliée par défaut (texte libre, vraiment optionnel) — elle
    // s'ouvre automatiquement si elle contient déjà une valeur. L'impact, lui,
    // s'affiche systématiquement dès qu'un statut effleuré/travaillé est choisi.
    const [showNote, setShowNote] = useState(!!draft.note?.trim());

    const statusMeta = draft.executionStatus ? STATUS_META[draft.executionStatus] : null;
    const impactMeta = draft.impactLevel ? IMPACT_META[draft.impactLevel] : null;
    const impactOptions = getStageObjectiveImpactOptions(draft.executionStatus);
    const reasonOptions = getStageObjectiveReasonOptions(draft.executionStatus, draft.impactLevel);
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

                    {/* Impact : slider glissable à 3 crans, affiché dès qu'un statut
                        effleuré/travaillé est choisi. */}
                    {!isNotDone && draft.executionStatus && (
                        <ImpactSlider
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
