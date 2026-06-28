'use server';

import { createClient } from '@/lib/supabase/server';
import { computeQuizPoints } from '@/lib/quiz-points';
import { revalidatePath } from 'next/cache';

// Mapping dimension pédagogique → thèmes de game_cards (thèmes réels de la base)
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

/**
 * Génère un quiz en piochant dans game_cards (type quizz).
 * - Si forceTheme est fourni, filtre par ce thème.
 * - Sinon, filtre automatiquement par les thèmes liés aux dimensions des fiches du stage.
 * Crée un game dans la table games et le lie au stage dans stage_quizzes.
 */
export async function generateStageQuiz(
    stageId: string,
    questionCount: number = 5,
    forceTheme: string | null = null,
): Promise<{ success: boolean; gameId?: string; error?: string }> {
    const supabase = await createClient();

    // Récupère les infos du stage
    const { data: stage } = await supabase
        .from('stages')
        .select('selected_content, title')
        .eq('id', stageId)
        .single();

    const selectedContent: string[] = stage?.selected_content ?? [];

    let quizzCards: Record<string, unknown>[] | null = null;
    let targetThemes: string[] = [];

    if (forceTheme) {
        targetThemes = [forceTheme];
        const { data } = await supabase
            .from('game_cards')
            .select('id, type, theme, related_objective_id, data')
            .eq('type', 'quizz')
            .in('theme', targetThemes);
        quizzCards = data;
    } else if (selectedContent.length) {
        const [{ data: linkedCards }, { data: selectedCards }] = await Promise.all([
            supabase
                .from('game_cards')
                .select('id, type, theme, related_objective_id, data')
                .eq('type', 'quizz')
                .in('related_objective_id', selectedContent),
            supabase
                .from('pedagogical_content')
                .select('dimension')
                .in('id', selectedContent),
        ]);

        quizzCards = linkedCards ?? null;

        if (!quizzCards || quizzCards.length < questionCount) {
            const dimensions = [...new Set((selectedCards ?? []).map(c => c.dimension).filter(Boolean))];
            const themeSet = new Set<string>();
            dimensions.forEach(dim => {
                (DIMENSION_TO_THEMES[dim] ?? ['Général']).forEach(t => themeSet.add(t));
            });
            targetThemes = Array.from(themeSet);

            if (targetThemes.length > 0) {
                const { data: themeCards } = await supabase
                    .from('game_cards')
                    .select('id, type, theme, related_objective_id, data')
                    .eq('type', 'quizz')
                    .in('theme', targetThemes);

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
        const { data: allQuizz } = await supabase
            .from('game_cards')
            .select('id, type, theme, related_objective_id, data')
            .eq('type', 'quizz');

        if (!allQuizz?.length) {
            return { success: false, error: 'Aucune carte quiz disponible dans la base de données. Exécutez le seed game_cards.' };
        }
        quizzCards = allQuizz;
    }

    // Sélectionne N cartes au hasard
    const count = Math.min(questionCount, quizzCards.length);
    const shuffled = [...quizzCards].sort(() => Math.random() - 0.5).slice(0, count);

    const quizzItems = shuffled.map(card => card.data);

    // Supprime l'ancien game lié à ce stage (évite l'accumulation dans /jeux)
    const { data: existingQuiz } = await supabase
        .from('stage_quizzes')
        .select('game_id')
        .eq('stage_id', stageId)
        .single();

    if (existingQuiz?.game_id) {
        await supabase.from('games').delete().eq('id', existingQuiz.game_id);
    }

    // Crée le nouveau game
    const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
            title: `Quiz — ${stage?.title ?? 'Stage'}`,
            theme: forceTheme ?? targetThemes[0] ?? 'Général',
            stage_id: stageId,
            game_data: {
                leGrandQuizz: {
                    title: 'Quiz de fin de stage',
                    instruction: 'Posez ces questions à votre groupe pour valider la transmission.',
                    items: quizzItems,
                },
            },
        })
        .select()
        .single();

    if (gameError || !game) {
        return { success: false, error: gameError?.message ?? 'Erreur création du jeu' };
    }

    // Met à jour le lien — remet completed_at à null si on regénère
    await supabase
        .from('stage_quizzes')
        .upsert({
            stage_id: stageId,
            game_id: game.id,
            score_correct: null,
            score_total: null,
            points_awarded: null,
            completed_at: null,
        }, { onConflict: 'stage_id' });

    return { success: true, gameId: game.id };
}

/**
 * Appelé depuis PlayClient après avoir terminé un jeu lié à un stage.
 * Calcule les points quiz et les insère dans leaderboard_points.
 * Idempotent : si les points ont déjà été accordés, retourne le résultat existant.
 */
export async function awardStageQuizPoints(
    stageId: string,
    gameId: string,
    scoreCorrect: number,
    scoreTotal: number,
): Promise<{ success: boolean; points_awarded?: number; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    // Idempotence : vérifie dans leaderboard_points (résiste à la regénération du quiz)
    const { data: existingPoints } = await supabase
        .from('leaderboard_points')
        .select('points')
        .eq('monitor_id', user.id)
        .eq('stage_id', stageId)
        .not('reason', 'like', '%Défi%')
        .maybeSingle();

    if (existingPoints) {
        return { success: true, points_awarded: existingPoints.points };
    }

    const score_pct = scoreTotal > 0 ? Math.round((scoreCorrect / scoreTotal) * 100) : 0;

    // 2 pts par bonne réponse (+ bonus sans-faute sur quiz complet) — voir computeQuizPoints.
    const points_awarded = computeQuizPoints(scoreCorrect, scoreTotal);

    // Met à jour stage_quizzes avec les résultats
    await supabase
        .from('stage_quizzes')
        .upsert({
            stage_id: stageId,
            game_id: gameId,
            score_correct: scoreCorrect,
            score_total: scoreTotal,
            points_awarded,
            completed_at: new Date().toISOString(),
        }, { onConflict: 'stage_id' });

    // Récupère le club du stage
    const { data: stageData } = await supabase
        .from('stages')
        .select('club_id')
        .eq('id', stageId)
        .single();

    // Insère dans leaderboard_points
    await supabase
        .from('leaderboard_points')
        .insert({
            monitor_id: user.id,
            club_id: stageData?.club_id ?? null,
            stage_id: stageId,
            defi_id: null,
            points: points_awarded,
            reason: `Quiz de fin de stage — ${scoreCorrect}/${scoreTotal} (${score_pct}%)`,
        });

    revalidatePath(`/stages/${stageId}`);
    revalidatePath(`/classement`);
    revalidatePath(`/profil`);

    return { success: true, points_awarded };
}

/**
 * Récupère le quiz existant d'un stage (s'il a déjà été créé).
 */
export async function getStageQuiz(stageId: string): Promise<StageQuiz | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('stage_quizzes')
        .select('*')
        .eq('stage_id', stageId)
        .single();

    if (error || !data) return null;
    return data as StageQuiz;
}

/**
 * Total de points d'un moniteur connecté.
 */
export async function getMyTotalPoints(): Promise<number> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data } = await supabase
        .from('leaderboard_points')
        .select('points')
        .eq('monitor_id', user.id);

    return (data ?? []).reduce((sum, r) => sum + r.points, 0);
}
