import { listUsers, getClubs } from '@/actions/admin-actions';
import { getAllPedagogicalContent } from '@/actions/content-actions';
import { getAllFichesMemo } from '@/actions/fiche-memo-actions';
import { AdminClient } from './AdminClient';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let userRole: string | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        userRole = profile?.role ?? null;
    }

    const [{ users, error }, clubs, fiches, fichesMemo] = await Promise.all([
        listUsers(),
        getClubs(),
        getAllPedagogicalContent(),
        getAllFichesMemo('publie'),
    ]);

    const normalized = (users ?? []).map(u => ({
        ...u,
        clubs: Array.isArray(u.clubs) ? (u.clubs[0] ?? null) : u.clubs,
    }));

    return <AdminClient users={normalized} clubs={clubs} fiches={fiches} fichesMemo={fichesMemo} error={error} userRole={userRole} />;
}
