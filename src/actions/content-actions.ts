'use server';

import { createClient } from '@/lib/supabase/server';
import { PedagogicalContent } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createPedagogicalContent(data: Partial<PedagogicalContent>) {
    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Vous devez être connecté pour créer une fiche." };
    }

    // Prepare data
    const newContent = {
        question: data.question,
        objectif: data.objectif,
        tip: data.tip,
        niveau: data.niveau || 1,
        dimension: data.dimension || 'COMPRENDRE',
        tags_theme: data.tags_theme || [],
        tags_filtre: [...(data.tags_filtre || []).filter(t => t !== 'Personnel'), 'Personnel'],
        owner_id: user.id,
        is_public: false, // Default to private
        // Club ID can be added later if we fetch user's club
    };

    const { data: inserted, error } = await supabase
        .from('pedagogical_content')
        .insert(newContent)
        .select()
        .single();

    if (error) {
        console.error('Error creating content:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/stages'); // Revalidate potential paths
    return { success: true, data: inserted };
}

export async function getUserContent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('pedagogical_content')
        .select('*')
        .eq('owner_id', user.id);

    if (error) {
        console.error('Error fetching user content:', error);
        return [];
    }

    return data as PedagogicalContent[];
}
