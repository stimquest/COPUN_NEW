'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { closeStage } from '@/actions/stage-actions';
import { StageDefisReview, DefiReview } from '@/components/StageDefisReview';
import { StageObservationsReview } from '@/components/StageObservationsReview';
import { WeekObservation, PedagogicalContent } from '@/types';
import { RessentiNiveau, RESSENTI_OPTIONS, RESSENTI_RAISONS } from '@/lib/stage-ressenti';
import { StagePreparation } from '@/actions/preparation-actions';
import ProgrammeCondense from '@/components/ProgrammeCondense';

type QuizReview = {
    done: boolean;
    score: number | null;
    total: number | null;
};

type Props = {
    stageId: string;
    stageTitle: string;
    objectives: PedagogicalContent[];
    preparations: Record<string, StagePreparation>;
    initialClosingNotes?: string | null;
    initialNbStagiaires?: number | null;
    defisAssigned: DefiReview[];
    observations: WeekObservation[];
    quizData: QuizReview | null;
    earlyWarning?: string | null;
};

/**
 * Clôture de semaine : un ressenti global, pas un statut par fiche.
 *
 * Remplace le formulaire qui faisait remplir exécution + impact + raisons pour chaque
 * fiche du programme — jusqu'à 15 fois le même formulaire pour clôturer une semaine.
 * Voir src/lib/stage-ressenti.ts pour le raisonnement complet.
 */
