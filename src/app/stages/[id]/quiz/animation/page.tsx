import { getStageById } from '@/services/data-service';
import { getStageQuiz } from '@/actions/quiz-actions';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import QuizLaunchClient from './QuizLaunchClient';

/**
 * Le quiz d'animation — l'ancien quiz de fin de semaine, conservé tel quel.
 *
 * Il a quitté `/stages/[id]/quiz`, où le vote de fin de stage l'a remplacé, mais il garde
 * toute son utilité : des questions à quatre options, prêtes à l'emploi, que le moniteur
 * sort quand l'occasion se présente — attente avant d'embarquer, averse, retour en minibus.
 * Plusieurs moniteurs s'en servent volontiers.
 *
 * Ce qu'il ne fait plus : compter. Il ne donne aucun point et ne valide aucune action,
 * puisque c'est le moniteur qui saisit les réponses — seul le vote fait répondre le groupe.
 * Le score reste enregistré pour le bilan, le carnet et les statistiques du club.
 */
export default async function StageQuizAnimationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const stage = await getStageById(id);
    if (!stage) return notFound();

    // Quiz déjà généré : on ne redirige plus aveuglément dessus. Le moniteur doit
    // pouvoir revenir ici pour changer de registre (enfants / adultes) ou de thème —
    // le lancement précédent le prive sinon de tout retour en arrière. On ne saute
    // directement au jeu que si un résultat a déjà été enregistré : rejouer serait
    // alors ambigu (nouveau quiz ou reprise ?), donc on laisse voir le score existant.
    const existingQuiz = await getStageQuiz(id);
    if (existingQuiz?.game_id && existingQuiz.completed_at) {
        redirect(`/jeux/${existingQuiz.game_id}`);
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-900">
            <header className="flex items-center gap-4 px-5 py-4 border-b border-white/10">
                <Link
                    href={`/stages/${id}/quiz`}
                    className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quiz d&apos;animation</p>
                    <h1 className="text-base font-extrabold text-white leading-tight">{stage.title}</h1>
                </div>
            </header>

            <QuizLaunchClient
                stageId={id}
                existingGameId={existingQuiz?.game_id ?? null}
            />
        </div>
    );
}
