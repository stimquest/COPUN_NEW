import { getStageById, getPedagogicalPool } from '@/services/data-service';
import { getUserContent } from '@/actions/content-actions';
import ProgramBuilderClient from './ProgramBuilderClient';
import { notFound } from 'next/navigation';

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch production-ready data
    const [stage, systemPool, userPool] = await Promise.all([
        getStageById(id),
        getPedagogicalPool(),
        getUserContent()
    ]);

    if (!stage) return notFound();

    const fullPool = [...systemPool, ...userPool];
    return (
        <ProgramBuilderClient
            stage={stage}
            fullPool={fullPool}
        />
    );
}
