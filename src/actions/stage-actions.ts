'use server';

import { createClient } from '@/lib/supabase/server';
import { isStageObjectiveExecutionStatus, isStageObjectiveImpactLevel } from '@/lib/stage-objective-review';
import { revalidatePath } from 'next/cache';
import { SESSION_TEMPLATES } from '@/data/session-templates';
import { StageObjectiveReviewDraft } from '@/types';

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

export async function createStage(data: { title: string, activity: string, level: string, dates: string, nb_stagiaires?: number, suggested_thematics?: string[] }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Vous devez être connecté pour créer un stage." };
    }

    const { data: created, error } = await supabase
        .from('stages')
        .insert([
            {
                title: data.title,
                activity: data.activity,
                level: data.level,
                dates: data.dates,
                nb_stagiaires: data.nb_stagiaires ?? null,
                selected_content: [],
                suggested_thematics: data.suggested_thematics ?? [],
                owner_id: user.id
            }
        ])
        .select('id')
        .single();

    if (error) {
        console.error('Error creating stage:', error);
        return { success: false, error: error.message };
    }

    // Auto-assigner le défi fil rouge du moniteur si défini
    const { data: profile } = await supabase
        .from('profiles')
        .select('defi_fil_rouge_id')
        .eq('id', user.id)
        .single();

    if (profile?.defi_fil_rouge_id) {
        await supabase.from('stage_exploits').insert({
            stage_id: created.id,
            exploit_id: profile.defi_fil_rouge_id,
            status: 'en_cours',
        });
    }

    revalidatePath('/stages');
    return { success: true, stageId: created.id };
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
        .rpc('shift_session_structure', {
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

export async function deleteStage(stageId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('stages')
        .delete()
        .eq('id', stageId);

    if (error) return { success: false, error: error.message };
    revalidatePath('/stages');
    return { success: true };
}

// ─── Step Todos ───────────────────────────────────────────────────────────────

export async function addStepTodo(stepId: string, stageId: string, text: string, order: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('step_todos')
        .insert({ session_step_id: stepId, text, todo_order: order })
        .select()
        .single();

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true, todo: data };
}

export async function updateStepTodo(todoId: string, stageId: string, patch: { text?: string; done?: boolean; todo_order?: number }) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('step_todos')
        .update(patch)
        .eq('id', todoId);

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

export async function deleteStepTodo(todoId: string, stageId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('step_todos')
        .delete()
        .eq('id', todoId);

    if (error) return { success: false, error: error.message };
    revalidatePath(`/stages/${stageId}/sessions`);
    return { success: true };
}

export async function getStepTodosForStage(stageId: string): Promise<{ step_id: string; todos: import('@/types').StepTodo[] }[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('step_todos')
        .select(`
            *,
            session_structure!inner(
                id,
                sessions!inner(
                    stage_id
                )
            )
        `)
        .eq('session_structure.sessions.stage_id', stageId)
        .order('todo_order');

    if (error || !data) return [];

    const grouped: Record<string, import('@/types').StepTodo[]> = {};
    data.forEach((row: Record<string, unknown>) => {
        const stepId = row.session_step_id as string;
        if (!grouped[stepId]) grouped[stepId] = [];
        grouped[stepId].push(row as import('@/types').StepTodo);
    });

    return Object.entries(grouped).map(([step_id, todos]) => ({ step_id, todos }));
}

export async function getPastTodosForUser(stageId: string): Promise<string[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('step_todos')
        .select(`
            text,
            session_structure!inner(
                sessions!inner(
                    stages!inner(owner_id)
                )
            )
        `)
        .eq('session_structure.sessions.stages.owner_id', user.id)
        .neq('session_structure.sessions.stage_id', stageId)
        .order('created_at', { ascending: false })
        .limit(200);

    if (error || !data) return [];

    const seen = new Set<string>();
    const texts: string[] = [];
    data.forEach((row: Record<string, unknown>) => {
        const t = (row.text as string).trim();
        if (!seen.has(t)) { seen.add(t); texts.push(t); }
    });
    return texts;
}

/* ─── CLÔTURE DE STAGE ─────────────────────────────────────────────── */

type CloseStageInput = {
  closingNotes: string;
  objectiveReviews: StageObjectiveReviewDraft[];
};

export async function closeStage(stageId: string, input: CloseStageInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non autorisé' };
  }

  const { data: stage, error: stageError } = await supabase
    .from('stages')
    .select('selected_content')
    .eq('id', stageId)
    .eq('owner_id', user.id)
    .single();

  if (stageError || !stage) {
    console.error('Error fetching stage before closing:', stageError);
    return { success: false, error: stageError?.message || 'Stage introuvable' };
  }

  const selectedContent: string[] = stage.selected_content ?? [];
  const selectedSet = new Set(selectedContent);
  const reviewByContentId = new Map<string, StageObjectiveReviewDraft>();

  for (const review of input.objectiveReviews ?? []) {
    if (!review?.pedagogicalContentId || !selectedSet.has(review.pedagogicalContentId)) continue;
    if (!review.executionStatus || !isStageObjectiveExecutionStatus(review.executionStatus)) {
      return { success: false, error: 'Chaque objectif doit avoir un sort renseigné.' };
    }

    const normalizedReview: StageObjectiveReviewDraft = {
      pedagogicalContentId: review.pedagogicalContentId,
      executionStatus: review.executionStatus,
      impactLevel: review.executionStatus === 'not_done'
        ? null
        : (review.impactLevel && isStageObjectiveImpactLevel(review.impactLevel) ? review.impactLevel : null),
      note: typeof review.note === 'string' ? review.note.trim() : '',
    };

    if (normalizedReview.executionStatus !== 'not_done' && !normalizedReview.impactLevel) {
      return { success: false, error: 'Renseignez aussi la qualité ressentie pour chaque objectif mené.' };
    }

    reviewByContentId.set(normalizedReview.pedagogicalContentId, normalizedReview);
  }

  if (selectedContent.length > 0) {
    const missingReviews = selectedContent.filter(contentId => !reviewByContentId.has(contentId));
    if (missingReviews.length > 0) {
      return { success: false, error: 'Complétez l’analyse de chaque objectif avant de clôturer le stage.' };
    }

    const { error: reviewError } = await supabase
      .from('stage_objective_reviews')
      .upsert(
        Array.from(reviewByContentId.values()).map(review => ({
          stage_id: stageId,
          pedagogical_content_id: review.pedagogicalContentId,
          execution_status: review.executionStatus,
          impact_level: review.executionStatus === 'not_done' ? null : review.impactLevel,
          note: review.note || null,
        })),
        { onConflict: 'stage_id,pedagogical_content_id' }
      );

    if (reviewError) {
      console.error('Error saving stage objective reviews:', reviewError);
      return { success: false, error: reviewError.message };
    }
  }

  const normalizedNotes = input.closingNotes.trim();

  const { data, error } = await supabase
    .from('stages')
    .update({
      closed_at: new Date().toISOString(),
      closing_notes: normalizedNotes || null,
    })
    .eq('id', stageId)
    .eq('owner_id', user.id)
    .select('id, closed_at, closing_notes')
    .single();

  if (error) {
    console.error('Error closing stage:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/stages/${stageId}`);
  revalidatePath(`/stages/${stageId}/bilan`);
  revalidatePath('/stages');

  return { success: true, stage: data };
}

export async function reopenStage(stageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non autorisé' };
  }

  const { error } = await supabase
    .from('stages')
    .update({
      closed_at: null,
    })
    .eq('id', stageId)
    .eq('owner_id', user.id);

  if (error) {
    console.error('Error reopening stage:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/stages/${stageId}`);
  revalidatePath(`/stages/${stageId}/bilan`);
  revalidatePath('/stages');

  return { success: true };
}

export async function updateClosingNotes(stageId: string, closingNotes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non autorisé' };
  }

  const { error } = await supabase
    .from('stages')
    .update({ closing_notes: closingNotes || null })
    .eq('id', stageId)
    .eq('owner_id', user.id);

  if (error) {
    console.error('Error updating closing notes:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/stages/${stageId}`);
  revalidatePath(`/stages/${stageId}/bilan`);
  return { success: true };
}
