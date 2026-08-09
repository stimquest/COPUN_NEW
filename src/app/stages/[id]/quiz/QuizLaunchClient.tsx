'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { generateStageQuiz } from '@/actions/quiz-actions';

type Props = {
    stageId: string;
    stageTitle: string;
    /** Quiz déjà généré pour ce stage, pas encore joué — permet d'y revenir sans le refaire. */
    existingGameId: string | null;
};

const QUESTION_OPTIONS = [5, 7, 10];

const PUBLIC_OPTIONS = [
    { value: 'enfant' as const, label: 'Enfants', description: 'Vocabulaire simple, posé à voix haute', icon: 'child_care' },
    { value: 'adulte' as const, label: 'Ados / adultes', description: 'Vocabulaire technique complet', icon: 'groups' },
];

// Quiz thématiques : option secondaire, repliée par défaut. C'est le même quiz de fin
// de semaine (un seul par stage, il remplace toute génération précédente) — seule la
// sélection des questions change. Le choix "Quiz de la semaine" (auto, basé sur les
// cartes objectifs sélectionnées) reste le seul mis en avant.
const THEME_OPTIONS = [
    { value: 'Les Marées', label: 'Les Marées', description: 'Flot, jusant, coefficients, étale…', icon: 'waves' },
    { value: 'Météo & Marées', label: 'Météo & Marées', description: 'Vent, nuages, brise thermique…', icon: 'cloud' },
    { value: 'Caractéristiques du littoral', label: 'Littoral', description: 'Estran, dunes, laisse de mer…', icon: 'beach_access' },
    { value: 'Observation Sensorielle', label: 'Observation', description: 'Lire la mer, repérer, observer…', icon: 'visibility' },
    { value: 'Général', label: 'Général', description: 'Biodiversité, environnement, gestes…', icon: 'eco' },
];

export default function QuizLaunchClient({ stageId, stageTitle, existingGameId }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [questionCount, setQuestionCount] = useState(5);
    const [selectedTheme, setSelectedTheme] = useState('auto');
    /** Registre de vocabulaire : les 131 fiches et les cartes quiz portent chacune une
     *  version adulte et une version enfant depuis la correction du 2026-08-09. */
    const [audience, setAudience] = useState<'enfant' | 'adulte'>('enfant');
    const [showThemeQuiz, setShowThemeQuiz] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLaunch = () => {
        setError(null);
        startTransition(async () => {
            const result = await generateStageQuiz(stageId, questionCount, selectedTheme === 'auto' ? null : selectedTheme, audience);
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
                    Posez ces questions à tes stagiaires pour valider ce qu&apos;ils ont retenu.
                    Leurs réponses valident tes points de moniteur.
                </p>
            </div>

            {/* Un quiz existe déjà pour ce stage, pas encore joué : proposer d'y retourner
                plutôt que d'en imposer un nouveau ou de forcer à en relancer un. */}
            {existingGameId && (
                <button
                    onClick={() => router.push(`/jeux/${existingGameId}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-left transition-all active:scale-[0.98]"
                >
                    <span className="size-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-emerald-400">play_circle</span>
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-white">Reprendre le quiz déjà préparé</p>
                        <p className="text-[11px] text-slate-400">Ou choisissez d&apos;autres réglages ci-dessous pour le remplacer</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 shrink-0">chevron_right</span>
                </button>
            )}

            {/* Nombre de questions */}
            <section>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Nombre de questions
                </p>
                <div className="flex justify-center gap-2">
                    {QUESTION_OPTIONS.map(n => (
                        <button
                            key={n}
                            onClick={() => setQuestionCount(n)}
                            className={clsx(
                                'w-20 py-4 rounded-2xl font-black text-xl transition-all active:scale-95',
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

            {/* Public — choisit la version du vocabulaire, pas le contenu des questions */}
            <section>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    À qui vous posez les questions
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {PUBLIC_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setAudience(opt.value)}
                            className={clsx(
                                'flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all active:scale-95',
                                audience === opt.value
                                    ? 'bg-violet-600/20 border-violet-500 text-white'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            )}
                        >
                            <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
                            <span className="font-black text-sm">{opt.label}</span>
                            <span className="text-[10px] text-slate-500 text-center px-2 leading-snug">{opt.description}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Quiz de la semaine — seule option mise en avant, celle qui valide les points */}
            <section>
                <button
                    onClick={() => setSelectedTheme('auto')}
                    className={clsx(
                        'w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-[0.98] border-2',
                        selectedTheme === 'auto'
                            ? 'bg-violet-600/20 border-violet-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                    )}
                >
                    <span className={clsx(
                        'size-11 rounded-xl flex items-center justify-center shrink-0',
                        selectedTheme === 'auto' ? 'bg-violet-500/30' : 'bg-white/10'
                    )}>
                        <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm">Quiz de la semaine</p>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">Basé sur les objectifs choisis cette semaine</p>
                    </div>
                    {selectedTheme === 'auto' && (
                        <span className="material-symbols-outlined text-violet-400 shrink-0">check_circle</span>
                    )}
                </button>
            </section>

            {/* Quiz thématiques — repliés, pour un entraînement libre, sans lien avec les points */}
            <section>
                <button
                    onClick={() => setShowThemeQuiz(v => !v)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
                >
                    Choisir un thème précis à la place
                    <span className={clsx('material-symbols-outlined text-sm transition-transform', showThemeQuiz && 'rotate-180')}>expand_more</span>
                </button>
                {showThemeQuiz && (
                    <div className="space-y-2 mt-3">
                        {THEME_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedTheme(opt.value)}
                                className={clsx(
                                    'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all active:scale-[0.98] border',
                                    selectedTheme === opt.value
                                        ? 'bg-white/10 border-white/30 text-white'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                )}
                            >
                                <span className="size-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs">{opt.label}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{opt.description}</p>
                                </div>
                                {selectedTheme === opt.value && (
                                    <span className="material-symbols-outlined text-slate-300 text-base shrink-0">check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* Erreur */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-400 shrink-0 mt-0.5">error</span>
                    <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
            )}

            {/* Barème simple + aperçu du gain */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comment gagner des points</p>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-violet-400">check_circle</span>
                        Par bonne réponse du groupe
                    </span>
                    <span className="text-sm font-black text-violet-400">2 pts</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-amber-400">star</span>
                        Quiz de 10 sans faute
                    </span>
                    <span className="text-sm font-black text-amber-400">+5 pts</span>
                </div>

                {/* Aperçu dynamique */}
                <div className="mt-1 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        Avec {questionCount} questions, max possible
                    </span>
                    <span className="text-base font-black text-white">
                        {questionCount * 2 + (questionCount >= 10 ? 5 : 0)} pts
                    </span>
                </div>
                {questionCount < 10 && (
                    <p className="text-[11px] text-amber-300/80 leading-snug flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[14px] mt-0.5">lightbulb</span>
                        Lancez un quiz de 10 questions pour viser le bonus et marquer le maximum.
                    </p>
                )}
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
