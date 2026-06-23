import { getLeaderboard } from '@/actions/defi-actions';
import { getMyTotalPoints } from '@/actions/quiz-actions';
import { createClient } from '@/lib/supabase/server';
import StatsClient from './StatsClient';

export default async function StatsPage() {
    const supabase = await createClient();

    const [monitors, clubs, myPoints, { data: { user } }] = await Promise.all([
        getLeaderboard('monitors', 20),
        getLeaderboard('clubs', 10),
        getMyTotalPoints(),
        supabase.auth.getUser(),
    ]);

    return (
        <StatsClient
            monitors={monitors}
            clubs={clubs}
            currentUserId={user?.id ?? null}
            myPoints={myPoints}
        />
    );
}
