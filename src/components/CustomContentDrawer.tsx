'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ContentTodo, PedagogicalContent } from '@/types';
import { createCustomContent, updateCustomContent } from '@/actions/custom-content-actions';

type FicheWithTodos = PedagogicalContent & { todos: ContentTodo[] };

const FFV_LEVELS = [
    { value: 1, label: 'N1 · Premiers bords' },
    { value: 2, label: 'N2 · Perfectionnement' },
    { value: 3, label: 'N3 · Évolution' },
    { value: 4, label: 'N4 · Autonomie' },
    { value: 5, label: 'N5 · Maîtrise' },
];

const SUPPORTS = [
    'Dériveur', 'Planche à voile', 'Catamaran', 'Kitesurf',
    'Paddle', 'Kayak', 'Aviron', 'Char à voile',
];

type TodoDraft = { text: string; todo_order: number };

type Props = {
    open: boolean;
    initialData?: FicheWithTodos | null;
    onClose: () => void;
    onSaved: (fiche: FicheWithTodos) => void;
};

export function CustomContentDrawer({ open, initialData, onClose, onSaved }: Props) {
    const [mounted, setMounted] = useState(false);
    const [question, setQuestion] = useState('');
    const [objectif, setObjectif] = useState('');
    const [tip, setTip] = useState('');
    const [ffvLevel, setFfvLevel] = useState<number | null>(null);
    const [supports, setSupports] = useState<string[]>([]);
    const [todos, setTodos] = useState<TodoDraft[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const newTodoRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setQuestion(initialData.question);
                setObjectif(initialData.objectif);
                setTip(initialData.tip ?? '');
                setFfvLevel(initialData.ffv_level ?? null);
                setSupports(initialData.supports ?? []);
                setTodos(initialData.todos.map(t => ({ text: t.text, todo_order: t.todo_order })));
            } else {
                setQuestion('');
                setObjectif('');
                setTip('');
                setFfvLevel(null);
                setSupports([]);
                setTodos([]);
            }
            setNewTodo('');
            setError(null);
        }
    }, [open, initialData]);

    const toggleSupport = (s: string) => {
        setSupports(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const addTodo = () => {
        const text = newTodo.trim();
        if (!text) return;
        setTodos(prev => [...prev, { text, todo_order: prev.length }]);
        setNewTodo('');
        newTodoRef.current?.focus();
    };

    const removeTodo = (idx: number) => {
        setTodos(prev => prev.filter((_, i) => i !== idx).map((t, i) => ({ ...t, todo_order: i })));
    };

    const moveTodo = (idx: number, dir: -1 | 1) => {
        const next = idx + dir;
        if (next < 0 || next >= todos.length) return;
        setTodos(prev => {
            const arr = [...prev];
            [arr[idx], arr[next]] = [arr[next], arr[idx]];
            return arr.map((t, i) => ({ ...t, todo_order: i }));
        });
    };

    const handleSave = async () => {
        if (!question.trim() || !objectif.trim()) {
            setError("Le titre et l'objectif sont obligatoires.");
            return;
        }
        setSaving(true);
        setError(null);

        const input = {
            question: question.trim(),
            objectif: objectif.trim(),
            tip: tip.trim() || undefined,
            ffv_level: ffvLevel,
            supports,
            todos,
        };

        if (initialData) {
            const result = await updateCustomContent(initialData.id, input);
            if (!result.success) {
                setError(result.error ?? 'Erreur');
                setSaving(false);
                return;
            }
            onSaved({
                ...initialData,
                question: input.question,
                objectif: input.objectif,
                tip: input.tip ?? '',
                ffv_level: input.ffv_level,
                supports: input.supports,
                todos: todos.map((t, i) => ({ id: `draft_${i}`, content_id: initialData.id, created_at: '', ...t })),
            });
        } else {
            const result = await createCustomContent(input);
            if (!result.success) {
                setError(result.error ?? 'Erreur');
                setSaving(false);
                return;
            }
            onSaved({
                id: result.id,
                question: input.question,
                objectif: input.objectif,
                tip: input.tip ?? '',
                niveau: 1,
                dimension: 'COMPRENDRE',
                tags_theme: [],
                tags_filtre: [],
                source: 'custom',
                ffv_level: input.ffv_level,
                supports: input.supports,
                todos: todos.map((t, i) => ({ id: `draft_${i}`, content_id: result.id, created_at: '', ...t })),
            });
        }

        setSaving(false);
    };

    if (!mounted) return null;

    const content = (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 max-h-[92dvh] ${open ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="h-1 w-10 rounded-full bg-slate-200" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-4 shrink-0">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Fiche sportive</p>
                        <h2 className="text-xl font-black text-slate-900">
                            {initialData ? 'Modifier la fiche' : 'Nouvelle fiche'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">

                    {/* Titre */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                            Titre de la notion <span className="text-red-400">*</span>
                        </label>
                        <input
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="Ex : Virement de bord vent arrière"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Objectif */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                            Objectif pédagogique <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={objectif}
                            onChange={e => setObjectif(e.target.value)}
                            placeholder="Ce que le stagiaire doit être capable de faire ou comprendre..."
                            className="w-full min-h-[90px] resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Niveau FFVoile */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                            Niveau FFVoile cible <span className="text-slate-300 font-semibold normal-case tracking-normal">optionnel</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {FFV_LEVELS.map(l => (
                                <button
                                    key={l.value}
                                    type="button"
                                    onClick={() => setFfvLevel(prev => prev === l.value ? null : l.value)}
                                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${ffvLevel === l.value
                                        ? 'border-indigo-500 bg-indigo-500 text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Supports */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                            Supports <span className="text-slate-300 font-semibold normal-case tracking-normal">optionnel</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SUPPORTS.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => toggleSupport(s)}
                                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${supports.includes(s)
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Points de cours */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                            Points de cours
                            <span className="ml-1 text-slate-300 font-semibold normal-case tracking-normal">— à cocher en séance</span>
                        </label>

                        {todos.length > 0 && (
                            <ul className="mb-3 space-y-2">
                                {todos.map((todo, idx) => (
                                    <li key={idx} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                        <span className="size-5 shrink-0 rounded-md bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1 text-sm text-slate-700">{todo.text}</span>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => moveTodo(idx, -1)}
                                                disabled={idx === 0}
                                                className="size-6 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 disabled:opacity-20 transition"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveTodo(idx, 1)}
                                                disabled={idx === todos.length - 1}
                                                className="size-6 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 disabled:opacity-20 transition"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeTodo(idx)}
                                                className="size-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex gap-2">
                            <input
                                ref={newTodoRef}
                                value={newTodo}
                                onChange={e => setNewTodo(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTodo(); } }}
                                placeholder="Ajouter un point de cours…"
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                            />
                            <button
                                type="button"
                                onClick={addTodo}
                                className="size-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                    </div>

                    {/* Conseil moniteur */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                            Conseil moniteur <span className="text-slate-300 font-semibold normal-case tracking-normal">optionnel</span>
                        </label>
                        <textarea
                            value={tip}
                            onChange={e => setTip(e.target.value)}
                            placeholder="Un repère, une astuce, un rappel pour vous..."
                            className="w-full min-h-[72px] resize-y rounded-2xl border border-slate-200 bg-amber-50/50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                        />
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer CTA */}
                <div className="shrink-0 border-t border-slate-100 px-5 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 h-12 rounded-2xl bg-slate-900 text-sm font-black text-white hover:bg-slate-700 transition disabled:opacity-50"
                    >
                        {saving ? 'Enregistrement…' : initialData ? 'Mettre à jour' : 'Créer la fiche'}
                    </button>
                </div>
            </div>
        </>
    );

    return createPortal(content, document.body);
}
