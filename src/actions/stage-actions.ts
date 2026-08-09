'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { encodeIntention, ObjectifId } from '@/data/objectifs';
import { StageRessenti, isRessentiNiveau } from '@/lib/stage-ressenti';

/**
 * Persists the selected pedagogical pool for a stage.
 * Layer 1: Strategy
 *
 * L'ordre du tableau est signifiant : il fixe l'ordre de traitement des sujets, que le
 * moniteur compose lui-même (enchaîner les méduses puis le vent parce que les méduses
 * dérivent avec lui). Cette action sert donc aussi bien à la sélection qu'au
 * réordonnancement.
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
    revalidatePath(`/stages/${stageId}/preparer`);
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

    // Les lignes liées (exploits, quiz, observations, reviews) partent en CASCADE côté DB,
    // mais les photos de défis dans Supabase Storage doivent être nettoyées à part.
    const { data: exploits } = await supabase
        .from('stage_exploits')
        .select('preuves_url')
        .eq('stage_id', stageId);

    const storagePaths = (exploits ?? [])
        .flatMap(e => e.preuves_url ?? [])
        .map((url: string) => {
            const marker = '/defis/';
            const idx = url.indexOf(marker);
            return idx === -1 ? null : url.slice(idx + marker.length);
        })
        .filter((p): p is string => Boolean(p));

    if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage.from('defis').remove(storagePaths);
        if (storageError) console.error('[deleteStage] storage cleanup', storageError.message);
    }

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
  ressenti: StageRessenti;
  /**
   * Nombre de stagiaires réellement encadrés cette semaine. Obligatoire à la clôture :
   * ce n'est plus une estimation demandée avant même que le groupe soit constitué (voir
   * NewStageClient), mais un chiffre connu, saisi une fois — utile plus tard pour
   * mesurer combien de personnes ont été sensibilisées sur une saison.
   */
  nbStagiaires: number;
};

export async function closeStage(stageId: string, input: CloseStageInput) {
  const ctx = await requireAuth();
  if (!ctx) return { success: false, error: 'Non autorisé' };
  const supabase = ctx.supabase;
  const user = ctx.user;

  if (!isRessentiNiveau(input.ressenti?.niveau)) {
    return { success: false, error: 'Indiquez si vous avez pu raconter ce qui était prévu.' };
  }
  if (!Number.isFinite(input.nbStagiaires) || input.nbStagiaires < 1) {
    return { success: false, error: 'Indiquez le nombre de stagiaires de la semaine.' };
  }

  const ressenti: StageRessenti = {
    niveau: input.ressenti.niveau,
    raisons: Array.isArray(input.ressenti.raisons)
      ? input.ressenti.raisons.filter((r): r is string => typeof r === 'string')
      : [],
    note: typeof input.ressenti.note === 'string' ? input.ressenti.note.trim() : '',
  };

  const normalizedNotes = input.closingNotes.trim();

  const { data, error } = await supabase
    .from('stages')
    .update({
      closed_at: new Date().toISOString(),
      closing_notes: normalizedNotes || null,
      ressenti,
      nb_stagiaires: input.nbStagiaires,
    })
    .eq('id', stageId)
    .eq('owner_id', user.id)
    .select('id, closed_at, closing_notes, ressenti, nb_stagiaires')
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

/**
 * Sauvegarde le niveau d'impact et les raisons cochées depuis l'accueil, à chaud — la
 * ligne existe déjà (le statut est posé avant l'impact), on met donc à jour plutôt que
 * d'upsert pour ne jamais écraser execution_status.
 */
export async function saveObjectiveImpact(
  stageId: string,
  contentId: string,
  impactLevel: import('@/types').StageObjectiveImpactLevel | null,
  reasons: string[],
) {
  const ctx = await requireAuth();
  if (!ctx) return { success: false, error: 'Non autorisé' };

  const { error } = await ctx.supabase
    .from('stage_objective_reviews')
    .update({
      impact_level: impactLevel,
      reasons,
    })
    .eq('stage_id', stageId)
    .eq('pedagogical_content_id', contentId);

  if (error) {
    console.error('[saveObjectiveImpact] error:', error.message, error.details);
    return { success: false, error: error.message };
  }

  revalidatePath('/stages');
  revalidatePath(`/stages/${stageId}/bilan`);
  return { success: true };
}

/** Efface le statut d'exécution d'un objectif pour revenir à l'état neutre (non renseigné). */
export async function clearObjectiveStatus(stageId: string, contentId: string) {
  const ctx = await requireAuth();
  if (!ctx) return { success: false, error: 'Non autorisé' };

  const { error } = await ctx.supabase
    .from('stage_objective_reviews')
    .delete()
    .eq('stage_id', stageId)
    .eq('pedagogical_content_id', contentId);

  if (error) {
    console.error('[clearObjectiveStatus] error:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/stages');
  revalidatePath(`/stages/${stageId}/bilan`);
  return { success: true };
}
