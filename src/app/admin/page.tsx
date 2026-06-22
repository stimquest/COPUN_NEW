import { listUsers, getClubs } from '@/actions/admin-actions';
import { AdminClient } from './AdminClient';

export default async function AdminPage() {
    const [{ users, error }, clubs] = await Promise.all([
        listUsers(),
        getClubs(),
    ]);

    const normalized = (users ?? []).map(u => ({
        ...u,
        clubs: Array.isArray(u.clubs) ? (u.clubs[0] ?? null) : u.clubs,
    }));

    return <AdminClient users={normalized} clubs={clubs} error={error} />;
}
