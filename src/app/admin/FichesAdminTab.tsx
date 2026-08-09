'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    createPedagogicalContent,
    updatePedagogicalContent,
    deletePedagogicalContent,
} from '@/actions/content-actions';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { NIVEAU_LABELS_LONGS } from '@/data/niveaux';
import type { PedagogicalContent, PedagogicalRessource, Dimension } from '@/types';
import { getAllFichesMemo } from '@/actions/fiche-memo-actions';
import type { FicheMemo } from '@/actions/fiche-memo-actions';

const DIMENSION_COLORS: Record<Dimension, { bg: string; text: string; badge: string }> = {
    'COMPRENDRE': { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    'OBSERVER':   { bg: 'bg-blue-50',  text: 'text-blue-700',  badge: 'bg-blue-100 text-blue-700'  },
    'PROTÉGER':   { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
};

type Mode = 'list' | 'edit' | 'create';

interface FicheFormState {
    question: string;
    objectif: string;
    explication: string;
    tip: string;
    niveau: 1 | 2 | 3 | 4;
    dimension: Dimension;
    tags_theme: string[];
    tags_filtre: string[];
    ressources: PedagogicalRessource[];
}

const emptyForm = (): FicheFormState => ({
    question: '',
    objectif: '',
    explication: '',
    tip: '',
    niveau: 1,
    dimension: 'COMPRENDRE',
    tags_theme: [],
    tags_filtre: [],
    ressources: [],
});

function formFromFiche(f: PedagogicalContent): FicheFormState {
    return {
        question: f.question,
        objectif: f.objectif,
        explication: f.explication ?? '',
        tip: f.tip,
        niveau: f.niveau,
        dimension: f.dimension,
        tags_theme: f.tags_theme ?? [],
        tags_filtre: f.tags_filtre ?? [],
        ressources: (f.ressources ?? []) as PedagogicalRessource[],
    };
}

export function FichesAdminTab({ initialFiches, fichesMemo }: {
    initialFiches: PedagogicalContent[];
    fichesMemo: FicheMemo[];
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [fiches, setFiches] = useState(initialFiches);
    const [mode, setMode] = useState<Mode>('list');
    const [selected, setSelected] = useState<PedagogicalContent | null>(null);
    const [form, setForm] = useState<FicheFormState>(emptyForm());
    const [filterDim, setFilterDim] = useState<Dimension | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Ressource form
    const [resType, setResType] = useState<'url' | 'fiche_memo'>('url');
    const [resLabel, setResLabel] = useState('');
    const [resUrl, setResUrl] = useState('');
    const [resFicheId, setResFicheId] = useState('');

    const openCreate = () => { setForm(emptyForm()); setSelected(null); setMode('create'); setError(null); };
    const openEdit = (f: PedagogicalContent) => { setForm(formFromFiche(f)); setSelected(f); setMode('edit'); setError(null); };
    const closePanel = () => { setMode('list'); setSelected(null); setError(null); };

    const setField = <K extends keyof FicheFormState>(key: K, val: FicheFormState[K]) =>
        setForm(prev => ({ ...prev, [key]: val }));

    const toggleTheme = (id: string) =>
        setField('tags_theme', form.tags_theme.includes(id)
            ? form.tags_theme.filter(t => t !== id)
            : [...form.tags_theme, id]);

    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !form.tags_filtre.includes(t)) setField('tags_filtre', [...form.tags_filtre, t]);
        setTagInput('');
    };

    const removeTag = (t: string) => setField('tags_filtre', form.tags_filtre.filter(x => x !== t));

    const addRessource = () => {
        const label = resLabel.trim();
        if (!label) return;
        let res: PedagogicalRessource;
        if (resType === 'url') {
            const url = resUrl.trim();
            if (!url) return;
            res = { type: 'url', label, url };
        } else {
            if (!resFicheId) return;
            res = { type: 'fiche_memo', label, fiche_memo_id: resFicheId };
        }
        setField('ressources', [...form.ressources, res]);
        setResLabel(''); setResUrl(''); setResFicheId('');
    };

    const removeRessource = (idx: number) =>
        setField('ressources', form.ressources.filter((_, i) => i !== idx));

    const flash = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleSave = () => {
        if (!form.question.trim() || !form.objectif.trim() || !form.tip.trim()) {
            setError('Question, objectif et conseil sont obligatoires.');
            return;
        }
        setError(null);
        startTransition(async () => {
            if (mode === 'create') {
                const result = await createPedagogicalContent({ ...form, is_public: true });
                if (!result.success) { setError(result.error ?? 'Erreur'); return; }
                flash('Fiche créée.');
            } else if (mode === 'edit' && selected) {
                const result = await updatePedagogicalContent(selected.id, form);
                if (!result.success) { setError(result.error ?? 'Erreur'); return; }
                flash('Fiche mise à jour.');
            }
            router.refresh();
            closePanel();
        });
    };

    const handleDelete = (f: PedagogicalContent) => {
        if (!confirm(`Supprimer la fiche "${f.question.slice(0, 60)}…" ?`)) return;
        startTransition(async () => {
            const result = await deletePedagogicalContent(f.id);
            if (!result.success) { setError(result.error ?? 'Erreur'); return; }
            setFiches(prev => prev.filter(x => x.id !== f.id));
            if (selected?.id === f.id) closePanel();
            flash('Fiche supprimée.');
        });
    };

    const filtered = fiches.filter(f => {
        if (filterDim !== 'ALL' && f.dimension !== filterDim) return false;
        if (search && !f.question.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const grouped = PILLARS.reduce((acc, p) => {
        acc[p.id] = filtered.filter(f => f.dimension === p.id);
        return acc;
    }, {} as Record<Dimension, PedagogicalContent[]>);

    return (
        <div className="flex h-full gap-0">
            {/* ── Left panel: list ── */}
            <div className={`flex flex-col ${mode !== 'list' ? 'w-[52%] border-r border-slate-200' : 'w-full'}`}>
                {/* Toolbar */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher une question…"
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setFilterDim('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterDim === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            Tous
                        </button>
                        {PILLARS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setFilterDim(filterDim === p.id ? 'ALL' : p.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterDim === p.id ? `${p.bg} ${DIMENSION_COLORS[p.id].text}` : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shrink-0"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        Nouvelle
                    </button>
                </div>

                {successMsg && (
                    <div className="mx-6 mt-3 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        {successMsg}
                    </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {PILLARS.map(p => {
                        const items = grouped[p.id];
                        if ((filterDim !== 'ALL' && filterDim !== p.id) || items.length === 0) return null;
                        return (
                            <div key={p.id}>
                                <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${p.border}`}>
                                    <span className={`material-symbols-outlined text-lg ${p.color}`}>{p.icon}</span>
                                    <span className={`text-xs font-black uppercase tracking-widest ${p.color}`}>{p.label}</span>
                                    <span className="ml-auto text-xs text-slate-400 font-semibold">{items.length} fiches</span>
                                </div>
                                <div className="space-y-2">
                                    {items.map(f => {
                                        const colors = DIMENSION_COLORS[f.dimension];
                                        const isActive = selected?.id === f.id;
                                        return (
                                            <div
                                                key={f.id}
                                                onClick={() => openEdit(f)}
                                                className={`group flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                                    isActive
                                                        ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                                                }`}
                                            >
                                                <span className={`mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${colors.badge}`}>
                                                    N{f.niveau}
                                                </span>
                                                <p className="text-sm text-slate-800 leading-snug flex-1 line-clamp-2">
                                                    {f.question}
                                                </p>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleDelete(f); }}
                                                    disabled={isPending}
                                                    className="opacity-0 group-hover:opacity-100 size-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition shrink-0 disabled:opacity-30"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                            <p className="text-sm font-semibold">Aucune fiche trouvée.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right panel: form ── */}
            {mode !== 'list' && (
                <div className="w-[48%] flex flex-col bg-slate-50">
                    {/* Panel header */}
                    <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
                        <button onClick={closePanel} className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                        <h3 className="font-black text-slate-900 text-sm">
                            {mode === 'create' ? 'Nouvelle fiche' : 'Modifier la fiche'}
                        </h3>
                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-base">save</span>
                                {isPending ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        {/* Dimension + Niveau */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Dimension</label>
                                <div className="flex flex-col gap-1.5">
                                    {PILLARS.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => { setField('dimension', p.id); setField('tags_theme', []); }}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition ${
                                                form.dimension === p.id
                                                    ? `${p.bg} ${DIMENSION_COLORS[p.id].text} border-current`
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className={`material-symbols-outlined text-base ${form.dimension === p.id ? '' : 'text-slate-400'}`}>{p.icon}</span>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Niveau</label>
                                <div className="flex flex-col gap-1.5">
                                    {([1, 2, 3, 4] as const).map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setField('niveau', n)}
                                            className={`px-3 py-2 rounded-xl border text-sm font-bold transition text-left ${
                                                form.niveau === n
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {NIVEAU_LABELS_LONGS[n]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Question */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Question <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={form.question}
                                onChange={e => setField('question', e.target.value)}
                                placeholder="L'accroche pédagogique posée aux stagiaires…"
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            />
                        </div>

                        {/* Objectif */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Objectif pédagogique <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={form.objectif}
                                onChange={e => setField('objectif', e.target.value)}
                                placeholder="Pourquoi cette fiche ? Qu'est-ce que le stagiaire doit comprendre…"
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            />
                        </div>

                        {/* Explication courte */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Ce qu&apos;il faut savoir <span className="font-semibold normal-case tracking-normal text-slate-300">— optionnel</span>
                            </label>
                            <textarea
                                value={form.explication}
                                onChange={e => setField('explication', e.target.value)}
                                placeholder="2-3 phrases qui répondent vraiment à la question, façon 'les pourquoi' — de quoi raconter le concept sans faire un cours…"
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            />
                        </div>

                        {/* Tip */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Conseil terrain <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={form.tip}
                                onChange={e => setField('tip', e.target.value)}
                                placeholder="Astuce pratique pour le moniteur sur le terrain…"
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            />
                        </div>

                        {/* Tags thématiques */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thèmes</label>
                            <div className="flex flex-wrap gap-2">
                                {THEMES_BY_PILLAR[form.dimension].map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => toggleTheme(t.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                                            form.tags_theme.includes(t.id)
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">{t.icon}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags filtre */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tags contextuels</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                    placeholder="marée, vent, courant…"
                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition"
                                >
                                    Ajouter
                                </button>
                            </div>
                            {form.tags_filtre.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {form.tags_filtre.map(t => (
                                        <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                                            {t}
                                            <button onClick={() => removeTag(t)} className="hover:text-red-600 transition">
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ressources */}
                        <div className="border-t border-slate-100 pt-5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                Ressources liées
                            </label>

                            {/* Liste des ressources existantes */}
                            {form.ressources.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {form.ressources.map((r, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                                            <span className={`material-symbols-outlined text-base shrink-0 ${r.type === 'fiche_memo' ? 'text-teal-500' : 'text-blue-500'}`}>
                                                {r.type === 'fiche_memo' ? 'article' : 'link'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{r.label}</p>
                                                <p className="text-xs text-slate-400 truncate">
                                                    {r.type === 'url' ? r.url : `Fiche mémo · ${r.fiche_memo_id.slice(0, 8)}…`}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeRessource(idx)}
                                                className="size-6 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Formulaire ajout ressource */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
                                {/* Type toggle */}
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setResType('url')}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${resType === 'url' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">link</span>
                                        Lien URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setResType('fiche_memo')}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${resType === 'fiche_memo' ? 'bg-teal-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">article</span>
                                        Fiche mémo
                                    </button>
                                </div>

                                {/* Label */}
                                <input
                                    value={resLabel}
                                    onChange={e => setResLabel(e.target.value)}
                                    placeholder="Intitulé de la ressource…"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />

                                {/* URL ou sélection fiche mémo */}
                                {resType === 'url' ? (
                                    <input
                                        value={resUrl}
                                        onChange={e => setResUrl(e.target.value)}
                                        placeholder="https://…"
                                        type="url"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                ) : (
                                    <select
                                        value={resFicheId}
                                        onChange={e => setResFicheId(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    >
                                        <option value="">— Choisir une fiche mémo —</option>
                                        {fichesMemo.map(f => (
                                            <option key={f.id} value={f.id}>{f.titre}</option>
                                        ))}
                                    </select>
                                )}

                                <button
                                    type="button"
                                    onClick={addRessource}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Ajouter la ressource
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
