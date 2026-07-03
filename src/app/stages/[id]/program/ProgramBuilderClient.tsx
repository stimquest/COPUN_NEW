'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stage, PedagogicalContent } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { OBJECTIFS, extractIntention, stripIntention } from '@/data/objectifs';
import { updateStagePool } from '@/actions/stage-actions';
import { SPORT_FEATURES_ENABLED } from '@/lib/feature-flags';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import CardDetailModal from '@/components/CardDetailModal';

function IntentionBanner({ intention, stageId }: { intention: string | null | undefined; stageId: string }) {
    const obj = OBJECTIFS.find(o => o.id === intention);
    const editHref = `/stages/new?edit=${stageId}`;

    if (!obj) {
        return (
            <section className="bg-white rounded-3xl border-2 border-slate-100 p-6 space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mon objectif pour cette semaine</p>
                    <Link href={editHref} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors shrink-0">
                        Renseigner
                    </Link>
                </div>
                <p className="text-xs text-slate-400">
                    Aucun objectif choisi — les conditions (marée, météo) ont peut-être changé depuis la préparation de la semaine.
                </p>
            </section>
        );
    }

    return (
        <section className={clsx("rounded-3xl border-2 p-6 space-y-3", obj.border, obj.bg)}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mon objectif pour cette semaine</p>
                <Link href={editHref} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors shrink-0">
                    Modifier
                </Link>
            </div>
            <div className="flex items-center gap-3">
                <div className={clsx("size-10 rounded-full flex items-center justify-center shrink-0", obj.activeBg)}>
                    <span className="material-symbols-outlined text-lg text-white">{obj.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className={clsx("text-sm font-black leading-snug", obj.color)}>{obj.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{obj.description} — les cartes correspondantes sont marquées ★.</p>
                </div>
            </div>
        </section>
    );
}

export default function ProgramBuilderClient({ stage, copunPool, customPool }: { stage: Stage, copunPool: PedagogicalContent[], customPool: PedagogicalContent[] }) {
    const fullPool = useMemo(() => [...copunPool, ...customPool], [copunPool, customPool]);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'EXPLORER' | 'SELECTION'>('EXPLORER');
    const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
    // Les thématiques suggérées (marée/météo/saison) servent à la fois à présélectionner les filtres
    // (comme avant) et à marquer/trier les cartes « Suggéré » en croisant aussi l'objectif choisi.
    const suggestedThemes = useMemo(() => stripIntention(stage.suggested_thematics), [stage.suggested_thematics]);
    const [selectedThemes, setSelectedThemes] = useState<string[]>(suggestedThemes);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');
    const [programIds, setProgramIds] = useState<string[]>(stage.selected_content || []);
    const intention = extractIntention(stage.suggested_thematics);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [selectedCardForDetail, setSelectedCardForDetail] = useState<PedagogicalContent | null>(null);

    // Filter COPUN cards by level (custom cards have their own section)
    const poolMatchingLevel = useMemo(() => {
        return copunPool.filter(card => {
            const cardLevel = Number(card.niveau);
            return cardLevel === selectedLevel || (selectedLevel === 3 && cardLevel === 4);
        });
    }, [copunPool, selectedLevel]);

    // Score de recommandation : croise les thématiques suggérées (marée/météo/saison, sur tags_theme)
    // et les tags de l'objectif choisi (sur tags_filtre). Plus une carte croise de critères, mieux elle
    // est classée ; toute carte avec un score > 0 porte le badge « Suggéré ».
    const recommendScore = useMemo(() => {
        const obj = OBJECTIFS.find(o => o.id === intention);
        const intentionTags = obj ? obj.tags.map(t => t.toLowerCase()) : [];
        const suggested = suggestedThemes.map(t => t.toLowerCase());
        return (card: PedagogicalContent) => {
            let score = 0;
            const cardThemes = (Array.isArray(card.tags_theme) ? card.tags_theme : []).map(t => String(t).toLowerCase().trim());
            score += suggested.filter(t => cardThemes.includes(t)).length;
            const cardTags = (Array.isArray(card.tags_filtre) ? card.tags_filtre : []).map(t => String(t).toLowerCase().trim());
            score += intentionTags.filter(t => cardTags.includes(t)).length;
            return score;
        };
    }, [intention, suggestedThemes]);
    const isRecommended = (card: PedagogicalContent) => recommendScore(card) > 0;

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

            // Les cartes qui croisent le mieux les critères (thématiques suggérées + objectif) en premier.
            cards.sort((a, b) => recommendScore(b) - recommendScore(a));

            return { pillar, cards };
        }).filter(g => g.cards.length > 0);
    }, [poolMatchingLevel, selectedThemes, selectedTags, recommendScore]);

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

    // 2-3 notions par semaine = bon rythme de transmission ; 5 max pour les très motivés
    // (ex. 2-3 cartes connexes sur les marées) — au-delà, rien ne sera vraiment travaillé.
    const MAX_WEEK_OBJECTIVES = 5;
    const envSelectedCount = useMemo(
        () => programIds.filter(id => copunPool.some(c => c.id === id)).length,
        [programIds, copunPool]
    );
    const [capReached, setCapReached] = useState(false);

    useEffect(() => {
        if (!capReached) return;
        const t = setTimeout(() => setCapReached(false), 3500);
        return () => clearTimeout(t);
    }, [capReached]);

    const toggleCard = (cardId: string) => {
        setProgramIds(prev => {
            if (prev.includes(cardId)) return prev.filter(i => i !== cardId);
            const envCount = prev.filter(id => copunPool.some(c => c.id === id)).length;
            const isEnvCard = copunPool.some(c => c.id === cardId);
            if (isEnvCard && envCount >= MAX_WEEK_OBJECTIVES) {
                setCapReached(true);
                return prev;
            }
            return [...prev, cardId];
        });
    };

    const toggleTheme = (themeId: string) => {
        setSelectedThemes(prev => prev.includes(themeId) ? prev.filter(t => t !== themeId) : [...prev, themeId]);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const pillarOf = (card: PedagogicalContent) => PILLARS.find(p => p.id === card.dimension);

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
                            <p className="text-xs text-slate-400 mb-6">{programIds.length} objectif{programIds.length > 1 ? 's' : ''} pour la semaine.</p>
                            <button onClick={() => router.push('/stages')} className="w-full bg-slate-900 text-white h-12 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                                Retour à la semaine
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
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
                    <Link href="/stages" className="text-white/50 inline-flex items-center gap-1 text-xs font-bold mb-5 hover:text-white/80 transition-colors uppercase tracking-widest">
                        <span className="material-symbols-outlined text-base">arrow_back_ios</span>
                        Cette semaine
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
                        <IntentionBanner intention={intention} stageId={stage.id} />

                        {/* FILTERS */}
                        <section className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Filtres</p>

                            {/* Level */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Niveau d&apos;implication</p>
                                    <LevelInfoButton />
                                </div>
                                <div className="flex bg-[#EBF0F7] p-1 rounded-xl gap-1">
                                    {([
                                        { lvl: 1 as const, label: 'N1', sub: 'Découverte' },
                                        { lvl: 2 as const, label: 'N2', sub: 'Approfondissement' },
                                        { lvl: 3 as const, label: 'N3', sub: 'Engagement' },
                                    ]).map(({ lvl, label, sub }) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setSelectedLevel(lvl)}
                                            className={clsx(
                                                "flex-1 flex flex-col items-center py-2.5 px-1 rounded-lg transition-all",
                                                selectedLevel === lvl ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            <span className="text-[12px] font-black">{label}</span>
                                            <span className="text-[9px] font-bold text-center leading-tight mt-0.5 opacity-70">{sub}</span>
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

                            {SPORT_FEATURES_ENABLED && (
                                <Link href="/fiches" className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-[11px] hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-base">sailing</span>
                                    Créer fiche voile (dans /fiches)
                                </Link>
                            )}
                        </section>

                        {/* CARDS GROUPED BY DIMENSION */}
                        {/* SECTION LABEL — environnemental */}
                        <div className="flex items-center gap-3 px-1">
                            <div className="size-6 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-white text-sm">eco</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">Contenu environnemental COP&apos;UN</p>
                        </div>

                        {groupedCards.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-3">search_off</span>
                                <p className="text-sm font-black uppercase tracking-wide">Aucun résultat</p>
                                <p className="text-xs mt-1 text-slate-400">Modifiez vos filtres pour voir des objectifs.</p>
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
                                                const allThemes = Object.values(THEMES_BY_PILLAR).flat();
                                                const cardThemeLabels = allThemes.filter(t => cardTagsTheme.includes(t.id.toLowerCase()));
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
                                                                    {cardThemeLabels.map((theme, i) => (
                                                                        <span key={theme.id} className={clsx("text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", isSelected ? "text-white/50" : pillar.color)}>
                                                                            {i > 0 && <span className="opacity-40">·</span>}
                                                                            {theme.label}
                                                                        </span>
                                                                    ))}
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
                    <div className="space-y-6">
                        {programCards.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
                                <p className="text-sm font-black uppercase tracking-wide">Réservoir vide</p>
                                <p className="text-xs mt-1">Ajoutez des objectifs depuis Explorer.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                    {programCards.length} objectif{programCards.length > 1 ? 's' : ''} sélectionné{programCards.length > 1 ? 's' : ''}
                                    <span className={clsx(
                                        'ml-2 normal-case tracking-normal font-bold',
                                        envSelectedCount <= 3 ? 'text-emerald-500' : 'text-amber-500'
                                    )}>
                                        {envSelectedCount <= 3 ? '· 2-3 par semaine, bon rythme' : '· 5 max — mieux vaut peu et bien'}
                                    </span>
                                </p>

                                {/* COPUN environmental cards */}
                                {(() => {
                                    const copunCards = programCards.filter(c => c.source !== 'custom');
                                    if (copunCards.length === 0) return null;
                                    return (
                                        <section className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="size-5 rounded-md bg-teal-600 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-white text-[11px]">eco</span>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-teal-700">Environnemental COP&apos;UN</p>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{copunCards.length}</span>
                                            </div>
                                            <div className="space-y-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0">
                                                {copunCards.map(card => {
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
                                        </section>
                                    );
                                })()}
                            </>
                        )}
                    </div>
                )}
            </main>

            {/* Toast plafond atteint */}
            <AnimatePresence>
                {capReached && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl max-w-[90vw] text-center"
                    >
                        5 objectifs max par semaine — mieux vaut 2-3 fiches bien travaillées.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer save — anchored above the bottom nav */}
            <div className="above-nav fixed left-0 right-0 px-4 pb-4 pt-12 bg-linear-to-t from-[#EBF0F7] via-[#EBF0F7] to-transparent z-40 pointer-events-none flex justify-center">
                <button onClick={handleSave} disabled={isSaving} className="w-full max-w-sm h-14 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.15em] shadow-xl active:scale-95 pointer-events-auto transition-all flex items-center justify-center gap-3">
                    {isSaving ? (
                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">save</span>
                            ENREGISTRER — {programIds.length} OBJECTIF{programIds.length > 1 ? 'S' : ''}
                        </>
                    )}
                </button>
            </div>

            <CardDetailModal
                isOpen={!!selectedCardForDetail}
                onClose={() => setSelectedCardForDetail(null)}
                content={selectedCardForDetail}
            />
        </div>
    );
}

const LEVEL_INFO = [
    {
        label: 'N1 — Découverte',
        sub: 'Je prends conscience',
        color: 'text-sky-600',
        bg: 'bg-sky-50',
        border: 'border-sky-100',
        description: "Le stagiaire découvre le milieu littoral et ses enjeux. Il observe, s'interroge et commence à identifier les interactions entre activités humaines et environnement. Les fiches N1 visent l'éveil et la curiosité — pas encore d'engagement actif, mais une prise de conscience progressive.",
    },
    {
        label: 'N2 — Approfondissement',
        sub: 'J\'agis en conscience',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        description: "Le stagiaire commence à intégrer ce qu'il a observé dans ses comportements. Il adapte ses gestes, fait des choix éclairés et comprend pourquoi certaines pratiques protègent le littoral. Les fiches N2 ancrent la connaissance dans l'action quotidienne.",
    },
    {
        label: 'N3 — Engagement',
        sub: 'J\'agis de façon responsable',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        description: "Le stagiaire devient acteur de la protection du littoral. Il anticipe les impacts, partage ses connaissances et s'implique dans des démarches collectives (sciences participatives, sensibilisation). Les fiches N3 visent l'autonomie et la posture de sentinelle.",
    },
];

function LevelInfoButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="size-5 rounded-full bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-500 transition-colors flex items-center justify-center shrink-0"
                title="En savoir plus sur les niveaux"
            >
                <span className="material-symbols-outlined text-[13px]">info</span>
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/50 z-50 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 max-h-[85vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Niveaux d&apos;implication</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Progression COP&apos;UN</p>
                                </div>
                                <button onClick={() => setOpen(false)} className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="px-6 py-5 space-y-4 pb-10">
                                {LEVEL_INFO.map((lvl) => (
                                    <div key={lvl.label} className={clsx("rounded-2xl border p-5 space-y-2", lvl.bg, lvl.border)}>
                                        <div>
                                            <p className={clsx("text-sm font-black", lvl.color)}>{lvl.label}</p>
                                            <p className={clsx("text-[11px] font-bold italic", lvl.color, "opacity-70")}>{lvl.sub}</p>
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{lvl.description}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}