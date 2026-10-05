import { redirect } from 'next/navigation';
import { ensureCalendarWeek } from '@/lib/calendar-week';

export default async function NextWeekPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
    const week = await ensureCalendarWeek(true);
    if (!week) redirect('/login');
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) if (value) query.set(key, value);
    redirect(`/stages/${week.id}/program${query.size ? `?${query}` : ''}`);
}
