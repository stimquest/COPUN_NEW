import { listUsers, getClubs } from '@/actions/admin-actions';
import { AdminClient } from './AdminClient';
import { createClient, getCachedUser } from '@/lib/supabase/server';

export default async function AdminPage() {
    const supabase = await createClient();
    const user = await getCachedUser();
    let userRole: string | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        userRole = profile?.role ?? null;
    }

    const [{ users, error }, clubs] = await Promise.all([
        listUsers(),
        getClubs(),
    ]);

    const normalized = (users ?? []).map(u => ({
        ...u, full_name: u.full_name ?? undefined, email: u.email ?? '', role: u.role ?? 'instructor', created_at: u.created_at ?? '',
        clubs: Array.isArray(u.clubs) ? (u.clubs[0] ?? null) : u.clubs,
    }));

    return <AdminClient users={normalized} clubs={clubs} error={error} userRole={userRole} />;
}
