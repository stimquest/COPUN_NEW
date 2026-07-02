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
    terrain_temps_reel: boolean;
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
    filRougeId?: string | null;
};

const pointsBadgeColor = (points: number) => {
    if (points >= 5) return 'bg-amber-100 text-amber-700';
    if (points >= 3) return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-500';
};

/** Field-constraint badge so the instructor chooses in full knowledge. */
function TerrainBadge({ tempsReel }: { tempsReel: boolean }) {
    if (tempsReel) {
        return (
            <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Nécessite le smartphone sur place (GPS / photo immédiate)">
                <span className="material-symbols-outlined text-xs">smartphone</span>Sur le terrain
            </span>
        );
    }
    return (
        <span className="text-[10px] font-black text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Réalisable sur papier puis saisie au calme après la séance">
            <span className="material-symbols-outlined text-xs">edit_note</span>Différé possible
        </span>
    );
}

export default function DefisTab({ stageId, availableDefis, assignedExploits, suggestedThemes = [], filRougeId }: Props & { filRougeId?: string | null }) {
    const [isPending, startTransition] = useTransition();
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [terrainFilter, setTerrainFilter] = useState<'all' | 'differe' | 'terrain'>('all');

    const assignedIds = useMemo(() => new Set(assignedExploits.map(e => e.exploit_id)), [assignedExploits]);

    const allThemes = useMemo(() => {
        const themes = new Set<string>();
        availableDefis.forEach(d => d.tags_theme?.forEach(t => themes.add(t)));
        return Array.from(themes).sort();
    }, [availableDefis]);

    const unassignedDefis = useMemo(() => availableDefis.filter(d => {
        if (assignedIds.has(d.id)) return false;
        if (selectedTheme && !d.tags_theme?.includes(selectedTheme)) return false;
        if (terrainFilter === 'differe' && d.terrain_temps_reel) return false;
        if (terrainFilter === 'terrain' && !d.terrain_temps_reel) return false;
        return true;
    }), [availableDefis, assignedIds, selectedTheme, terrainFilter]);

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

    // Exploit fil rouge assigné à ce stage
    const filRougeExploit = filRougeId ? assignedExploits.find(e => e.exploit_id === filRougeId) : null;
    const filRougeDefi = filRougeId ? availableDefis.find(d => d.id === filRougeId) : null;

    return (
        <div className="space-y-8">

            {/* Défi fil rouge épinglé */}
            {filRougeId && (filRougeExploit || filRougeDefi) && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-emerald-500 text-lg">timeline</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Défi de saison — Fil rouge</p>
                    </div>
                    {filRougeExploit ? (
                        <div className="p-4 rounded-2xl border-2 border-emerald-300 bg-linear-to-br from-emerald-50 to-teal-50">
                            <div className="flex items-start gap-3">
                                <div className={clsx(
                                    'size-11 rounded-xl flex items-center justify-center shrink-0',
                                    filRougeExploit.status === 'complete' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'
                                )}>
                                    <span className="material-symbols-outlined">
                                        {filRougeExploit.status === 'complete' ? 'check' : filRougeExploit.defis.icon}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                        <h4 className="font-black text-slate-900 text-sm">{filRougeExploit.defis.description}</h4>
                                        {filRougeExploit.status === 'complete'
                                            ? <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Validé cette semaine ✓</span>
                                            : <span className="text-[10px] font-black text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">À réaliser</span>
                                        }
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">{filRougeExploit.defis.instruction}</p>
                                </div>
                            </div>
                        </div>
                    ) : filRougeDefi ? (
                        /* Fil rouge défini mais pas encore assigné à cette semaine — cas impossible normalement grâce à l'auto-assign, mais sécurité */
                        <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 flex items-center gap-3">
                            <div className="size-11 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">{filRougeDefi.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 text-sm">{filRougeDefi.description}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Non assigné à cette semaine</p>
                            </div>
                            <button
                                onClick={() => handleAssign(filRougeDefi.id)}
                                disabled={isPending}
                                className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50 shrink-0"
                            >
                                Assigner
                            </button>
                        </div>
                    ) : null}
                </section>
            )}

            {/* Assigned Defis */}
            <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">checklist</span>
                    Défis assignés ({assignedExploits.length})
                </h3>

                {assignedExploits.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-400">
                        <span className="material-symbols-outlined text-3xl mb-2 text-slate-300 block">flag</span>
                        <p className="text-sm font-semibold">Aucun défi assigné</p>
                        <p className="text-xs mt-1">Ajoutez des défis depuis la liste ci-dessous.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {assignedExploits.map(exploit => {
                            const done = exploit.status === 'complete';
                            return (
                                <div key={exploit.id} className={clsx(
                                    'rounded-2xl border-2 flex items-center gap-3 px-4 py-3 transition-all',
                                    done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
                                )}>
                                    <div className={clsx(
                                        'size-9 rounded-xl flex items-center justify-center shrink-0',
                                        done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                                    )}>
                                        <span className="material-symbols-outlined text-[18px]">
                                            {done ? 'check' : exploit.defis.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={clsx('text-sm font-bold leading-tight', done ? 'text-emerald-900' : 'text-slate-900')}>
                                            {exploit.defis.description}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded", pointsBadgeColor(exploit.defis.points))}>
                                                {exploit.defis.points} pts
                                            </span>
                                            {done && (
                                                <span className="text-[10px] text-emerald-600 font-semibold">✓ Validé</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(exploit.exploit_id)}
                                        disabled={isPending}
                                        className="size-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition disabled:opacity-50 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Available Defis */}
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">explore</span>
                    Défis Disponibles ({unassignedDefis.length})
                </h3>

                {/* Field-constraint filter */}
                <div className="flex gap-2 mb-4">
                    {([
                        { id: 'all' as const, label: 'Tous', icon: 'apps' },
                        { id: 'differe' as const, label: 'Différé', icon: 'edit_note' },
                        { id: 'terrain' as const, label: 'Sur le terrain', icon: 'smartphone' },
                    ]).map(opt => (
                        <button key={opt.id} onClick={() => setTerrainFilter(opt.id)}
                            className={clsx(
                                'flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full transition whitespace-nowrap',
                                terrainFilter === opt.id
                                    ? opt.id === 'terrain' ? 'bg-orange-500 text-white' : opt.id === 'differe' ? 'bg-teal-500 text-white' : 'bg-slate-800 text-white'
                                    : 'bg-white text-slate-500 border border-slate-200'
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>

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

const PREUVE_LABEL: Record<string, { icon: string; label: string }> = {
    photo:    { icon: 'photo_camera',  label: 'Photo requise' },
    checkbox: { icon: 'check_box',     label: 'Validation simple' },
    action:   { icon: 'touch_app',     label: 'Action terrain' },
    quiz:     { icon: 'quiz',          label: 'Quiz de validation' },
};

function DefiDetailDrawer({ defi, onClose, onAssign, isPending, variant }: {
    defi: Defi;
    onClose: () => void;
    onAssign: (id: string) => void;
    isPending: boolean;
    variant: 'suggested' | 'other';
}) {
    const preuve = PREUVE_LABEL[defi.type_preuve] ?? { icon: 'task_alt', label: defi.type_preuve };
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Drawer */}
            <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl max-h-[85vh] overflow-y-auto">
                <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-4 pb-3 border-b border-slate-100 flex items-start gap-3">
                    <div className={clsx(
                        "size-12 rounded-2xl flex items-center justify-center shrink-0",
                        variant === 'suggested' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                    )}>
                        <span className="material-symbols-outlined text-2xl">{defi.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-black text-slate-900 text-base leading-tight">{defi.description}</h2>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <TerrainBadge tempsReel={defi.terrain_temps_reel} />
                            {defi.spot_fixe && (
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-xs">location_on</span>Spot fixe
                                </span>
                            )}
                            <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded", pointsBadgeColor(defi.points))}>
                                {defi.points} pts
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 shrink-0">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="px-5 py-5 space-y-5">
                    {/* Ce qu'il faut faire */}
                    <section>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ce qu&apos;il faut faire</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{defi.instruction}</p>
                    </section>

                    {/* Preuve attendue */}
                    <section className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400 text-xl">{preuve.icon}</span>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preuve attendue</p>
                            <p className="text-sm font-bold text-slate-700">{preuve.label}</p>
                        </div>
                    </section>

                    {/* Thématiques */}
                    {defi.tags_theme?.length > 0 && (
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Thématiques</p>
                            <div className="flex flex-wrap gap-1.5">
                                {defi.tags_theme.map(tag => (
                                    <span key={tag} className="text-xs px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* CTA sticky */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 pb-[max(env(safe-area-inset-bottom),5.5rem)] md:pb-4">
                    <button
                        onClick={() => { onAssign(defi.id); onClose(); }}
                        disabled={isPending}
                        className={clsx(
                            "w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2",
                            variant === 'suggested' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-700'
                        )}
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Assigner ce défi
                    </button>
                </div>
            </div>
        </>
    );
}

function DefiListItem({ defi, onAssign, isPending, variant }: {
    defi: Defi;
    onAssign: (id: string) => void;
    isPending: boolean;
    variant: 'suggested' | 'other';
}) {
    const [showDetail, setShowDetail] = useState(false);

    return (
        <>
            <div className={clsx(
                "p-4 rounded-xl border transition flex items-start gap-4",
                variant === 'suggested' ? 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-300' : 'bg-white border-slate-200 hover:border-emerald-300'
            )}>
                <button
                    onClick={() => setShowDetail(true)}
                    className={clsx(
                        "size-10 rounded-full flex items-center justify-center shrink-0 hover:scale-110 transition-transform",
                        variant === 'suggested' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                    )}
                    title="Voir le détail"
                >
                    <span className="material-symbols-outlined">{defi.icon}</span>
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <button
                            onClick={() => setShowDetail(true)}
                            className="font-bold text-slate-900 text-left hover:text-indigo-700 transition-colors"
                        >
                            {defi.description}
                        </button>
                        <TerrainBadge tempsReel={defi.terrain_temps_reel} />
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
                    <div className="flex flex-wrap gap-1 mt-2 items-center">
                        {defi.tags_theme?.slice(0, 3).map(tag => (
                            <span key={tag} className={clsx(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                variant === 'suggested' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-50 text-emerald-600'
                            )}>
                                {tag}
                            </span>
                        ))}
                        <button
                            onClick={() => setShowDetail(true)}
                            className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5 ml-1"
                        >
                            <span className="material-symbols-outlined text-xs">info</span>
                            Voir plus
                        </button>
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

            {showDetail && (
                <DefiDetailDrawer
                    defi={defi}
                    onClose={() => setShowDetail(false)}
                    onAssign={onAssign}
                    isPending={isPending}
                    variant={variant}
                />
            )}
        </>
    );
}
