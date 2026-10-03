import { notFound } from 'next/navigation';
import { getSequenceProgress } from '@/actions/parcours-formation-actions';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';
import { ParcoursCoursClient } from '@/components/formation/ParcoursCoursClient';

export default async function ParcoursPage({ params }: { params: Promise<{ parcoursId: string }> }) {
    const { parcoursId } = await params;
    const sequence = PARCOURS_FORMATION.find(parcours => parcours.id === parcoursId);
    if (!sequence) notFound();
    const progression = await getSequenceProgress(sequence.id);
    return <main className="co-lesson-page"><ParcoursCoursClient sequence={sequence} progression={progression}/></main>;
}
