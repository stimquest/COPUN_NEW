'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleValidation(contentId: string, sessionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    // Check if validation exists
    const { data: existingValidation, error: fetchError } = await supabase
        .from('user_validations')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('session_id', sessionId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
        return { success: false, error: fetchError.message };
    }

    if (existingValidation) {
        // Validation exists -> DELETE (Unvalidate)
        const { error: deleteError } = await supabase
            .from('user_validations')
            .delete()
            .eq('id', existingValidation.id);

        if (deleteError) return { success: false, error: deleteError.message };
    } else {
        // Validation does not exist -> INSERT (Validate)
        const { error: insertError } = await supabase
            .from('user_validations')
            .insert({
                user_id: user.id,
                content_id: contentId,
                session_id: sessionId
            });

        if (insertError) return { success: false, error: insertError.message };
    }

    revalidatePath(`/session/${sessionId}`);
    return { success: true };
}
