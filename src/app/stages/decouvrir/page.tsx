import { getPedagogicalPool } from '@/services/data-service';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';
import DecouvrirClient from './DecouvrirClient';
import { getSavedCards } from '@/actions/saved-card-actions';
import { ENTREES_DECOUVERTE } from '@/data/decouverte-accueil';

export default async function DecouvrirPage({ searchParams }: { searchParams: Promise<{ theme?: string; group?: string; saved?: string; pillar?: string; entry?: string }> }) {
    const { theme, group, saved, pillar, entry } = await searchParams;
    const rail = ENTREES_DECOUVERTE.find(item => item.id === pillar);
    const validEntry = rail?.themes.find(item => item.id === entry)?.id;
    const [pool, bookmarks] = await Promise.all([getPedagogicalPool(), getSavedCards()]);
    const validTheme = theme && Object.hasOwn(THEMATIC_LABELS, theme) ? theme as ThematicTag : undefined;
    return <DecouvrirClient key={`${validTheme ?? 'all'}-${group ?? ''}-${rail?.id ?? ''}-${validEntry ?? ''}-${saved ?? ''}-${bookmarks.error ? 'unavailable' : 'ready'}`} pool={pool} theme={validTheme} group={group} pillar={rail?.dimension} entry={validEntry} initialSavedIds={bookmarks.ids} initialChoices={bookmarks.choices} savedError={bookmarks.error} initialSavedView={saved === '1'} />;
}
