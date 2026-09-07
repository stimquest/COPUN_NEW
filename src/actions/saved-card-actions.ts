'use server';

import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSavedCards(): Promise<{ ids: string[]; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { ids: [], error: 'Connectez-vous pour retrouver vos cartes mises de côté.' };
    const { data, error } = await ctx.supabase.from('saved_pedagogical_cards')
        .select('content_id').eq('user_id', ctx.user.id).order('created_at', { ascending: false });
    if (error) {
        console.error('[getSavedCards]', error.message);
        return { ids: [], error: 'Vos cartes mises de côté ne sont pas disponibles pour le moment. Réessayez.' };
    }
    return { ids: (data ?? []).map(row => row.content_id as string) };
}

/** Un état souhaité explicite rend les répétitions de requête sans effet indésirable. */
export async function setCardSaved(contentId: string, saved: boolean): Promise<{ success: boolean; error?: string }> {
    if (typeof contentId !== 'string' || !contentId.trim() || contentId.length > 200 || typeof saved !== 'boolean') {
        return { success: false, error: 'Cette carte ne peut pas être enregistrée.' };
    }
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Reconnectez-vous pour enregistrer cette carte.' };
    const query = saved
        ? ctx.supabase.from('saved_pedagogical_cards').upsert(
            { user_id: ctx.user.id, content_id: contentId },
            { onConflict: 'user_id,content_id', ignoreDuplicates: true },
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
