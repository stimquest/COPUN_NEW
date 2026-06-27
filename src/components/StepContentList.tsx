'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { StepTodo, PedagogicalContent, ContentTodo } from '@/types';
import { addStepTodo, updateStepTodo, deleteStepTodo, addStepPedagogicalCard } from '@/actions/stage-actions';
import CardDetailModal from './CardDetailModal';
import { CustomContentDrawer } from './CustomContentDrawer';

interface Props {
    stepId: string;
    stageId: string;
    initialTodos: StepTodo[];
    pastSuggestions: string[];
    customPool: PedagogicalContent[];
}

export function StepContentList({ stepId, stageId, initialTodos, pastSuggestions, customPool }: Props) {
    const [todos, setTodos] = useState<StepTodo[]>(initialTodos);
    
    // Add modes
    const [showAddSelector, setShowAddSelector] = useState(false);
    const [addMode, setAddMode] = useState<'text' | null>(null);
    const [showCardDrawer, setShowCardDrawer] = useState(false);
    const [showCreateDrawer, setShowCreateDrawer] = useState(false);
    
    // Text todo states
    const [draft, setDraft] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Drawer states
    const [searchQuery, setSearchQuery] = useState('');
    
    // Local list of newly created custom cards to avoid revalidation lag
    const [localCustomCards, setLocalCustomCards] = useState<PedagogicalContent[]>([]);
    
    // Detail Modal states
    const [selectedCardForDetail, setSelectedCardForDetail] = useState<PedagogicalContent | null>(null);
    
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep state in sync with props
    useEffect(() => {
        setTodos(initialTodos);
    }, [initialTodos]);

    useEffect(() => {
        if (addMode === 'text' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [addMode]);

    // Gather unique linked_content_ids that are already linked in this step
    const alreadyLinkedIds = useMemo(() => {
        const ids = new Set<string>();
        todos.forEach(t => {
            if (t.linked_content_id) ids.add(t.linked_content_id);
        });
        return ids;
    }, [todos]);

    // Merged custom pool with local created ones
    const mergedCustomPool = useMemo(() => {
        const combined = [...customPool];
        localCustomCards.forEach(localCard => {
            if (!combined.some(c => c.id === localCard.id)) {
                combined.push(localCard);
            }
        });
        return combined;
    }, [customPool, localCustomCards]);

    // Parse and group todos
    // Plain pending todos, card blocks (header + sub-todos), and plain done todos.
    const { pendingPlainTodos, cardBlocks, donePlainTodos } = useMemo(() => {
        const sorted = [...todos].sort((a, b) => a.todo_order - b.todo_order);
        
        const pendingPlain: StepTodo[] = [];
        const donePlain: StepTodo[] = [];
        
        // Group components for cards
        const cardsMap = new Map<string, { header?: StepTodo; subTodos: StepTodo[] }>();
        
        sorted.forEach(todo => {
            if (!todo.linked_content_id) {
                if (todo.done) {
                    donePlain.push(todo);
                } else {
                    pendingPlain.push(todo);
                }
            } else {
                if (!cardsMap.has(todo.linked_content_id)) {
                    cardsMap.set(todo.linked_content_id, { subTodos: [] });
                }
                const group = cardsMap.get(todo.linked_content_id)!;
                if (todo.is_content_header) {
                    group.header = todo;
                } else {
                    group.subTodos.push(todo);
                }
            }
        });

        // Resolve card blocks in order of their header
        const blocks: { headerTodo: StepTodo; subTodos: StepTodo[]; card: PedagogicalContent | null; linked_content_id: string }[] = [];
        const seenCards = new Set<string>();
        
        sorted.forEach(todo => {
            if (todo.linked_content_id && !seenCards.has(todo.linked_content_id)) {
                seenCards.add(todo.linked_content_id);
                const group = cardsMap.get(todo.linked_content_id)!;
                if (group.header) {
                    const cardObj = mergedCustomPool.find(c => c.id === todo.linked_content_id) || null;
                    blocks.push({
                        headerTodo: group.header,
                        subTodos: group.subTodos,
                        card: cardObj,
                        linked_content_id: todo.linked_content_id
                    });
                }
            }
        });

        return {
            pendingPlainTodos: pendingPlain,
            cardBlocks: blocks,
            donePlainTodos: donePlain
        };
    }, [todos, mergedCustomPool]);

    const filteredSuggestions = pastSuggestions
        .filter(s => {
            if (!draft.trim()) return true;
            return s.toLowerCase().includes(draft.toLowerCase());
        })
        .filter(s => !todos.some(t => t.text.toLowerCase() === s.toLowerCase()))
        .slice(0, 5);

    const handleAddText = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) { setAddMode(null); setDraft(''); return; }

        const nextOrder = todos.length > 0 ? Math.max(...todos.map(t => t.todo_order)) + 1 : 0;
        const optimistic: StepTodo = {
            id: `tmp-${Date.now()}`,
            session_step_id: stepId,
            text: trimmed,
            done: false,
            todo_order: nextOrder,
            created_at: new Date().toISOString(),
        };
        
        setTodos(prev => [...prev, optimistic]);
        setDraft('');
        setAddMode(null);
        setShowSuggestions(false);

        const res = await addStepTodo(stepId, stageId, trimmed, nextOrder);
        if (res.success && res.todo) {
            setTodos(prev => prev.map(t => t.id === optimistic.id ? res.todo as StepTodo : t));
        } else {
            setTodos(prev => prev.filter(t => t.id !== optimistic.id));
        }
    };

    const handleAddCard = async (card: PedagogicalContent) => {
        setShowCardDrawer(false);
        setSearchQuery('');
        
        // Optimistic header and sub-todos insertion locally
        const startOrder = todos.length > 0 ? Math.max(...todos.map(t => t.todo_order)) + 1 : 0;
        
        const optimisticHeader: StepTodo = {
            id: `tmp-header-${Date.now()}`,
            session_step_id: stepId,
            text: card.question,
            done: false,
            todo_order: startOrder,
            created_at: new Date().toISOString(),
            linked_content_id: card.id,
            is_content_header: true
        };
        
        // Get content todos from card
        // Note: they are already available in customPool card obj? Wait, they are not typically nested inside customPool unless loaded.
        // But wait! If we don't have them in customPool, the DB action will load them and persist them in step_todos.
        // For local optimistic UI, if we don't know the todos yet, they will load from the database refresh.
        // But if they are not in card, we can just insert the header optimistically, then wait for revalidation.
        setTodos(prev => [...prev, optimisticHeader]);

        const res = await addStepPedagogicalCard(stepId, stageId, card.id, startOrder);
        if (!res.success) {
            // Rollback
            setTodos(prev => prev.filter(t => t.linked_content_id !== card.id));
            alert("Erreur lors de l'ajout de la fiche : " + res.error);
        }
    };

    const handleCreatedCard = async (newFiche: PedagogicalContent & { todos: ContentTodo[] }) => {
        setShowCreateDrawer(false);
        
        // Add new custom card to our local pool so it resolves correctly
        setLocalCustomCards(prev => [...prev, newFiche]);

        const startOrder = todos.length > 0 ? Math.max(...todos.map(t => t.todo_order)) + 1 : 0;
        
        const optimisticHeader: StepTodo = {
            id: `tmp-header-${Date.now()}`,
            session_step_id: stepId,
            text: newFiche.question,
            done: false,
            todo_order: startOrder,
            created_at: new Date().toISOString(),
            linked_content_id: newFiche.id,
            is_content_header: true
        };
        
        const optimisticSubTodos: StepTodo[] = (newFiche.todos || []).map((t, idx) => ({
            id: `tmp-sub-${Date.now()}-${idx}`,
            session_step_id: stepId,
            text: t.text,
            done: false,
            todo_order: startOrder + 1 + idx,
            created_at: new Date().toISOString(),
            linked_content_id: newFiche.id,
            is_content_header: false
        }));
        
        setTodos(prev => [...prev, optimisticHeader, ...optimisticSubTodos]);

        const res = await addStepPedagogicalCard(stepId, stageId, newFiche.id, startOrder);
        if (!res.success) {
            setTodos(prev => prev.filter(t => t.linked_content_id !== newFiche.id));
            alert("Erreur lors de l'attribution de la nouvelle fiche : " + res.error);
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

    const handleDeleteCardBlock = async (cardId: string, headerId: string) => {
        setTodos(prev => prev.filter(t => t.linked_content_id !== cardId));
        await deleteStepTodo(headerId, stageId);
    };

    // Filter drawer cards based on search query
    const filteredCustomCards = useMemo(() => {
        return mergedCustomPool.filter(card => {
            const matchesSearch = card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (card.objectif && card.objectif.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [mergedCustomPool, searchQuery]);

    const hasContent = todos.length > 0;

    return (
        <div className="space-y-2 pt-1">
            {/* Main content list */}
            {hasContent && (
                <div className="space-y-2">
                    {/* Pending plain todos */}
                    <AnimatePresence initial={false}>
                        {pendingPlainTodos.map(todo => (
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

                    {/* Card Blocks */}
                    <AnimatePresence initial={false}>
                        {cardBlocks.map(block => (
                            <motion.div
                                key={block.linked_content_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-3.5 space-y-2.5 shadow-sm hover:border-indigo-100 hover:bg-indigo-50/60 transition-all group/card"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between gap-3">
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
                                        onClick={() => { if (block.card) setSelectedCardForDetail(block.card); }}
                                    >
                                        <div className="size-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-sm font-bold">sports</span>
                                        </div>
                                        <span className="text-[12px] font-black text-slate-800 leading-tight italic hover:text-indigo-600 transition-colors truncate">
                                            {block.headerTodo.text}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCardBlock(block.linked_content_id, block.headerTodo.id)}
                                        className="opacity-0 group-hover/card:opacity-100 text-slate-300 hover:text-red-400 transition-all shrink-0 size-5 rounded hover:bg-red-50 flex items-center justify-center"
                                        title="Retirer la fiche sportive"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>

                                {/* Card sub-todos */}
                                {block.subTodos.length > 0 && (
                                    <div className="space-y-1.5 pl-8 border-l border-indigo-100/50 ml-3">
                                        {block.subTodos.map(sub => (
                                            <div key={sub.id} className="flex items-start gap-2 group/sub py-0.5">
                                                <button
                                                    onClick={() => handleToggleDone(sub)}
                                                    className={clsx(
                                                        "size-3.5 rounded mt-0.5 shrink-0 transition-colors flex items-center justify-center border",
                                                        sub.done 
                                                            ? "bg-indigo-500 border-indigo-500 text-white" 
                                                            : "border-slate-300 bg-white hover:border-indigo-400"
                                                    )}
                                                >
                                                    {sub.done && <span className="material-symbols-outlined text-[10px] font-bold">check</span>}
                                                </button>
                                                <span className={clsx(
                                                    "text-[11px] font-semibold leading-relaxed transition-all",
                                                    sub.done ? "text-slate-400 line-through opacity-70" : "text-slate-600"
                                                )}>
                                                    {sub.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Done plain todos */}
                    {donePlainTodos.length > 0 && (
                        <div className="space-y-0.5 opacity-50 pt-1 border-t border-slate-100/50">
                            {donePlainTodos.map(todo => (
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
                </div>
            )}

            {/* Empty state when no content and not adding */}
            {!hasContent && !addMode && !showAddSelector && (
                <button
                    onClick={() => setShowAddSelector(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-[11px] font-semibold group"
                >
                    <span className="material-symbols-outlined text-base text-slate-300 group-hover:text-slate-500">checklist</span>
                    Ajouter du contenu (todos, fiche sportive)…
                </button>
            )}

            {/* Add Content Selector & Inputs */}
            <div className="pt-1">
                {addMode === 'text' ? (
                    <AnimatePresence>
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
                                        if (e.key === 'Enter') handleAddText(draft);
                                        if (e.key === 'Escape') { setAddMode(null); setDraft(''); setShowSuggestions(false); }
                                    }}
                                    onBlur={() => { setTimeout(() => { handleAddText(draft); setShowSuggestions(false); }, 150); }}
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
                                                onMouseDown={e => { e.preventDefault(); handleAddText(s); }}
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
                    </AnimatePresence>
                ) : showAddSelector ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 border border-slate-200/50 rounded-xl w-fit"
                    >
                        <button
                            onClick={() => { setAddMode('text'); setShowAddSelector(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">notes</span>
                            Texte libre
                        </button>
                        <button
                            onClick={() => { setShowCardDrawer(true); setShowAddSelector(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:bg-white hover:text-indigo-800 rounded-lg transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">sports</span>
                            Fiche sportive
                        </button>
                        <button
                            onClick={() => { setShowCreateDrawer(true); setShowAddSelector(false); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:bg-white hover:text-emerald-800 rounded-lg transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            Créer une fiche
                        </button>
                        <button
                            onClick={() => setShowAddSelector(false)}
                            className="size-7 flex items-center justify-center text-slate-400 hover:bg-white rounded-lg transition-all shrink-0"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </motion.div>
                ) : (
                    <button
                        onClick={() => setShowAddSelector(true)}
                        className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Ajouter
                    </button>
                )}
            </div>

            {/* Bottom drawer for Selecting Custom/Sport cards */}
            <AnimatePresence>
                {showCardDrawer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCardDrawer(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3.5rem] z-110 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border-t border-slate-100"
                        >
                            {/* Drawer Header */}
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic">Fiches Sportives</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sélectionner une fiche pour l&apos;ajouter à l&apos;étape</p>
                                </div>
                                <button
                                    onClick={() => { setShowCardDrawer(false); setSearchQuery(''); }}
                                    className="size-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined font-bold">close</span>
                                </button>
                            </div>

                            {/* Search bar */}
                            <div className="px-8 py-4 border-b border-slate-100 bg-white flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Rechercher une fiche sportive..."
                                    className="flex-1 text-sm font-semibold text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-slate-300 hover:text-slate-500 font-bold"
                                    >
                                        <span className="material-symbols-outlined text-sm">clear</span>
                                    </button>
                                )}
                            </div>

                            {/* List scrollable */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                                {filteredCustomCards.length === 0 ? (
                                    <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">inventory_2</span>
                                        <p className="text-slate-400 font-bold italic">
                                            {searchQuery ? "Aucune fiche ne correspond à votre recherche." : "Aucune fiche sportive disponible."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3.5">
                                        {filteredCustomCards.map(card => {
                                            const isLinked = alreadyLinkedIds.has(card.id);
                                            return (
                                                <div
                                                    key={card.id}
                                                    onClick={() => { if (!isLinked) handleAddCard(card); }}
                                                    className={clsx(
                                                        "p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-4",
                                                        isLinked 
                                                            ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed" 
                                                            : "bg-white border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/20 hover:scale-[0.99] active:scale-95"
                                                    )}
                                                >
                                                    <div className="flex gap-4 items-center flex-1 min-w-0">
                                                        <div className={clsx(
                                                            "size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                                            isLinked ? "bg-slate-200 text-slate-400" : "bg-indigo-100 text-indigo-600"
                                                        )}>
                                                            <span className="material-symbols-outlined text-xl">sports</span>
                                                        </div>
                                                        <div className="space-y-0.5 min-w-0 flex-1">
                                                            <h4 className="text-sm font-black text-slate-900 leading-tight truncate">{card.question}</h4>
                                                            <p className="text-[11px] text-slate-400 truncate leading-snug">{card.objectif}</p>
                                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                                {card.ffv_level && (
                                                                    <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">N{card.ffv_level} FFV</span>
                                                                )}
                                                                {(card.supports ?? []).slice(0, 2).map(s => (
                                                                    <span key={s} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{s}</span>
                                                                ))}
                                                                {isLinked && (
                                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded-full ml-auto">
                                                                        Déjà ajouté
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!isLinked && (
                                                        <div className="size-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                                            <span className="material-symbols-outlined text-[18px] font-bold">add</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="h-20" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Fiche Detail Modal */}
            <CardDetailModal
                isOpen={!!selectedCardForDetail}
                onClose={() => setSelectedCardForDetail(null)}
                content={selectedCardForDetail}
            />

            {/* Custom Content Drawer (Creation) */}
            <CustomContentDrawer
                open={showCreateDrawer}
                onClose={() => setShowCreateDrawer(false)}
                onSaved={handleCreatedCard}
            />
        </div>
    );
}
