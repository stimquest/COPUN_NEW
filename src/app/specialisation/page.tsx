import { getSequencesProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_LAISSE_DE_MER, PARCOURS_LITTORAL_EAU } from '@/data/parcours-formation';
import { LearningJourney } from '@/components/design/LearningJourney';

export default async function SpecialisationPage() {
    const progressions = await getSequencesProgress([PARCOURS_LAISSE_DE_MER.id, PARCOURS_LITTORAL_EAU.id]);
    const laisseDeMer = progressions[PARCOURS_LAISSE_DE_MER.id];
    const littoralEau = progressions[PARCOURS_LITTORAL_EAU.id];
    return <LearningJourney progressions={{ [PARCOURS_LAISSE_DE_MER.id]: laisseDeMer, [PARCOURS_LITTORAL_EAU.id]: littoralEau }}/>;
}
