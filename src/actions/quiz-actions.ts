'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { computeQuizPoints } from '@/lib/quiz-points';
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
): Promise<{ success: boolean; gameId?: string; error?: string }> {
    const supabase = await createClient();

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

            const dimensions = [...new Set((selectedCards ?? []).map(c => c.dimension).filter(Boolean))];
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
    const quizzItems = shuffled.map(card => card.data);

    const { data: existingQuiz } = await supabase
        .from('stage_quizzes').select('game_id').eq('stage_id', stageId).single();
    if (existingQuiz?.game_id) {
        await supabase.from('games').delete().eq('id', existingQuiz.game_id);
    }

    const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
            title: `Quiz — ${stage?.title ?? 'Semaine'}`,
            theme: forceTheme ?? targetThemes[0] ?? 'Général',
            stage_id: stageId,
            game_data: { leGrandQuizz: { title: 'Quiz de fin de semaine', instruction: 'Posez ces questions à votre groupe pour valider la transmission.', items: quizzItems } },
        })
        .select()
        .single();

    if (gameError || !game) return { success: false, error: gameError?.message ?? 'Erreur création du jeu' };

    await supabase.from('stage_quizzes').upsert(
        { stage_id: stageId, game_id: game.id, score_correct: null, score_total: null, points_awarded: null, completed_at: null },
        { onConflict: 'stage_id' },
    );

    return { success: true, gameId: game.id };
}

export async function awardStageQuizPoints(
    stageId: string,
    gameId: string,
    scoreCorrect: number,
    scoreTotal: number,
): Promise<{ success: boolean; points_awarded?: number; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    // Un seul gain de quiz par semaine — on cible précisément les lignes "Quiz…" :
    // un filtre trop large (ex: "tout sauf Défi") matcherait aussi les points retours terrain.
    const { data: existingPoints } = await ctx.supabase
        .from('leaderboard_points')
        .select('points')
        .eq('monitor_id', ctx.user.id)
        .eq('stage_id', stageId)
        .like('reason', 'Quiz%')
        .limit(1)
        .maybeSingle();

    if (existingPoints) return { success: true, points_awarded: existingPoints.points };

    const score_pct = scoreTotal > 0 ? Math.round((scoreCorrect / scoreTotal) * 100) : 0;
    const points_awarded = computeQuizPoints(scoreCorrect, scoreTotal);

    // Le club vient du profil du moniteur (les stages n'ont pas de club_id renseigné).
    const { data: profile } = await ctx.supabase
        .from('profiles').select('club_id').eq('id', ctx.user.id).maybeSingle();

    await Promise.all([
        ctx.supabase.from('stage_quizzes').upsert(
            { stage_id: stageId, game_id: gameId, score_correct: scoreCorrect, score_total: scoreTotal, points_awarded, completed_at: new Date().toISOString() },
            { onConflict: 'stage_id' },
        ),
        ctx.supabase.from('leaderboard_points').insert({
            monitor_id: ctx.user.id,
            club_id: profile?.club_id ?? null,
            stage_id: stageId,
            defi_id: null,
            points: points_awarded,
            reason: `Quiz de fin de semaine — ${scoreCorrect}/${scoreTotal} (${score_pct}%)`,
        }),
    ]);

    revalidatePath(`/stages/${stageId}/bilan`);
    revalidatePath('/classement');
    revalidatePath('/profil');

    return { success: true, points_awarded };
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
