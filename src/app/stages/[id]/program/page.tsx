import { getStageById, getPedagogicalPool, getStages } from '@/services/data-service';
import { getUserContent } from '@/actions/content-actions';
import ProgramBuilderClient from './ProgramBuilderClient';
import { notFound } from 'next/navigation';

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch production-ready data
    const [stage, systemPool, userPool, allStages] = await Promise.all([
        getStageById(id),
        getPedagogicalPool(),
        getUserContent(),
        getStages(),
    ]);

    if (!stage) return notFound();

    // Fiches déjà utilisées sur d'autres semaines du moniteur — le mode guidé favorise
    // les fiches jamais explorées pour éviter de proposer toujours les mêmes.
    const usedContentIds = Array.from(new Set(
        (allStages ?? [])
            .filter((s: { id: string }) => s.id !== id)
            .flatMap((s: { selected_content?: string[] }) => s.selected_content ?? [])
    ));

    return (
        <ProgramBuilderClient
            stage={stage}
            copunPool={systemPool}
            customPool={userPool}
            usedContentIds={usedContentIds}
        />
    );
}
