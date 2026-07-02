'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { ObservationType, PedagogicalAction, WeekObservation } from '@/types';

export type ObservationInput = {
    stageId: string;
    text: string;
    pedagogicalAction: PedagogicalAction | null;
    linkedThematic: string | null;
    observationType: ObservationType | null;
    targetId: string | null;
    speciesLabel: string | null;
    speciesUncertain: boolean;
    individualCount: number | null;
    locationNote: string | null;
    observedAt: string | null;
};

export async function addObservation(input: ObservationInput) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { data, error } = await ctx.supabase
        .from('week_observations')
        .insert({
            stage_id: input.stageId,
            text: input.text.trim(),
            pedagogical_action: input.pedagogicalAction,
            linked_thematic: input.linkedThematic,
            observation_type: input.observationType,
            target_id: input.targetId,
            species_label: input.speciesLabel?.trim() || null,
            species_uncertain: input.speciesUncertain,
            individual_count: input.individualCount,
            location_note: input.locationNote?.trim() || null,
            observed_at: input.observedAt,
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
