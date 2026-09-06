import { notFound } from 'next/navigation';
import { getStageById, getPedagogicalPool } from '@/services/data-service';
import { NewStageClient } from './NewStageClient';

export default async function NewStagePage({ searchParams }: { searchParams: Promise<{ edit?: string; selection?: string; theme?: string; group?: string }> }) {
    const { edit, selection, theme, group } = await searchParams;

    if (edit) {
        const stage = await getStageById(edit);
        if (!stage) return notFound();
        return <NewStageClient existingStage={stage} />;
    }

    const pool = selection ? await getPedagogicalPool() : [];
    const validIds = new Set(pool.map(card => card.id));
    const initialSelection = Array.from(new Set((selection ?? '').split(',').filter(id => validIds.has(id)))).slice(0, 5);
    return <NewStageClient initialSelection={initialSelection} initialTheme={theme} initialGroup={group} />;
}
