'use client';

import { useState, useMemo, useTransition, useRef } from 'react';
import clsx from 'clsx';
import { addStageExploit, updateStageExploitStatus, removeStageExploit, uploadDefiPhoto } from '@/actions/defi-actions';

type Defi = {
    id: string;
    description: string;
    instruction: string;
    type_preuve: 'photo' | 'checkbox' | 'action' | 'quiz';
    icon: string;
    tags_theme: string[];
    stage_type: string[];
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
};

export default function DefisTab({ stageId, availableDefis, assignedExploits, suggestedThemes = [] }: Props) {
    const [isPending, startTransition] = useTransition();
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentDefiIdRef = useRef<string | null>(null);

    // Memoize assigned IDs
    const assignedIds = useMemo(() => {
        return new Set(assignedExploits.map(e => e.exploit_id));
    }, [assignedExploits]);

    // Extract unique themes from available défis
    const allThemes = useMemo(() => {
        const themes = new Set<string>();
        availableDefis.forEach(d => d.tags_theme?.forEach(t => themes.add(t)));
        return Array.from(themes).sort();
    }, [availableDefis]);

    // Filter available defis (not already assigned + theme filter)
    const unassignedDefis = useMemo(() => {
        return availableDefis.filter(d => {
            if (assignedIds.has(d.id)) return false;
            if (selectedTheme && !d.tags_theme?.includes(selectedTheme)) return false;
            return true;
        });
    }, [availableDefis, assignedIds, selectedTheme]);

    // Split unassigned into Suggested and Others based on stage themes
    const { suggestedUnassigned, otherUnassigned } = useMemo(() => {
        const suggested: Defi[] = [];
        const others: Defi[] = [];

        unassignedDefis.forEach(d => {
            const hasMatch = d.tags_theme?.some(t => suggestedThemes.includes(t));
            if (hasMatch && suggestedThemes.length > 0) {
                suggested.push(d);
            } else {
                others.push(d);
            }
        });

        return { suggestedUnassigned: suggested, otherUnassigned: others };
    }, [unassignedDefis, suggestedThemes]);

    const handleAssign = (defiId: string) => {
        startTransition(async () => {
            await addStageExploit(stageId, defiId);
        });
    };

    const handleComplete = (defiId: string, preuveUrl?: string) => {
        startTransition(async () => {
            await updateStageExploitStatus(stageId, defiId, 'complete', preuveUrl);
        });
    };

    const handlePhotoClick = (defiId: string) => {
        currentDefiIdRef.current = defiId;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const defiId = currentDefiIdRef.current;
        if (!file || !defiId) return;

        setIsUploading(defiId);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadDefiPhoto(formData);

            if (result.success && result.url) {
                handleComplete(defiId, result.url);
            } else {
                alert('Erreur d\'upload : ' + result.error);
            }
        } finally {
            setIsUploading(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = (defiId: string) => {
        startTransition(async () => {
            await removeStageExploit(stageId, defiId);
        });
    };

    return (
        <div className="space-y-8">
            {/* Hidden Photo Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
            />
            {/* Assigned Defis */}
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">checklist</span>
                    Défis Assignés ({assignedExploits.length})
                </h3>

                {assignedExploits.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">flag</span>
                        <p>Aucun défi assigné à ce stage</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assignedExploits.map(exploit => (
                            <div
                                key={exploit.id}
                                className={clsx(
                                    'p-4 rounded-xl border-2 transition-all',
                                    exploit.status === 'complete'
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-slate-200 bg-white'
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={clsx(
                                        'size-10 rounded-full flex items-center justify-center shrink-0',
                                        exploit.status === 'complete' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                                    )}>
                                        <span className="material-symbols-outlined">
                                            {exploit.status === 'complete' ? 'check' : exploit.defis.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-slate-900 truncate">{exploit.defis.description}</h4>
                                            {exploit.status === 'complete' && (
                                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-100 px-2 py-0.5 rounded">Terminé</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{exploit.defis.instruction}</p>

                                        {exploit.status === 'complete' && exploit.completed_at && (
                                            <p className="text-xs text-green-600 mt-2 font-medium">
                                                ✓ Validé le {new Date(exploit.completed_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        )}

                                        {/* Proof Previews */}
                                        {exploit.preuves_url && exploit.preuves_url.length > 0 && (
                                            <div className="mt-3 flex gap-2">
                                                {exploit.preuves_url.map((url, idx) => (
                                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="relative size-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm block hover:scale-105 transition-transform">
                                                        <img src={url} alt="Preuve" className="size-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {exploit.status !== 'complete' && (
                                            <>
                                                {exploit.defis.type_preuve === 'checkbox' && (
                                                    <button
                                                        onClick={() => handleComplete(exploit.exploit_id)}
                                                        disabled={isPending}
                                                        className="px-3 py-1.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                                    >
                                                        Valider
                                                    </button>
                                                )}
                                                {exploit.defis.type_preuve === 'photo' && (
                                                    <button
                                                        onClick={() => handlePhotoClick(exploit.exploit_id)}
                                                        disabled={isPending || isUploading === exploit.exploit_id}
                                                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5"
                                                    >
                                                        {isUploading === exploit.exploit_id ? (
                                                            <><span className="animate-spin inline-block size-3 border-2 border-white/30 border-t-white rounded-full" /> Upload...</>
                                                        ) : (
                                                            <>📷 Photo</>
                                                        )}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleRemove(exploit.exploit_id)}
                                            disabled={isPending}
                                            className="px-3 py-1.5 text-slate-400 text-sm hover:text-red-500 transition disabled:opacity-50"
                                        >
                                            Retirer
                                        </button>
                                    </div>
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

                {/* Theme Filters - 2 Row Grid with Horizontal Scroll */}
                {allThemes.length > 0 && (
                    <div className="overflow-x-auto -mx-4 px-4 pb-3 mb-4 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-2">
                            <button
                                onClick={() => setSelectedTheme(null)}
                                className={clsx(
                                    'px-4 py-2.5 text-sm font-bold rounded-full transition whitespace-nowrap',
                                    selectedTheme === null
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'bg-white text-slate-600 border border-slate-200'
                                )}
                            >
                                Tous
                            </button>
                            {allThemes.map(theme => (
                                <button
                                    key={theme}
                                    onClick={() => setSelectedTheme(theme)}
                                    className={clsx(
                                        'px-4 py-2.5 text-sm font-bold rounded-full transition whitespace-nowrap',
                                        selectedTheme === theme
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                            : 'bg-white text-slate-600 border border-slate-200'
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
                        {/* Suggested Defis (if we lack a broad selectedTheme filter) */}
                        {suggestedUnassigned.length > 0 && (
                            <div>
                                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">Suggérés pour votre programme</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {suggestedUnassigned.map(defi => (
                                        <div
                                            key={defi.id}
                                            className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:border-indigo-300 transition flex items-start gap-4"
                                        >
                                            <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                <span className="material-symbols-outlined">{defi.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900">{defi.description}</h4>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{defi.instruction}</p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {defi.tags_theme?.slice(0, 3).map(tag => (
                                                        <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssign(defi.id)}
                                                disabled={isPending}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 shrink-0 flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                Assigner
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Defis */}
                        {otherUnassigned.length > 0 && (
                            <div>
                                {suggestedUnassigned.length > 0 && <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Autres Défis</h4>}
                                <div className="grid grid-cols-1 gap-3">
                                    {otherUnassigned.map(defi => (
                                        <div
                                            key={defi.id}
                                            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-start gap-4"
                                        >
                                            <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                                <span className="material-symbols-outlined">{defi.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900">{defi.description}</h4>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{defi.instruction}</p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {defi.tags_theme?.slice(0, 3).map(tag => (
                                                        <span key={tag} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssign(defi.id)}
                                                disabled={isPending}
                                                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition disabled:opacity-50 shrink-0 flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                Assigner
                                            </button>
                                        </div>
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
