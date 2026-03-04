'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SESSION_TEMPLATES } from '@/data/session-templates';

/**
 * Persists the selected pedagogical pool for a stage.
 * Layer 1: Strategy
 */
export async function updateStagePool(stageId: string, contentIds: string[]) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('stages')
        .update({ selected_content: contentIds })
        .eq('id', stageId);

    if (error) {
        console.error('Error updating stage pool:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/stages/${stageId}`);
    revalidatePath(`/stages/${stageId}/program`);
    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

/**
 * Persists links between a session step and a pedagogical card.
 * Layer 2: Tactics
 */
export async function linkCardToStep(stepId: string, cardId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('session_step_pedagogical_links')
        .insert({ session_step_id: stepId, pedagogical_content_id: cardId });

    if (error) {
        console.error('Error linking card:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function unlinkCardFromStep(stepId: string, cardId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('session_step_pedagogical_links')
        .delete()
        .match({ session_step_id: stepId, pedagogical_content_id: cardId });

    if (error) {
        console.error('Error unlinking card:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function createStage(data: { title: string, activity: string, level: string, dates: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Vous devez être connecté pour créer un stage." };
    }

    const { error } = await supabase
        .from('stages')
        .insert([
            {
                title: data.title,
                activity: data.activity,
                level: data.level,
                dates: data.dates,
                selected_content: [],
                owner_id: user.id
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating stage:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/stages');
    return { success: true };
}

/**
 * Initializes a default week of sessions for a new stage.
 * Now creates 5 empty sessions (Mon-Fri) without steps.
 */
export async function initializeStageSessions(stageId: string) {
    const supabase = await createClient();
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

    for (let i = 0; i < days.length; i++) {
        const { error: sError } = await supabase
            .from('sessions')
            .insert({
                stage_id: stageId,
                title: `${days[i]}`,
                session_order: i + 1
            });

        if (sError) return { success: false, error: sError.message };
    }

    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

/**
 * Applies a specific template to an existing session.
 * Replaces any existing steps with steps from the template.
 */
export async function applyTemplateToSession(sessionId: string, stageId: string, templateId: string) {
    const supabase = await createClient();
    const template = SESSION_TEMPLATES.find(t => t.id === templateId) || SESSION_TEMPLATES[0];

    // 1. Delete existing steps for this session to avoid mixing
    const { error: deleteError } = await supabase
        .from('session_structure')
        .delete()
        .eq('session_id', sessionId);

    if (deleteError) return { success: false, error: deleteError.message };

    // 2. Create steps from template
    const stepsToInsert = template.steps.map((s, idx) => ({
        session_id: sessionId,
        step_title: s.title,
        step_duration_minutes: s.duration,
        step_order: idx + 1
    }));

    const { error: stepsError } = await supabase
        .from('session_structure')
        .insert(stepsToInsert);

    if (stepsError) return { success: false, error: stepsError.message };

    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

export async function createSession(stageId: string, templateId: string, order: number, title?: string) {
    const supabase = await createClient();
    const template = SESSION_TEMPLATES.find(t => t.id === templateId) || SESSION_TEMPLATES[0];

    const { data: session, error: sError } = await supabase
        .from('sessions')
        .insert({
            stage_id: stageId,
            title: title || `Session ${order} : ${template.label}`,
            session_order: order
        })
        .select()
        .single();

    if (sError) return { success: false, error: sError.message };

    const stepsToInsert = template.steps.map((s, idx) => ({
        session_id: session.id,
        step_title: s.title,
        step_duration_minutes: s.duration,
        step_order: idx + 1
    }));

    const { error: stepsError } = await supabase
        .from('session_structure')
        .insert(stepsToInsert);

    if (stepsError) return { success: false, error: stepsError.message };

    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

export async function updateSession(sessionId: string, stageId: string, updates: { title?: string }) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId);

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

export async function updateStep(stepId: string, stageId: string, updates: { step_title?: string, step_duration_minutes?: number }) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('session_structure')
        .update(updates)
        .eq('id', stepId);

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

export async function addStep(sessionId: string, stageId: string, order: number) {
    const supabase = await createClient();
    // 1. Shift existing steps
    const { error: shiftError } = await supabase
        .rpc('shift_session_steps', {
            p_session_id: sessionId,
            p_min_order: order
        });

    // Fallback if RPC doesn't exist yet (manual shift)
    if (shiftError) {
        const { data: steps } = await supabase
            .from('session_structure')
            .select('id, step_order')
            .eq('session_id', sessionId)
            .gte('step_order', order);

        if (steps && steps.length > 0) {
            for (const s of steps) {
                await supabase
                    .from('session_structure')
                    .update({ step_order: s.step_order + 1 })
                    .eq('id', s.id);
            }
        }
    }

    // 2. Insert new step
    const { error } = await supabase
        .from('session_structure')
        .insert({
            session_id: sessionId,
            step_title: 'Nouvelle Étape',
            step_duration_minutes: 10,
            step_order: order
        });

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

export async function deleteStep(stepId: string, stageId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('session_structure')
        .delete()
        .eq('id', stepId);

    if (error) {
        console.error('Error deleting step:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}
