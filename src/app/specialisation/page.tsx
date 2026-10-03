import { getSequencesProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';
import { LearningJourney } from '@/components/design/LearningJourney';

export default async function SpecialisationPage() {
    const progressions = await getSequencesProgress(PARCOURS_FORMATION.map(parcours => parcours.id));
    return <LearningJourney progressions={progressions}/>;
}
