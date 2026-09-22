'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAuth, requireStageOwner } from '@/lib/auth';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';

const sequenceSchema = z.enum(PARCOURS_FORMATION.map(sequence => sequence.id) as [string, ...string[]]);
const answersSchema = z.object({ sequenceId: sequenceSchema, answers: z.record(z.string(), z.string()) });
const practiceSchema = z.object({ sequenceId: sequenceSchema, stageId: z.string().uuid(), actionId: z.string().min(1).max(80), cardIds: z.array(z.string().uuid()).min(1).max(3) });

export type SequenceProgress = { parcouru: boolean; acquisVerifie: boolean; mission: { stageId: string; actionId: string; cardIds: string[]; completed: boolean } | null };

function sequenceById(sequenceId: string) {
    return PARCOURS_FORMATION.find(sequence => sequence.id === sequenceId);
}

export async function getSequenceProgress(sequenceId: string): Promise<SequenceProgress> {
    if (!sequenceSchema.safeParse(sequenceId).success) return { parcouru: false, acquisVerifie: false, mission: null };
    const ctx = await requireAuth();
    if (!ctx) return { parcouru: false, acquisVerifie: false, mission: null };
    const [{ data }, { data: mission }] = await Promise.all([
        ctx.supabase.from('formation_sequence_progress').select('parcouru_le, acquis_verifie_le').eq('user_id', ctx.user.id).eq('sequence_id', sequenceId).maybeSingle(),
        ctx.supabase.from('formation_practice_missions').select('stage_id, action_id, card_ids, completed_at').eq('user_id', ctx.user.id).eq('sequence_id', sequenceId).maybeSingle(),
    ]);
    return { parcouru: !!data?.parcouru_le, acquisVerifie: !!data?.acquis_verifie_le, mission: mission ? { stageId: mission.stage_id, actionId: mission.action_id, cardIds: mission.card_ids, completed: !!mission.completed_at } : null };
}

export async function marquerSequenceParcourue(sequenceId: string) {
    if (!sequenceSchema.safeParse(sequenceId).success) return { error: 'Parcours inconnu.' };
    const ctx = await requireAuth();
    if (!ctx) return { error: 'Non connecté.' };
    const { error } = await ctx.supabase.from('formation_sequence_progress').upsert(
        { user_id: ctx.user.id, sequence_id: sequenceId, parcouru_le: new Date().toISOString() },
        { onConflict: 'user_id,sequence_id', ignoreDuplicates: false },
    );
    if (error) return { error: error.message };
    revalidatePath('/formation');
    return { success: true };
}

export async function verifierAcquisSequence(input: unknown) {
    const parsed = answersSchema.safeParse(input);
    if (!parsed.success) return { error: 'Réponses invalides.' };
    const ctx = await requireAuth();
    if (!ctx) return { error: 'Non connecté.' };
    const sequence = sequenceById(parsed.data.sequenceId);
    if (!sequence) return { error: 'Parcours inconnu.' };
    const corrections = sequence.questions.map(question => ({ id: question.id, correct: parsed.data.answers[question.id] === question.correct, retour: question.retour }));
    const score = corrections.filter(c => c.correct).length;
    if (score === corrections.length) {
        const { error } = await ctx.supabase.from('formation_sequence_progress').upsert(
            { user_id: ctx.user.id, sequence_id: parsed.data.sequenceId, parcouru_le: new Date().toISOString(), acquis_verifie_le: new Date().toISOString() },
            { onConflict: 'user_id,sequence_id' },
        );
        if (error) return { error: error.message };
        revalidatePath('/formation');
    }
    return { score, total: corrections.length, corrections, valide: score === corrections.length };
}

export async function ajouterMissionPratique(input: unknown) {
    const parsed = practiceSchema.safeParse(input);
    if (!parsed.success) return { error: 'Choisissez une action et une à trois cartes-questions.' };
    const sequence = sequenceById(parsed.data.sequenceId);
    if (parsed.data.actionId !== 'carte-question' && !sequence?.actionsTerrain.some(action => action.id === parsed.data.actionId)) return { error: 'Action inconnue.' };
    const ctx = await requireStageOwner(parsed.data.stageId);
    if (!ctx) return { error: 'Semaine inaccessible.' };
    const [{ data: cards }, { data: stage }] = await Promise.all([
        ctx.supabase.from('pedagogical_content').select('id').in('id', parsed.data.cardIds),
        ctx.supabase.from('stages').select('selected_content, closed_at').eq('id', parsed.data.stageId).maybeSingle(),
    ]);
    if (!stage || stage.closed_at) return { error: 'Choisissez une semaine encore en cours.' };
    if ((cards ?? []).length !== parsed.data.cardIds.length) return { error: 'Une carte-question choisie est introuvable.' };
    const selected = Array.from(new Set([...(stage.selected_content ?? []), ...parsed.data.cardIds]));
    if (selected.length > 5) return { error: 'Cette semaine contient déjà trop de cartes. Retirez-en une avant d’ajouter cette mission.' };
    const { error: stageError } = await ctx.supabase.from('stages').update({ selected_content: selected }).eq('id', parsed.data.stageId);
    if (stageError) return { error: stageError.message };
    const { error } = await ctx.supabase.from('formation_practice_missions').upsert({
        user_id: ctx.user.id, sequence_id: parsed.data.sequenceId, stage_id: parsed.data.stageId, action_id: parsed.data.actionId, card_ids: parsed.data.cardIds, completed_at: null,
    }, { onConflict: 'user_id,sequence_id' });
    if (error) return { error: error.message };
    revalidatePath('/specialisation');
    revalidatePath(`/stages/${parsed.data.stageId}/program`);
    return { success: true };
}

export async function validerMissionPratique(sequenceId: string) {
    if (!sequenceSchema.safeParse(sequenceId).success) return { error: 'Parcours inconnu.' };
    const ctx = await requireAuth();
    if (!ctx) return { error: 'Non connecté.' };
    const { data: mission } = await ctx.supabase.from('formation_practice_missions').select('id, stage_id').eq('user_id', ctx.user.id).eq('sequence_id', sequenceId).maybeSingle();
    if (!mission) return { error: 'Ajoutez d’abord une mission à votre semaine.' };
    const now = new Date().toISOString();
    const [{ error: missionError }, { error: progressError }] = await Promise.all([
        ctx.supabase.from('formation_practice_missions').update({ completed_at: now }).eq('id', mission.id).eq('user_id', ctx.user.id),
        ctx.supabase.from('formation_sequence_progress').upsert({ user_id: ctx.user.id, sequence_id: sequenceId, parcouru_le: now, mise_en_pratique_le: now }, { onConflict: 'user_id,sequence_id' }),
    ]);
    if (missionError || progressError) return { error: missionError?.message ?? progressError?.message ?? 'Validation impossible.' };
    revalidatePath('/specialisation');
    revalidatePath(`/stages/${mission.stage_id}/program`);
    return { success: true };
}
