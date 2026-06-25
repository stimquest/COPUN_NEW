'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createStage } from '@/actions/stage-actions';
import { createStageFromTemplate, deleteTemplate, type StageTemplate } from '@/actions/template-actions';
import { motion, AnimatePresence } from 'framer-motion';
import SeasonalGuide from '@/components/SeasonalGuide';
import DatePicker from '@/components/DatePicker';
import { ThematicTag } from '@/data/seasonal-context';
import clsx from 'clsx';

const CONDITION_LABELS: Record<string, string> = {
    vent_fort: 'Vent fort', vent_faible: 'Vent faible',
    mer_calme: 'Mer calme', mer_agitee: 'Mer agitée',
    pluie: 'Pluie', grand_soleil: 'Soleil', brouillard: 'Brouillard',
};
const PERIODE_LABELS: Record<string, string> = {
    printemps: 'Printemps', juillet: 'Juillet', aout: 'Août',
    automne: 'Automne', hiver: 'Hiver',
    vacances_scolaires: 'Vacances', hors_vacances: 'Hors vacances',
};
const SUPPORT_LABELS: Record<string, string> = {
    catamaran_enfant: 'Cata enfant', catamaran_adulte: 'Cata adulte',
    deriveur_simple: 'Dériveur simple', deriveur_double: 'Dériveur double',
    planche_a_voile: 'Planche à voile', wing_foil: 'Wing Foil', kite_surf: 'Kite Surf',
    char_a_voile: 'Char à voile', kayak_mer: 'Kayak de mer',
    sup: 'SUP', paddle_geant: 'Paddle géant',
    cerf_volant: 'Cerf-volant', marche_aquatique: 'Marche aquatique',
};
const TYPE_STAGE_LABELS: Record<string, string> = {
    decouverte: 'Découverte', initiation: 'Initiation',
    perfectionnement: 'Perfectionnement', competition: 'Compétition',
    randonnee: 'Randonnée', scolaire_classe_mer: 'Classe de mer',
    teambuilding: 'Teambuilding', evg_evjf: 'EVG/EVJF',
    bien_etre: 'Bien-être', secourisme_bnssa: 'Secourisme',
};
const PUBLIC_LABELS: Record<string, string> = {
    enfants_7_10: 'Enfants 7-10', enfants_10_14: 'Enfants 10-14',
    ados: 'Ados', adultes: 'Adultes', seniors: 'Seniors',
    groupes_scolaires: 'Scolaires', entreprises: 'Entreprises', tous_niveaux: 'Tous niveaux',
};

const DURATION_OPTIONS = [
    { days: 3, label: '3 jours' },
    { days: 5, label: '5 jours' },
    { days: 7, label: '1 semaine' },
    { days: 14, label: '2 semaines' },
];

type Mode = 'choice' | 'template' | 'scratch' | 'guide';

