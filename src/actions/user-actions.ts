'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleValidation(contentId: string, sessionId: string, isValidated: boolean) {
    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Vous devez être connecté pour valider." };
    }

    if (isValidated) {
        // Remove validation
        const { error } = await supabase
            .from('user_validations')
            .delete()
            .match({
                user_id: user.id,
                content_id: contentId,
                session_id: sessionId
            });

        if (error) return { success: false, error: error.message };
    } else {
        // Add validation
        const { error } = await supabase
            .from('user_validations')
            .insert({
                user_id: user.id,
                content_id: contentId,
                session_id: sessionId
            });

        if (error) return { success: false, error: error.message };
    }

    // Revalidate the session page to update UI
    revalidatePath(`/session/${sessionId}`);
    return { success: true };
}

export async function getSessionValidations(sessionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('user_validations')
        .select('content_id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

    if (error) {
        console.error('Error fetching validations:', error);
        return [];
    }

    return data.map(v => v.content_id);
}

export async function getProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, clubs(name)')
        .eq('id', user.id)
        .single();

    if (error) {
        console.warn('Note: Profile found but club link may be missing:', error.message);
        // Fallback info from auth
        return {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            role: 'instructor'
        };
    }

    return profile;
}

export async function getUserStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { count: validationsCount } = await supabase
        .from('user_validations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    const { count: createdCount } = await supabase
        .from('pedagogical_content')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

    return {
        totalValidations: validationsCount || 0,
        createdContent: createdCount || 0,
    };
}
