'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { PedagogicalAction, WeekObservation } from '@/types';

export async function addObservation(
    stageId: string,
    text: string,
    pedagogicalAction: PedagogicalAction | null,
    linkedThematic: string | null,
) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { data, error } = await ctx.supabase
        .from('week_observations')
        .insert({
            stage_id: stageId,
            text: text.trim(),
            pedagogical_action: pedagogicalAction,
            linked_thematic: linkedThematic,
        })
        .select()
        .single();

    if (error) {
        console.error('[addObservation]', error.message);
        return { success: false, error: error.message };
    }

    revalidatePath('/stages');
    return { success: true, observation: data as WeekObservation };
}

export async function deleteObservation(observationId: string) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase
        .from('week_observations')
        .delete()
        .eq('id', observationId);

    if (error) {
        console.error('[deleteObservation]', error.message);
        return { success: false, error: error.message };
    }

    revalidatePath('/stages');
    return { success: true };
}

export async function getObservationsForStage(stageId: string): Promise<WeekObservation[]> {
    const ctx = await requireAuth();
    if (!ctx) return [];

    const { data, error } = await ctx.supabase
        .from('week_observations')
        .select('*')
        .eq('stage_id', stageId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getObservationsForStage]', error.message);
        return [];
    }
    return data as WeekObservation[];
}
