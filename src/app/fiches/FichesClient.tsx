'use client';

import { useState } from 'react';
import { ContentTodo, PedagogicalContent } from '@/types';
import { deleteCustomContent } from '@/actions/custom-content-actions';
import { CustomContentDrawer } from '@/components/CustomContentDrawer';
import Link from 'next/link';
import { VOILE_THEMES } from '@/data/voile-themes';

type FicheWithTodos = PedagogicalContent & { todos: ContentTodo[] };

const FFV_LEVELS: Record<number, { label: string; color: string }> = {
    1: { label: 'N1 · Premiers bords', color: 'bg-amber-100 text-amber-700' },
    2: { label: 'N2 · Perfectionnement', color: 'bg-orange-100 text-orange-700' },
    3: { label: 'N3 · Évolution', color: 'bg-emerald-100 text-emerald-700' },
    4: { label: 'N4 · Autonomie', color: 'bg-sky-100 text-sky-700' },
    5: { label: 'N5 · Maîtrise', color: 'bg-violet-100 text-violet-700' },
};

function FicheCard({
    fiche,
    onEdit,
    onDelete,
}: {
    fiche: FicheWithTodos;
    onEdit: (f: FicheWithTodos) => void;
    onDelete: (id: string) => void;
}) {
    const [deleting, setDeleting] = useState(false);
    const levelMeta = fiche.ffv_level ? FFV_LEVELS[fiche.ffv_level] : null;

    const handleDelete = async () => {
        if (!confirm('Supprimer cette fiche ? Cette action est irréversible.')) return;
        setDeleting(true);
        const result = await deleteCustomContent(fiche.id);
        if (result.success) {
            onDelete(fiche.id);
        } else {
            alert('Erreur : ' + result.error);
            setDeleting(false);
        }
    };

    return (
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                            Sportif
                        </span>
                        {levelMeta && (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${levelMeta.color}`}>
                                {levelMeta.label}
                            </span>
                        )}
                        {(fiche.supports ?? []).map(s => (
                            <span key={s} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                {s}
                            </span>
                        ))}
                        {((fiche.tags_theme || [])[0]) && (
                            (() => {
                                const theme = VOILE_THEMES.find(t => t.id === (fiche.tags_theme || [])[0]);
                                return theme ? (
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 gap-1">
                                        <span className="material-symbols-outlined text-[14px]">{theme.icon}</span>
                                        {theme.label}
                                    </span>
                                ) : null;
                            })()
                        )}
                    </div>
                    <h3 className="text-base font-black leading-tight text-slate-900">{fiche.question}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{fiche.objectif}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <button
                        onClick={() => onEdit(fiche)}
                        className="size-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="size-9 rounded-xl border border-red-100 bg-white flex items-center justify-center text-red-400 hover:bg-red-50 transition disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>

            {fiche.todos.length > 0 && (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Points de cours ({fiche.todos.length})
                    </p>
                    <ul className="space-y-1.5">
                        {fiche.todos.map(todo => (
                            <li key={todo.id} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300" />
                                {todo.text}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {fiche.tip && (
                <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <span className="font-bold">Conseil : </span>{fiche.tip}
                </div>
            )}
        </article>
    );
}

export function FichesClient({ initialFiches }: { initialFiches: FicheWithTodos[] }) {
    const [fiches, setFiches] = useState(initialFiches);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<FicheWithTodos | null>(null);

    const handleCreated = (fiche: FicheWithTodos) => {
        setFiches(prev => [fiche, ...prev]);
        setDrawerOpen(false);
    };

    const handleUpdated = (fiche: FicheWithTodos) => {
        setFiches(prev => prev.map(f => f.id === fiche.id ? fiche : f));
        setEditing(null);
    };

    const handleDelete = (id: string) => {
        setFiches(prev => prev.filter(f => f.id !== id));
    };

    const handleEdit = (fiche: FicheWithTodos) => {
        setEditing(fiche);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
                    <Link
                        href="/"
                        className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all shrink-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Mes fiches</p>
                        <h1 className="text-sm font-extrabold text-slate-900">Contenu sportif</h1>
                    </div>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-[11px] font-black text-white transition hover:bg-slate-700"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Nouvelle fiche
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
                {fiches.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">menu_book</span>
                        <p className="text-sm font-bold text-slate-400">Aucune fiche sportive pour l'instant.</p>
                        <p className="mt-1 text-xs text-slate-400">Créez vos fiches réutilisables avec leurs points de cours.</p>
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="mt-5 inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-slate-700"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Créer ma première fiche
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {fiches.map(fiche => (
                            <FicheCard
                                key={fiche.id}
                                fiche={fiche}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>

            <CustomContentDrawer
                open={drawerOpen || editing !== null}
                initialData={editing}
                onClose={() => { setDrawerOpen(false); setEditing(null); }}
                onSaved={editing ? handleUpdated : handleCreated}
            />
        </div>
    );
}
