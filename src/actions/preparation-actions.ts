'use server';

import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type StagePreparation = {
    pedagogical_content_id: string;
    accroche_choisie: string | null;
    /** Idée à faire retenir, reprise de la fiche au moment du choix de l'accroche. */
    chute: string | null;
    /** Actions retenues pour ce sujet (`src/data/actions-sujets.ts`). */
    actions: string[] | null;
    /** Sujet raconté au groupe — la rature du carnet, pas un statut de tâche. */
    raconte: boolean | null;
};

export async function getStagePreparations(stageId: string): Promise<Record<string, StagePreparation>> {
    const ctx = await requireAuth();
    if (!ctx) return {};

    const { data, error } = await ctx.supabase
        .from('stage_preparations')
        .select('pedagogical_content_id, accroche_choisie, chute, actions, raconte')
        .eq('stage_id', stageId);

    // Une lecture en échec renvoyait {} — indiscernable d'une semaine non préparée, donc
    // d'une perte de données silencieuse côté moniteur. On trace au moins la cause.
    if (error) {
        console.error('[preparations] lecture impossible', error.message);
        return {};
    }

    const result: Record<string, StagePreparation> = {};
    (data ?? []).forEach((row: StagePreparation) => {
        result[row.pedagogical_content_id] = row;
    });
    return result;
}

/** Enregistre l'accroche retenue — la porte d'entrée du récit. */
export async function saveAccrocheChoice(
    stageId: string,
    contentId: string,
    accroche: string,
): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase.from('stage_preparations').upsert(
        {
            stage_id: stageId,
            pedagogical_content_id: contentId,
            accroche_choisie: accroche,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'stage_id,pedagogical_content_id' },
    );

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/preparer`);
    return { success: true };
}

/** Enregistre les actions retenues pour ce sujet. */
export async function saveActions(
    stageId: string,
    contentId: string,
    actions: string[],
): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase.from('stage_preparations').upsert(
        {
            stage_id: stageId,
            pedagogical_content_id: contentId,
            actions,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'stage_id,pedagogical_content_id' },
    );

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/preparer`);
    return { success: true };
}

/**
 * Enregistre les actions transversales du stage.
 *
 * Portées par le stage et non par le sujet : ce sont des rituels de semaine, choisis une
 * fois pour tous les sujets.
 */
export async function saveActionsSemaine(
    stageId: string,
    actions: string[],
): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase
        .from('stages')
        .update({ actions_semaine: actions })
        .eq('id', stageId);

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/preparer`);
    return { success: true };
}

/**
 * Marque un sujet comme raconté au groupe — ou revient en arrière.
 *
 * Reprend le geste du carnet papier (on raye ce qu'on a fait) plutôt qu'une case à
 * cocher : c'est un état du document, pas un statut d'exécution séparé avec impact et
 * raisons. Le suivi détaillé de la semaine vit dans le bilan de clôture.
 */
export async function toggleSujetRaconte(
    stageId: string,
    contentId: string,
    raconte: boolean,
): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase.from('stage_preparations').upsert(
        {
            stage_id: stageId,
            pedagogical_content_id: contentId,
            raconte,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'stage_id,pedagogical_content_id' },
    );

    if (error) return { success: false, error: error.message };
    revalidatePath('/stages');
    revalidatePath(`/stages/${stageId}/bilan`);
    return { success: true };
}

/** Enregistre l'idée finale : la phrase qui doit rester quand tout le reste est oublié. */
export async function saveChute(
    stageId: string,
    contentId: string,
    chute: string,
): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase.from('stage_preparations').upsert(
        {
            stage_id: stageId,
            pedagogical_content_id: contentId,
            chute,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'stage_id,pedagogical_content_id' },
    );

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/preparer`);
    return { success: true };
}

