'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { generateStageQuiz } from '@/actions/quiz-actions';

type Props = {
    stageId: string;
    stageTitle: string;
};

const QUESTION_OPTIONS = [3, 5, 7, 10];

const THEME_OPTIONS = [
    { value: 'auto', label: 'Automatique', description: 'Basé sur les thèmes de vos fiches pédagogiques', icon: 'auto_awesome' },
    { value: 'Les Marées', label: 'Les Marées', description: 'Flot, jusant, coefficients, étale…', icon: 'waves' },
    { value: 'Météo & Marées', label: 'Météo & Marées', description: 'Vent, nuages, brise thermique…', icon: 'cloud' },
    { value: 'Caractéristiques du littoral', label: 'Littoral', description: 'Estran, dunes, laisse de mer…', icon: 'beach_access' },
    { value: 'Observation Sensorielle', label: 'Observation', description: 'Lire la mer, repérer, observer…', icon: 'visibility' },
    { value: 'Général', label: 'Général', description: 'Biodiversité, environnement, gestes…', icon: 'eco' },
];

export default function QuizLaunchClient({ stageId, stageTitle }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [questionCount, setQuestionCount] = useState(5);
    const [selectedTheme, setSelectedTheme] = useState('auto');
    const [error, setError] = useState<string | null>(null);

    const handleLaunch = () => {
        setError(null);
        startTransition(async () => {
            const result = await generateStageQuiz(stageId, questionCount, selectedTheme === 'auto' ? null : selectedTheme);
            if (result.success && result.gameId) {
                router.push(`/jeux/${result.gameId}`);
            } else {
                setError(result.error ?? 'Erreur lors de la génération du quiz.');
            }
        });
    };

    return (
        <div className="flex-1 flex flex-col px-5 pt-8 pb-32 max-w-lg mx-auto w-full gap-8">

            {/* Intro */}
            <div className="text-center">
                <div className="size-20 rounded-3xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-4xl text-violet-400">quiz</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Quiz de fin de stage</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Posez ces questions à votre groupe pour valider ce qu&apos;ils ont retenu.
                    Les réponses des enfants valident vos points de moniteur.
                </p>
            </div>

            {/* Nombre de questions */}
            <section>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Nombre de questions
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {QUESTION_OPTIONS.map(n => (
                        <button
                            key={n}
                            onClick={() => setQuestionCount(n)}
                            className={clsx(
                                'py-4 rounded-2xl font-black text-xl transition-all active:scale-95',
                                questionCount === n
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
                            )}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </section>

            {/* Thème */}
            <section>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Thème des questions
                </p>
                <div className="space-y-2">
                    {THEME_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedTheme(opt.value)}
                            className={clsx(
                                'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.98] border-2',
                                selectedTheme === opt.value
                                    ? 'bg-violet-600/20 border-violet-500 text-white'
                                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                            )}
                        >
                            <span className={clsx(
                                'size-9 rounded-xl flex items-center justify-center shrink-0',
                                selectedTheme === opt.value ? 'bg-violet-500/30' : 'bg-white/10'
                            )}>
                                <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm">{opt.label}</p>
                                <p className="text-[11px] text-slate-400 truncate">{opt.description}</p>
                            </div>
                            {selectedTheme === opt.value && (
                                <span className="material-symbols-outlined text-violet-400 shrink-0">check_circle</span>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Erreur */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-400 shrink-0 mt-0.5">error</span>
                    <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
            )}

            {/* Barème rappel */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vos points</p>
                {[
                    { label: 'Quiz complété', pts: '8 pts' },
                    { label: 'Score du groupe 70-85%', pts: '+1 pt' },
                    { label: 'Score du groupe 85-100%', pts: '+2 pts' },
                ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                        <span className="text-xs font-black text-violet-400">{item.pts}</span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <button
                onClick={handleLaunch}
                disabled={isPending}
                className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {isPending ? (
                    <>
                        <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                        Génération en cours…
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                        Lancer le quiz — {questionCount} questions
                    </>
                )}
            </button>
        </div>
    );
}
