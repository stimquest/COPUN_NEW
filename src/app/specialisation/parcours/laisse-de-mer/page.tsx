import { getSequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_LAISSE_DE_MER } from '@/data/parcours-formation';
import { ParcoursLaisseDeMerClient } from './ParcoursLaisseDeMerClient';
import { getPedagogicalPool, getStages } from '@/services/data-service';
import { getSavedCards } from '@/actions/saved-card-actions';

export default async function ParcoursLaisseDeMerPage() {
    const [progression, cards, stages, saved] = await Promise.all([getSequenceProgress(PARCOURS_LAISSE_DE_MER.id), getPedagogicalPool(), getStages(), getSavedCards()]);
    return <main className="co-lesson-page"><ParcoursLaisseDeMerClient sequence={PARCOURS_LAISSE_DE_MER} progression={progression} cards={cards} stages={stages} savedIds={saved.ids} /></main>;
}
