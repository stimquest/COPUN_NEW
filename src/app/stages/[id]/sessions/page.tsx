import { getStageById, getSessionsForStage, getPedagogicalPool, getSessionStepLinks } from '@/services/data-service';
import SessionsManagerClient from './SessionsManagerClient';
import { notFound } from 'next/navigation';

export default async function SessionsManagerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch real data (async)
    const stage = await getStageById(id);
    if (!stage) return notFound();

    const sessions = await getSessionsForStage(id);
    const pool = await getPedagogicalPool();
    const stepIds = sessions.flatMap(s => (s.steps || []).map((step: { id: string }) => step.id));
    const links = await getSessionStepLinks(stepIds);

    return (
        <SessionsManagerClient
            stage={stage}
            initialSessions={sessions}
            fullPool={pool}
            initialLinks={links}
        />
    );
}
