'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { saveStageGameResult, saveQuizAttempt } from '@/actions/game-actions';
import { awardStageQuizPoints } from '@/actions/quiz-actions';
import { computeQuizPoints } from '@/lib/quiz-points';

type GameItemData = Record<string, unknown>;

type GameSection = { title: string; instruction: string; items: GameItemData[] };

type GameData = {
    triageCotier?: GameSection;
    motsEnRafale?: GameSection;
    dilemmeDuMarin?: GameSection;
    leGrandQuizz?: GameSection;
};

type Game = {
    id: string;
    title: string;
    theme: string;
    stage_id: string | null;
    game_data: GameData;
};

type CardItem = {
    type: 'triage' | 'mots' | 'dilemme' | 'quizz';
    sectionTitle: string;
    data: GameItemData;
};

type AnswerRecord = { answer: unknown; correct: boolean };

export default function PlayClient({ game }: { game: Game }) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<Record<number, AnswerRecord>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Flatten all cards into a single array with type info
    const allCards = useMemo(() => {
        const cards: CardItem[] = [];
        const gd = game.game_data;

        if (gd.triageCotier?.items) {
            gd.triageCotier.items.forEach(item => {
                cards.push({ type: 'triage', sectionTitle: gd.triageCotier!.title, data: item });
            });
        }
        if (gd.motsEnRafale?.items) {
            gd.motsEnRafale.items.forEach(item => {
                cards.push({ type: 'mots', sectionTitle: gd.motsEnRafale!.title, data: item });
            });
        }
        if (gd.dilemmeDuMarin?.items) {
            gd.dilemmeDuMarin.items.forEach(item => {
                cards.push({ type: 'dilemme', sectionTitle: gd.dilemmeDuMarin!.title, data: item });
            });
        }
        if (gd.leGrandQuizz?.items) {
            gd.leGrandQuizz.items.forEach(item => {
                cards.push({ type: 'quizz', sectionTitle: gd.leGrandQuizz!.title, data: item });
            });
        }

        // Return cards in consistent order (no shuffle to avoid React impurity)
        return cards;
    }, [game.game_data]);

    const currentCard = allCards[currentIndex];
    const totalCards = allCards.length;
    const progress = ((currentIndex + 1) / totalCards) * 100;

    const handleAnswer = (answer: unknown, correct: boolean) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: { answer, correct } }));
        setIsCorrect(correct);
        setShowFeedback(true);
        if (correct) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = async () => {
        setShowFeedback(false);
        if (currentIndex < totalCards - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            const finalScore = score;
            setIsFinished(true);
            if (game.stage_id) {
                await saveStageGameResult(game.stage_id, game.id, finalScore, totalCards, answers);
                // Si c'est un quiz de bilan, on attribue les points moniteur
                if (game.game_data.leGrandQuizz) {
                    await awardStageQuizPoints(game.stage_id, game.id, finalScore, totalCards);
                }
            }
            await saveQuizAttempt(game.theme || 'Mixte', finalScore, totalCards);
        }
    };

    if (isFinished) {
        const finalScore = score;
        const percentage = Math.round((finalScore / totalCards) * 100);
        const pointsAwarded = computeQuizPoints(finalScore, totalCards);
        const isStageQuiz = !!game.game_data.leGrandQuizz && !!game.stage_id;
        const isExcellent = percentage >= 85;
        const isGood = percentage >= 70;

        // Écran félicitations élèves pour les quiz de bilan de stage
        if (isStageQuiz) {
            return (
                <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                    {/* Étoiles animées */}
                    <div className="relative mb-8">
                        <div className={clsx(
                            'size-36 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl mx-auto',
                            isExcellent ? 'border-amber-400 bg-amber-500/20 shadow-amber-500/30' :
                                isGood ? 'border-emerald-400 bg-emerald-500/20 shadow-emerald-500/30' :
                                    'border-slate-500 bg-slate-800 shadow-slate-700/30'
                        )}>
                            <span className="text-5xl mb-1">
                                {isExcellent ? '🏆' : isGood ? '⭐' : '💪'}
                            </span>
                            <span className={clsx(
                                'text-2xl font-black',
                                isExcellent ? 'text-amber-400' : isGood ? 'text-emerald-400' : 'text-slate-400'
                            )}>{percentage}%</span>
                        </div>
                    </div>

                    {/* Message groupe collectif */}
                    <h2 className={clsx(
                        'text-3xl font-black uppercase tracking-tight mb-2',
                        isExcellent ? 'text-amber-400' : isGood ? 'text-emerald-400' : 'text-slate-300'
                    )}>
                        {isExcellent ? 'Tes stagiaires sont de vraies sentinelles de l\'Océan !' : isGood ? 'Tes stagiaires ont brillamment joué !' : 'Tes stagiaires ont bien progressé !'}
                    </h2>
                    <p className="text-slate-400 font-medium mb-2">
                        Vous avez obtenu {finalScore} bonne{finalScore > 1 ? 's' : ''} réponse{finalScore > 1 ? 's' : ''} sur {totalCards}
                    </p>

                    {/* Message adapté */}
                    <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-10">
                        {isExcellent
                            ? 'Ensemble, vous avez retenu l\'essentiel de la semaine. Tes stagiaires sont prêts à devenir ambassadeurs du littoral !'
                            : isGood
                                ? 'Tes stagiaires ont bien assimilé les notions essentielles. Continuez ainsi, vous êtes sur la bonne vague !'
                                : 'Certaines notions méritent d\'être revues ensemble. Chaque semaine est un pas de plus vers la conscience du littoral.'}
                    </p>

                    {/* Points de la semaine */}
                    <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl px-8 py-5 flex flex-col items-center gap-1 mb-8 w-full max-w-xs">
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Points gagnés pour cette semaine</p>
                        <span className="text-5xl font-black text-white">+{pointsAwarded}</span>
                        <p className="text-xs text-indigo-400 font-medium">ajoutés à votre banque de points moniteur</p>
                    </div>

                    <button
                        onClick={() => router.push(`/stages/${game.stage_id}/bilan`)}
                        className="w-full max-w-xs px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                    >
                        Passer au bilan de la semaine
                    </button>
                </div>
            );
        }

        // Écran standard pour les jeux libres
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
                    <div className={clsx(
                        'size-24 rounded-full flex items-center justify-center mx-auto mb-6',
                        percentage >= 70 ? 'bg-green-100 text-green-600' :
                            percentage >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    )}>
                        <span className="material-symbols-outlined text-5xl">
                            {percentage >= 70 ? 'emoji_events' : percentage >= 50 ? 'thumb_up' : 'sentiment_dissatisfied'}
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Terminé !</h2>
                    <p className="text-6xl font-black text-indigo-600 mb-2">{percentage}%</p>
                    <p className="text-slate-500 mb-8">{finalScore} / {totalCards} bonnes réponses</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/jeux')}
                            className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                        >
                            Retour aux Jeux
                        </button>
                        {game.stage_id && (
                            <button
                                onClick={() => router.push('/stages')}
                                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                            >
                                Retour au Stage
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-4 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                    {/* Retour vers le choix du registre (enfants / adultes) et des réglages
                        du quiz — sans lui, un quiz déjà lancé était un cul-de-sac : rien ne
                        permettait de changer de public une fois arrivé ici. */}
                    {game.stage_id && game.game_data.leGrandQuizz && (
                        <button
                            onClick={() => router.push(`/stages/${game.stage_id}/quiz`)}
                            aria-label="Changer les réglages du quiz"
                            className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                    )}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg font-bold text-slate-900 truncate">{game.title}</h1>
                        <p className="text-sm text-slate-500">{currentCard?.sectionTitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-2xl font-black text-indigo-600">{currentIndex + 1}/{totalCards}</p>
                        <p className="text-sm text-slate-500">Score: {score}</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="max-w-3xl mx-auto mt-3">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Card Content — scrollable, padded so content never hides behind fixed button */}
            <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
                <div className="bg-white rounded-3xl shadow-xl p-6 max-w-2xl mx-auto w-full">
                    {currentCard?.type === 'triage' && (
                        <TriageCard
                            key={currentIndex}
                            data={currentCard.data as { statement: string; isTrue: boolean }}
                            onAnswer={handleAnswer}
                            showFeedback={showFeedback}
                            isCorrect={isCorrect}
                        />
                    )}
                    {currentCard?.type === 'quizz' && (
                        <QuizzCard
                            key={currentIndex}
                            data={currentCard.data as { question: string; answers?: string[]; options?: string[]; correctAnswerIndex?: number; correctAnswer?: number; explanation?: string }}
                            onAnswer={handleAnswer}
                            showFeedback={showFeedback}
                        />
                    )}
                    {currentCard?.type === 'mots' && (
                        <MotsCard
                            key={currentIndex}
                            data={currentCard.data as { definition: string; answer: string }}
                            onAnswer={handleAnswer}
                            showFeedback={showFeedback}
                        />
                    )}
                    {currentCard?.type === 'dilemme' && (
                        <DilemmeCard
                            key={currentIndex}
                            data={currentCard.data as { optionA: string; optionB: string; explanation: string }}
                            onAnswer={handleAnswer}
                            showFeedback={showFeedback}
                        />
                    )}
                </div>
            </main>

            {/* Bouton Suivant — toujours visible, ancré en bas */}
            {showFeedback && (
                <div className="above-nav fixed left-0 right-0 z-40 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-slate-50/95 backdrop-blur-sm border-t border-slate-200">
                    <button
                        onClick={handleNext}
                        className="w-full max-w-2xl mx-auto block px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {currentIndex < totalCards - 1 ? 'Suivant →' : 'Voir les Résultats'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ==========================================
// Card Components
// ==========================================

function TriageCard({ data, onAnswer, showFeedback, isCorrect }: {
    data: { statement: string; isTrue: boolean };
    onAnswer: (answer: boolean, correct: boolean) => void;
    showFeedback: boolean;
    isCorrect: boolean;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="size-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined text-lg">rule</span>
                </span>
                <span className="text-sm font-bold text-green-600 uppercase">Vrai ou Faux</span>
            </div>
            <p className="text-xl font-medium text-slate-900 mb-8">{data.statement}</p>

            {!showFeedback ? (
                <div className="flex gap-4">
                    <button
                        onClick={() => onAnswer(true, data.isTrue === true)}
                        className="flex-1 py-4 bg-green-100 text-green-700 rounded-xl font-bold text-lg hover:bg-green-200 transition"
                    >
                        Vrai
                    </button>
                    <button
                        onClick={() => onAnswer(false, data.isTrue === false)}
                        className="flex-1 py-4 bg-red-100 text-red-700 rounded-xl font-bold text-lg hover:bg-red-200 transition"
                    >
                        Faux
                    </button>
                </div>
            ) : (
                <div className={clsx(
                    'p-4 rounded-xl text-center',
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}>
                    <span className="material-symbols-outlined text-3xl mb-2">
                        {isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                    <p className="font-bold">{isCorrect ? 'Correct !' : 'Incorrect'}</p>
                    <p className="text-sm mt-1">La réponse était: {data.isTrue ? 'Vrai' : 'Faux'}</p>
                </div>
            )}
        </div>
    );
}

function QuizzCard({ data, onAnswer, showFeedback }: {
    data: { question: string; answers?: string[]; options?: string[]; correctAnswerIndex?: number; correctAnswer?: number; explanation?: string };
    onAnswer: (answer: number, correct: boolean) => void;
    showFeedback: boolean;
}) {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    // Mélange l'ordre des réponses à l'affichage, indépendamment de l'ordre en base —
    // certaines données historiques plaçaient systématiquement la bonne réponse en 2e
    // position. Mélange stable pour la durée de vie de la question (recalculé seulement
    // si la question elle-même change), pour ne pas rebattre les cartes à chaque re-render.
    const { answerOptions, correctIndex } = useMemo(() => {
        const rawAnswers = data.answers || data.options || [];
        const rawCorrectIndex = data.correctAnswerIndex ?? data.correctAnswer ?? 0;
        const order = rawAnswers.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        return {
            answerOptions: order.map(i => rawAnswers[i]),
            correctIndex: order.indexOf(rawCorrectIndex),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.question]);

    const handleSelect = (index: number) => {
        if (showFeedback) return;
        setSelectedAnswer(index);
        onAnswer(index, index === correctIndex);
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-lg">quiz</span>
                </span>
                <span className="text-sm font-bold text-blue-600 uppercase">Quizz</span>
            </div>
            <p className="text-xl font-medium text-slate-900 mb-6">{data.question || 'Question non disponible'}</p>

            {answerOptions.length === 0 ? (
                <p className="text-slate-500 italic">Aucune option de réponse disponible</p>
            ) : (
                <div className="space-y-3">
                    {answerOptions.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(index)}
                            disabled={showFeedback}
                            className={clsx(
                                'w-full p-4 rounded-xl text-left font-medium transition',
                                showFeedback
                                    ? index === correctIndex
                                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                        : selectedAnswer === index
                                            ? 'bg-red-100 text-red-700 border-2 border-red-500'
                                            : 'bg-slate-100 text-slate-500'
                                    : selectedAnswer === index
                                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            )}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}

            {showFeedback && data.explanation && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl text-blue-700 text-sm">
                    <span className="font-bold">Explication:</span> {data.explanation}
                </div>
            )}
        </div>
    );
}

function MotsCard({ data, onAnswer, showFeedback }: {
    data: { definition: string; answer: string };
    onAnswer: (answer: string, correct: boolean) => void;
    showFeedback: boolean;
}) {
    const handleReveal = () => {
        // Animateur valide verbalement - on marque toujours comme correct
        onAnswer(data.answer, true);
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="size-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined text-lg">edit_note</span>
                </span>
                <span className="text-sm font-bold text-amber-600 uppercase">Mots en Rafale</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <p className="text-sm text-slate-500 mb-2 uppercase font-bold">Définition :</p>
                <p className="text-2xl font-medium text-slate-900">{data.definition}</p>
            </div>

            {!showFeedback ? (
                <button
                    onClick={handleReveal}
                    className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-lg hover:bg-amber-600 transition flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">visibility</span>
                    Révéler la Réponse
                </button>
            ) : (
                <div className="p-6 bg-amber-100 rounded-xl text-center">
                    <p className="text-sm text-amber-600 uppercase font-bold mb-2">Réponse :</p>
                    <p className="text-3xl font-black text-amber-800">{data.answer}</p>
                </div>
            )}
        </div>
    );
}

function DilemmeCard({ data, onAnswer, showFeedback }: {
    data: { optionA: string; optionB: string; explanation: string };
    onAnswer: (answer: string, correct: boolean) => void;
    showFeedback: boolean;
}) {
    const [selected, setSelected] = useState<'A' | 'B' | null>(null);

    const handleSelect = (choice: 'A' | 'B') => {
        setSelected(choice);
        onAnswer(choice, true); // Dilemmes have no wrong answer
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="size-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <span className="material-symbols-outlined text-lg">call_split</span>
                </span>
                <span className="text-sm font-bold text-purple-600 uppercase">Dilemme</span>
            </div>
            <p className="text-lg font-medium text-slate-900 mb-6">Que choisiriez-vous ?</p>

            {!showFeedback ? (
                <div className="space-y-4">
                    <button
                        onClick={() => handleSelect('A')}
                        className="w-full p-4 bg-slate-100 rounded-xl text-left hover:bg-purple-100 transition"
                    >
                        <span className="font-bold text-purple-600">A.</span> {data.optionA}
                    </button>
                    <button
                        onClick={() => handleSelect('B')}
                        className="w-full p-4 bg-slate-100 rounded-xl text-left hover:bg-purple-100 transition"
                    >
                        <span className="font-bold text-purple-600">B.</span> {data.optionB}
                    </button>
                </div>
            ) : (
                <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="font-bold text-purple-700 mb-2">Vous avez choisi: {selected}</p>
                    <p className="text-purple-600 text-sm">{data.explanation}</p>
                </div>
            )}
        </div>
    );
}
