'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAuth, requireStageOwner } from '@/lib/auth';
import { PARCOURS_FORMATION } from '@/data/parcours-formation';
import { updateStagePool } from './stage-actions';

const sequenceSchema = z.enum(PARCOURS_FORMATION.map(sequence => sequence.id) as [string, ...string[]]);
const answersSchema = z.object({ sequenceId: sequenceSchema, answers: z.record(z.string(), z.string()) });
const practiceSchema = z.object({
    sequenceId: sequenceSchema,
    stageId: z.string().uuid(),
    actionId: z.string().min(1).max(80),
    cardIds: z.array(z.string().min(1).max(200)).min(1).max(3).refine(ids => new Set(ids).size === ids.length),
    actionChoices: z.record(z.string(), z.string()).optional(),
    choices: z.record(z.string(), z.object({ accroche: z.string().min(1).max(10000), actionId: z.string().nullable() })).optional(),
});

export type SequenceProgress = { parcouru: boolean; acquisVerifie: boolean; mission: { stageId: string; actionId: string; cardIds: string[]; completed: boolean } | null };

const progressionVide = (): SequenceProgress => ({ parcouru: false, acquisVerifie: false, mission: null });

function sequenceById(sequenceId: string) {
    return PARCOURS_FORMATION.find(sequence => sequence.id === sequenceId);
}

export async function getSequenceProgress(sequenceId: string): Promise<SequenceProgress> {
    if (!sequenceSchema.safeParse(sequenceId).success) return progressionVide();
    const progressions = await getSequencesProgress([sequenceId]);
    return progressions[sequenceId] ?? progressionVide();
}

/**
 * Charge tous les parcours demandés en trois requêtes, quel que soit leur nombre.
 *
 * Une mission est « terminée » quand au moins une de ses cartes est marquée abordée
 * (`done` ou `partial`) dans le suivi réel de la semaine (`stage_objective_reviews`) —
 * pas quand le moniteur revient cliquer un bouton dédié dans l'écran du parcours. Ce
 * bouton (« Je l'ai fait avec mon groupe ») demandait un aller-retour que personne ne
 * faisait : le parcours restait ouvert indéfiniment alors que la sortie avait bien eu
 * lieu et était déjà cochée « Abordé » sur l'écran « Mes semaines ». Un seul geste de
 * validation compte désormais, fait au bon endroit — sur la carte, dans sa semaine.
 */
export async function getSequencesProgress(sequenceIds: readonly string[]): Promise<Record<string, SequenceProgress>> {
    const ids = Array.from(new Set(sequenceIds.filter(id => sequenceSchema.safeParse(id).success)));
    const resultat = Object.fromEntries(ids.map(id => [id, progressionVide()])) as Record<string, SequenceProgress>;
    if (ids.length === 0) return resultat;
    const ctx = await requireAuth();
    if (!ctx) return resultat;
    const [{ data: progressions }, { data: missions }] = await Promise.all([
        ctx.supabase.from('formation_sequence_progress')
            .select('sequence_id, parcouru_le, acquis_verifie_le')
            .eq('user_id', ctx.user.id).in('sequence_id', ids),
        ctx.supabase.from('formation_practice_missions')
            .select('sequence_id, stage_id, action_id, card_ids, completed_at')
            .eq('user_id', ctx.user.id).in('sequence_id', ids),
    ]);
    for (const progression of progressions ?? []) {
        resultat[progression.sequence_id] = {
            ...resultat[progression.sequence_id],
            parcouru: !!progression.parcouru_le,
            acquisVerifie: !!progression.acquis_verifie_le,
        };
    }

    const stageIds = Array.from(new Set((missions ?? []).map(mission => mission.stage_id)));
    const { data: reviews } = stageIds.length
        ? await ctx.supabase.from('stage_objective_reviews')
            .select('stage_id, pedagogical_content_id, execution_status')
            .in('stage_id', stageIds)
            .in('execution_status', ['done', 'partial'])
        : { data: [] };
    const abordees = new Set((reviews ?? []).map(review => `${review.stage_id}:${review.pedagogical_content_id}`));

    for (const mission of missions ?? []) {
        const completed = !!mission.completed_at || mission.card_ids.some(cardId => abordees.has(`${mission.stage_id}:${cardId}`));
        resultat[mission.sequence_id] = {
            ...resultat[mission.sequence_id],
            mission: { stageId: mission.stage_id, actionId: mission.action_id, cardIds: mission.card_ids, completed },
        };
    }
    return resultat;
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
    const selection = await updateStagePool(parsed.data.stageId, parsed.data.cardIds, parsed.data.actionChoices, parsed.data.choices, true);
    if (!selection.success) return { error: selection.error };
    const { error } = await ctx.supabase.from('formation_practice_missions').upsert({
        user_id: ctx.user.id, sequence_id: parsed.data.sequenceId, stage_id: parsed.data.stageId, action_id: parsed.data.actionId, card_ids: parsed.data.cardIds, completed_at: null,
    }, { onConflict: 'user_id,sequence_id' });
    if (error) return { error: error.message };
    revalidatePath('/specialisation');
    revalidatePath(`/stages/${parsed.data.stageId}/program`);
    return { success: true };
}

/**
 * @deprecated Plus aucun écran n'appelle cette action : la validation d'une mission se
 * fait désormais en marquant la carte « Abordé » dans le suivi de la semaine
 * (`saveObjectiveStatus`), lu par `getSequencesProgress`. Le bouton dédié qui appelait
 * cette fonction demandait un aller-retour que personne ne faisait, laissant les
 * parcours ouverts indéfiniment. Conservée pour compatibilité avec d'éventuelles
 * missions déjà marquées `completed_at` par ce chemin.
 */
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
