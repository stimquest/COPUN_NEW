'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { StepTodo } from '@/types';
import { addStepTodo, updateStepTodo, deleteStepTodo } from '@/actions/stage-actions';

interface Props {
    stepId: string;
    stageId: string;
    initialTodos: StepTodo[];
    pastSuggestions: string[];
}

export function StepTodoList({ stepId, stageId, initialTodos, pastSuggestions }: Props) {
    const [todos, setTodos] = useState<StepTodo[]>(initialTodos);
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (adding && inputRef.current) inputRef.current.focus();
    }, [adding]);

    const filteredSuggestions = pastSuggestions
        .filter(s => {
            if (!draft.trim()) return true;
            return s.toLowerCase().includes(draft.toLowerCase());
        })
        .filter(s => !todos.some(t => t.text.toLowerCase() === s.toLowerCase()))
        .slice(0, 5);

    const handleAdd = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) { setAdding(false); setDraft(''); return; }

        const optimistic: StepTodo = {
            id: `tmp-${Date.now()}`,
            session_step_id: stepId,
            text: trimmed,
            done: false,
            todo_order: todos.length,
            created_at: new Date().toISOString(),
        };
        setTodos(prev => [...prev, optimistic]);
        setDraft('');
        setAdding(false);
        setShowSuggestions(false);

        const res = await addStepTodo(stepId, stageId, trimmed, todos.length);
        if (res.success && res.todo) {
            setTodos(prev => prev.map(t => t.id === optimistic.id ? res.todo as StepTodo : t));
        } else {
            setTodos(prev => prev.filter(t => t.id !== optimistic.id));
        }
    };

    const handleToggleDone = async (todo: StepTodo) => {
        setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, done: !t.done } : t));
        await updateStepTodo(todo.id, stageId, { done: !todo.done });
    };

    const handleEditSave = async (todo: StepTodo) => {
        const trimmed = editText.trim();
        if (!trimmed || trimmed === todo.text) { setEditingId(null); return; }
        setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, text: trimmed } : t));
        setEditingId(null);
        await updateStepTodo(todo.id, stageId, { text: trimmed });
    };

    const handleDelete = async (todoId: string) => {
        setTodos(prev => prev.filter(t => t.id !== todoId));
        await deleteStepTodo(todoId, stageId);
    };

    const doneTodos = todos.filter(t => t.done);
    const pendingTodos = todos.filter(t => !t.done);

    if (todos.length === 0 && !adding) {
        return (
            <button
                onClick={() => setAdding(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-[11px] font-semibold group"
            >
                <span className="material-symbols-outlined text-base text-slate-300 group-hover:text-slate-500">checklist</span>
                Ajouter des points de cours…
            </button>
        );
    }

    return (
        <div className="space-y-1 pt-1">
            {/* Pending todos */}
            <AnimatePresence initial={false}>
                {pendingTodos.map(todo => (
                    <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {editingId === todo.id ? (
                            <div className="flex items-center gap-2 px-2 py-1.5">
                                <span className="size-4 rounded border-2 border-slate-200 shrink-0" />
                                <input
                                    autoFocus
                                    className="flex-1 text-[12px] font-medium text-slate-800 bg-slate-50 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleEditSave(todo);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    onBlur={() => handleEditSave(todo)}
                                />
                            </div>
                        ) : (
                            <div className="flex items-start gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 group/todo transition-colors">
                                <button
                                    onClick={() => handleToggleDone(todo)}
                                    className="size-4 rounded border-2 border-slate-300 shrink-0 mt-0.5 hover:border-blue-400 transition-colors flex items-center justify-center"
                                />
                                <span
                                    className="flex-1 text-[12px] font-medium text-slate-700 leading-snug cursor-text"
                                    onClick={() => { setEditingId(todo.id); setEditText(todo.text); }}
                                >
                                    {todo.text}
                                </span>
                                <button
                                    onClick={() => handleDelete(todo.id)}
                                    className="opacity-0 group-hover/todo:opacity-100 text-slate-300 hover:text-red-400 transition-all shrink-0"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Done todos — collapsed section */}
            {doneTodos.length > 0 && (
                <div className="space-y-0.5 opacity-50">
                    {doneTodos.map(todo => (
                        <div key={todo.id} className="flex items-start gap-2 px-2 py-1.5 rounded-xl group/todo">
                            <button
                                onClick={() => handleToggleDone(todo)}
                                className="size-4 rounded border-2 border-emerald-400 bg-emerald-400 shrink-0 mt-0.5 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-white text-[10px]">check</span>
                            </button>
                            <span className="flex-1 text-[12px] font-medium text-slate-400 line-through leading-snug">{todo.text}</span>
                            <button
                                onClick={() => handleDelete(todo.id)}
                                className="opacity-0 group-hover/todo:opacity-100 text-slate-300 hover:text-red-400 transition-all shrink-0"
                            >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add input */}
            <AnimatePresence>
                {adding ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative"
                    >
                        <div className="flex items-center gap-2 px-2 py-1.5">
                            <span className="size-4 rounded border-2 border-dashed border-slate-300 shrink-0" />
                            <input
                                ref={inputRef}
                                className="flex-1 text-[12px] font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
                                placeholder="Point de cours…"
                                value={draft}
                                onChange={e => { setDraft(e.target.value); setShowSuggestions(true); }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleAdd(draft);
                                    if (e.key === 'Escape') { setAdding(false); setDraft(''); setShowSuggestions(false); }
                                }}
                                onBlur={() => { setTimeout(() => { handleAdd(draft); setShowSuggestions(false); }, 150); }}
                            />
                        </div>

                        {/* Suggestions */}
                        <AnimatePresence>
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute left-0 right-0 top-full z-50 bg-white rounded-xl border border-slate-100 shadow-lg overflow-hidden mt-1"
                                >
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-3 pt-2 pb-1">Réutiliser</p>
                                    {filteredSuggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onMouseDown={e => { e.preventDefault(); handleAdd(s); }}
                                            className="w-full text-left px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-slate-300 text-[13px]">history</span>
                                            {s}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Ajouter
                    </button>
                )}
            </AnimatePresence>
        </div>
    );
}
