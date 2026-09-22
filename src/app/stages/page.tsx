import { getProfile } from '@/actions/user-actions';
import { getResumeFormation } from '@/actions/formation-actions';
import { HomeLearning } from '@/components/design/HomeLearning';
import { getSequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';

export default async function StagesPage() {
    const [profile, resume, ...progressions] = await Promise.all([getProfile(), getResumeFormation(), ...PARCOURS_FORMATION.map(parcours => getSequenceProgress(parcours.id))]);
    return <HomeLearning firstName={profile?.full_name?.split(' ')[0] || 'à toi'} resume={resume} progressions={Object.fromEntries(PARCOURS_FORMATION.map((parcours, index) => [parcours.id, progressions[index]]))}/>;
}
