'use client';

import { useState } from 'react';
import { GameCardDB, QuizzData, TriageData, MotsData, DilemmeData } from './types';
import QuizzComponent from '@/components/games/QuizzComponent';
import TriageComponent from '@/components/games/TriageComponent';
import MotsComponent from '@/components/games/MotsComponent';
import DilemmeComponent from '@/components/games/DilemmeComponent';
import { submitGameResult } from '@/actions/game-actions';

type GameCardProps = {
    game: GameCardDB;
};

export default function GameCard({ game }: GameCardProps) {
    const [completed, setCompleted] = useState(false);

    const handleComplete = async (result: unknown) => {
        setCompleted(true);
        await submitGameResult(game.id, result);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-50/50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500 text-lg">
                        {game.type === 'quizz' ? 'quiz' :
                            game.type === 'triage' ? 'rule' :
                                game.type === 'mots' ? 'edit_note' : 'call_split'}
                    </span>
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">
                        {game.theme || 'Jeu'}
                    </span>
                </div>
                {completed && (
                    <span className="text-emerald-500 material-symbols-outlined text-lg">check_circle</span>
                )}
            </div>

            <div className="p-5">
                {game.type === 'quizz' && (
                    <QuizzComponent data={game.data as QuizzData} onComplete={handleComplete} isCompleted={completed} />
                )}
                {game.type === 'triage' && (
                    <TriageComponent data={game.data as TriageData} onComplete={handleComplete} />
                )}
                {game.type === 'mots' && (
                    <MotsComponent data={game.data as MotsData} onComplete={handleComplete} />
                )}
                {game.type === 'dilemme' && (
                    <DilemmeComponent data={game.data as DilemmeData} onComplete={handleComplete} />
                )}
            </div>
        </div>
    );
}
