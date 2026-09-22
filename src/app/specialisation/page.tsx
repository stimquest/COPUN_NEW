import { getSequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_LAISSE_DE_MER, PARCOURS_LITTORAL_EAU } from '@/data/parcours-formation';
import { LearningJourney } from '@/components/design/LearningJourney';

export default async function SpecialisationPage() {
    const [laisseDeMer, littoralEau] = await Promise.all([getSequenceProgress(PARCOURS_LAISSE_DE_MER.id), getSequenceProgress(PARCOURS_LITTORAL_EAU.id)]);
    return <LearningJourney progressions={{ [PARCOURS_LAISSE_DE_MER.id]: laisseDeMer, [PARCOURS_LITTORAL_EAU.id]: littoralEau }}/>;
}
