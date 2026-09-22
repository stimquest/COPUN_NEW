'use server';

import { jsonValue } from '@/lib/data-models';
import { createClient } from '@/lib/supabase/server';
import { createPrivilegedClient } from '@/lib/supabase/privileged';
import { requireStageOwner, requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const DIMENSION_TO_THEMES: Record<string, string[]> = {
    COMPRENDRE: ['Les Marées', 'Météo & Marées', 'Repères spatio-temporels', 'Toutes les notions - comprendre', 'Interactions des éléments climatiques', 'Général'],
    OBSERVER: ['Observation Sensorielle', 'Toutes les notions - observer', 'Caractéristiques du littoral', 'Général'],
    PROTÉGER: ['Caractéristiques du littoral', 'Toutes les notions - comprendre', 'Interactions des éléments climatiques', 'Général'],
};

export type StageQuiz = {
    id: string;
    stage_id: string;
    game_id: string | null;
    score_correct: number | null;
    score_total: number | null;
    points_awarded: number | null;
    completed_at: string | null;
};

export async function generateStageQuiz(
    stageId: string,
    questionCount: number = 5,
    forceTheme: string | null = null,
    audience: 'enfant' | 'adulte' = 'enfant',
): Promise<{ success: boolean; gameId?: string; error?: string }> {
    const ctx = await requireStageOwner(stageId);
    if (!ctx) return { success: false, error: 'Stage inaccessible.' };
    if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 50) return { success: false, error: 'Nombre de questions invalide.' };
    const supabase = ctx.supabase;
    const writer = createPrivilegedClient();

    const { data: stage } = await supabase
        .from('stages').select('selected_content, title').eq('id', stageId).single();

    const selectedContent: string[] = stage?.selected_content ?? [];
    let quizzCards: Record<string, unknown>[] | null = null;
    let targetThemes: string[] = [];

    if (forceTheme) {
        targetThemes = [forceTheme];
        const { data } = await supabase
            .from('game_cards').select('*').eq('type', 'quizz').in('theme', targetThemes);
        quizzCards = data;
    } else if (selectedContent.length) {
        const { data: linkedCards } = await supabase
            .from('game_cards').select('*').eq('type', 'quizz').in('related_objective_id', selectedContent);
        quizzCards = linkedCards ?? null;

        if (!quizzCards || quizzCards.length < questionCount) {
            const { data: selectedCards } = await supabase
                .from('pedagogical_content').select('dimension').in('id', selectedContent);

            const dimensions = [...new Set((selectedCards ?? []).map(c => c.dimension).filter((d): d is string => Boolean(d)))];
            const themeSet = new Set<string>();
            dimensions.forEach(dim => (DIMENSION_TO_THEMES[dim] ?? ['Général']).forEach(t => themeSet.add(t)));
            targetThemes = Array.from(themeSet);

            if (targetThemes.length > 0) {
                const { data: themeCards } = await supabase
                    .from('game_cards').select('*').eq('type', 'quizz').in('theme', targetThemes);

                const seen = new Set((quizzCards ?? []).map((c: Record<string, unknown>) => c.id));
                const merged = [...(quizzCards ?? [])];
                (themeCards ?? []).forEach((c: Record<string, unknown>) => {
                    if (!seen.has(c.id)) { merged.push(c); seen.add(c.id); }
                });
                quizzCards = merged;
            }
        }
    }

    if (!quizzCards?.length) {
        const { data: allQuizz } = await supabase.from('game_cards').select('*').eq('type', 'quizz');
        if (!allQuizz?.length) return { success: false, error: 'Aucune carte quiz disponible.' };
        quizzCards = allQuizz;
    }

    const count = Math.min(questionCount, quizzCards.length);
    const shuffled = [...quizzCards].sort(() => Math.random() - 0.5).slice(0, count);
    // `data` porte la version adulte au premier niveau, `data.version_enfant` la version
    // enfant du même sujet (même fiche, même bonne réponse, vocabulaire simplifié). On
    // substitue ici plutôt que de complexifier QuizzComponent, qui reste ignorant du
    // registre choisi.
    const quizzItems = shuffled.map(card => {
        const data = card.data as Record<string, unknown>;
        if (audience === 'enfant' && data.version_enfant) {
            const { version_enfant, ...adulte } = data;
            return { ...adulte, ...(version_enfant as object) };
        }
        const adulte = { ...data };
        delete adulte.version_enfant;
        return adulte;
    });

    const { data: existingQuiz } = await supabase
        .from('stage_quizzes').select('game_id').eq('stage_id', stageId).single();
    if (existingQuiz?.game_id) {
        await supabase.from('games').delete().eq('id', existingQuiz.game_id);
    }

    const { data: game, error: gameError } = await writer
        .from('games')
        .insert({
            title: `Quiz — ${stage?.title ?? 'Semaine'}`,
            theme: forceTheme ?? targetThemes[0] ?? 'Général',
            stage_id: stageId,
            game_data: { leGrandQuizz: { title: 'Quiz de fin de semaine', instruction: 'Pose ces questions à tes stagiaires pour valider la transmission.', items: jsonValue(quizzItems) } },
        })
        .select()
        .single();

    if (gameError || !game) return { success: false, error: gameError?.message ?? 'Erreur création du jeu' };

    const { error: quizError } = await writer.from('stage_quizzes').upsert(
        { stage_id: stageId, game_id: game.id, score_correct: null, score_total: null, points_awarded: null, completed_at: null },
        { onConflict: 'stage_id' },
    );

    if (quizError) return { success: false, error: quizError.message };
    return { success: true, gameId: game.id };
}

/**
 * @deprecated Le quiz ne donne plus de points : c'est un outil d'animation que le moniteur
 * sort quand l'occasion se présente (attente avant d'embarquer, averse, retour en minibus),
 * pas une épreuve notée en fin de semaine. Seules les actions menées avec le groupe
 * mesurent la progression — elles se constatent sans que le moniteur ait à se juger.
 *
 * Conservée parce que la RPC `complete_stage_quiz` reste la voie d'écriture de
 * `stage_quizzes` ; plus aucun appelant côté application.
 */
export async function awardStageQuizPoints(stageId: string, gameId: string, answers: unknown[]) {
    const ctx = await requireStageOwner(stageId);
    if (!ctx) return { success: false, error: 'Stage inaccessible.' };
    if (!Array.isArray(answers) || answers.length > 50 || !answers.every(a => Number.isInteger(a) && Number(a) >= 0)) return { success: false, error: 'Réponses invalides.' };
    const { data, error } = await ctx.supabase.rpc('complete_stage_quiz', { p_stage_id: stageId, p_game_id: gameId, p_answers: answers.map(Number) });
    if (error) return { success: false, error: error.message };
    revalidatePath('/stages');
    revalidatePath('/classement');
    revalidatePath('/profil');
    return { success: true, points_awarded: data as number };
}

export async function getStageQuiz(stageId: string): Promise<StageQuiz | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('stage_quizzes').select('*').eq('stage_id', stageId).single();
    if (error || !data) return null;
    return data as StageQuiz;
}

export async function getMyTotalPoints(): Promise<number> {
    const ctx = await requireAuth();
    if (!ctx) return 0;
    const { data } = await ctx.supabase
        .from('leaderboard_points').select('points').eq('monitor_id', ctx.user.id);
    return (data ?? []).reduce((sum, r) => sum + r.points, 0);
}
