'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stage, PedagogicalContent, Sujet } from '@/types';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { OBJECTIFS, extractIntention, stripIntention } from '@/data/objectifs';
import { updateStagePool } from '@/actions/stage-actions';
import { SPORT_FEATURES_ENABLED } from '@/lib/feature-flags';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import CardDetailModal from '@/components/CardDetailModal';
import SujetBuilder from '@/components/SujetBuilder';
import FiltresPanel from '@/components/FiltresPanel';

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

export default function ProgramBuilderClient({ stage, copunPool, customPool, usedContentIds, successIds, sujets = [] }: { stage: Stage, copunPool: PedagogicalContent[], customPool: PedagogicalContent[], usedContentIds: string[], successIds: string[], sujets?: Sujet[] }) {
    const fullPool = useMemo(() => [...copunPool, ...customPool], [copunPool, customPool]);
    const router = useRouter();
    // Deux modes : "Guidé" (défaut) propose une semaine composée — le contenu a été
    // pensé par l'expert de la méthode, le moniteur qui débute n'a pas les repères pour
    // choisir dans un catalogue. "Explorer" (mode expert) garde le pilotage total.
    const [activeTab, setActiveTab] = useState<'GUIDE' | 'EXPLORER' | 'SELECTION'>('GUIDE');
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

    // ── Mode guidé ────────────────────────────────────────────────────────────
    const usedIdSet = useMemo(() => new Set(usedContentIds), [usedContentIds]);
    const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
    // Accordéon par carte (même geste que l'accueil) : fermé = question seule, déplié =
    // début du contenu (objectif + tip), la fiche complète reste dans le modal.
    const [expandedGuideCard, setExpandedGuideCard] = useState<string | null>(null);
    // Après "Adopter la proposition" : écran de découverte des fiches choisies avec
    // leurs explications dépliées — le seul moment calme où le moniteur est déjà dans
    // le sujet, on en profite pour déposer la connaissance sans que ça ressemble à
    // du travail. (Philosophie : le guidage doit enseigner en passant.)
    const [showWeekPreview, setShowWeekPreview] = useState(false);

    // Passage de relais : sur un pilier dont le moniteur a déjà exploré plusieurs
    // fiches, on ne propose plus une fiche unique — on lui rend le choix (parmi 3),
    // précisément là où il est devenu compétent.
    const PILLAR_HANDOVER_THRESHOLD = 4;
    const usedCountByPillar = useMemo(() => {
        const counts: Record<string, number> = {};
        copunPool.forEach(c => {
            if (usedIdSet.has(c.id)) counts[c.dimension] = (counts[c.dimension] ?? 0) + 1;
        });
        return counts;
    }, [copunPool, usedIdSet]);

    // Classement guidé par pilier : la pertinence (conditions + intention) pèse le plus,
    // une fiche jamais explorée est favorisée, léger bonus N1 (découverte). Départage
    // déterministe seedé par la semaine : la proposition varie d'un stage à l'autre
    // sans bouger à chaque rendu.
    const successIdSet = useMemo(() => new Set(successIds), [successIds]);

    const guidedByPillar = useMemo(() => {
        const tieBreak = (cardId: string) => {
            const s = stage.id + cardId;
            let h = 0;
            for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
            return (h % 997) / 997;
        };
        return PILLARS.map(pillar => {
            const candidates = copunPool
                .filter(c => c.dimension === pillar.id)
                .map(card => ({
                    card,
                    // Une valeur sûre (a bien accroché avec un groupe passé) gagne toujours
                    // sur une nouveauté : les groupes changent, le message se répète — comme
                    // les exercices sportifs. La nouveauté ne fait que remplir les trous.
                    guideScore: recommendScore(card) * 2
                        + (successIdSet.has(card.id) ? 3 : 0)
                        + (usedIdSet.has(card.id) ? 0 : 1)
                        + (Number(card.niveau) === 1 ? 1 : 0)
                        + tieBreak(card.id),
                }))
                .sort((a, b) => b.guideScore - a.guideScore)
                .map(x => x.card);
            return { pillar, candidates };
        });
    }, [copunPool, usedIdSet, successIdSet, recommendScore, stage.id]);

    const ALL_THEMES = useMemo(() => Object.values(THEMES_BY_PILLAR).flat(), []);

    // « Pourquoi cette fiche ? » — les critères croisés rendus visibles. C'est cette
    // information qui rend le choix évident, au lieu de laisser le moniteur simuler
    // mentalement sa semaine avec chaque carte du catalogue.
    const reasonChips = (card: PedagogicalContent) => {
        // Ordre = priorité d'affichage : valeur sûre > intention > thématique > nouveauté.
        const chips: { icon: string; label: string; novel?: boolean; success?: boolean }[] = [];
        if (successIdSet.has(card.id)) chips.push({ icon: 'verified', label: 'A bien accroché', success: true });
        const obj = OBJECTIFS.find(o => o.id === intention);
        if (obj) {
            const cardTags = (Array.isArray(card.tags_filtre) ? card.tags_filtre : []).map(t => String(t).toLowerCase().trim());
            if (obj.tags.some(t => cardTags.includes(t.toLowerCase()))) chips.push({ icon: obj.icon, label: 'Ton intention' });
        }
        const cardThemes = (Array.isArray(card.tags_theme) ? card.tags_theme : []).map(t => String(t).toLowerCase().trim());
        suggestedThemes.forEach(t => {
            if (cardThemes.includes(t.toLowerCase())) {
                const meta = ALL_THEMES.find(th => th.id.toLowerCase() === t.toLowerCase());
                if (meta) chips.push({ icon: meta.icon, label: meta.label });
            }
        });
        if (!usedIdSet.has(card.id)) chips.push({ icon: 'auto_awesome', label: 'Jamais explorée', novel: true });
        return chips;
    };

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

    const programCards = useMemo(() => {
        return programIds.map(id => fullPool.find(c => c.id === id)).filter((c): c is PedagogicalContent => Boolean(c));
    }, [fullPool, programIds]);

    // Filtres en panneau : la barre reste compacte, le détail s'ouvre sur demande.
    const [showFiltres, setShowFiltres] = useState(false);
    const activeFilterCount = selectedThemes.length + selectedTags.length;
    const visibleCount = useMemo(
        () => groupedCards.reduce((n, g) => n + g.cards.length, 0),
        [groupedCards],
    );
    const resetFiltres = () => {
        setSelectedThemes([]);
        setSelectedTags([]);
        setTagSearch('');
    };

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
                            <button onClick={() => setActiveTab('GUIDE')} className={clsx("flex-1 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all", activeTab === 'GUIDE' ? "bg-slate-900 text-white shadow" : "text-slate-400 hover:text-slate-600")}>
                                Guidé
                            </button>
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

                {activeTab === 'GUIDE' && (() => {
                    const slots = guidedByPillar.map(({ pillar, candidates }) => {
                        const selectedCards = programCards.filter(c => c.source !== 'custom' && c.dimension === pillar.id);
                        const available = candidates.filter(c => !programIds.includes(c.id));
                        const handover = (usedCountByPillar[pillar.id] ?? 0) >= PILLAR_HANDOVER_THRESHOLD;
                        // Pilier "connu" : 3 choix équivalents au lieu d'une proposition unique.
                        // Après un premier choix, les fiches restantes repassent derrière
                        // "Voir d'autres pistes" — même comportement que les piliers proposés,
                        // on peut toujours en ajouter (dans la limite des 5).
                        const proposal = handover ? null : available[0] ?? null;
                        const handoverChoices = handover && selectedCards.length === 0 ? available.slice(0, 3) : [];
                        const alternatives = handover
                            ? (selectedCards.length > 0 ? available.slice(0, 3) : [])
                            : available.slice(1, 4);
                        return { pillar, selectedCards, proposal, alternatives, handover, handoverChoices };
                    });
                    const allEmpty = slots.every(s => s.selectedCards.length === 0);
                    // "Adopter" ne remplit que les piliers encore proposés — ceux passés en
                    // "à toi de choisir" restent au moniteur, c'est le but.
                    const autoSlots = slots.filter(s => s.selectedCards.length === 0 && !s.handover && s.proposal);

                    const adoptAll = () => {
                        autoSlots.forEach(s => { if (s.proposal) toggleCard(s.proposal.id); });
                        setShowWeekPreview(true);
                    };

                    // Carte accordéon (même geste que l'accueil) : fermée = 1 chip + question
                    // + bouton "+" pour choisir ; dépliée = début du contenu (objectif + tip)
                    // ; "Fiche complète" ouvre le modal pour toute la profondeur.
                    const renderGuidedCard = (card: PedagogicalContent, pillar: typeof PILLARS[number]) => {
                        const chips = reasonChips(card).slice(0, 1);
                        const isOpen = expandedGuideCard === card.id;
                        return (
                            <div key={card.id} className="relative bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className={clsx("absolute left-0 top-0 bottom-0 w-2", pillar.bg)} />
                                <div className="pl-6 pr-4 py-4 flex items-center gap-3">
                                    <button
                                        onClick={() => setExpandedGuideCard(isOpen ? null : card.id)}
                                        className="flex-1 min-w-0 text-left"
                                        aria-label="Déplier la fiche"
                                    >
                                        {chips.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {chips.map(chip => (
                                                    <span
                                                        key={chip.label}
                                                        className={clsx(
                                                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                                                            chip.success ? "bg-emerald-100 text-emerald-700" :
                                                            chip.novel ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                                                        )}
                                                    >
                                                        <span className="material-symbols-outlined text-[12px]">{chip.icon}</span>
                                                        {chip.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-sm font-black text-slate-900 leading-relaxed">{card.question}</p>
                                    </button>
                                    <span className={clsx(
                                        "material-symbols-outlined text-slate-300 text-base shrink-0 transition-transform duration-200",
                                        isOpen && "rotate-180"
                                    )}>expand_more</span>
                                    <button
                                        onClick={() => toggleCard(card.id)}
                                        className="size-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 hover:bg-slate-700 active:scale-90 transition"
                                        aria-label="Choisir cette fiche"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                </div>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pl-6 pr-4 pb-4 pt-0.5 space-y-2 border-t border-slate-50">
                                                <p className="text-xs text-slate-500 leading-relaxed pt-2">{card.objectif}</p>
                                                {card.tip && (
                                                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2">
                                                        <span className="material-symbols-outlined text-amber-500 text-sm shrink-0 mt-0.5">lightbulb</span>
                                                        <p className="text-xs text-amber-800 leading-relaxed">{card.tip}</p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setSelectedCardForDetail(card)}
                                                    className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                                                >
                                                    Fiche complète →
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    };

                    return (
                        <div className="space-y-5">
                            <IntentionBanner intention={intention} stageId={stage.id} />

                            {/* Intro : la proposition est le défaut, l'expertise reste accessible */}
                            <div className="rounded-2xl bg-white p-4 shadow-sm flex items-start gap-3">
                                <span className="material-symbols-outlined text-2xl text-indigo-500 shrink-0 mt-0.5">auto_awesome</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900">Une semaine prête à l&apos;emploi</p>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Une fiche par pilier, choisie d&apos;après tes conditions et ton intention.
                                        Garde, remplace — ou passe en mode <button onClick={() => setActiveTab('EXPLORER')} className="font-bold text-indigo-500">Explorer</button> pour composer librement.
                                    </p>
                                </div>
                            </div>

                            {allEmpty && autoSlots.length > 0 && (
                                <button
                                    onClick={adoptAll}
                                    className="w-full h-12 rounded-2xl bg-slate-900 text-white text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition"
                                >
                                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                    Adopter la proposition — {autoSlots.length} fiche{autoSlots.length > 1 ? 's' : ''}
                                </button>
                            )}

                            {slots.map(({ pillar, selectedCards, proposal, alternatives, handover, handoverChoices }) => (
                                <section key={pillar.id} className="space-y-2">
                                    <span className={clsx("inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-3 py-1.5 text-white shadow-sm", pillar.bg)}>
                                        <span className="material-symbols-outlined text-[15px]">{pillar.icon}</span>
                                        <span className="text-[11px] font-black uppercase tracking-wide">{pillar.label}</span>
                                    </span>

                                    {/* Fiches déjà retenues sur ce pilier */}
                                    {selectedCards.map(card => (
                                        <div key={card.id} className="relative bg-emerald-50 rounded-2xl shadow-sm overflow-hidden">
                                            <div className={clsx("absolute left-0 top-0 bottom-0 w-1", pillar.bg)} />
                                            <div className="pl-5 pr-4 py-3.5 flex items-center gap-3">
                                                <span className="material-symbols-outlined text-emerald-500 shrink-0">check_circle</span>
                                                <p className="flex-1 min-w-0 text-sm font-bold text-slate-800 leading-snug">{card.question}</p>
                                                <button
                                                    onClick={() => toggleCard(card.id)}
                                                    className="shrink-0 text-[10px] font-black text-red-400 hover:text-red-600 px-2 py-1 transition-colors"
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pilier bien exploré : on rend la main — choix parmi 3,
                                        exactement là où le moniteur est devenu compétent */}
                                    {selectedCards.length === 0 && handover && handoverChoices.length > 0 && (
                                        <>
                                            <div className="flex items-center gap-1.5 px-1">
                                                <span className="material-symbols-outlined text-indigo-400 text-sm shrink-0">workspace_premium</span>
                                                <p className="text-[11px] font-bold text-indigo-500">
                                                    Tu connais ce pilier — à toi de choisir :
                                                </p>
                                            </div>
                                            {handoverChoices.map(choice => renderGuidedCard(choice, pillar))}
                                        </>
                                    )}

                                    {/* Proposition pour un pilier encore vide */}
                                    {selectedCards.length === 0 && !handover && proposal && renderGuidedCard(proposal, pillar)}

                                    {/* Autres pistes du pilier, repliées */}
                                    {alternatives.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => setExpandedPillar(p => p === pillar.id ? null : pillar.id)}
                                                className={clsx(
                                                    "w-full flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm active:scale-[0.98] transition",
                                                    expandedPillar === pillar.id
                                                        ? "bg-slate-900 text-white"
                                                        : "bg-white hover:bg-slate-50"
                                                )}
                                            >
                                                <span className={clsx(
                                                    "material-symbols-outlined text-lg shrink-0",
                                                    expandedPillar === pillar.id ? "text-white/70" : "text-indigo-500"
                                                )}>style</span>
                                                <span className={clsx(
                                                    "flex-1 text-left text-xs font-black",
                                                    expandedPillar === pillar.id ? "text-white" : "text-slate-700"
                                                )}>
                                                    {expandedPillar === pillar.id ? 'Masquer les autres pistes' : 'Voir d’autres pistes sur ce pilier'}
                                                </span>
                                                <span className={clsx(
                                                    "text-[10px] font-black px-2 py-0.5 rounded-full shrink-0",
                                                    expandedPillar === pillar.id ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-500"
                                                )}>
                                                    {alternatives.length}
                                                </span>
                                                <span className={clsx(
                                                    "material-symbols-outlined text-base shrink-0 transition-transform duration-200",
                                                    expandedPillar === pillar.id ? "rotate-180 text-white/70" : "text-slate-300"
                                                )}>expand_more</span>
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {expandedPillar === pillar.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="space-y-2 pt-1">
                                                            {alternatives.map(alt => renderGuidedCard(alt, pillar))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    );
                })()}

                {activeTab === 'EXPLORER' && (
                    <>
                        {/* Retour visible vers le mode guidé — la barre d'onglets est tout en
                            haut et sort de l'écran dès qu'on scrolle dans le catalogue */}
                        <button
                            onClick={() => setActiveTab('GUIDE')}
                            className="w-full flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm text-left active:scale-[0.98] transition"
                        >
                            <span className="material-symbols-outlined text-indigo-500 text-lg">auto_awesome</span>
                            <span className="flex-1 text-xs font-bold text-slate-600">Mode expert — composez librement</span>
                            <span className="text-xs font-black text-indigo-500">Revenir au guidé</span>
                        </button>

                        {/* OBJECTIF */}
                        <IntentionBanner intention={intention} stageId={stage.id} />

                        {/* Barre de filtres compacte — le détail s'ouvre en panneau sur demande.
                            Le bloc déployé en permanence forçait à régler des critères avant
                            d'avoir vu la moindre fiche : on paramétrait à l'aveugle. */}
                        <div className="sticky top-[68px] z-30 -mx-4 px-4 py-2 bg-[#EBF0F7]/95 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFiltres(true)}
                                    className="flex items-center gap-2 h-10 px-4 bg-white rounded-xl shadow-sm text-xs font-black text-slate-700 active:scale-95 transition"
                                >
                                    <span className="material-symbols-outlined text-[17px] text-slate-400">tune</span>
                                    Affiner
                                    {activeFilterCount > 0 && (
                                        <span className="size-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                                <p className="text-[11px] font-bold text-slate-400 flex-1 min-w-0 truncate">
                                    {visibleCount} fiche{visibleCount > 1 ? 's' : ''} · Niveau {selectedLevel}
                                </p>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={resetFiltres}
                                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 shrink-0 transition"
                                    >
                                        Effacer
                                    </button>
                                )}
                            </div>
                        </div>

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

                        {/* Fabrication du sujet : le réservoir s'arrêtait à une liste de
                            questions, il en sort maintenant une capsule à transmettre. */}
                        {programCards.length > 0 && (
                            <section className="pt-6 mt-2 border-t-2 border-slate-200 space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="size-5 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-white text-[11px]">auto_stories</span>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-700">Mes sujets</p>
                                </div>
                                <SujetBuilder
                                    stageId={stage.id}
                                    fiches={programCards.filter(c => c.source !== 'custom')}
                                    sujets={sujets}
                                />
                            </section>
                        )}
                    </div>
                )}
            </main>

            <FiltresPanel
                open={showFiltres}
                onClose={() => setShowFiltres(false)}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                selectedThemes={selectedThemes}
                toggleTheme={toggleTheme}
                availableTags={availableTags}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                tagSearch={tagSearch}
                setTagSearch={setTagSearch}
                resultCount={visibleCount}
                onReset={resetFiltres}
            />

            {/* Toast plafond atteint */}
            <AnimatePresence>
                {capReached && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] bg-amber-500 text-white text-sm font-black px-6 py-4 rounded-2xl shadow-2xl shadow-amber-500/40 max-w-[85vw] flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-2xl shrink-0">warning</span>
                        5 objectifs max — mieux vaut 2-3 fiches bien travaillées.
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

            {/* Découverte de la semaine adoptée : les explications dépliées, à lire au
                seul moment calme où le moniteur est déjà dans le sujet. Pas de quiz,
                pas d'obligation — on met juste la connaissance sous les yeux. */}
            <AnimatePresence>
                {showWeekPreview && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center md:px-4"
                    >
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="bg-white rounded-t-[2rem] md:rounded-3xl w-full max-w-lg max-h-[88vh] flex flex-col shadow-2xl"
                        >
                            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-2xl text-indigo-500">auto_awesome</span>
                                    <h3 className="text-lg font-black text-slate-900">Ta semaine est prête</h3>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">2 minutes pour la découvrir — de quoi être à l&apos;aise devant ton groupe.</p>
                            </div>

                            <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
                                {programCards.filter(c => c.source !== 'custom').map(card => {
                                    const p = pillarOf(card);
                                    return (
                                        <div key={card.id} className="relative bg-slate-50 rounded-2xl overflow-hidden">
                                            <div className={clsx("absolute left-0 top-0 bottom-0 w-1", p?.bg)} />
                                            <div className="pl-5 pr-4 py-4 space-y-2">
                                                <p className="text-sm font-black text-slate-900 leading-snug">{card.question}</p>
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    {card.explication || card.objectif}
                                                </p>
                                                {card.tip && (
                                                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2">
                                                        <span className="material-symbols-outlined text-amber-500 text-base shrink-0 mt-0.5">lightbulb</span>
                                                        <p className="text-xs text-amber-800 leading-relaxed">{card.tip}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => setShowWeekPreview(false)}
                                    className="flex-1 h-12 rounded-2xl border-2 border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider hover:bg-slate-50 transition"
                                >
                                    Ajuster encore
                                </button>
                                <button
                                    onClick={() => { setShowWeekPreview(false); handleSave(); }}
                                    className="flex-1 h-12 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider active:scale-[0.98] transition"
                                >
                                    Enregistrer ma semaine
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
