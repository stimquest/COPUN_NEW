import { getSequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_LITTORAL_EAU } from '@/data/parcours-formation';
import { ParcoursCoursClient } from '@/components/formation/ParcoursCoursClient';

export default async function ParcoursLittoralEauPage() {
    const progression = await getSequenceProgress(PARCOURS_LITTORAL_EAU.id);
    return <main className="co-lesson-page"><ParcoursCoursClient sequence={PARCOURS_LITTORAL_EAU} progression={progression}/></main>;
}
