import { getPedagogicalPool } from '@/services/data-service';
import { PedagogicalContent } from '@/types';
import DemoParcoursClient from './DemoParcoursClient';

/** Démo de la direction visuelle — à supprimer une fois la refonte validée. */
export default async function DemoParcoursPage() {
    const pool = (await getPedagogicalPool()) as PedagogicalContent[];
    return <DemoParcoursClient pool={pool} />;
}
