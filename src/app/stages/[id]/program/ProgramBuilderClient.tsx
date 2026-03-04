'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stage, PedagogicalContent } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { updateStagePool } from '@/actions/stage-actions';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import CardCreatorModal from '@/components/CardCreatorModal';
import CardDetailModal from '@/components/CardDetailModal';

export default function ProgramBuilderClient({ stage, fullPool }: { stage: Stage, fullPool: PedagogicalContent[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'EXPLORER' | 'SELECTION'>('EXPLORER');
    const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

    // State optimized for new tag filtering
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');

    const [programIds, setProgramIds] = useState<string[]>(stage.selected_content || []);

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [selectedCardForDetail, setSelectedCardForDetail] = useState<PedagogicalContent | null>(null);

    // 1. Filter by Level and Themes first
    const poolMatchingThemes = useMemo(() => {
        return fullPool.filter(card => {
            // Level matching: Include Level 4 when Level 3 (Expert) is selected
            const cardLevel = Number(card.niveau);
            const matchesLevel = cardLevel === selectedLevel || (selectedLevel === 3 && cardLevel === 4);

            if (!matchesLevel) return false;

            // Theme matching (if selected)
            if (selectedThemes.length === 0) return true;

            const cardThemes = (Array.isArray(card.tags_theme) ? card.tags_theme : []).map(t => String(t).toLowerCase().trim());
            return selectedThemes.some(selectedId => {
                const normalizedId = selectedId.toLowerCase().trim();
                return cardThemes.includes(normalizedId);
            });
        });
    }, [fullPool, selectedLevel, selectedThemes]);

    // 2. Compute available tags based on the theme-filtered pool
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        poolMatchingThemes.forEach(card => {
            if (Array.isArray(card.tags_filtre)) {
                card.tags_filtre.forEach(tag => {
                    if (tag) tags.add(tag);
                });
            }
        });
        return Array.from(tags).sort();
    }, [poolMatchingThemes]);

    // 3. Filter tags for the search input
    const filteredTags = useMemo(() => {
        if (!tagSearch) return availableTags;
        return availableTags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()));
    }, [availableTags, tagSearch]);

    // 4. Final pool filtered by Tags
    const filteredPool = useMemo(() => {
        // Start from the pool that already matches level & themes
        if (selectedTags.length === 0) return poolMatchingThemes;

        return poolMatchingThemes.filter(card => {
            // Tag matching
            const cardTags = (Array.isArray(card.tags_filtre) ? card.tags_filtre : []).map(t => String(t).toLowerCase().trim());
            return selectedTags.some(selectedTag => {
                const normalizedTag = selectedTag.toLowerCase().trim();
                return cardTags.includes(normalizedTag);
            });
        });
    }, [poolMatchingThemes, selectedTags]);

    const programCards = useMemo(() => {
        return programIds.map(id => fullPool.find(c => c.id === id)).filter((c): c is PedagogicalContent => Boolean(c));
    }, [fullPool, programIds]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateStagePool(stage.id, programIds);

        setIsSaving(false);
        if (result.success) {
            router.refresh();
            setIsSaved(true);
            // Removed auto-hide to let user read and choose next action
        } else {
            alert('Erreur lors de la sauvegarde : ' + result.error);
        }
    };

    const toggleCard = (cardId: string) => {
        setProgramIds(prev =>
            prev.includes(cardId) ? prev.filter(i => i !== cardId) : [...prev, cardId]
        );
    };

    const toggleTheme = (themeId: string) => {
        setSelectedThemes(prev =>
            prev.includes(themeId) ? prev.filter(t => t !== themeId) : [...prev, themeId]
        );
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-36">
            <AnimatePresence>
                {isSaved && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 text-center shadow-2xl max-w-xs w-full">
                            <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">Module Sauvegardé</h3>
                            <p className="text-xs font-bold text-slate-400 mb-6 italic">Votre réservoir tactique est prêt.</p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push(`/stages/${stage.id}/sessions`)}
                                    className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>Aller aux Séances</span>
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>

                                <button
                                    onClick={() => router.push(`/stages/${stage.id}`)}
                                    className="w-full text-slate-500 h-10 rounded-xl font-bold text-xs hover:text-slate-800 hover:bg-slate-50 transition-colors"
                                >
                                    Retour au pilotage
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative bg-slate-900 pt-12 pb-24 px-6">
                <div className="md:max-w-7xl md:mx-auto">
                    <Link href={`/stages/${stage.id}`} className="relative z-10 text-white/60 inline-flex items-center gap-1 text-sm font-bold mb-6 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back_ios</span>
                        Retour au Pilotage
                    </Link>
                    <h1 className="text-4xl font-black text-white uppercase md:max-w-7xl md:mx-auto">{stage.title}</h1>

                    <div className="absolute bottom-0 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[400px] translate-y-1/2">
                        <div className="bg-white p-1.5 rounded-2xl shadow-xl flex border border-slate-200">
                            <button onClick={() => setActiveTab('EXPLORER')} className={clsx("flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase", activeTab === 'EXPLORER' ? "bg-slate-100 text-slate-900 shadow-inner" : "text-slate-400")}>Explorer</button>
                            <button onClick={() => setActiveTab('SELECTION')} className={clsx("flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase", activeTab === 'SELECTION' ? "bg-slate-100 text-slate-900 shadow-inner" : "text-slate-400")}>Mon Réservoir ({programIds.length})</button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mt-16 px-6 space-y-10 max-w-2xl md:max-w-7xl mx-auto w-full pb-48 items-start">
                {activeTab === 'EXPLORER' && (
                    <section className="space-y-8 mb-10">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">1. Choix du Niveau</h3>
                            <div className="flex bg-slate-100 p-1 rounded-2xl">
                                {[1, 2, 3].map(lvl => (
                                    <button key={lvl} onClick={() => setSelectedLevel(lvl as 1 | 2 | 3)} className={clsx("flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all", selectedLevel === lvl ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>NIVEAU {lvl}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">2. Thématiques</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {PILLARS.map(pillar => (
                                    <div key={pillar.id} className="space-y-2">
                                        <p className={clsx("text-[9px] font-black uppercase tracking-widest", pillar.color)}>{pillar.label}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {THEMES_BY_PILLAR[pillar.id].map(theme => (
                                                <button key={theme.id} onClick={() => toggleTheme(theme.id)} className={clsx("px-4 py-2 rounded-full border-2 text-[11px] font-bold flex items-center gap-2 transition-all", selectedThemes.includes(theme.id) ? `${pillar.bg} text-white border-transparent` : "bg-slate-100 border-transparent text-slate-500")}>
                                                    <span className="material-symbols-outlined text-[18px]">{theme.icon}</span>
                                                    {theme.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="py-4 border-t border-slate-100">
                            <button
                                onClick={() => setIsCreatorOpen(true)}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-400 font-bold uppercase text-xs hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Créer une fiche perso
                            </button>
                        </div>

                        {availableTags.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">3. Mots-clés</h3>

                                <div className="space-y-3">
                                    {/* Search Input */}
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">search</span>
                                        <input
                                            type="text"
                                            placeholder="Rechercher un mot-clé..."
                                            value={tagSearch}
                                            onChange={e => setTagSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-slate-100 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        />
                                    </div>

                                    {/* Selected Tags Pilled */}
                                    <AnimatePresence>
                                        {selectedTags.length > 0 && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 overflow-hidden">
                                                {selectedTags.map(tag => (
                                                    <motion.button
                                                        key={tag}
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        onClick={() => toggleTag(tag)}
                                                        className="bg-slate-800 text-white pl-3 pr-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-red-500 transition-colors group"
                                                    >
                                                        {tag}
                                                        <span className="material-symbols-outlined text-[14px] group-hover:rotate-90 transition-transform">close</span>
                                                    </motion.button>
                                                ))}
                                                <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-4 px-2">Tout effacer</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Tag Suggestions (Scrollable or Grid) */}
                                    <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-xl p-2 border border-slate-100 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                        {filteredTags.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {filteredTags.map(tag => {
                                                    const isSelected = selectedTags.includes(tag);
                                                    if (isSelected) return null;

                                                    return (
                                                        <button
                                                            key={tag}
                                                            onClick={() => toggleTag(tag)}
                                                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm"
                                                        >
                                                            {tag}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-center text-xs text-slate-400 py-4 italic">Aucun mot-clé correspondant au filtre actuel.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeTab === 'EXPLORER' ? filteredPool : programCards).map((card) => (
                        <div key={card.id} className={clsx("p-6 rounded-3xl border-2 bg-white relative", programIds.includes(card.id) ? "border-indigo-600 shadow-lg" : "border-slate-100")}>
                            <div className={clsx("absolute top-6 left-0 bottom-6 w-1 rounded-r-full", card.dimension === 'COMPRENDRE' ? "bg-amber-400" : card.dimension === 'OBSERVER' ? "bg-blue-400" : "bg-emerald-400")}></div>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-base font-black text-slate-900 leading-tight italic">{card.question}</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedCardForDetail(card)}
                                        className="size-10 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-colors"
                                        title="Voir les détails"
                                    >
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                    <button onClick={() => toggleCard(card.id)} className={clsx("size-10 rounded-full flex items-center justify-center border-2", programIds.includes(card.id) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-400")}>
                                        <span className="material-symbols-outlined font-black">{programIds.includes(card.id) ? 'remove' : 'add'}</span>
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed pl-2">{card.objectif}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* FOOTER SAVE BUTTON */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent pt-12 z-40 pointer-events-none flex justify-center">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full max-w-sm h-14 bg-slate-900 text-white rounded-[2rem] font-black text-xs tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 pointer-events-auto transition-all flex items-center justify-center gap-3"
                >
                    {isSaving ? (
                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            ENREGISTRER MES CHOIX ({programIds.length})
                        </>
                    )}
                </button>
            </div>

            <CardCreatorModal
                isOpen={isCreatorOpen}
                onClose={() => setIsCreatorOpen(false)}
                onCreated={() => {
                    router.refresh();
                }}
            />

            <CardDetailModal
                isOpen={!!selectedCardForDetail}
                onClose={() => setSelectedCardForDetail(null)}
                content={selectedCardForDetail}
            />
        </div>
    );
}
