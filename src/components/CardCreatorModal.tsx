'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { createPedagogicalContent } from '@/actions/content-actions';
import { PILLARS, THEMES_BY_PILLAR } from '@/data/etages';
import { Dimension } from '@/types';

type CardCreatorModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
};

export default function CardCreatorModal({ isOpen, onClose, onCreated }: CardCreatorModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [question, setQuestion] = useState('');
    const [objectif, setObjectif] = useState('');
    const [tip, setTip] = useState('');
    const [level, setLevel] = useState<1 | 2 | 3>(1);
    const [dimension, setDimension] = useState<Dimension>('COMPRENDRE');
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const handleSubmit = async () => {
        if (!question || !objectif || !tip) return;

        setLoading(true);
        const result = await createPedagogicalContent({
            question,
            objectif,
            tip,
            niveau: level,
            dimension,
            tags_theme: selectedThemes,
            tags_filtre: tags
        });

        setLoading(false);

        if (result.success) {
            onCreated();
            onClose();
            // Reset form
            setStep(1);
            setQuestion('');
            setObjectif('');
            setTip('');
            setTags([]);
            setSelectedThemes([]);
        } else {
            alert(result.error || "Erreur lors de la création");
        }
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-black uppercase text-slate-800">Créer une fiche</h2>
                        <button onClick={onClose} className="size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-100 w-full">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">L&apos;Accroche (Question)</label>
                                    <textarea
                                        value={question}
                                        onChange={e => setQuestion(e.target.value)}
                                        placeholder="Ex: Pourquoi la mer est salée ?"
                                        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:outline-none font-bold text-slate-700 min-h-[100px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Le Pourquoi (Objectif Pédago)</label>
                                    <textarea
                                        value={objectif}
                                        onChange={e => setObjectif(e.target.value)}
                                        placeholder="Ex: Comprendre le cycle de l'eau..."
                                        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:outline-none font-medium text-slate-600 min-h-[80px]"
                                    />
                                </div>
                                <button
                                    disabled={!question || !objectif}
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Le Comment (Tips Terrain)</label>
                                    <textarea
                                        value={tip}
                                        onChange={e => setTip(e.target.value)}
                                        placeholder="Ex: Utiliser un seau pour montrer l'évaporation..."
                                        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:outline-none font-medium text-slate-600 min-h-[100px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Dimension</label>
                                    <div className="flex gap-2">
                                        {['COMPRENDRE', 'OBSERVER', 'PROTÉGER'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDimension(d as Dimension)}
                                                className={clsx(
                                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2",
                                                    dimension === d
                                                        ? (d === 'COMPRENDRE' ? "bg-amber-50 border-amber-400 text-amber-600" : d === 'OBSERVER' ? "bg-blue-50 border-blue-400 text-blue-600" : "bg-emerald-50 border-emerald-400 text-emerald-600")
                                                        : "bg-white border-slate-100 text-slate-400"
                                                )}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Retour</button>
                                    <button
                                        disabled={!tip}
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Niveau</label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        {[1, 2, 3].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => setLevel(lvl as 1 | 2 | 3)}
                                                className={clsx("flex-1 py-2 rounded-lg text-xs font-black transition-all", level === lvl ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}
                                            >
                                                Niveau {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Thématiques</label>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                        {PILLARS.map(p => THEMES_BY_PILLAR[p.id].map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setSelectedThemes(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                                                className={clsx(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold border transition-all",
                                                    selectedThemes.includes(t.id) ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-400"
                                                )}
                                            >
                                                {t.label}
                                            </button>
                                        )))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mots-clés (Entrée pour ajouter)</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="bg-slate-800 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1">
                                                {tag}
                                                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-300"><span className="material-symbols-outlined text-[10px]">close</span></button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="Ajouter un tag..."
                                        className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:outline-none text-sm font-bold"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Retour</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span>Créer la fiche</span>}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
