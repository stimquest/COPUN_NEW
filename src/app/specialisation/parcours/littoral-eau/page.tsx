import { getSequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_LITTORAL_EAU } from '@/data/parcours-formation';
import { ParcoursLaisseDeMerClient } from '../laisse-de-mer/ParcoursLaisseDeMerClient';
import { getPedagogicalPool, getStages } from '@/services/data-service';
import { getSavedCards } from '@/actions/saved-card-actions';

export default async function ParcoursLittoralEauPage() {
    const [progression, cards, stages, saved] = await Promise.all([getSequenceProgress(PARCOURS_LITTORAL_EAU.id), getPedagogicalPool(), getStages(), getSavedCards()]);
    return <main className="co-lesson-page"><ParcoursLaisseDeMerClient sequence={PARCOURS_LITTORAL_EAU} progression={progression} cards={cards} stages={stages} savedIds={saved.ids} /></main>;
}
