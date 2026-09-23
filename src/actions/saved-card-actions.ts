'use server';

import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { CardChoice, CardChoices } from '@/lib/card-choice';

export async function getSavedCards(): Promise<{ ids: string[]; choices?: CardChoices; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { ids: [], error: 'Connectez-vous pour retrouver vos cartes mises de côté.' };
    const { data, error } = await ctx.supabase.from('saved_pedagogical_cards')
        .select('content_id, accroche_choisie, action_id').eq('user_id', ctx.user.id).order('created_at', { ascending: false });
    if (error) {
        console.error('[getSavedCards]', error.message);
        return { ids: [], error: 'Vos cartes mises de côté ne sont pas disponibles pour le moment. Réessayez.' };
    }
    return { ids: (data ?? []).map(row => row.content_id), choices: Object.fromEntries((data ?? []).filter(row => row.accroche_choisie).map(row => [row.content_id, { accroche: row.accroche_choisie!, actionId: row.action_id }])) };
}

/** Un état souhaité explicite rend les répétitions de requête sans effet indésirable. */
export async function setCardSaved(contentId: string, saved: boolean, choice?: CardChoice): Promise<{ success: boolean; error?: string }> {
    if (typeof contentId !== 'string' || !contentId.trim() || contentId.length > 200 || typeof saved !== 'boolean') {
        return { success: false, error: 'Cette carte ne peut pas être enregistrée.' };
    }
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Reconnectez-vous pour enregistrer cette carte.' };
    if (choice) {
        if (typeof choice.accroche !== 'string' || !choice.accroche.trim() || choice.accroche.length > 10000 || (choice.actionId !== null && typeof choice.actionId !== 'string')) return { success: false, error: 'Choix invalide.' };
        const { data: card, error } = await ctx.supabase.from('pedagogical_content').select('actions').eq('id', contentId).single();
        if (error || !card || (choice.actionId && (!Array.isArray(card.actions) || !card.actions.some(a => a && typeof a === 'object' && 'id' in a && a.id === choice.actionId)))) return { success: false, error: 'Cette action n’est plus disponible.' };
    }
    const query = saved
        ? ctx.supabase.from('saved_pedagogical_cards').upsert(
            { user_id: ctx.user.id, content_id: contentId, ...(choice ? { accroche_choisie: choice.accroche, action_id: choice.actionId } : {}) },
            { onConflict: 'user_id,content_id', ignoreDuplicates: !choice },
        )
        : ctx.supabase.from('saved_pedagogical_cards').delete().eq('user_id', ctx.user.id).eq('content_id', contentId);
    const { error } = await query;
    if (error) {
        console.error('[setCardSaved]', error.message);
        return { success: false, error: 'La modification n’a pas été enregistrée. Réessayez.' };
    }
    revalidatePath('/stages/decouvrir');
    revalidatePath('/stages/[id]/program', 'page');
    return { success: true };
}
