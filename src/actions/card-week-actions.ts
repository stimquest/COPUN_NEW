'use server';

import { requireAuth, requireStageOwner } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { CardChoice } from '@/lib/card-choice';
import { ensureCalendarWeek } from '@/lib/calendar-week';

export async function getWeeksForCard() {
    const ctx = await requireAuth();
    if (!ctx) return { weeks: [], error: 'Reconnectez-vous pour retrouver vos semaines.' };
    const [stages, votes] = await Promise.all([
        ctx.supabase.from('stages').select('id, title, dates, selected_content').eq('owner_id', ctx.user.id).is('closed_at', null).order('created_at', { ascending: false }),
        ctx.supabase.from('stage_vote_results').select('stage_id'),
    ]);
    if (stages.error || votes.error) return { weeks: [], error: 'Impossible de charger vos semaines. Réessayez.' };
    const voted = new Set(votes.data.map(vote => vote.stage_id));
    return { weeks: stages.data.filter(stage => !voted.has(stage.id)) };
}

export async function addCardToWeek(stageId: string, contentId: string, choice: CardChoice, discussed = false, day: string | null = null, executionStatus?: 'partial' | 'done') {
    if (!choice || typeof choice.accroche !== 'string' || choice.accroche.length > 10000 || (choice.actionId !== null && typeof choice.actionId !== 'string')) return { success: false, error: 'Choix invalide.' };
    const ctx = await requireStageOwner(stageId);
    if (!ctx) return { success: false, error: 'Semaine inaccessible.' };
    if (day !== null && !/^\d{4}-\d{2}-\d{2}$/.test(day)) return { success: false, error: 'Date invalide.' };
    const { error } = executionStatus
        ? await ctx.supabase.rpc('record_calendar_week_card_with_status', { p_stage_id: stageId, p_content_id: contentId, p_choice: choice, p_execution_status: executionStatus })
        : await ctx.supabase.rpc('record_calendar_week_card', { p_stage_id: stageId, p_content_id: contentId, p_choice: choice, p_discussed: discussed, p_day: day });
    if (error) return { success: false, error: error.message };
    revalidatePath('/stages/semaines');
    revalidatePath(`/stages/${stageId}/program`);
    revalidatePath(`/stages/${stageId}/bilan`);
    revalidatePath('/profil/carnet');
    return { success: true };
}

export async function addCardToCalendarWeek(next: boolean, contentId: string, choice: CardChoice, discussed: boolean, day: string | null = null) {
    if (next && discussed) return { success: false, error: 'Un sujet déjà abordé appartient à la semaine en cours.' };
    const week = await ensureCalendarWeek(next);
    if (!week) return { success: false, error: 'Reconnectez-vous pour retrouver votre semaine.' };
    const result = await addCardToWeek(week.id, contentId, choice, discussed, day);
    return result.success ? { ...result, stageId: week.id } : result;
}
