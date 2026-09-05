import { getStageById, getPedagogicalPool, getStages, getMyFicheOutcomes } from '@/services/data-service';
import { getUserContent } from '@/actions/content-actions';
import ExplorerClient from './ExplorerClient';
import { construireHistorique } from '@/lib/historique-moniteur';
import { notFound } from 'next/navigation';

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [stage, systemPool, userPool, tousLesStages, outcomes] = await Promise.all([
        getStageById(id),
        getPedagogicalPool(),
        getUserContent(),
        getStages(),
        getMyFicheOutcomes(),
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
        />
    );
}
