'use server';

import { requireAuth, requireStageOwner } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { CardChoice } from '@/lib/card-choice';

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

export async function addCardToWeek(stageId: string, contentId: string, choice: CardChoice, discussed = false) {
    if (!choice || typeof choice.accroche !== 'string' || choice.accroche.length > 10000 || (choice.actionId !== null && typeof choice.actionId !== 'string')) return { success: false, error: 'Choix invalide.' };
    const ctx = await requireStageOwner(stageId);
    if (!ctx) return { success: false, error: 'Semaine inaccessible.' };
    const { error } = await ctx.supabase.rpc('use_week_card', { p_stage_id: stageId, p_content_id: contentId, p_choice: choice, p_discussed: discussed });
    if (error) return { success: false, error: error.message };
    revalidatePath('/stages/semaines');
    revalidatePath(`/stages/${stageId}/program`);
    revalidatePath(`/stages/${stageId}/bilan`);
    return { success: true };
}
