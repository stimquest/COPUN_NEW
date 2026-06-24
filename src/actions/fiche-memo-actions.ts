'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ThematicTag } from '@/data/seasonal-context';

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

    if (filtreStatut) {
        query = query.eq('statut', filtreStatut);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching fiches memo:', error.message);
        return [];
    }
    return data as FicheMemo[];
}

export async function getFicheMemoById(id: string): Promise<FicheMemo | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fiches_memo')
        .select('*, auteur:profiles(full_name, email)')
        .eq('id', id)
        .single();

    if (error) return null;
    return data as FicheMemo;
}

export async function getFichesMemoByTheme(tag: ThematicTag): Promise<FicheMemo[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fiches_memo')
        .select('*, auteur:profiles(full_name, email)')
        .eq('statut', 'publie')
        .contains('tags_thematiques', [tag])
        .order('updated_at', { ascending: false });

    if (error) return [];
    return data as FicheMemo[];
}

export async function getFichesMemoByFilters(
    tags_thematiques: ThematicTag[],
    tags_saisons: string[]
): Promise<FicheMemo[]> {
    const supabase = await createClient();
    let query = supabase
        .from('fiches_memo')
        .select('*, auteur:profiles(full_name, email)')
        .eq('statut', 'publie')
        .order('updated_at', { ascending: false });

    if (tags_thematiques.length > 0) {
        query = query.overlaps('tags_thematiques', tags_thematiques);
    }
    if (tags_saisons.length > 0) {
        query = query.overlaps('tags_saisons', tags_saisons);
    }

    const { data, error } = await query;
    if (error) return [];
    return data as FicheMemo[];
}

export async function createFicheMemo(ficheData: CreateFicheData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Non connecté' };

    const { data, error } = await supabase
        .from('fiches_memo')
        .insert({
            titre: ficheData.titre,
            resume: ficheData.resume ?? null,
            contenu: ficheData.contenu,
            tags_thematiques: ficheData.tags_thematiques,
            tags_saisons: ficheData.tags_saisons,
            tags: ficheData.tags ?? [],
            auteur_id: user.id,
            statut: 'brouillon',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating fiche memo:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/ressources');
    return { success: true, ficheId: data.id };
}

export async function updateFicheMemo(
    id: string,
    ficheData: Partial<CreateFicheData & { statut: FicheStatut }>
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('fiches_memo')
        .update(ficheData)
        .eq('id', id);

    if (error) {
        console.error('Error updating fiche memo:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/ressources');
    revalidatePath(`/ressources/${id}`);
    return { success: true };
}

export async function publierFicheMemo(id: string) {
    return updateFicheMemo(id, { statut: 'publie' });
}

export async function depublierFicheMemo(id: string) {
    return updateFicheMemo(id, { statut: 'brouillon' });
}

export async function deleteFicheMemo(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('fiches_memo')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting fiche memo:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/ressources');
    return { success: true };
}
