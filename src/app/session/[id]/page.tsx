import { getSessionFull, getUserValidationsForSession, getSessionsForStage } from '@/services/data-service';
import { getStageExploits, getClubSpotsForUser, getClubObservationTargets } from '@/actions/defi-actions';
import { getStepTodosForStage } from '@/actions/stage-actions';
import { createClient } from '@/lib/supabase/server';
import { StageObjectiveExecutionStatus } from '@/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SessionRunnerClient from './SessionRunnerClient';

export default async function SessionRunnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSessionFull(id);

    if (!data || !data.session) return notFound();

    const { session, steps, links, contentPool } = data;

    const [
        initialValidations,
        allSessions,
        assignedExploits,
        todosGrouped,
        reviewRows,
    ] = await Promise.all([
        getUserValidationsForSession(id),
        getSessionsForStage(session.stage_id),
        getStageExploits(session.stage_id),
        getStepTodosForStage(session.stage_id),
        (async () => {
            const supabase = await createClient();
            const { data } = await supabase
                .from('stage_objective_reviews')
                .select('pedagogical_content_id, execution_status')
                .eq('stage_id', session.stage_id);
            return data;
        })(),
    ]);

    const initialReviews: Record<string, StageObjectiveExecutionStatus> = {};
    (reviewRows ?? []).forEach((r) => {
        if (r.execution_status) {
            initialReviews[r.pedagogical_content_id] = r.execution_status as StageObjectiveExecutionStatus;
        }
    });

    const todosByStep: Record<string, import('@/types').StepTodo[]> = {};
    todosGrouped.forEach(({ step_id, todos }) => { todosByStep[step_id] = todos; });

    const spotFixeIds = assignedExploits
        .filter((e: { defis?: { spot_fixe?: boolean }; exploit_id: string }) => e.defis?.spot_fixe)
        .map((e: { exploit_id: string }) => e.exploit_id);

    const [clubSpots, clubObservationTargets] = await Promise.all([
        getClubSpotsForUser(spotFixeIds),
        getClubObservationTargets(),
    ]);

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fc] pb-24">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/stages/${session.stage_id}`} className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                            <span className="material-symbols-outlined block">arrow_back</span>
                        </Link>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Séance {session.session_order}</p>
                            <h1 className="text-base font-extrabold text-slate-900 leading-tight">{session.title}</h1>
                        </div>
                    </div>
                </div>
            </header>

            <SessionRunnerClient
                steps={steps}
                contentPool={contentPool}
                links={links}
                initialValidations={initialValidations}
                initialReviews={initialReviews}
                sessionId={id}
                stageId={session.stage_id}
                allSessions={allSessions.map(s => ({ id: s.id, title: s.title, order: s.session_order }))}
                assignedExploits={assignedExploits}
                clubSpots={clubSpots}
                clubObservationTargets={clubObservationTargets}
                todosByStep={todosByStep}
            />
        </div>
    );
}
