import { listUsers, getClubs } from '@/actions/admin-actions';
import { getAllPedagogicalContent } from '@/actions/content-actions';
import { getAllFichesMemo } from '@/actions/fiche-memo-actions';
import { AdminClient } from './AdminClient';

export default async function AdminPage() {
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

    return <AdminClient users={normalized} clubs={clubs} fiches={fiches} fichesMemo={fichesMemo} error={error} />;
}
