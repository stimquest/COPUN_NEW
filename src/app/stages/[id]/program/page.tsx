import { getStageById, getPedagogicalPool } from '@/services/data-service';
import { getUserContent } from '@/actions/content-actions';
import ExplorerClient from './ExplorerClient';
import { notFound } from 'next/navigation';

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [stage, systemPool, userPool] = await Promise.all([
        getStageById(id),
        getPedagogicalPool(),
        getUserContent(),
    ]);

    if (!stage) return notFound();

    return <ExplorerClient stage={stage} copunPool={systemPool} customPool={userPool} />;
}
