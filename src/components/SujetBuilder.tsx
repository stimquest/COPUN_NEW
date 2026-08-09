'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { PedagogicalContent, Sujet } from '@/types';
import { creerSujet, majSujet, supprimerSujet } from '@/actions/sujet-actions';
import { composerBrouillon } from '@/lib/sujet-brouillon';

type Props = {
    stageId: string;
    /** Questions du réservoir — la matière qui nourrit le sujet. */
    fiches: PedagogicalContent[];
    sujets: Sujet[];
};

/**
 * Atelier de fabrication du sujet.
 *
 * Le réservoir donnait des questions ; il en sort maintenant une capsule prête à
 * insérer dans un moment creux de la séance. Les questions retenues fusionnent en un
 * sujet unique et consistant plutôt que de rester juxtaposées.
 */
export default function SujetBuilder({ stageId, fiches, sujets }: Props) {
    const router = useRouter();
    const [mode, setMode] = useState<'liste' | 'creation'>(sujets.length ? 'liste' : 'liste');
    const [selection, setSelection] = useState<string[]>([]);
    const [titre, setTitre] = useState('');
    const [accroche, setAccroche] = useState('');
    const [points, setPoints] = useState('');
    const [retenir, setRetenir] = useState('');
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const demarrerCreation = () => {
        // Tout le réservoir est proposé par défaut : le moniteur a déjà fait le tri
        // dans Explorer, on ne lui redemande pas de tout re-cocher.
        const ids = fiches.map(f => f.id);
        setSelection(ids);
        appliquerBrouillon(ids);
        setEditId(null);
        setMode('creation');
    };

    const appliquerBrouillon = (ids: string[]) => {
        const retenues = fiches.filter(f => ids.includes(f.id));
        const b = composerBrouillon(retenues);
        setAccroche(b.accroche);
        setPoints(b.points_cles);
        setRetenir(b.a_retenir);
        if (!titre && retenues.length) setTitre(retenues[0].tags_filtre?.[0] ?? '');
    };

    const toggleSource = (id: string) => {
        const next = selection.includes(id) ? selection.filter(x => x !== id) : [...selection, id];
        setSelection(next);
        appliquerBrouillon(next);
    };

    const editer = (s: Sujet) => {
        setEditId(s.id);
        setTitre(s.titre);
        setAccroche(s.accroche ?? '');
        setPoints(s.points_cles ?? '');
        setRetenir(s.a_retenir ?? '');
        setSelection(s.sources ?? []);
        setMode('creation');
    };

    const enregistrer = async () => {
        if (!titre.trim()) { setError('Donne un nom à ton sujet.'); return; }
        setSaving(true);
        setError(null);

        const res = editId
            ? await majSujet(editId, { titre, accroche, points_cles: points, a_retenir: retenir })
            : await creerSujet(stageId, titre, selection, { accroche, points_cles: points, a_retenir: retenir });

        setSaving(false);
        if (!res.success) { setError(res.error ?? 'Erreur'); return; }

        setMode('liste');
        setTitre(''); setAccroche(''); setPoints(''); setRetenir(''); setEditId(null);
        router.refresh();
    };

    const supprimer = async (id: string) => {
        await supprimerSujet(id);
        router.refresh();
    };

    // ── Liste des sujets fabriqués ───────────────────────────────────────────
    if (mode === 'liste') {
        return (
            <div className="space-y-3">
                {sujets.length === 0 && (
                    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 text-center space-y-2">
                        <span className="material-symbols-outlined text-3xl text-violet-500">auto_stories</span>
                        <p className="text-sm font-black text-violet-900">Fabrique ton sujet</p>
                        <p className="text-xs text-violet-700 leading-relaxed max-w-sm mx-auto">
                            Tes {fiches.length} question{fiches.length > 1 ? 's' : ''} deviennent une capsule prête à glisser
                            dans un moment creux de ta séance.
                        </p>
                    </div>
                )}

                {sujets.map(s => (
                    <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3.5 space-y-2.5">
                            <div className="flex items-start gap-3">
                                <span className="size-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[17px] text-violet-600">auto_stories</span>
                                </span>
                                <p className="flex-1 min-w-0 text-sm font-black text-slate-900 leading-snug">{s.titre}</p>
                                <button onClick={() => editer(s)} className="text-[11px] font-bold text-indigo-500 shrink-0">Modifier</button>
                            </div>
                            {s.accroche && (
                                <p className="text-sm text-slate-700 italic leading-relaxed">«&nbsp;{s.accroche}&nbsp;»</p>
                            )}
                            {s.a_retenir && (
                                <p className="text-xs text-slate-500 leading-snug pt-2 border-t border-slate-100">
                                    → {s.a_retenir}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => supprimer(s.id)}
                            className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-red-500 border-t border-slate-100 transition"
                        >
                            Supprimer
                        </button>
                    </div>
                ))}

                {fiches.length > 0 && (
                    <button
                        onClick={demarrerCreation}
                        className="w-full flex items-center justify-center gap-2 h-12 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-sm active:scale-[0.98] transition"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        {sujets.length ? 'Fabriquer un autre sujet' : 'Fabriquer mon sujet'}
                    </button>
                )}
            </div>
        );
    }

    // ── Atelier ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">
            <button onClick={() => setMode('liste')} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition">
                ← Retour
            </button>

            {/* Les questions qui nourrissent le sujet */}
            <section>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Ce qui nourrit mon sujet
                </p>
                <div className="space-y-1.5">
                    {fiches.map(f => {
                        const on = selection.includes(f.id);
                        return (
                            <button
                                key={f.id}
                                onClick={() => toggleSource(f.id)}
                                className={clsx(
                                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition',
                                    on ? 'bg-violet-50 border-violet-300' : 'bg-white border-slate-200 opacity-50',
                                )}
                            >
                                <span className={clsx(
                                    'size-5 rounded-md flex items-center justify-center shrink-0',
                                    on ? 'bg-violet-500 text-white' : 'bg-slate-200',
                                )}>
                                    {on && <span className="material-symbols-outlined text-[13px]">check</span>}
                                </span>
                                <span className="flex-1 min-w-0 text-xs font-bold text-slate-700 leading-snug">{f.question}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <div className="space-y-4 bg-white rounded-2xl border border-slate-200 p-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                        Mon sujet
                    </label>
                    <input
                        type="text"
                        value={titre}
                        onChange={e => setTitre(e.target.value)}
                        placeholder="Les méduses, le vent thermique…"
                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-violet-400 transition"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                        Comment je lance
                        <span className="font-semibold normal-case tracking-normal text-slate-300 ml-1">— la phrase qui accroche</span>
                    </label>
                    <textarea
                        value={accroche}
                        onChange={e => setAccroche(e.target.value)}
                        rows={2}
                        placeholder="Vous en avez vu combien aujourd'hui ?"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-violet-400 transition resize-none"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                        Ce que j&apos;aborde
                    </label>
                    <textarea
                        value={points}
                        onChange={e => setPoints(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-violet-400 transition resize-none leading-relaxed"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                        Ce qu&apos;ils doivent retenir
                        <span className="font-semibold normal-case tracking-normal text-slate-300 ml-1">— une phrase</span>
                    </label>
                    <textarea
                        value={retenir}
                        onChange={e => setRetenir(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-violet-400 transition resize-none"
                    />
                </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
                onClick={enregistrer}
                disabled={saving}
                className="w-full h-12 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition"
            >
                {saving ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Enregistrer mon sujet'}
            </button>
        </div>
    );
}
