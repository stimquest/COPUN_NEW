'use client';

import { useState, useMemo, useTransition } from 'react';
import clsx from 'clsx';
import { addStageExploit, removeStageExploit } from '@/actions/defi-actions';

type Defi = {
    id: string;
    description: string;
    instruction: string;
    type_preuve: 'photo' | 'checkbox' | 'action' | 'quiz';
    icon: string;
    tags_theme: string[];
    stage_type: string[];
    spot_fixe: boolean;
    points: number;
};

type StageExploit = {
    id: string;
    stage_id: string;
    exploit_id: string;
    status: 'en_cours' | 'complete';
    completed_at: string | null;
    preuves_url: string[];
    defis: Defi;
};

type Props = {
    stageId: string;
    availableDefis: Defi[];
    assignedExploits: StageExploit[];
    suggestedThemes?: string[];
    clubSpots: { defi_id: string }[];
    clubObservationTargets: unknown[];
};

const pointsBadgeColor = (points: number) => {
    if (points >= 5) return 'bg-amber-100 text-amber-700';
    if (points >= 3) return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-500';
};

export default function DefisTab({ stageId, availableDefis, assignedExploits, suggestedThemes = [] }: Props) {
    const [isPending, startTransition] = useTransition();
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

    const assignedIds = useMemo(() => new Set(assignedExploits.map(e => e.exploit_id)), [assignedExploits]);

    const allThemes = useMemo(() => {
        const themes = new Set<string>();
        availableDefis.forEach(d => d.tags_theme?.forEach(t => themes.add(t)));
        return Array.from(themes).sort();
    }, [availableDefis]);

    const unassignedDefis = useMemo(() => availableDefis.filter(d => {
        if (assignedIds.has(d.id)) return false;
        if (selectedTheme && !d.tags_theme?.includes(selectedTheme)) return false;
        return true;
    }), [availableDefis, assignedIds, selectedTheme]);

    const { suggestedUnassigned, otherUnassigned } = useMemo(() => {
        const suggested: Defi[] = [];
        const others: Defi[] = [];
        unassignedDefis.forEach(d => {
            (d.tags_theme?.some(t => suggestedThemes.includes(t)) && suggestedThemes.length > 0)
                ? suggested.push(d) : others.push(d);
        });
        return { suggestedUnassigned: suggested, otherUnassigned: others };
    }, [unassignedDefis, suggestedThemes]);

    const handleAssign = (defiId: string) => {
        startTransition(async () => { await addStageExploit(stageId, defiId); });
    };

    const handleRemove = (defiId: string) => {
        startTransition(async () => { await removeStageExploit(stageId, defiId); });
    };

    return (
        <div className="space-y-8">

            {/* Assigned Defis */}
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">checklist</span>
                    Défis Assignés ({assignedExploits.length})
                </h3>
                <p className="text-xs text-slate-400 mb-4">La validation se fait sur le terrain via <strong>En Action</strong>.</p>

                {assignedExploits.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">flag</span>
                        <p>Aucun défi assigné à ce stage</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assignedExploits.map(exploit => (
                            <div key={exploit.id} className={clsx(
                                'p-4 rounded-xl border-2 transition-all',
                                exploit.status === 'complete' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
                            )}>
                                <div className="flex items-start gap-3">
                                    <div className={clsx(
                                        'size-10 rounded-full flex items-center justify-center shrink-0',
                                        exploit.status === 'complete' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                                    )}>
                                        <span className="material-symbols-outlined text-sm">
                                            {exploit.status === 'complete' ? 'check' : exploit.defis.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                            <h4 className="font-bold text-slate-900 text-sm">{exploit.defis.description}</h4>
                                            {exploit.defis.spot_fixe && (
                                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-xs">location_on</span>Spot
                                                </span>
                                            )}
                                            <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded", pointsBadgeColor(exploit.defis.points))}>
                                                {exploit.defis.points} pts
                                            </span>
                                            {exploit.status === 'complete' && (
                                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Validé</span>
                                            )}
                                        </div>
                                        {exploit.status === 'complete' && exploit.completed_at && (
                                            <p className="text-xs text-emerald-600 font-medium">
                                                ✓ {new Date(exploit.completed_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemove(exploit.exploit_id)}
                                        disabled={isPending}
                                        className="text-slate-300 hover:text-red-400 transition disabled:opacity-50 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Available Defis */}
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">explore</span>
                    Défis Disponibles ({unassignedDefis.length})
                </h3>

                {allThemes.length > 0 && (
                    <div className="overflow-x-auto -mx-4 px-4 pb-3 mb-4 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedTheme(null)}
                                className={clsx(
                                    'px-4 py-2 text-sm font-bold rounded-full transition whitespace-nowrap',
                                    selectedTheme === null ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                                )}
                            >
                                Tous
                            </button>
                            {allThemes.map(theme => (
                                <button key={theme} onClick={() => setSelectedTheme(theme)}
                                    className={clsx(
                                        'px-4 py-2 text-sm font-bold rounded-full transition whitespace-nowrap',
                                        selectedTheme === theme ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
                                    )}
                                >
                                    {theme}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {unassignedDefis.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">check_circle</span>
                        <p>{selectedTheme ? `Aucun défi pour "${selectedTheme}"` : 'Tous les défis ont été assignés !'}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {suggestedUnassigned.length > 0 && (
                            <div>
                                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">Suggérés pour votre programme</h4>
                                <div className="space-y-3">
                                    {suggestedUnassigned.map(defi => (
                                        <DefiListItem key={defi.id} defi={defi} onAssign={handleAssign} isPending={isPending} variant="suggested" />
                                    ))}
                                </div>
                            </div>
                        )}
                        {otherUnassigned.length > 0 && (
                            <div>
                                {suggestedUnassigned.length > 0 && <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Autres Défis</h4>}
                                <div className="space-y-3">
                                    {otherUnassigned.map(defi => (
                                        <DefiListItem key={defi.id} defi={defi} onAssign={handleAssign} isPending={isPending} variant="other" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

function DefiListItem({ defi, onAssign, isPending, variant }: {
    defi: Defi;
    onAssign: (id: string) => void;
    isPending: boolean;
    variant: 'suggested' | 'other';
}) {
    return (
        <div className={clsx(
            "p-4 rounded-xl border transition flex items-start gap-4",
            variant === 'suggested' ? 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-300' : 'bg-white border-slate-200 hover:border-emerald-300'
        )}>
            <div className={clsx(
                "size-10 rounded-full flex items-center justify-center shrink-0",
                variant === 'suggested' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
            )}>
                <span className="material-symbols-outlined">{defi.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <h4 className="font-bold text-slate-900">{defi.description}</h4>
                    {defi.spot_fixe && (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">location_on</span>Spot
                        </span>
                    )}
                    <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded", pointsBadgeColor(defi.points))}>
                        {defi.points} pts
                    </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{defi.instruction}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {defi.tags_theme?.slice(0, 3).map(tag => (
                        <span key={tag} className={clsx(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            variant === 'suggested' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-50 text-emerald-600'
                        )}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <button
                onClick={() => onAssign(defi.id)}
                disabled={isPending}
                className={clsx(
                    "px-4 py-2 text-sm font-bold rounded-lg transition disabled:opacity-50 shrink-0 flex items-center gap-1",
                    variant === 'suggested' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
            >
                <span className="material-symbols-outlined text-sm">add</span>
                Assigner
            </button>
        </div>
    );
}
