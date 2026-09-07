import { getPedagogicalPool } from '@/services/data-service';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';
import DecouvrirClient from './DecouvrirClient';
import { getSavedCards } from '@/actions/saved-card-actions';

export default async function DecouvrirPage({ searchParams }: { searchParams: Promise<{ theme?: string; group?: string; saved?: string }> }) {
    const { theme, group, saved } = await searchParams;
    const [pool, bookmarks] = await Promise.all([getPedagogicalPool(), getSavedCards()]);
    const validTheme = theme && Object.hasOwn(THEMATIC_LABELS, theme) ? theme as ThematicTag : undefined;
    return <DecouvrirClient key={`${validTheme ?? 'all'}-${group ?? ''}-${saved ?? ''}-${bookmarks.error ? 'unavailable' : 'ready'}`} pool={pool} theme={validTheme} group={group} initialSavedIds={bookmarks.ids} savedError={bookmarks.error} initialSavedView={saved === '1'} />;
}
