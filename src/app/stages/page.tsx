import { getProfile } from '@/actions/user-actions';
import { getResumeFormation } from '@/actions/formation-actions';
import { HomeLearning } from '@/components/design/HomeLearning';
import { getSequenceProgress } from '@/actions/parcours-formation-actions';
import { getStages } from '@/services/data-service';
import { pickCurrentStage } from '@/lib/stage-dates';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';

export default async function StagesPage() {
    const [profile, resume, stages, ...progressions] = await Promise.all([
        getProfile(),
        getResumeFormation(),
        getStages(),
        ...PARCOURS_FORMATION.map(parcours => getSequenceProgress(parcours.id)),
    ]);

    // Une semaine « en cours » est celle dont les dates couvrent aujourd'hui — jamais la plus
    // proche : une semaine à venir ou déjà passée se prépare ou se clôt, elle ne se mène pas.
    const semaineEnCours = pickCurrentStage(stages.filter(stage => !stage.closed_at)) !== null;

    return <HomeLearning
        firstName={profile?.full_name?.split(' ')[0] || 'à toi'}
        resume={resume}
        progressions={Object.fromEntries(PARCOURS_FORMATION.map((parcours, index) => [parcours.id, progressions[index]]))}
        semaineEnCours={semaineEnCours}
    />;
}
