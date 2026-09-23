import { getStageById, getPedagogicalPool, getStages, getMyFicheOutcomes } from '@/services/data-service';
import { getUserContent } from '@/actions/content-actions';
import ExplorerClient from './ExplorerClient';
import { construireHistorique } from '@/lib/historique-moniteur';
import { notFound } from 'next/navigation';
import { getSavedCards } from '@/actions/saved-card-actions';
import { getStagePreparations } from '@/actions/preparation-actions';
import { getResumeVote } from '@/actions/vote-actions';

export default async function ProgramPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ theme?: string; selection?: string; group?: string; aborde?: string }> }) {
    const { id } = await params;
    const { theme, selection, group, aborde } = await searchParams;

    const [stage, systemPool, userPool, tousLesStages, outcomes, bookmarks, preparations, vote] = await Promise.all([
        getStageById(id),
        getPedagogicalPool(),
        getUserContent(),
        getStages(),
        getMyFicheOutcomes(),
        getSavedCards(),
        getStagePreparations(id),
        getResumeVote(id),
    ]);

    if (!stage) return notFound();

    // L'historique des semaines passées — sans la semaine en cours, sinon tout ce qui vient
    // d'être retenu remonterait aussitôt comme « déjà fait ».
    const historique = construireHistorique({
        semainesPassees: tousLesStages
            .filter((s: { id: string }) => s.id !== id)
            .map((s: { selected_content?: string[] | null }) => s.selected_content),
        successIds: outcomes.successIds,
        lowIds: outcomes.lowIds,
    });

    return (
        <ExplorerClient
            stage={stage}
            copunPool={systemPool}
            customPool={userPool}
            historique={historique}
            savedIds={bookmarks.ids}
            savedError={bookmarks.error}
            locked={vote?.done}
            initiallyDiscussed={aborde === '1'}
            initialChoices={{ ...bookmarks.choices, ...Object.fromEntries(Object.entries(preparations).map(([contentId, preparation]) => [contentId, { accroche: preparation.accroche_choisie ?? '', actionId: preparation.actions?.[0] ?? null }])) }}
            initialActionChoices={Object.fromEntries(Object.entries(preparations).flatMap(([contentId, preparation]) => preparation.actions?.[0] ? [[contentId, preparation.actions[0]]] : []))}
            initialTheme={theme}
            initialGroup={group}
            initialSelection={Array.from(new Set((selection ?? '').split(',').filter(id => systemPool.some(card => card.id === id)))).slice(0, 5)}
        />
    );
}
