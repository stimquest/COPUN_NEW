import { getSequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_LAISSE_DE_MER } from '@/data/parcours-formation';
import { ParcoursCoursClient } from '@/components/formation/ParcoursCoursClient';

export default async function ParcoursLaisseDeMerPage() {
    const progression = await getSequenceProgress(PARCOURS_LAISSE_DE_MER.id);
    return <main className="co-lesson-page"><ParcoursCoursClient sequence={PARCOURS_LAISSE_DE_MER} progression={progression}/></main>;
}