export function NewStageClient({ templates: initialTemplates }: { templates: StageTemplate[] }) {
    const router = useRouter();
    const [templateList, setTemplateList] = useState<StageTemplate[]>(initialTemplates);
    const [mode, setMode] = useState<Mode>(initialTemplates.length > 0 ? 'choice' : 'scratch');
    const [isSaving, setIsSaving] = useState(false);
    const [isPendingDelete, startDeleteTransition] = useTransition();

    // Filtres template
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterSupport, setFilterSupport] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterPublic, setFilterPublic] = useState<string | null>(null);
    const [filterCondition, setFilterCondition] = useState<string | null>(null);
    const [filterPeriode, setFilterPeriode] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<StageTemplate | null>(null);

    const activeFilterCount = [filterSupport, filterType, filterPublic, filterCondition, filterPeriode].filter(Boolean).length;

    // Champs communs (scratch + template)
    const [startDate, setStartDate] = useState('');
    const [templateThematics, setTemplateThematics] = useState<ThematicTag[] | null>(null);
    const [durationDays, setDurationDays] = useState(5);
    const [nbStagiaires, setNbStagiaires] = useState('');

    // Champs scratch uniquement
    const [formData, setFormData] = useState({ title: '', activity: 'Catamaran', level: 'Niveau 1' });
    const [suggestedThematics, setSuggestedThematics] = useState<ThematicTag[]>([]);

    const endDate = (() => {
        if (!startDate) return '';
        const d = new Date(startDate);
        d.setDate(d.getDate() + durationDays - 1);
        return d.toISOString().slice(0, 10);
    })();

    const formatDateRange = (start: string, end: string) => {
        if (!start || !end) return '';
        const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return `${new Date(start).toLocaleDateString('fr-FR', opts)} - ${new Date(end).toLocaleDateString('fr-FR', opts)}`;
    };

    // ── Depuis un modèle ──
    const filteredTemplates = templateList.filter(t => {
        if (filterSupport && !(t.tags_support ?? []).includes(filterSupport as never)) return false;
        if (filterType && !(t.tags_type_stage ?? []).includes(filterType as never)) return false;
        if (filterPublic && !(t.tags_public ?? []).includes(filterPublic as never)) return false;
        if (filterCondition && !t.tags_conditions.includes(filterCondition as never)) return false;
        if (filterPeriode && !t.tags_periode.includes(filterPeriode as never)) return false;
        return true;
    });

    const handleFromTemplate = async (thematics: ThematicTag[]) => {
        if (!selectedTemplate || !startDate) return;
        setIsSaving(true);
        const dates = formatDateRange(startDate, endDate);
        const res = await createStageFromTemplate(selectedTemplate.id, dates, nbStagiaires ? Number(nbStagiaires) : undefined, thematics);
        if (res.success && res.stageId) router.push(`/stages/${res.stageId}`);
        else { alert(res.error); setIsSaving(false); }
    };

    const handleDeleteTemplate = (id: string) => {
        startDeleteTransition(async () => {
            await deleteTemplate(id);
            setTemplateList(prev => prev.filter(t => t.id !== id));
            if (selectedTemplate?.id === id) setSelectedTemplate(null);
        });
    };

    // ── Depuis zéro ──
    const handleScratchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate) setMode('guide');
    };

    const saveStage = async (thematics: ThematicTag[]) => {
        if (isSaving) return;
        setIsSaving(true);
        const res = await createStage({
            ...formData,
            dates: formatDateRange(startDate, endDate),
            nb_stagiaires: nbStagiaires !== '' ? Number(nbStagiaires) : undefined,
            suggested_thematics: thematics,
        });
        if (res.success) router.push(res.stageId ? `/stages/${res.stageId}` : '/stages');
        else { alert('Erreur: ' + res.error); setIsSaving(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {isSaving && (
                <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-3xl px-8 py-7 shadow-2xl flex flex-col items-center gap-3">
                        <span className="animate-spin material-symbols-outlined text-4xl text-indigo-600">progress_activity</span>
                        <p className="text-sm font-bold text-slate-700">Création du stage…</p>
                    </div>
                </div>
            )}

            <header className="bg-white border-b border-slate-200 px-6 py-6 flex items-center gap-4">
                <Link href="/stages" className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-xl font-black text-slate-900 uppercase italic">Nouveau Stage</h1>
            </header>

            <main className="p-6 max-w-lg mx-auto">
                <AnimatePresence mode="wait">

                    {/* ── CHOIX : modèle ou zéro ── */}
                    {mode === 'choice' && (
                        <motion.div key="choice" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Comment créer ce stage ?</p>

                            <button
                                onClick={() => setMode('template')}
                                className="w-full flex items-center gap-4 bg-white rounded-2xl p-5 border-2 border-indigo-100 hover:border-indigo-400 shadow-sm transition-all active:scale-[0.98] text-left"
                            >
                                <div className="size-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">bookmarks</span>
                                </div>
                                <div>
                                    <p className="font-black text-slate-900">Partir d&apos;un modèle</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{templateList.length} modèle{templateList.length > 1 ? 's' : ''} sauvegardé{templateList.length > 1 ? 's' : ''}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 ml-auto">arrow_forward_ios</span>
                            </button>

                            <button
                                onClick={() => setMode('scratch')}
                                className="w-full flex items-center gap-4 bg-white rounded-2xl p-5 border-2 border-slate-100 hover:border-slate-300 shadow-sm transition-all active:scale-[0.98] text-left"
                            >
                                <div className="size-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">add_circle</span>
                                </div>
                                <div>
                                    <p className="font-black text-slate-900">Créer de zéro</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Nouveau stage vierge</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 ml-auto">arrow_forward_ios</span>
                            </button>
                        </motion.div>
                    )}

                    {/* ── DEPUIS UN MODÈLE ── */}
                    {mode === 'template' && (
                        <motion.div key="template" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <button onClick={() => setMode('choice')} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> Retour
                            </button>

                            {/* Barre : compteur + bouton Filtrer */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-black text-slate-700">
                                    {filteredTemplates.length} modèle{filteredTemplates.length !== 1 ? 's' : ''}
                                    {activeFilterCount > 0 && <span className="text-slate-400 font-medium"> trouvé{filteredTemplates.length !== 1 ? 's' : ''}</span>}
                                </p>
                                <button
                                    onClick={() => setFilterOpen(true)}
                                    className={clsx(
                                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border-2 transition-all',
                                        activeFilterCount > 0
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                    )}
                                >
                                    <span className="material-symbols-outlined text-sm">tune</span>
                                    Filtrer
                                    {activeFilterCount > 0 && (
                                        <span className="size-4 rounded-full bg-white text-indigo-600 text-[10px] font-black flex items-center justify-center leading-none">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Chips filtres actifs */}
                            {activeFilterCount > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {filterSupport && (
                                        <span className="flex items-center gap-1 text-[11px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                                            {SUPPORT_LABELS[filterSupport]}
                                            <button onClick={() => setFilterSupport(null)} className="ml-0.5 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-[12px]">close</span></button>
                                        </span>
                                    )}
                                    {filterType && (
                                        <span className="flex items-center gap-1 text-[11px] font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full">
                                            {TYPE_STAGE_LABELS[filterType]}
                                            <button onClick={() => setFilterType(null)} className="ml-0.5 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-[12px]">close</span></button>
                                        </span>
                                    )}
                                    {filterPublic && (
                                        <span className="flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full">
                                            {PUBLIC_LABELS[filterPublic]}
                                            <button onClick={() => setFilterPublic(null)} className="ml-0.5 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-[12px]">close</span></button>
                                        </span>
                                    )}
                                    {filterCondition && (
                                        <span className="flex items-center gap-1 text-[11px] font-bold bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full">
                                            {CONDITION_LABELS[filterCondition]}
                                            <button onClick={() => setFilterCondition(null)} className="ml-0.5 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-[12px]">close</span></button>
                                        </span>
                                    )}
                                    {filterPeriode && (
                                        <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                                            {PERIODE_LABELS[filterPeriode]}
                                            <button onClick={() => setFilterPeriode(null)} className="ml-0.5 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-[12px]">close</span></button>
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Liste modèles */}
                            <div className="space-y-2">
                                {filteredTemplates.length === 0 && (
                                    <div className="text-center py-10 text-slate-400">
                                        <span className="material-symbols-outlined text-3xl mb-2 block">search_off</span>
                                        <p className="text-sm font-semibold">Aucun modèle pour ces filtres</p>
                                    </div>
                                )}
                                {filteredTemplates.map(t => (
                                    <div key={t.id} className={clsx(
                                        'flex items-start gap-3 bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer',
                                        selectedTemplate?.id === t.id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'
                                    )} onClick={() => { setSelectedTemplate(prev => prev?.id === t.id ? null : t); setTemplateThematics(null); }}>
                                        <div className={clsx('size-10 rounded-xl flex items-center justify-center shrink-0', selectedTemplate?.id === t.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500')}>
                                            <span className="material-symbols-outlined">bookmarks</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                                            <p className="text-xs text-slate-500">{t.activity} · {t.level} · {t.duration_days}j</p>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {(t.tags_support ?? []).map(s => (
                                                    <span key={s} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">{SUPPORT_LABELS[s] ?? s}</span>
                                                ))}
                                                {(t.tags_type_stage ?? []).map(s => (
                                                    <span key={s} className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-semibold">{TYPE_STAGE_LABELS[s] ?? s}</span>
                                                ))}
                                                {(t.tags_public ?? []).map(p => (
                                                    <span key={p} className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold">{PUBLIC_LABELS[p] ?? p}</span>
                                                ))}
                                                {t.tags_conditions.map(c => (
                                                    <span key={c} className="text-[10px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full font-semibold">{CONDITION_LABELS[c] ?? c}</span>
                                                ))}
                                                {t.tags_periode.map(p => (
                                                    <span key={p} className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold">{PERIODE_LABELS[p] ?? p}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={e => { e.stopPropagation(); handleDeleteTemplate(t.id); }}
                                            disabled={isPendingDelete}
                                            className="text-slate-300 hover:text-red-400 transition shrink-0 p-1"
                                            title="Supprimer ce modèle"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Date + stagiaires + contexte saisonnier + CTA */}
                            {selectedTemplate && (
                                <div className="bg-white rounded-2xl border-2 border-indigo-100">
                                    <div className="p-5 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paramètres du stage</p>
                                        <DatePicker
                                            value={startDate}
                                            onChange={v => { setStartDate(v); setTemplateThematics(null); }}
                                            placeholder="Jour de début"
                                        />
                                        <input
                                            type="number" min={1} max={999} placeholder="Nb stagiaires (optionnel)"
                                            value={nbStagiaires}
                                            onChange={e => setNbStagiaires(e.target.value)}
                                            className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-900 focus:border-indigo-400 outline-none text-sm"
                                        />
                                    </div>

                                    {/* Guide saisonnier — apparaît dès qu'une date est choisie */}
                                    {startDate && templateThematics === null && (
                                        <div className="border-t border-slate-100 px-5 py-5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Contexte de la semaine</p>
                                            <SeasonalGuide
                                                startDate={startDate}
                                                onSuggestions={thematics => setTemplateThematics(thematics)}
                                                onSkip={() => setTemplateThematics([])}
                                                isSaving={isSaving}
                                            />
                                        </div>
                                    )}

                                    {/* Résumé thématiques + CTA final */}
                                    {startDate && templateThematics !== null && (
                                        <div className="border-t border-slate-100 p-5 space-y-3">
                                            {templateThematics.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Thématiques suggérées</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {templateThematics.map(t => (
                                                            <span key={t} className="text-[11px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-semibold">{t.replace(/_/g, ' ')}</span>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => setTemplateThematics(null)} className="text-[10px] text-slate-400 hover:text-slate-600 mt-2 transition">
                                                        Modifier le contexte
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleFromTemplate(templateThematics)}
                                                disabled={isSaving}
                                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs tracking-widest uppercase transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isSaving
                                                    ? <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                                    : <span className="material-symbols-outlined">rocket_launch</span>
                                                }
                                                Créer depuis &quot;{selectedTemplate.name}&quot;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Drawer filtres */}
                            {filterOpen && (
                                <>
                                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" onClick={() => setFilterOpen(false)} />
                                    <div className="fixed inset-x-0 bottom-0 z-[9999] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
                                        {/* Header drawer */}
                                        <div className="flex-none px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                                            <h3 className="font-black text-slate-900">Filtrer les modèles</h3>
                                            <div className="flex items-center gap-2">
                                                {activeFilterCount > 0 && (
                                                    <button
                                                        onClick={() => { setFilterSupport(null); setFilterType(null); setFilterPublic(null); setFilterCondition(null); setFilterPeriode(null); }}
                                                        className="text-xs font-bold text-slate-400 hover:text-red-500 transition"
                                                    >
                                                        Tout effacer
                                                    </button>
                                                )}
                                                <button onClick={() => setFilterOpen(false)} className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Corps scrollable */}
                                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                                            {([
                                                { label: 'Support nautique', entries: SUPPORT_LABELS, value: filterSupport, set: setFilterSupport, color: 'bg-indigo-500' },
                                                { label: 'Type de stage',    entries: TYPE_STAGE_LABELS, value: filterType, set: setFilterType, color: 'bg-violet-500' },
                                                { label: 'Public cible',     entries: PUBLIC_LABELS, value: filterPublic, set: setFilterPublic, color: 'bg-rose-500' },
                                                { label: 'Conditions météo', entries: CONDITION_LABELS, value: filterCondition, set: setFilterCondition, color: 'bg-sky-500' },
                                                { label: 'Période',          entries: PERIODE_LABELS, value: filterPeriode, set: setFilterPeriode, color: 'bg-amber-500' },
                                            ] as const).map(group => (
                                                <div key={group.label}>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{group.label}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(group.entries).map(([id, label]) => (
                                                            <button
                                                                key={id}
                                                                onClick={() => group.set(group.value === id ? null : id)}
                                                                className={clsx(
                                                                    'px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all active:scale-95',
                                                                    group.value === id
                                                                        ? `${group.color} border-transparent text-white`
                                                                        : 'bg-white border-slate-200 text-slate-600'
                                                                )}
                                                            >
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <div className="flex-none px-5 pt-4 border-t border-slate-100 pb-[max(env(safe-area-inset-bottom),1rem)] md:pb-4">
                                            <button
                                                onClick={() => setFilterOpen(false)}
                                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest"
                                            >
                                                Voir {filteredTemplates.length} modèle{filteredTemplates.length !== 1 ? 's' : ''}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* ── DEPUIS ZÉRO ── */}
                    {mode === 'scratch' && (
                        <motion.div key="scratch" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                            {templateList.length > 0 && (
                                <button onClick={() => setMode('choice')} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors mb-4">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span> Retour
                                </button>
                            )}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-slate-100">
                                <form onSubmit={handleScratchSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nom du Stage</label>
                                        <input required type="text" placeholder="ex: Catamaran Perfectionnement"
                                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Support</label>
                                            <select className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold text-slate-900 outline-none cursor-pointer"
                                                value={formData.activity} onChange={e => setFormData({ ...formData, activity: e.target.value })}>
                                                <option>Catamaran</option><option>Optimist</option><option>Planche à voile</option>
                                                <option>Wing Foil</option><option>Kayak / Paddle</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Niveau</label>
                                            <select className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold text-slate-900 outline-none cursor-pointer"
                                                value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                                                <option>Niveau 1</option><option>Niveau 2</option><option>Niveau 3</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nombre de Stagiaires</label>
                                        <input type="number" min={1} max={999} placeholder="ex: 12"
                                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-indigo-500 outline-none transition-all"
                                            value={nbStagiaires} onChange={e => setNbStagiaires(e.target.value)} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Période du Stage</label>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-slate-400 ml-1">JOUR DE DÉBUT</span>
                                            <DatePicker value={startDate} onChange={setStartDate} placeholder="Choisir le 1er jour" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-slate-400 ml-1">DURÉE</span>
                                            <div className="grid grid-cols-4 gap-2">
                                                {DURATION_OPTIONS.map(opt => (
                                                    <button key={opt.days} type="button" onClick={() => setDurationDays(opt.days)}
                                                        className={clsx('h-14 rounded-2xl border-2 font-black text-xs transition-all active:scale-95',
                                                            durationDays === opt.days
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300')}>
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-center gap-3 pt-2">
                                                <button type="button" onClick={() => setDurationDays(d => Math.max(1, d - 1))}
                                                    className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all">
                                                    <span className="material-symbols-outlined text-[18px]">remove</span>
                                                </button>
                                                <span className="text-xs font-bold text-slate-500 w-24 text-center">{durationDays} jour{durationDays > 1 ? 's' : ''}</span>
                                                <button type="button" onClick={() => setDurationDays(d => Math.min(60, d + 1))}
                                                    className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all">
                                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                                </button>
                                            </div>
                                        </div>
                                        {startDate && endDate && (
                                            <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 flex items-center gap-3">
                                                <span className="material-symbols-outlined text-indigo-500">calendar_month</span>
                                                <div>
                                                    <span className="block text-xs font-black text-indigo-600 uppercase italic">{formatDateRange(startDate, endDate)}</span>
                                                    <span className="block text-[10px] font-semibold text-indigo-400">{durationDays} jour{durationDays > 1 ? 's' : ''} de stage</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4">
                                        <button type="submit" disabled={isSaving || !startDate || !endDate}
                                            className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                            SUIVANT
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* ── GUIDE THÉMATIQUE ── */}
                    {mode === 'guide' && (
                        <motion.div key="guide" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-slate-100 space-y-4">
                            <div className="space-y-1 mb-6">
                                <p className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Étape 2 — Contexte</p>
                                <h2 className="text-lg font-black text-slate-900">Guidez votre programme</h2>
                                <p className="text-xs text-slate-500">Ces informations vont présélectionner les thématiques les plus pertinentes pour votre semaine.</p>
                            </div>
                            <SeasonalGuide
                                startDate={startDate}
                                onSuggestions={saveStage}
                                onSkip={() => saveStage([])}
                                isSaving={isSaving}
                            />
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}
