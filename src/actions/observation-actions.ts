'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { ObservationType, PedagogicalAction, WeekObservation } from '@/types';

// Un retour terrain rapporte 1 point, plafonné par semaine : assez pour valoriser le geste,
// pas assez pour que multiplier de fausses remontées fasse grimper au classement.

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

    // Points (non bloquants pour l'enregistrement du retour lui-même).
    // Le libellé embarque l'id de l'observation pour pouvoir reprendre le point si
    // le retour est supprimé.
    try {
        const { error: pointsError } = await ctx.supabase.rpc('award_verified_points', { p_stage_id: input.stageId, p_kind: 'observation', p_reference: data.id });
        if (pointsError) throw pointsError;
    } catch (e) {
        console.error('[addObservation] points non attribués:', e);
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

    // On reprend le point attribué à ce retour (supprimer/recréer ne rapporte donc rien).
    await ctx.supabase
        .from('leaderboard_points')
        .delete()
        .eq('monitor_id', ctx.user.id)
        .eq('reason', `Retour terrain [${observationId}]`);

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
