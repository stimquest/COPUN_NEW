'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stage, PedagogicalContent } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { updateStagePool } from '@/actions/stage-actions';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import CardCreatorModal from '@/components/CardCreatorModal';
import CardDetailModal from '@/components/CardDetailModal';

const OBJECTIFS = [
    { id: 'conditions', label: 'Lire les conditions avant de naviguer', description: 'Marées, courants, vent — comprendre pour naviguer en sécurité', tags: ['marée', 'courant', 'vent', 'coefficient', 'sécurité'], icon: 'navigation', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', activeBg: 'bg-blue-600' },
    { id: 'marees', label: 'Comprendre les rythmes de la marée', description: 'Cycles, coefficients, flot et jusant', tags: ['marée', 'coefficient', 'courant', 'vocabulaire'], icon: 'waves', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', activeBg: 'bg-cyan-600' },
    { id: 'meteo', label: 'Décrypter la météo marine', description: 'Vent, nuages, houle et thermiques', tags: ['météo', 'vent', 'nuage', 'thermique', 'houle', 'vague'], icon: 'partly_cloudy_day', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', activeBg: 'bg-sky-600' },
    { id: 'paysage', label: 'Observer et décrire le paysage littoral', description: 'Lecture du terrain, dunes, repères visuels', tags: ['repères visuels', 'dune', 'vague', 'érosion', 'observation'], icon: 'landscape', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', activeBg: 'bg-amber-600' },
    { id: 'biodiversite', label: 'Découvrir la biodiversité du site', description: 'Faune, flore, laisse de mer et écosystème', tags: ['faune', 'écosystème', 'laisse de mer', 'zone sensible', 'flore'], icon: 'flutter_dash', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', activeBg: 'bg-emerald-600' },
    { id: 'vivant', label: 'Comprendre les interactions du vivant', description: 'Cycles biologiques, adaptation, migration', tags: ['écosystème', 'adaptation', 'reproduction', 'migration'], icon: 'account_tree', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', activeBg: 'bg-green-600' },
    { id: 'cohabitation', label: 'Apprendre à cohabiter avec la faune', description: 'Dérangement, zones sensibles, discrétion', tags: ['faune', 'zone sensible'], icon: 'diversity_3', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', activeBg: 'bg-teal-600' },
    { id: 'pollution', label: 'Agir contre la pollution', description: 'Déchets, laisse de mer, gestes concrets', tags: ['pollution', 'laisse de mer', 'éco-geste'], icon: 'delete_sweep', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', activeBg: 'bg-orange-600' },
    { id: 'protection', label: 'Devenir acteur de la protection du site', description: 'Sciences participatives, signalement, engagement', tags: ['action citoyenne', 'éco-geste', 'zone sensible'], icon: 'shield', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', activeBg: 'bg-rose-600' },
    { id: 'responsable', label: 'Adopter des comportements responsables', description: 'Gestes en navigation, adaptation, respect du milieu', tags: ['sécurité', 'adaptation', 'zone sensible', 'éco-geste'], icon: 'self_improvement', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', activeBg: 'bg-violet-600' },
];

function ObjectifDropdown({ intention, setIntention }: { intention: string | null, setIntention: (v: string | null) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = OBJECTIFS.find(o => o.id === intention);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <section className="bg-white rounded-3xl border-2 border-slate-100 p-6 space-y-3">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mon objectif pour ce stage</p>
                <p className="text-xs text-slate-500 mt-1">Les questions ★ recommandées s'ajusteront à votre choix.</p>
            </div>
            <div ref={ref} className="relative">
                {/* Trigger */}
                <button
                    type="button"
                    onClick={() => setOpen(v => !v)}
                    className={clsx(
                        "w-full flex items-center gap-3 px-4 h-14 rounded-2xl border-2 text-left transition-all",
                        selected ? `${selected.border} ${selected.bg}` : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    )}
                >
                    <span className={clsx("material-symbols-outlined text-lg shrink-0", selected ? selected.color : "text-slate-300")}>
                        {selected ? selected.icon : 'flag'}
                    </span>
                    <span className={clsx("text-xs font-bold flex-1", selected ? selected.color : "text-slate-400")}>
                        {selected ? selected.label : 'Choisir un objectif…'}
                    </span>
                    <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="material-symbols-outlined text-slate-400 text-lg shrink-0"
                    >
                        expand_more
                    </motion.span>
                </button>

                {/* Dropdown panel */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-white rounded-2xl border-2 border-slate-100 shadow-2xl overflow-hidden"
                        >
                            {/* Clear option */}
                            {selected && (
                                <button
                                    type="button"
                                    onClick={() => { setIntention(null); setOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-400 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                    <span className="text-xs font-bold">Aucun objectif</span>
                                </button>
                            )}
                            {OBJECTIFS.map(obj => {
                                const isActive = intention === obj.id;
                                return (
                                    <button
                                        key={obj.id}
                                        type="button"
                                        onClick={() => { setIntention(obj.id); setOpen(false); }}
                                        className={clsx(
                                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                            isActive ? `${obj.bg}` : "hover:bg-slate-50"
                                        )}
                                    >
                                        <div className={clsx("size-8 rounded-full flex items-center justify-center shrink-0", isActive ? obj.activeBg : "bg-slate-100")}>
                                            <span className={clsx("material-symbols-outlined text-sm", isActive ? "text-white" : "text-slate-400")}>{obj.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx("text-xs font-black leading-snug", isActive ? obj.color : "text-slate-700")}>{obj.label}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{obj.description}</p>
                                        </div>
                                        {isActive && <span className={clsx("material-symbols-outlined text-base shrink-0", obj.color)}>check</span>}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feedback */}
            <AnimatePresence mode="wait">
                {selected && (
                    <motion.div
                        key={selected.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={clsx("flex items-center gap-2 px-3 py-2 rounded-xl border", selected.border, selected.bg)}
                    >
                        <span className={clsx("material-symbols-outlined text-base shrink-0", selected.color)}>star</span>
                        <p className={clsx("text-[11px] font-bold", selected.color)}>
                            {selected.description} — les cartes correspondantes sont marquées ★.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

export default function ProgramBuilderClient({ stage, fullPool }: { stage: Stage, fullPool: PedagogicalContent[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'EXPLORER' | 'SELECTION'>('EXPLORER');
    const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
    const [selectedThemes, setSelectedThemes] = useState<string[]>(stage.suggested_thematics ?? []);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');
    const [programIds, setProgramIds] = useState<string[]>(stage.selected_content || []);
    const [intention, setIntention] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [selectedCardForDetail, setSelectedCardForDetail] = useState<PedagogicalContent | null>(null);

    // Filter by level
    const poolMatchingLevel = useMemo(() => {
        return fullPool.filter(card => {
            const cardLevel = Number(card.niveau);
            return cardLevel === selectedLevel || (selectedLevel === 3 && cardLevel === 4);
        });
    }, [fullPool, selectedLevel]);

    // Group cards by dimension, filtered by selected themes and tags
    const groupedCards = useMemo(() => {
        return PILLARS.map(pillar => {
            const cards = poolMatchingLevel.filter(card => {
                if (card.dimension !== pillar.id) return false;

                if (selectedThemes.length > 0) {
                    const cardThemes = (Array.isArray(card.tags_theme) ? card.tags_theme : []).map(t => String(t).toLowerCase().trim());
                    if (!selectedThemes.some(t => cardThemes.includes(t.toLowerCase()))) return false;
                }

                if (selectedTags.length > 0) {
                    const cardTags = (Array.isArray(card.tags_filtre) ? card.tags_filtre : []).map(t => String(t).toLowerCase().trim());
                    if (!selectedTags.some(tag => cardTags.includes(tag.toLowerCase()))) return false;
                }

                return true;
            });

            return { pillar, cards };
        }).filter(g => g.cards.length > 0);
    }, [poolMatchingLevel, selectedThemes, selectedTags]);

    // Available tags based on filtered level
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        poolMatchingLevel.forEach(card => {
            if (selectedThemes.length > 0) {
                const cardThemes = (Array.isArray(card.tags_theme) ? card.tags_theme : []).map(t => String(t).toLowerCase().trim());
                if (!selectedThemes.some(t => cardThemes.includes(t.toLowerCase()))) return;
            }
            if (Array.isArray(card.tags_filtre)) {
                card.tags_filtre.forEach(tag => { if (tag) tags.add(tag); });
            }
        });
        return Array.from(tags).sort();
    }, [poolMatchingLevel, selectedThemes]);

    const filteredTags = useMemo(() => {
        if (!tagSearch) return availableTags;
        return availableTags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()));
    }, [availableTags, tagSearch]);

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
        } else {
            alert('Erreur lors de la sauvegarde : ' + result.error);
        }
    };

    const toggleCard = (cardId: string) => {
        setProgramIds(prev => prev.includes(cardId) ? prev.filter(i => i !== cardId) : [...prev, cardId]);
    };

    const toggleTheme = (themeId: string) => {
        setSelectedThemes(prev => prev.includes(themeId) ? prev.filter(t => t !== themeId) : [...prev, themeId]);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const pillarOf = (card: PedagogicalContent) => PILLARS.find(p => p.id === card.dimension);

    const isRecommended = useMemo(() => {
        if (!intention) return (_card: PedagogicalContent) => false;
        const obj = OBJECTIFS.find(o => o.id === intention);
        if (!obj) return (_card: PedagogicalContent) => false;
        const targetTags = obj.tags.map(t => t.toLowerCase());
        return (card: PedagogicalContent) => {
            const cardTags = (Array.isArray(card.tags_filtre) ? card.tags_filtre : []).map(t => String(t).toLowerCase());
            return targetTags.some(t => cardTags.includes(t));
        };
    }, [intention]);

    return (
        <div className="flex flex-col min-h-screen bg-[#EBF0F7]">

            {/* Save success modal */}
            <AnimatePresence>
                {isSaved && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full">
                            <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">Sauvegardé</h3>
                            <p className="text-xs text-slate-400 mb-6">{programIds.length} questions dans votre réservoir.</p>
                            <div className="space-y-2">
                                <button onClick={() => router.push(`/stages/${stage.id}/sessions`)} className="w-full bg-slate-900 text-white h-12 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                                    Aller aux Séances
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </button>
                                <button onClick={() => router.push(`/stages/${stage.id}`)} className="w-full text-slate-400 h-10 rounded-xl font-bold text-xs hover:text-slate-700 transition-colors">
                                    Retour au pilotage
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="relative overflow-hidden bg-slate-900 pt-10 pb-20 px-5">
                {/* Decorative waves */}
                <svg className="absolute bottom-0 left-0 right-0 w-full opacity-10" viewBox="0 0 400 60" preserveAspectRatio="none">
                    <path d="M0,30 C100,60 200,0 300,30 C350,45 380,20 400,30 L400,60 L0,60 Z" fill="white"/>
                </svg>
                <svg className="absolute bottom-0 left-0 right-0 w-full opacity-5" viewBox="0 0 400 60" preserveAspectRatio="none">
                    <path d="M0,40 C80,10 160,50 240,30 C320,10 360,40 400,20 L400,60 L0,60 Z" fill="white"/>
                </svg>
                <div className="md:max-w-5xl md:mx-auto relative">
                    <Link href={`/stages/${stage.id}`} className="text-white/50 inline-flex items-center gap-1 text-xs font-bold mb-5 hover:text-white/80 transition-colors uppercase tracking-widest">
                        <span className="material-symbols-outlined text-base">arrow_back_ios</span>
                        Pilotage
                    </Link>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Programme environnemental</p>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none">{stage.title}</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stage.level}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"/>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stage.dates}</span>
                    </div>
                    {/* Tabs */}
                    <div className="absolute -bottom-px left-0 right-0 translate-y-full pt-4">
                        <div className="bg-white rounded-2xl shadow-lg p-1 flex gap-1">
                            <button onClick={() => setActiveTab('EXPLORER')} className={clsx("flex-1 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all", activeTab === 'EXPLORER' ? "bg-slate-900 text-white shadow" : "text-slate-400 hover:text-slate-600")}>
                                Explorer
                            </button>
                            <button onClick={() => setActiveTab('SELECTION')} className={clsx("flex-1 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2", activeTab === 'SELECTION' ? "bg-slate-900 text-white shadow" : "text-slate-400 hover:text-slate-600")}>
                                Réservoir
                                {programIds.length > 0 && (
                                    <span className={clsx("rounded-full px-1.5 py-0.5 text-[9px] font-black", activeTab === 'SELECTION' ? "bg-white text-slate-900" : "bg-slate-900 text-white")}>
                                        {programIds.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mt-20 px-4 md:px-6 max-w-5xl mx-auto w-full space-y-4 pb-[calc(var(--bottom-nav-h)+6rem)]">

                {activeTab === 'EXPLORER' && (
                    <>
                        {/* OBJECTIF */}
                        <ObjectifDropdown intention={intention} setIntention={setIntention} />

                        {/* FILTERS */}
                        <section className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Filtres</p>

                            {/* Level */}
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Niveau</p>
                                <div className="flex bg-[#EBF0F7] p-1 rounded-xl gap-1">
                                    {[1, 2, 3].map(lvl => (
                                        <button key={lvl} onClick={() => setSelectedLevel(lvl as 1 | 2 | 3)} className={clsx("flex-1 py-2 rounded-lg text-[11px] font-black transition-all", selectedLevel === lvl ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                                            N{lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Themes */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thématiques</p>
                                <div className="space-y-3">
                                    {PILLARS.map(pillar => (
                                        <div key={pillar.id} className="space-y-2">
                                            <p className={clsx("text-[9px] font-black uppercase tracking-[0.15em]", pillar.color)}>{pillar.label}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {THEMES_BY_PILLAR[pillar.id].map(theme => {
                                                    const active = selectedThemes.includes(theme.id);
                                                    return (
                                                        <button key={theme.id} onClick={() => toggleTheme(theme.id)} className={clsx(
                                                            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all",
                                                            active ? `${pillar.bg} text-white` : "bg-[#EBF0F7] text-slate-500 hover:text-slate-700"
                                                        )}>
                                                            <span className="material-symbols-outlined text-[13px]">{theme.icon}</span>
                                                            {theme.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            {availableTags.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mots-clés</p>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-base">search</span>
                                        <input type="text" placeholder="Filtrer..." value={tagSearch} onChange={e => setTagSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#EBF0F7] text-[11px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all" />
                                    </div>
                                    <AnimatePresence>
                                        {selectedTags.length > 0 && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-1.5 pt-1">
                                                {selectedTags.map(tag => (
                                                    <button key={tag} onClick={() => toggleTag(tag)} className="bg-slate-800 text-white pl-2.5 pr-1.5 py-0.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-red-500 transition-colors">
                                                        {tag}<span className="material-symbols-outlined text-[12px]">close</span>
                                                    </button>
                                                ))}
                                                <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline px-1">Effacer</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                                        {filteredTags.filter(t => !selectedTags.includes(t)).map(tag => (
                                            <button key={tag} onClick={() => toggleTag(tag)} className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-[#EBF0F7] text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all">
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={() => setIsCreatorOpen(true)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-[11px] hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-base">add_circle</span>
                                Créer une fiche perso
                            </button>
                        </section>

                        {/* CARDS GROUPED BY DIMENSION */}
                        {groupedCards.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-3">search_off</span>
                                <p className="text-sm font-black uppercase tracking-wide">Aucun résultat</p>
                                <p className="text-xs mt-1 text-slate-400">Modifiez vos filtres pour voir des questions.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupedCards.map(({ pillar, cards }) => (
                                    <section key={pillar.id} className="space-y-2">
                                        {/* Pillar header */}
                                        <div className="flex items-center gap-2 px-1 py-2">
                                            <div className={clsx("size-7 rounded-lg flex items-center justify-center shrink-0", pillar.bg)}>
                                                <span className="material-symbols-outlined text-white text-base">{pillar.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className={clsx("text-sm font-black uppercase tracking-tight", pillar.color)}>{pillar.label}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full">{cards.length}</span>
                                        </div>

                                        {/* Cards */}
                                        <div className="space-y-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0">
                                            {cards.map(card => {
                                                const isSelected = programIds.includes(card.id);
                                                const recommended = isRecommended(card);
                                                const obj = OBJECTIFS.find(o => o.id === intention);
                                                const cardTagsTheme = (Array.isArray(card.tags_theme) ? card.tags_theme : []).map((x: string) => String(x).toLowerCase());
                                                const cardThemeLabel = THEMES_BY_PILLAR[pillar.id]?.find(t => cardTagsTheme.includes(t.id.toLowerCase()));
                                                return (
                                                    <div key={card.id} className={clsx(
                                                        "rounded-2xl transition-all flex flex-col relative overflow-hidden",
                                                        isSelected
                                                            ? "bg-slate-900 shadow-lg"
                                                            : recommended
                                                                ? "bg-white shadow-md"
                                                                : "bg-white shadow-sm"
                                                    )}>
                                                        {/* Left accent bar */}
                                                        <div className={clsx("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", pillar.bg)} />

                                                        <div className="pl-5 pr-4 pt-4 pb-3 flex flex-col flex-1">
                                                            {/* Top row */}
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    {cardThemeLabel && (
                                                                        <span className={clsx("text-[9px] font-black uppercase tracking-widest", isSelected ? "text-white/50" : pillar.color)}>
                                                                            {cardThemeLabel.label}
                                                                        </span>
                                                                    )}
                                                                    {recommended && !isSelected && (
                                                                        <span className={clsx("text-[10px] font-bold px-2.5 py-0.5 rounded-full", obj ? `${obj.bg} ${obj.color}` : `${pillar.bg} text-white`)}>
                                                                            Suggéré
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button onClick={() => setSelectedCardForDetail(card)} className={clsx("shrink-0 material-symbols-outlined text-base transition-colors", isSelected ? "text-white/30 hover:text-white/60" : "text-slate-300 hover:text-slate-500")}>
                                                                    info
                                                                </button>
                                                            </div>

                                                            {/* Question */}
                                                            <p className={clsx("text-[13px] font-black leading-snug flex-1 mb-3", isSelected ? "text-white" : "text-slate-900")}>
                                                                {card.question}
                                                            </p>

                                                            {/* Objectif */}
                                                            <p className={clsx("text-[10px] leading-relaxed mb-3", isSelected ? "text-white/40" : "text-slate-400")}>
                                                                {card.objectif}
                                                            </p>

                                                            {/* Add button */}
                                                            <button
                                                                onClick={() => toggleCard(card.id)}
                                                                className={clsx(
                                                                    "self-end flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all",
                                                                    isSelected
                                                                        ? "bg-white/10 text-white hover:bg-red-500"
                                                                        : "bg-slate-900 text-white hover:bg-slate-700"
                                                                )}
                                                            >
                                                                <span className="material-symbols-outlined text-sm">{isSelected ? 'check' : 'add'}</span>
                                                                {isSelected ? 'Ajouté' : 'Ajouter'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* RESERVOIR TAB */}
                {activeTab === 'SELECTION' && (
                    <div className="space-y-4">
                        {programCards.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
                                <p className="text-sm font-black uppercase tracking-wide">Réservoir vide</p>
                                <p className="text-xs mt-1">Ajoutez des questions depuis Explorer.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{programCards.length} question{programCards.length > 1 ? 's' : ''} sélectionnée{programCards.length > 1 ? 's' : ''}</p>
                                <div className="space-y-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0">
                                    {programCards.map(card => {
                                        const p = pillarOf(card);
                                        return (
                                            <div key={card.id} className="bg-white rounded-2xl overflow-hidden shadow-sm relative flex flex-col">
                                                <div className={clsx("absolute left-0 top-0 bottom-0 w-1", p?.bg)} />
                                                <div className="pl-5 pr-4 pt-4 pb-3 flex flex-col flex-1">
                                                    <span className={clsx("text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1", p?.color)}>
                                                        <span className="material-symbols-outlined text-[11px]">{p?.icon}</span>
                                                        {card.dimension}
                                                    </span>
                                                    <p className="text-[13px] font-black text-slate-900 leading-snug flex-1 mb-2">{card.question}</p>
                                                    <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{card.objectif}</p>
                                                    <button onClick={() => toggleCard(card.id)} className="self-end flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-red-50 text-red-400 hover:bg-red-100 transition-all">
                                                        <span className="material-symbols-outlined text-sm">remove</span>
                                                        Retirer
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>

            {/* Footer save — anchored above the bottom nav */}
            <div className="above-nav fixed left-0 right-0 px-4 pb-4 pt-12 bg-linear-to-t from-[#EBF0F7] via-[#EBF0F7] to-transparent z-40 pointer-events-none flex justify-center">
                <button onClick={handleSave} disabled={isSaving} className="w-full max-w-sm h-14 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.15em] shadow-xl active:scale-95 pointer-events-auto transition-all flex items-center justify-center gap-3">
                    {isSaving ? (
                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">save</span>
                            ENREGISTRER — {programIds.length} QUESTION{programIds.length > 1 ? 'S' : ''}
                        </>
                    )}
                </button>
            </div>

            <CardCreatorModal isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} onCreated={() => router.refresh()} />
            <CardDetailModal isOpen={!!selectedCardForDetail} onClose={() => setSelectedCardForDetail(null)} content={selectedCardForDetail} />
        </div>
    );
}
