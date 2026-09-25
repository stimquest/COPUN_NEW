'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { generateStageQuiz } from '@/actions/quiz-actions';

import { iconeMaterial } from '@/components/ui/Icone';
const ArrowRight = iconeMaterial('arrow_forward');
const Play = iconeMaterial('play_arrow');

type Props = { stageId: string; existingGameId: string | null };
const QUESTION_OPTIONS = [5, 7, 10];

export default function QuizLaunchClient({ stageId, existingGameId }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [questionCount, setQuestionCount] = useState(5);
    const [error, setError] = useState<string | null>(null);

    const handleLaunch = () => {
        setError(null);
        startTransition(async () => {
            const result = await generateStageQuiz(stageId, questionCount, null, 'enfant');
            if (result.success && result.gameId) router.push(`/jeux/${result.gameId}`);
            else setError(result.error ?? 'Impossible de préparer le quiz.');
        });
    };

    return <main className="co-week-quiz">
        <section className="co-week-quiz-card">
            <p className="co-eyebrow">Animation</p>
            <h2>Un quiz à partir des cartes de la semaine</h2>
            <p>Les questions reprennent les sujets que vous avez choisi de faire vivre. Posez-les directement au groupe pour vérifier ce qui a été compris.</p>

            {existingGameId && <button className="co-week-quiz-resume" onClick={() => router.push(`/jeux/${existingGameId}`)}>
                <span>Reprendre le quiz déjà préparé</span><ArrowRight size={17}/>
            </button>}

            <fieldset>
                <legend>Nombre de questions</legend>
                <div>{QUESTION_OPTIONS.map(count => <button type="button" key={count} aria-pressed={questionCount === count} onClick={() => setQuestionCount(count)}>{count}</button>)}</div>
            </fieldset>

            {error && <p role="alert" className="co-week-quiz-error">{error}</p>}
            <button className="co-week-quiz-launch" onClick={handleLaunch} disabled={isPending}>
                <Play size={17}/>{isPending ? 'Préparation…' : 'Lancer le quiz avec le groupe'}
            </button>
        </section>
    </main>;
}
