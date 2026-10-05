import { notFound, redirect } from 'next/navigation';
import { getStageById } from '@/services/data-service';
import { NewStageClient } from './NewStageClient';

export default async function NewStagePage({ searchParams }: { searchParams: Promise<{ edit?: string; selection?: string; theme?: string; group?: string; parcours?: string; aborde?: string }> }) {
    const { edit, selection, theme, group, parcours, aborde } = await searchParams;

    if (edit) {
        const stage = await getStageById(edit);
        if (!stage) return notFound();
        return <NewStageClient existingStage={stage} />;
    }

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ selection, theme, group, parcours, aborde })) if (value) query.set(key, value);
    redirect(`/stages/${aborde === '1' ? 'actuelle' : 'prochaine'}${query.size ? `?${query}` : ''}`);
}
