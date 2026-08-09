'use server';

import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Sujet } from '@/types';

export async function getSujetsForStage(stageId: string): Promise<Sujet[]> {
    const ctx = await requireAuth();
    if (!ctx) return [];

    const { data } = await ctx.supabase
        .from('sujets')
        .select('id, stage_id, titre, accroche, points_cles, a_retenir, notes_perso, acquis, sujet_sources(pedagogical_content_id)')
        .eq('stage_id', stageId)
        .order('created_at');

    return (data ?? []).map(s => ({
        ...s,
        sources: (s.sujet_sources ?? []).map((x: { pedagogical_content_id: string }) => x.pedagogical_content_id),
    })) as Sujet[];
}

export async function creerSujet(
    stageId: string,
    titre: string,
    sourceIds: string[],
    contenu: { accroche: string; points_cles: string; a_retenir: string },
): Promise<{ success: boolean; sujetId?: string; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { data: sujet, error } = await ctx.supabase
        .from('sujets')
        .insert({
            owner_id: ctx.user.id,
            stage_id: stageId,
            titre: titre.trim(),
            accroche: contenu.accroche || null,
            points_cles: contenu.points_cles || null,
            a_retenir: contenu.a_retenir || null,
        })
        .select('id')
        .single();

    if (error || !sujet) return { success: false, error: error?.message ?? 'Erreur création' };

    if (sourceIds.length) {
        await ctx.supabase.from('sujet_sources').insert(
            sourceIds.map(id => ({ sujet_id: sujet.id, pedagogical_content_id: id })),
        );
    }

    revalidatePath(`/stages/${stageId}/program`);
    return { success: true, sujetId: sujet.id };
}

export async function majSujet(
    sujetId: string,
    data: Partial<Pick<Sujet, 'titre' | 'accroche' | 'points_cles' | 'a_retenir' | 'notes_perso' | 'acquis'>>,
): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase
        .from('sujets')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', sujetId);

    if (error) return { success: false, error: error.message };
    revalidatePath('/stages');
    return { success: true };
}

export async function supprimerSujet(sujetId: string): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase.from('sujets').delete().eq('id', sujetId);
    if (error) return { success: false, error: error.message };

    revalidatePath('/stages');
    return { success: true };
}