export function StageClosureReview({
    stageId, stageTitle, objectives, preparations, initialClosingNotes, initialNbStagiaires,
    defisAssigned, observations, quizData, earlyWarning = null,
}: Props) {
    const router = useRouter();
    const [niveau, setNiveau] = useState<RessentiNiveau | null>(null);
    const [raisons, setRaisons] = useState<string[]>([]);
    const [closingNote, setClosingNote] = useState(initialClosingNotes ?? '');
    const [nbStagiaires, setNbStagiaires] = useState(initialNbStagiaires ? String(initialNbStagiaires) : '');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defisDone = defisAssigned.filter(d => d.status === 'complete').length;
    const defisTotal = defisAssigned.length;
    const quizDone = quizData?.done ?? false;

    const choisirNiveau = (n: RessentiNiveau) => {
        setNiveau(n);
        setRaisons([]); // les raisons dépendent du niveau, on repart à zéro en changeant
    };

    const toggleRaison = (r: string) => {
        setRaisons(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
    };

    const nbStagiairesValide = Number(nbStagiaires) >= 1;

    const handleClose = async () => {
        if (!niveau) {
            setError('Indiquez si vous avez pu raconter ce qui était prévu.');
            return;
        }
        if (!nbStagiairesValide) {
            setError('Indiquez le nombre de stagiaires de la semaine.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const result = await closeStage(stageId, {
            closingNotes: closingNote,
            ressenti: { niveau, raisons, note: '' },
            nbStagiaires: Number(nbStagiaires),
        });

        setIsSubmitting(false);
        if (!result.success) {
            setError(result.error ?? 'Erreur lors de la clôture');
            return;
        }
        router.push(`/stages/${stageId}/bilan`);
        router.refresh();
    };

    return (
        <div className="space-y-6">

            {earlyWarning && (
                <div className="rounded-2xl bg-orange-100 border border-orange-300 px-4 py-3 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-orange-500 text-xl shrink-0">schedule</span>
                    <p className="text-sm font-black text-orange-900">{earlyWarning}</p>
                </div>
            )}

            {/* Intro */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-1">Clôture de la semaine</p>
                <p className="text-sm font-semibold text-amber-900">{stageTitle}</p>
            </div>

            {/* Le programme, rappelé pour se souvenir de ce qui était prévu avant de juger */}
            {objectives.length > 0 && (
                <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                        Ce qui était prévu
                    </p>
                    <ProgrammeCondense stageId={stageId} contents={objectives} preparations={preparations} />
                </section>
            )}

            {/* Le ressenti global */}
            <section>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                    Dans l&apos;ensemble
                </p>
                <p className="text-sm font-bold text-slate-900 mb-3">
                    Avez-vous pu raconter ce que vous aviez prévu ?
                </p>
                <div className="space-y-2">
                    {RESSENTI_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => choisirNiveau(opt.value)}
                            className={clsx(
                                'w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.99]',
                                niveau === opt.value
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300',
                            )}
                        >
                            <span className={clsx(
                                'material-symbols-outlined text-2xl shrink-0',
                                niveau === opt.value ? 'text-white' : 'text-slate-400',
                            )}>
                                {opt.icon}
                            </span>
                            <span className="flex-1 min-w-0">
                                <span className="block font-black text-sm">{opt.label}</span>
                                <span className={clsx(
                                    'block text-xs mt-0.5',
                                    niveau === opt.value ? 'text-white/60' : 'text-slate-400',
                                )}>
                                    {opt.helper}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>

                {/* Raisons — dépendent du niveau choisi, utiles pour le club */}
                {niveau && (
                    <div className="mt-4">
                        <p className="text-xs font-bold text-slate-500 mb-2">
                            Pourquoi, en quelques mots ? <span className="font-medium text-slate-300">— optionnel</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {RESSENTI_RAISONS[niveau].map(r => (
                                <button
                                    key={r}
                                    onClick={() => toggleRaison(r)}
                                    className={clsx(
                                        'px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98]',
                                        raisons.includes(r)
                                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300',
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Nombre de stagiaires — obligatoire ici plutôt qu'à la création : c'est un
                chiffre connu à ce stade, pas une estimation avant même que le groupe soit
                constitué. Utile plus tard pour mesurer combien de personnes ont été
                sensibilisées sur une saison. */}
            <section>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                    Combien de stagiaires cette semaine
                </p>
                <input
                    type="number"
                    min={1}
                    max={999}
                    placeholder="ex : 12"
                    value={nbStagiaires}
                    onChange={e => setNbStagiaires(e.target.value)}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition"
                />
            </section>

            {/* Défis Terrain */}
            {defisTotal > 0 && (
                <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                        Défis terrain
                    </p>
                    <StageDefisReview defis={defisAssigned} />
                </section>
            )}

            {/* Retours terrain */}
            {observations.length > 0 && (
                <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                        Retours terrain
                        <span className="ml-2 text-slate-300">{observations.length}</span>
                    </p>
                    <StageObservationsReview observations={observations} />
                </section>
            )}

            {/* Quiz de fin de semaine */}
            {quizData && (
                <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                        Quiz de fin de semaine
                    </p>
                    <div className={clsx(
                        'rounded-xl border px-4 py-3 flex items-center gap-3',
                        quizDone ? 'border-violet-200 bg-violet-50' : 'border-amber-200 bg-amber-50'
                    )}>
                        <span className={clsx(
                            'material-symbols-outlined text-xl',
                            quizDone ? 'text-violet-600' : 'text-amber-600'
                        )}>
                            {quizDone ? 'check_circle' : 'quiz'}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900">{quizDone ? 'Quiz validé' : 'Quiz pas encore fait'}</p>
                            {quizDone && quizData.score !== null && quizData.total !== null && (
                                <p className="text-[10px] text-slate-500">
                                    Score : {quizData.score}/{quizData.total}
                                </p>
                            )}
                            {!quizDone && (
                                <p className="text-[10px] text-slate-500">À faire avec le groupe avant de clôturer</p>
                            )}
                        </div>
                        {quizDone ? (
                            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-violet-600 text-white">
                                Terminé
                            </span>
                        ) : (
                            <Link
                                href={`/stages/${stageId}/quiz`}
                                className="text-[10px] font-black px-3 py-1.5 rounded-full bg-amber-600 text-white active:scale-95 transition shrink-0"
                            >
                                Faire le quiz
                            </Link>
                        )}
                    </div>
                </section>
            )}

            {/* Mémo libre */}
            <section>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                    Mémo moniteur <span className="font-semibold normal-case tracking-normal text-slate-300">— optionnel</span>
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <textarea
                        value={closingNote}
                        onChange={e => setClosingNote(e.target.value)}
                        placeholder="Ce qui a bien marché, ce qui a bloqué, une idée pour la prochaine fois…"
                        rows={5}
                        className="w-full resize-none px-4 py-4 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent focus:outline-none leading-relaxed"
                    />
                </div>
            </section>

            {/* Erreur */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Barre de clôture sticky */}
            <div className="sticky bottom-4 z-30">
                <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl shadow-slate-200/60 p-3 flex items-center gap-3">
                    <div className="flex-1">
                        {!niveau ? (
                            <p className="text-xs font-semibold text-amber-600">Un mot sur la semaine, avant de clôturer</p>
                        ) : !nbStagiairesValide ? (
                            <p className="text-xs font-semibold text-amber-600">Indiquez le nombre de stagiaires</p>
                        ) : !quizDone ? (
                            <p className="text-xs font-semibold text-amber-600">Quiz pas fait — clôture possible quand même</p>
                        ) : (
                            <p className="text-xs font-semibold text-emerald-600">Prêt à clôturer</p>
                        )}
                    </div>
                    <Link
                        href="/stages"
                        className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 flex items-center hover:bg-slate-50 transition"
                    >
                        Annuler
                    </Link>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting || !niveau || !nbStagiairesValide}
                        className={clsx(
                            'h-11 px-5 rounded-xl text-sm font-black text-white transition',
                            !niveau || !nbStagiairesValide || isSubmitting
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-slate-700 active:scale-95'
                        )}
                    >
                        {isSubmitting ? 'Clôture…' : 'Clôturer le stage'}
                    </button>
                </div>
            </div>
        </div>
    );
}
