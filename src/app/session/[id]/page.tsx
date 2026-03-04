import { getSessionFull, getUserValidationsForSession } from '@/services/data-service';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SessionRunnerClient from './SessionRunnerClient';

export default async function SessionRunnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSessionFull(id);

    if (!data || !data.session) return notFound();

    const { session, steps, links, contentPool } = data;
    const initialValidations = await getUserValidationsForSession(id); // Fetch validations

    // Fetch all sessions for navigation
    const { getSessionsForStage } = await import('@/services/data-service');
    const { getStageExploits } = await import('@/actions/defi-actions');

    const [allSessions, assignedExploits] = await Promise.all([
        getSessionsForStage(session.stage_id),
        getStageExploits(session.stage_id)
    ]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
            {/* HEADER COMPACT */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/stages/${session.stage_id}`} className="bg-slate-900 p-2 rounded-xl text-white active:scale-95 transition-transform">
                            <span className="material-symbols-outlined block">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">{session.title}</h1>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Séance N°{session.session_order}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                            <span className="material-symbols-outlined text-emerald-600 text-[18px]">cloud_done</span>
                        </div>
                    </div>
                </div>
            </header>

            <SessionRunnerClient
                steps={steps}
                contentPool={contentPool}
                links={links}
                initialValidations={initialValidations}
                sessionId={id}
                allSessions={allSessions.map(s => ({ id: s.id, title: s.title, order: s.session_order }))}
                assignedExploits={assignedExploits}
            />
        </div>
    );
}
