import { redirect } from 'next/navigation';
import { weekHref } from '@/lib/week-navigation';
import { ensureCalendarWeek } from '@/lib/calendar-week';

export default async function CurrentWeekPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
    const week = await ensureCalendarWeek();
    if (!week) redirect('/login');
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) if (value) query.set(key, value);
    redirect(query.size ? `/stages/${week.id}/program?${query}` : weekHref(week.id));
}
