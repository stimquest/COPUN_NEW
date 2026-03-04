'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getAllGameCards, createGame, GameData } from '@/actions/game-actions';
import clsx from 'clsx';

type GameCard = {
    id: string;
    type: 'quizz' | 'triage' | 'mots' | 'dilemme';
    theme: string;
    data: Record<string, unknown>;
};

const GAME_TYPES = [
    { value: 'quizz', label: 'Le Grand Quizz', icon: 'quiz', color: 'bg-blue-500' },
    { value: 'triage', label: 'Le Triage Côtier', icon: 'rule', color: 'bg-green-500' },
    { value: 'mots', label: 'Les Mots en Rafale', icon: 'edit_note', color: 'bg-amber-500' },
    { value: 'dilemme', label: 'Le Dilemme du Marin', icon: 'call_split', color: 'bg-purple-500' },
];

const THEMES = [
    'Marées', 'Météo', 'Navigation', 'Sécurité', 'Biodiversité',
    'Environnement', 'Matériel', 'Réglementation', 'Général'
];

export default function GeneratorClient({ initialCards }: { initialCards: GameCard[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Mode: 'auto' or 'manual'
    const [mode, setMode] = useState<'auto' | 'manual'>('auto');

    // Auto mode settings
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['quizz', 'triage', 'mots', 'dilemme']);
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [cardCount, setCardCount] = useState(10);

    // Manual mode: selected card IDs
    const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

    // Game title
    const [title, setTitle] = useState('');

    // Filter cards for display
    const filteredCards = useMemo(() => {
        return initialCards.filter(card => {
            if (selectedTypes.length > 0 && !selectedTypes.includes(card.type)) return false;
            if (selectedThemes.length > 0 && !selectedThemes.includes(card.theme)) return false;
            return true;
        });
    }, [initialCards, selectedTypes, selectedThemes]);

    // Unique themes from cards
    const availableThemes = useMemo(() => {
        const themes = new Set(initialCards.map(c => c.theme).filter(Boolean));
        return Array.from(themes).sort();
    }, [initialCards]);

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleTheme = (theme: string) => {
        setSelectedThemes(prev =>
            prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
        );
    };

    const toggleCard = (cardId: string) => {
        setSelectedCardIds(prev => {
            const next = new Set(prev);
            if (next.has(cardId)) {
                next.delete(cardId);
            } else {
                next.add(cardId);
            }
            return next;
        });
    };

    const handleCreate = async () => {
        // Determine cards to use
        let cardsToUse: GameCard[];
        if (mode === 'auto') {
            // Shuffle and slice
            const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
            cardsToUse = shuffled.slice(0, cardCount);
        } else {
            cardsToUse = initialCards.filter(c => selectedCardIds.has(c.id));
        }

        if (cardsToUse.length === 0) {
            alert('Sélectionnez au moins une carte !');
            return;
        }

        // Build game data structure
        const gameData: GameData = {};

        const triageCards = cardsToUse.filter(c => c.type === 'triage');
        const motsCards = cardsToUse.filter(c => c.type === 'mots');
        const dilemmeCards = cardsToUse.filter(c => c.type === 'dilemme');
        const quizzCards = cardsToUse.filter(c => c.type === 'quizz');

        if (triageCards.length > 0) {
            gameData.triageCotier = {
                title: 'Le Triage Côtier',
                instruction: 'Démêlez le vrai du faux ! Pour chaque affirmation, indiquez si elle est vraie ou fausse.',
                items: triageCards.map(c => c.data)
            };
        }
        if (motsCards.length > 0) {
            gameData.motsEnRafale = {
                title: 'Les Mots en Rafale',
                instruction: 'Trouvez le mot correspondant à chaque définition.',
                items: motsCards.map(c => c.data)
            };
        }
        if (dilemmeCards.length > 0) {
            gameData.dilemmeDuMarin = {
                title: 'Le Dilemme du Marin',
                instruction: 'Face à ces situations, que choisiriez-vous ?',
                items: dilemmeCards.map(c => c.data)
            };
        }
        if (quizzCards.length > 0) {
            gameData.leGrandQuizz = {
                title: 'Le Grand Quizz',
                instruction: 'Testez vos connaissances avec ces questions à choix multiples.',
                items: quizzCards.map(c => c.data)
            };
        }

        const gameTitle = title || `Jeu du ${new Date().toLocaleDateString('fr-FR')}`;
        const gameTheme = selectedThemes.length === 1 ? selectedThemes[0] : 'Mixte';

        startTransition(async () => {
            const result = await createGame(gameTitle, gameTheme, null, gameData);
            if (result.success && result.gameId) {
                router.push(`/jeux/${result.gameId}`);
            } else {
                alert('Erreur lors de la création: ' + result.error);
            }
        });
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 rounded-full p-1 w-fit">
                <button
                    onClick={() => setMode('auto')}
                    className={clsx(
                        'px-6 py-2 rounded-full font-bold transition-all',
                        mode === 'auto' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">shuffle</span>
                        Auto
                    </span>
                </button>
                <button
                    onClick={() => setMode('manual')}
                    className={clsx(
                        'px-6 py-2 rounded-full font-bold transition-all',
                        mode === 'manual' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">checklist</span>
                        Manuel
                    </span>
                </button>
            </div>

            {/* Title Input */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Titre du jeu (optionnel)</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Quiz Marées Niveau 1"
                    className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* Type Filters */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Types de cartes</label>
                <div className="flex flex-wrap gap-2">
                    {GAME_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => toggleType(type.value)}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all',
                                selectedTypes.includes(type.value)
                                    ? `${type.color} text-white shadow-lg`
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                            )}
                        >
                            <span className="material-symbols-outlined text-lg">{type.icon}</span>
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme Filters */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Thèmes (optionnel)</label>
                <div className="flex flex-wrap gap-2">
                    {availableThemes.map(theme => (
                        <button
                            key={theme}
                            onClick={() => toggleTheme(theme)}
                            className={clsx(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                selectedThemes.includes(theme)
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                        >
                            {theme}
                        </button>
                    ))}
                </div>
            </div>

            {/* Auto Mode: Card Count Slider */}
            {mode === 'auto' && (
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Nombre de cartes: <span className="text-indigo-600">{cardCount}</span>
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={Math.min(50, filteredCards.length)}
                        value={cardCount}
                        onChange={e => setCardCount(Number(e.target.value))}
                        className="w-full max-w-md"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                        {filteredCards.length} cartes disponibles avec les filtres actuels
                    </p>
                </div>
            )}

            {/* Manual Mode: Card Selection */}
            {mode === 'manual' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-bold text-slate-700">
                            Sélectionnez les cartes ({selectedCardIds.size} sélectionnées)
                        </label>
                        <button
                            onClick={() => setSelectedCardIds(new Set())}
                            className="text-sm text-slate-500 hover:text-red-500"
                        >
                            Tout désélectionner
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                        {filteredCards.map(card => {
                            const isSelected = selectedCardIds.has(card.id);
                            const typeInfo = GAME_TYPES.find(t => t.value === card.type);
                            return (
                                <button
                                    key={card.id}
                                    onClick={() => toggleCard(card.id)}
                                    className={clsx(
                                        'p-4 rounded-xl border-2 text-left transition-all',
                                        isSelected
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={clsx('size-6 rounded-full flex items-center justify-center text-white text-xs', typeInfo?.color)}>
                                            <span className="material-symbols-outlined text-sm">{typeInfo?.icon}</span>
                                        </span>
                                        <span className="text-xs font-bold text-slate-500 uppercase">{card.type}</span>
                                        {card.theme && (
                                            <span className="text-xs text-slate-400">• {card.theme}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 line-clamp-2">
                                        {(card.data as Record<string, string>).question ||
                                            (card.data as Record<string, string>).statement ||
                                            (card.data as Record<string, string>).definition ||
                                            'Carte'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Create Button */}
            <div className="pt-6">
                <button
                    onClick={handleCreate}
                    disabled={isPending || (mode === 'manual' && selectedCardIds.size === 0)}
                    className={clsx(
                        'px-8 py-4 rounded-xl font-bold text-lg transition-all',
                        isPending || (mode === 'manual' && selectedCardIds.size === 0)
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    )}
                >
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Création...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined">play_arrow</span>
                            Créer et Jouer
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
