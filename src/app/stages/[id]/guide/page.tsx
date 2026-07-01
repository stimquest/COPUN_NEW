import { getStageById } from '@/services/data-service';
import { notFound } from 'next/navigation';
import EnvironmentalGuideClient from './EnvironmentalGuideClient';

export default async function EnvironmentalGuidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const stage = await getStageById(id);

    if (!stage) return notFound();

    return <EnvironmentalGuideClient stage={stage} />;
}