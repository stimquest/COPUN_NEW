import clsx from 'clsx';
import { WeekObservation, PedagogicalAction } from '@/types';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';
import { OBSERVATION_TYPES } from '@/data/observations';

const DIM_COLORS: Record<'C' | 'O' | 'P', { bg: string; text: string; border: string }> = {
    C: { bg: 'bg-amber-500',   text: 'text-amber-700',   border: 'border-amber-200' },
    O: { bg: 'bg-sky-500',     text: 'text-sky-700',     border: 'border-sky-200' },
    P: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const PEDAGOGICAL_ACTION_LABELS: Record<PedagogicalAction, { label: string; icon: string }> = {
    expliquer: { label: 'Expliquer', icon: 'school' },
    montrer: { label: 'Montrer', icon: 'visibility' },
    questionner: { label: 'Questionner', icon: 'help' },
    laisser_decouvrir: { label: 'Laisser découvrir', icon: 'explore' },
};

function formatObservedAt(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Relecture en lecture seule des retours terrain de la semaine, pour le bilan (clôturé ou en cours de clôture). */
export function StageObservationsReview({ observations }: { observations: WeekObservation[] }) {
    if (observations.length === 0) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
                <span className="material-symbols-outlined text-2xl text-slate-300">travel_explore</span>
                <p className="mt-1.5 text-sm font-semibold text-slate-400">Aucun retour terrain enregistré</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {observations.map(obs => {
                const action = obs.pedagogical_action ? PEDAGOGICAL_ACTION_LABELS[obs.pedagogical_action] : null;
                const thematic = obs.linked_thematic ? THEMATIC_LABELS[obs.linked_thematic as ThematicTag] : null;
                const dim = thematic ? DIM_COLORS[thematic.dimension] : null;
                const typeInfo = OBSERVATION_TYPES.find(t => t.value === obs.observation_type);
                const speciesLabel = obs.species_label
                    ? `${obs.species_label}${obs.species_uncertain ? ' (?)' : ''}`
                    : (obs.species_uncertain ? 'Espèce non identifiée' : null);

                return (
                    <div key={obs.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                        <div className="flex items-start gap-3">
                            {dim ? (
                                <span className={clsx('mt-0.5 text-[10px] font-black rounded-md px-1.5 py-0.5 shrink-0 text-white', dim.bg)}>
                                    {thematic!.dimension}
                                </span>
                            ) : (
                                <span className="mt-2 size-2 rounded-full bg-slate-200 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <p className="text-sm text-slate-700 leading-relaxed">{obs.text}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {typeInfo && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                            <span className="material-symbols-outlined text-[11px]">{typeInfo.icon}</span>
                                            {speciesLabel || typeInfo.label}
                                        </span>
                                    )}
                                    {obs.individual_count !== null && (
                                        <span className="inline-flex items-center text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                                            ×{obs.individual_count}
                                        </span>
                                    )}
                                    {obs.location_note && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                            <span className="material-symbols-outlined text-[11px]">location_on</span>
                                            {obs.location_note}
                                        </span>
                                    )}
                                    {action && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                            <span className="material-symbols-outlined text-[11px]">{action.icon}</span>
                                            {action.label}
                                        </span>
                                    )}
                                    {thematic && dim && (
                                        <span className={clsx('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', `bg-white ${dim.text} ${dim.border}`)}>
                                            {thematic.label}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-300">
                                    {obs.observed_at ? formatObservedAt(obs.observed_at) : formatObservedAt(obs.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
