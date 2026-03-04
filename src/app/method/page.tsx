'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { MOCK_PEDAGOGICAL_CONTENT } from '@/data/mockData';
import { Dimension } from '@/types';

const PILLARS: { id: Dimension; label: string; color: string; icon: string }[] = [
    { id: 'COMPRENDRE', label: 'Comprendre', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: 'psychology' },
    { id: 'OBSERVER', label: 'Observer', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: 'visibility' },
    { id: 'PROTÉGER', label: 'Protéger', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: 'shield' },
];

const THEMES_BY_PILLAR: Record<Dimension, string[]> = {
    'COMPRENDRE': ['caracteristiques_littoral', 'activites_humaines', 'biodiversite_saisonnalite'],
    'OBSERVER': ['lecture_paysage', 'reperes_spatio_temporels', 'interactions_climatiques'],
    'PROTÉGER': ['impact_presence_humaine', 'cohabitation_vivant', 'sciences_participatives'],
};

export default function MethodPage() {
    const [activePillar, setActivePillar] = useState<Dimension>('COMPRENDRE');

    const activeThemes = THEMES_BY_PILLAR[activePillar];
    const activeCards = MOCK_PEDAGOGICAL_CONTENT.filter(c => c.dimension === activePillar);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-28">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <h1 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">La Méthode</h1>
                <p className="text-xl font-black leading-none text-slate-900 mt-1">Bibliothèque COPUN</p>
            </header>

            <main className="flex-1 px-4 py-6 space-y-6">

                {/* PILLAR TABS */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {PILLARS.map(pillar => (
                        <button
                            key={pillar.id}
                            onClick={() => setActivePillar(pillar.id)}
                            className={clsx(
                                "flex items-center gap-2 px-5 py-3 rounded-full border transition-all shrink-0",
                                activePillar === pillar.id
                                    ? `bg-white shadow-md border-transparent ring-2 ${pillar.id === 'COMPRENDRE' ? 'ring-indigo-500' : pillar.id === 'OBSERVER' ? 'ring-emerald-500' : 'ring-amber-500'}`
                                    : "bg-white border-slate-200 opacity-60 hover:opacity-100"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined text-[20px]",
                                pillar.id === 'COMPRENDRE' ? 'text-indigo-600' : pillar.id === 'OBSERVER' ? 'text-emerald-600' : 'text-amber-600'
                            )}>
                                {pillar.icon}
                            </span>
                            <span className={clsx("font-black text-sm uppercase tracking-wide text-slate-900")}>
                                {pillar.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* THEMES & CONTENT */}
                <div className="space-y-8">
                    {activeThemes.map(theme => {
                        const cards = activeCards.filter(c => c.tags_theme.includes(theme));
                        if (cards.length === 0) return null;

                        return (
                            <section key={theme} className="space-y-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 border-l-2 border-slate-300 pl-3">
                                    {theme.replace(/_/g, ' ')}
                                </h3>

                                <div className="grid gap-4">
                                    {cards.map(card => (
                                        <div key={card.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-transform">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={clsx(
                                                    "text-[10px] font-black uppercase px-2 py-1 rounded-md",
                                                    activePillar === 'COMPRENDRE' ? "bg-indigo-50 text-indigo-700" :
                                                        activePillar === 'OBSERVER' ? "bg-emerald-50 text-emerald-700" :
                                                            "bg-amber-50 text-amber-700"
                                                )}>
                                                    Niveau {card.niveau}
                                                </span>
                                                <div className="flex gap-1">
                                                    {card.tags_filtre.map(tag => (
                                                        <span key={tag} className="text-[9px] font-bold text-slate-400 uppercase border border-slate-100 px-1.5 py-0.5 rounded-full">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2">
                                                {card.question}
                                            </h4>

                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                                                <p className="text-sm font-medium text-slate-700">{card.objectif}</p>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-yellow-50/50 p-2 rounded-lg border border-yellow-100/50">
                                                <span className="material-symbols-outlined text-amber-400 text-[16px] filled-icon">lightbulb</span>
                                                <span className="italic">&quot;{card.tip}&quot;</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

            </main >
        </div >
    );
}
