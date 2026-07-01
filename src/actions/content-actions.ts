'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { PedagogicalContent } from '@/types';

export async function getAllPedagogicalContent(): Promise<PedagogicalContent[]> {
    const ctx = await requireAuth();
    if (!ctx) return [];

    const { data, error } = await ctx.supabase
        .from('pedagogical_content')
        .select('*')
        .order('dimension', { ascending: true })
        .order('niveau', { ascending: true });

    if (error) {
        console.error('[getAllPedagogicalContent]', error.message);
        return [];
    }
    return data as PedagogicalContent[];
}

async function requireAdmin() {
    const ctx = await requireAuth();
    if (!ctx) return null;
    const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('role')
        .eq('id', ctx.user.id)
        .single();
    if (profile?.role !== 'admin') return null;
    return ctx;
}

export async function updatePedagogicalContent(id: string, data: Partial<PedagogicalContent>) {
    const ctx = await requireAdmin();
    if (!ctx) return { success: false, error: 'Accès refusé.' };

    const { error } = await ctx.supabase
        .from('pedagogical_content')
        .update(data)
        .eq('id', id);

    if (error) {
        console.error('[updatePedagogicalContent]', error.message);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/stages');
    return { success: true };
}

export async function deletePedagogicalContent(id: string) {
    const ctx = await requireAdmin();
    if (!ctx) return { success: false, error: 'Accès refusé.' };

    const { error } = await ctx.supabase
        .from('pedagogical_content')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[deletePedagogicalContent]', error.message);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/stages');
    return { success: true };
}

export async function createPedagogicalContent(data: Partial<PedagogicalContent>) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Vous devez être connecté pour créer une fiche.' };

    const newContent = {
        question: data.question,
        objectif: data.objectif,
        tip: data.tip,
        niveau: data.niveau || 1,
        dimension: data.dimension || 'COMPRENDRE',
        tags_theme: data.tags_theme || [],
        tags_filtre: [...(data.tags_filtre || []).filter(t => t !== 'Personnel'), 'Personnel'],
        owner_id: ctx.user.id,
        is_public: false,
    };

    const { data: inserted, error } = await ctx.supabase
        .from('pedagogical_content')
        .insert(newContent)
        .select()
        .single();

    if (error) {
        console.error('[createPedagogicalContent]', error.message);
        return { success: false, error: error.message };
    }

    revalidatePath('/stages');
    return { success: true, data: inserted };
}

export async function getUserContent() {
    const ctx = await requireAuth();
    if (!ctx) return [];

    const { data, error } = await ctx.supabase
        .from('pedagogical_content')
        .select('*')
        .eq('owner_id', ctx.user.id);

    if (error) {
        console.error('[getUserContent]', error.message);
        return [];
    }
    return data as PedagogicalContent[];
}
