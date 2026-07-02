'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { isStageObjectiveExecutionStatus, isStageObjectiveImpactLevel } from '@/lib/stage-objective-review';
import { revalidatePath } from 'next/cache';
import { StageObjectiveReviewDraft } from '@/types';
import { encodeIntention, ObjectifId } from '@/data/objectifs';

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

    revalidatePath('/stages');
    revalidatePath(`/stages/${stageId}/program`);
    return { success: true };
}

/**
 * Met à jour le contexte saisonnier (thématiques suggérées + intention) d'un stage existant,
 * permettant au moniteur d'ajuster les conditions si elles ont changé depuis la création.
 */
export async function updateStageConditions(stageId: string, suggestedThematics: string[], intentionId: ObjectifId | null) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non autorisé' };

    const suggested = [...suggestedThematics];
    if (intentionId) suggested.push(encodeIntention(intentionId));

    const { error } = await ctx.supabase
        .from('stages')
        .update({ suggested_thematics: suggested })
        .eq('id', stageId)
        .eq('owner_id', ctx.user.id);

    if (error) {
        console.error('[updateStageConditions]', error.message);
        return { success: false, error: error.message };
    }

    revalidatePath('/stages');
    revalidatePath(`/stages/${stageId}/program`);
    return { success: true };
}

export async function createStage(data: { title: string, activity: string, level: string, dates: string, nb_stagiaires?: number, suggested_thematics?: string[], intention?: ObjectifId | null }) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Vous devez être connecté pour créer une semaine.' };

    const suggestedThematics = [...(data.suggested_thematics ?? [])];
    if (data.intention) suggestedThematics.push(encodeIntention(data.intention));

    const { data: created, error } = await ctx.supabase
        .from('stages')
        .insert([
            {
                title: data.title,
                activity: data.activity,
                level: data.level,
                dates: data.dates,
                nb_stagiaires: data.nb_stagiaires ?? null,
                selected_content: [],
                suggested_thematics: suggestedThematics,
                owner_id: ctx.user.id
            }
        ])
        .select('id')
        .single();

    if (error) {
        console.error('[createStage]', error.message);
        return { success: false, error: error.message };
    }

    // Auto-assigner le défi fil rouge du moniteur si défini
    const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('defi_fil_rouge_id')
        .eq('id', ctx.user.id)
        .single();

    if (profile?.defi_fil_rouge_id) {
        await ctx.supabase.from('stage_exploits').insert({
            stage_id: created.id,
            exploit_id: profile.defi_fil_rouge_id,
            status: 'en_cours',
        });
    }

    revalidatePath('/stages');
    return { success: true, stageId: created.id };
}

export async function updateStage(stageId: string, data: { title: string, activity: string, level: string, dates: string, nb_stagiaires?: number, suggested_thematics?: string[], intention?: ObjectifId | null }) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non autorisé' };

    const suggestedThematics = [...(data.suggested_thematics ?? [])];
    if (data.intention) suggestedThematics.push(encodeIntention(data.intention));

    const { error } = await ctx.supabase
        .from('stages')
        .update({
            title: data.title,
            activity: data.activity,
            level: data.level,
            dates: data.dates,
            nb_stagiaires: data.nb_stagiaires ?? null,
            suggested_thematics: suggestedThematics,
        })
        .eq('id', stageId)
        .eq('owner_id', ctx.user.id);

    if (error) {
        console.error('[updateStage]', error.message);
        return { success: false, error: error.message };
    }

    revalidatePath('/stages');
    revalidatePath(`/stages/${stageId}/program`);
    return { success: true, stageId };
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


/* ─── CLÔTURE DE STAGE ─────────────────────────────────────────────── */

type CloseStageInput = {
  closingNotes: string;
  objectiveReviews: StageObjectiveReviewDraft[];
};

export async function closeStage(stageId: string, input: CloseStageInput) {
  const ctx = await requireAuth();
  if (!ctx) return { success: false, error: 'Non autorisé' };
  const supabase = ctx.supabase;
  const user = ctx.user;

  const { data: stage, error: stageError } = await supabase
    .from('stages')
    .select('selected_content')
    .eq('id', stageId)
    .eq('owner_id', user.id)
    .single();

  if (stageError || !stage) {
    console.error('Error fetching stage before closing:', stageError);
    return { success: false, error: stageError?.message || 'Semaine introuvable' };
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

    reviewByContentId.set(normalizedReview.pedagogicalContentId, normalizedReview);
  }

  if (selectedContent.length > 0) {
    const missingReviews = selectedContent.filter(contentId => !reviewByContentId.has(contentId));
    if (missingReviews.length > 0) {
      return { success: false, error: 'Complétez l’analyse de chaque objectif avant de clôturer la semaine.' };
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

  revalidatePath('/stages');
  revalidatePath(`/stages/${stageId}/bilan`);

  return { success: true, stage: data };
}

export async function reopenStage(stageId: string) {
  const ctx = await requireAuth();
  if (!ctx) return { success: false, error: 'Non autorisé' };

  const { error } = await ctx.supabase
    .from('stages')
    .update({
      closed_at: null,
    })
    .eq('id', stageId)
    .eq('owner_id', ctx.user.id);

  if (error) {
    console.error('[reopenStage]', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/stages');
  revalidatePath(`/stages/${stageId}/bilan`);

  return { success: true };
}

export async function updateClosingNotes(stageId: string, closingNotes: string) {
  const ctx = await requireAuth();
  if (!ctx) return { success: false, error: 'Non autorisé' };

  const { error } = await ctx.supabase
    .from('stages')
    .update({ closing_notes: closingNotes || null })
    .eq('id', stageId)
    .eq('owner_id', ctx.user.id);

  if (error) {
    console.error('[updateClosingNotes]', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/stages');
  revalidatePath(`/stages/${stageId}/bilan`);
  return { success: true };
}

export async function saveObjectiveStatus(
  stageId: string,
  contentId: string,
  executionStatus: import('@/types').StageObjectiveExecutionStatus,
) {
  const ctx = await requireAuth();
  if (!ctx) return { success: false, error: 'Non autorisé' };

  const { error } = await ctx.supabase
    .from('stage_objective_reviews')
    .upsert(
      {
        stage_id: stageId,
        pedagogical_content_id: contentId,
        execution_status: executionStatus,
        impact_level: null,
      },
      { onConflict: 'stage_id,pedagogical_content_id', ignoreDuplicates: false }
    );

  if (error) {
    console.error('[saveObjectiveStatus] error:', error.message, error.details);
    return { success: false, error: error.message };
  }

  revalidatePath('/stages');
  revalidatePath(`/stages/${stageId}/bilan`);
  return { success: true };
}
