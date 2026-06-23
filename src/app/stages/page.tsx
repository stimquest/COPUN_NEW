import { getDashboardStages } from '@/services/data-service';
import { getProfile, getUserStats } from '@/actions/user-actions';
import HomeDashboard from '@/components/HomeDashboard';

export default async function StagesPage() {
    const [stages, profile, stats] = await Promise.all([
        getDashboardStages(),
        getProfile(),
        getUserStats()
    ]);

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : profile?.email?.slice(0, 2).toUpperCase() || '??';

    return (
        <HomeDashboard
            stages={stages}
            profile={profile}
            stats={stats}
            initials={initials}
        />
    );
}
