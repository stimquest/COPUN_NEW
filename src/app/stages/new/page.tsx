import { notFound } from 'next/navigation';
import { getStageById } from '@/services/data-service';
import { NewStageClient } from './NewStageClient';

export default async function NewStagePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
    const { edit } = await searchParams;

    if (edit) {
        const stage = await getStageById(edit);
        if (!stage) return notFound();
        return <NewStageClient existingStage={stage} />;
    }

    return <NewStageClient />;
}
