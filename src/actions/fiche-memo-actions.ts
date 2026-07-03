'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { ThematicTag } from '@/data/seasonal-context';

async function requireAdminOrModerator() {
    const ctx = await requireAuth();
    if (!ctx) return null;
    const { data: profile } = await ctx.supabase
        .from('profiles').select('role').eq('id', ctx.user.id).single();
    if (!profile || !['admin', 'moderator'].includes(profile.role)) return null;
    return ctx;
}

export type FicheStatut = 'brouillon' | 'publie';

export interface FicheMemo {
    id: string;
    titre: string;
    resume: string | null;
    contenu: string;
    tags_thematiques: ThematicTag[];
    tags_saisons: string[];
    tags: string[];
    statut: FicheStatut;
    auteur_id: string | null;
    created_at: string;
    updated_at: string;
    auteur?: { full_name: string | null; email: string | null } | null;
}

export interface CreateFicheData {
    titre: string;
    resume?: string;
    contenu: string;
    tags_thematiques: ThematicTag[];
    tags_saisons: string[];
    tags: string[];
}

export async function getAllFichesMemo(filtreStatut?: FicheStatut): Promise<FicheMemo[]> {
    const supabase = await createClient();
    let query = supabase
        .from('fiches_memo')
        .select('*, auteur:profiles(full_name, email)')
        .order('updated_at', { ascending: false });
    if (filtreStatut) query = query.eq('statut', filtreStatut);
    const { data, error } = await query;
    if (error) { console.error('[getAllFichesMemo]', error.message); return []; }
    return data as FicheMemo[];
}

export async function getFicheMemoById(id: string): Promise<FicheMemo | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fiches_memo').select('*, auteur:profiles(full_name, email)').eq('id', id).single();
    if (error) return null;
    return data as FicheMemo;
}

export async function getFichesMemoByTheme(tag: ThematicTag): Promise<FicheMemo[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fiches_memo').select('*, auteur:profiles(full_name, email)')
        .eq('statut', 'publie').contains('tags_thematiques', [tag]).order('updated_at', { ascending: false });
    if (error) return [];
    return data as FicheMemo[];
}

export async function getFichesMemoByFilters(tags_thematiques: ThematicTag[], tags_saisons: string[]): Promise<FicheMemo[]> {
    const supabase = await createClient();
    let query = supabase
        .from('fiches_memo').select('*, auteur:profiles(full_name, email)')
        .eq('statut', 'publie').order('updated_at', { ascending: false });
    if (tags_thematiques.length > 0) query = query.overlaps('tags_thematiques', tags_thematiques);
    if (tags_saisons.length > 0) query = query.overlaps('tags_saisons', tags_saisons);
    const { data, error } = await query;
    if (error) return [];
    return data as FicheMemo[];
}

/**
 * Fiches mémo pertinentes pour une carte objectif, par rapprochement de tags — sans lien
 * manuel à poser. Score : +2 par tags_theme en commun (mêmes valeurs que tags_thematiques),
 * +1 par tags_filtre (mot-clé précis, ex. "marée") retrouvé dans les tags libres de la fiche.
 * Seules les fiches avec un score > 0 sont retenues, triées par pertinence.
 */
export async function getFichesMemoForCard(
    tags_theme: string[],
    tags_filtre: string[],
): Promise<FicheMemo[]> {
    if (tags_theme.length === 0 && tags_filtre.length === 0) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fiches_memo')
        .select('*, auteur:profiles(full_name, email)')
        .eq('statut', 'publie')
        .or([
            tags_theme.length > 0 ? `tags_thematiques.ov.{${tags_theme.join(',')}}` : null,
            tags_filtre.length > 0 ? `tags.ov.{${tags_filtre.join(',')}}` : null,
        ].filter(Boolean).join(','));

    if (error || !data) return [];

    const filtreLower = tags_filtre.map(t => t.toLowerCase());
    const themeSet = new Set(tags_theme);

    return (data as FicheMemo[])
        .map(fiche => {
            const themeMatches = fiche.tags_thematiques.filter(t => themeSet.has(t)).length;
            const filtreMatches = (fiche.tags ?? []).filter(t => filtreLower.includes(t.toLowerCase())).length;
            return { fiche, score: themeMatches * 2 + filtreMatches };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(x => x.fiche);
}

export async function createFicheMemo(ficheData: CreateFicheData) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non connecté' };

    const { data, error } = await ctx.supabase
        .from('fiches_memo')
        .insert({
            titre: ficheData.titre,
            resume: ficheData.resume ?? null,
            contenu: ficheData.contenu,
            tags_thematiques: ficheData.tags_thematiques,
            tags_saisons: ficheData.tags_saisons,
            tags: ficheData.tags ?? [],
            auteur_id: ctx.user.id,
            statut: 'brouillon',
        })
        .select()
        .single();

    if (error) { console.error('[createFicheMemo]', error.message); return { success: false, error: error.message }; }
    revalidatePath('/ressources');
    return { success: true, ficheId: data.id };
}

export async function updateFicheMemo(id: string, ficheData: Partial<CreateFicheData & { statut: FicheStatut }>) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non connecté' };

    const { data: profile } = await ctx.supabase.from('profiles').select('role').eq('id', ctx.user.id).single();
    if (!['admin', 'moderator'].includes(profile?.role)) {
        const { data: fiche } = await ctx.supabase.from('fiches_memo').select('auteur_id').eq('id', id).single();
        if (fiche?.auteur_id !== ctx.user.id) return { success: false, error: 'Accès refusé.' };
    }

    const { error } = await ctx.supabase.from('fiches_memo').update(ficheData).eq('id', id);
    if (error) { console.error('[updateFicheMemo]', error.message); return { success: false, error: error.message }; }
    revalidatePath('/ressources');
    revalidatePath(`/ressources/${id}`);
    return { success: true };
}

export async function publierFicheMemo(id: string) { return updateFicheMemo(id, { statut: 'publie' }); }
export async function depublierFicheMemo(id: string) { return updateFicheMemo(id, { statut: 'brouillon' }); }

export async function deleteFicheMemo(id: string) {
    const ctx = await requireAdminOrModerator();
    if (!ctx) return { success: false, error: 'Accès refusé.' };
    const { error } = await ctx.supabase.from('fiches_memo').delete().eq('id', id);
    if (error) { console.error('[deleteFicheMemo]', error.message); return { success: false, error: error.message }; }
    revalidatePath('/ressources');
    return { success: true };
}
