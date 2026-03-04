'use client';

import { useState, useMemo } from 'react';
import { GameCardDB } from './types';
import GameCard from './GameCard';
import clsx from 'clsx';

type Props = {
    initialGames: GameCardDB[];
};

type GameTypeFilter = 'all' | 'quizz' | 'triage' | 'mots' | 'dilemme';

export default function GameGallery({ initialGames }: Props) {
    const [filter, setFilter] = useState<GameTypeFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGames = useMemo(() => {
        return initialGames.filter(game => {
            const matchesType = filter === 'all' || game.type === filter;
            const matchesSearch = game.theme?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                game.type.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [initialGames, filter, searchQuery]);

    // Group by theme
    const gamesByTheme = useMemo(() => {
        const groups: Record<string, GameCardDB[]> = {};
        filteredGames.forEach(game => {
            const theme = game.theme || 'Général';
            if (!groups[theme]) groups[theme] = [];
            groups[theme].push(game);
        });
        return groups;
    }, [filteredGames]);

    const filterButtons: { label: string; value: GameTypeFilter; icon: string }[] = [
        { label: 'Tous', value: 'all', icon: 'apps' },
        { label: 'Quizz', value: 'quizz', icon: 'quiz' },
        { label: 'Vrai/Faux', value: 'triage', icon: 'rule' },
        { label: 'Mots', value: 'mots', icon: 'edit_note' },
        { label: 'Dilemmes', value: 'dilemme', icon: 'call_split' },
    ];

    return (
        <div className="space-y-8 pb-32">
            {/* Controls */}
            <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md pt-4 pb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {filterButtons.map(btn => (
                            <button
                                key={btn.value}
                                onClick={() => setFilter(btn.value)}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                                    filter === btn.value
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                                        : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                                )}
                            >
                                <span className="material-symbols-outlined text-lg">{btn.icon}</span>
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Rechercher un thème..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="space-y-12">
                {Object.keys(gamesByTheme).length > 0 ? (
                    Object.entries(gamesByTheme).map(([theme, games]) => (
                        <div key={theme} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest italic">{theme}</h2>
                                <div className="h-[2px] flex-1 bg-linear-to-r from-slate-200 to-transparent"></div>
                                <span className="text-xs font-bold text-slate-400">{games.length} jeu(x)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {games.map(game => (
                                    <GameCard key={game.id} game={game} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 scale-150 mb-8">
                            <span className="material-symbols-outlined text-4xl">extension_off</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun jeu trouvé</h3>
                        <p className="text-slate-500 max-w-sm">
                            Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
