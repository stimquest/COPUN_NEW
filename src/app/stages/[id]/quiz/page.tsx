import { getStageById } from '@/services/data-service';
import { getStageQuiz } from '@/actions/quiz-actions';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import QuizLaunchClient from './QuizLaunchClient';

export default async function StageQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const stage = await getStageById(id);
    if (!stage) return notFound();

    // Quiz déjà généré — redirige directement vers le jeu
    const existingQuiz = await getStageQuiz(id);
    if (existingQuiz?.game_id) {
        redirect(`/jeux/${existingQuiz.game_id}`);
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-900">
            <header className="flex items-center gap-4 px-5 py-4 border-b border-white/10">
                <Link
                    href="/stages"
                    className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quiz de fin de semaine</p>
                    <h1 className="text-base font-extrabold text-white leading-tight">{stage.title}</h1>
                </div>
            </header>

            <QuizLaunchClient stageId={id} stageTitle={stage.title} />
        </div>
    );
}
