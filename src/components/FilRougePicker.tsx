'use client';

import { useState, useTransition } from 'react';
import { setMonitorFilRouge, type FilRougeDefi } from '@/actions/defi-actions';
import clsx from 'clsx';

const THEME_ICONS: Record<string, string> = {
    biodiversite: 'eco',
    caracteristiques_littoral: 'waves',
    impact_presence_humaine: 'delete',
    cohabitation_vivant: 'pets',
    marée: 'water',
    transversal: 'hub',
};

export function FilRougePicker({ defis, currentId }: { defis: FilRougeDefi[]; currentId: string | null }) {
    const [selected, setSelected] = useState<string | null>(currentId);
    const [saved, setSaved] = useState(false);
    const [isPending, startTransition] = useTransition();

    const current = defis.find(d => d.id === selected);

    const handleSelect = (id: string) => {
        setSelected(prev => prev === id ? null : id);
        setSaved(false);
    };

    const handleSave = () => {
        startTransition(async () => {
            await setMonitorFilRouge(selected);
            setSaved(true);
        });
    };

    const hasChanged = selected !== currentId;

    return (
        <div className="space-y-3">
            {/* Défi actif */}
            {current ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">{current.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Défi de saison actif</p>
                        <p className="font-bold text-emerald-900 text-sm truncate">{current.description}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">Assigné automatiquement à chaque nouveau stage</p>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-400 text-2xl shrink-0">flag</span>
                    <div>
                        <p className="font-bold text-amber-900 text-sm">Aucun défi de saison</p>
                        <p className="text-xs text-amber-600 mt-0.5">Choisissez un défi ci-dessous pour l&apos;activer</p>
                    </div>
                </div>
            )}

            {/* Liste des défis fil rouge */}
            <div className="space-y-2">
                {defis.map(defi => {
                    const isSelected = selected === defi.id;
                    return (
                        <button
                            key={defi.id}
                            onClick={() => handleSelect(defi.id)}
                            className={clsx(
                                "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 active:scale-[0.99]",
                                isSelected
                                    ? "border-emerald-400 bg-emerald-50"
                                    : "border-slate-100 bg-white hover:border-slate-300"
                            )}
                        >
                            <div className={clsx(
                                "size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                                isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                            )}>
                                <span className="material-symbols-outlined text-lg">{defi.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className={clsx("font-bold text-sm", isSelected ? "text-emerald-900" : "text-slate-900")}>
                                        {defi.description}
                                    </p>
                                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                        {defi.points} pts
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{defi.instruction}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {defi.tags_theme?.map(tag => (
                                        <span key={tag} className={clsx(
                                            "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                                            isSelected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                        )}>
                                            <span className="material-symbols-outlined text-[10px]">
                                                {THEME_ICONS[tag] ?? 'label'}
                                            </span>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {isSelected && (
                                <span className="material-symbols-outlined text-emerald-500 shrink-0 mt-0.5">check_circle</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bouton enregistrer */}
            {hasChanged && (
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-700"
                >
                    {isPending
                        ? <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                        : <span className="material-symbols-outlined text-lg">{selected ? 'check' : 'remove_circle'}</span>
                    }
                    {selected ? 'Activer ce défi de saison' : 'Retirer le défi de saison'}
                </button>
            )}

            {saved && !hasChanged && (
                <p className="text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Sauvegardé
                </p>
            )}
        </div>
    );
}
