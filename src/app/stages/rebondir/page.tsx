import { getDirectorCards, getPedagogicalPool } from '@/services/data-service';
import { getSavedCards } from '@/actions/saved-card-actions';
import RebondirClient from './RebondirClient';

export default async function RebondirPage() {
    const [details, directors, bookmarks] = await Promise.all([getPedagogicalPool(), getDirectorCards(), getSavedCards()]);
    return <RebondirClient details={details} directors={directors} savedIds={bookmarks.ids} initialChoices={bookmarks.choices ?? {}} savedError={bookmarks.error}/>;
}
