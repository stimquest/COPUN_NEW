import 'server-only';
import { requireAuth } from '@/lib/auth';
import { calendarWeek, parseStageDateRange } from '@/lib/stage-dates';
import { stageModel } from '@/lib/data-models';

export async function ensureCalendarWeek(next = false) {
    const ctx = await requireAuth();
    if (!ctx) return null;
    const { start } = calendarWeek(next);
    const { data: stages, error: readError } = await ctx.supabase.from('stages').select('*').eq('owner_id', ctx.user.id).order('created_at', { ascending: false });
    if (readError) throw new Error('Impossible de retrouver votre semaine.', { cause: readError });
    const canonical = stages.find(stage => stage.calendar_week_start === start);
    if (canonical) return stageModel(canonical);
    const existing = stages.find(stage => {
        const range = parseStageDateRange(stage.dates, new Date(`${start}T12:00:00Z`));
        return range && calendarWeek(false, range.start).start === start;
    });
    const { data: id, error } = await ctx.supabase.rpc('ensure_calendar_week', { p_next: next, p_existing_id: existing?.id ?? null });
    if (error) throw new Error('Votre semaine n’a pas pu être ouverte. Réessayez.', { cause: error });
    const { data: stage, error: stageError } = await ctx.supabase.from('stages').select('*').eq('id', id).eq('owner_id', ctx.user.id).single();
    if (stageError) throw new Error('Chargement de la semaine impossible.', { cause: stageError });
    return stageModel(stage);
}
