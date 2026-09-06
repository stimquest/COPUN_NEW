import { getPedagogicalPool } from '@/services/data-service';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';
import DecouvrirClient from './DecouvrirClient';

export default async function DecouvrirPage({ searchParams }: { searchParams: Promise<{ theme?: string; group?: string }> }) {
    const { theme, group } = await searchParams;
    const pool = await getPedagogicalPool();
    const validTheme = theme && Object.hasOwn(THEMATIC_LABELS, theme) ? theme as ThematicTag : undefined;
    return <DecouvrirClient key={`${validTheme ?? 'all'}-${group ?? ''}`} pool={pool} theme={validTheme} group={group} />;
}
