import { getStageById, getSessionsForStage, getPedagogicalPool, getSessionStepLinks } from '@/services/data-service';
import { getStepTodosForStage, getPastTodosForUser } from '@/actions/stage-actions';
import { getUserContent } from '@/actions/content-actions';
import SessionsManagerClient from './SessionsManagerClient';
import { notFound } from 'next/navigation';

export default async function SessionsManagerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const stage = await getStageById(id);
    if (!stage) return notFound();

    const [sessions, copunPool, customPool, todosGrouped, pastTodos] = await Promise.all([
        getSessionsForStage(id),
        getPedagogicalPool(),
        getUserContent(),
        getStepTodosForStage(id),
        getPastTodosForUser(id),
    ]);

    const stepIds = sessions.flatMap(s => (s.steps || []).map((step: { id: string }) => step.id));
    const links = await getSessionStepLinks(stepIds);

    const todosByStep: Record<string, import('@/types').StepTodo[]> = {};
    todosGrouped.forEach(({ step_id, todos }) => { todosByStep[step_id] = todos; });

    return (
        <SessionsManagerClient
            stage={stage}
            initialSessions={sessions}
            copunPool={copunPool}
            customPool={customPool}
            initialLinks={links}
            initialTodosByStep={todosByStep}
            pastTodos={pastTodos}
        />
    );
}
