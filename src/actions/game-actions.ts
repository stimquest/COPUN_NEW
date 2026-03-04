'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ==========================================
// GAME CARDS (Individual quiz cards)
// ==========================================

export async function getGameCardsForContent(contentId?: string) {
    const supabase = await createClient();
    let query = supabase.from('game_cards').select('*');

    if (contentId) {
        query = query.eq('related_objective_id', contentId);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching game cards:', error);
        return [];
    }
    return data;
}

export async function getAllGameCards() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('game_cards')
        .select('*')
        .order('theme', { ascending: true })
        .order('type', { ascending: true });

    if (error) {
        console.error('Error fetching all game cards:', error);
        return [];
    }
    return data;
}

export async function getFilteredGameCards(types: string[], themes: string[]) {
    const supabase = await createClient();
    let query = supabase.from('game_cards').select('*');

    if (types.length > 0) {
        query = query.in('type', types);
    }
    if (themes.length > 0) {
        query = query.in('theme', themes);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching filtered game cards:', error);
        return [];
    }
    return data;
}

export async function getGameCardById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('game_cards')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

// ==========================================
// GAMES (Session grouping)
// ==========================================

export interface GameData {
    triageCotier?: { title: string; instruction: string; items: unknown[] };
    motsEnRafale?: { title: string; instruction: string; items: unknown[] };
    dilemmeDuMarin?: { title: string; instruction: string; items: unknown[] };
    leGrandQuizz?: { title: string; instruction: string; items: unknown[] };
}

export async function createGame(title: string, theme: string, stageId: string | null, gameData: GameData) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('games')
        .insert({
            title,
            theme,
            stage_id: stageId,
            game_data: gameData
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating game:', error);
        return { success: false, error: error.message };
    }

    if (stageId) {
        revalidatePath(`/stages/${stageId}`);
    }
    revalidatePath('/jeux');

    return { success: true, gameId: data.id };
}

export async function getGameById(gameId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

    if (error) {
        console.error('Error fetching game:', error);
        return null;
    }
    return data;
}

export async function getGamesForStage(stageId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('stage_id', stageId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching games for stage:', error);
        return [];
    }
    return data;
}

export async function getAllGames() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all games:', error);
        return [];
    }
    return data;
}

export async function deleteGame(gameId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

    if (error) {
        console.error('Error deleting game:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/jeux');
    return { success: true };
}

// ==========================================
// QUIZ ATTEMPTS (User history)
// ==========================================

export async function saveQuizAttempt(theme: string, score: number, totalQuestions: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .from('quiz_attempts')
        .insert({
            user_id: user.id,
            theme,
            score,
            total_questions: totalQuestions
        });

    if (error) {
        console.error('Error saving quiz attempt:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function getQuizAttemptsForUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false });

    if (error) {
        console.error('Error fetching quiz attempts:', error);
        return [];
    }
    return data;
}

// ==========================================
// STAGE GAME HISTORY (Results per stage)
// ==========================================

export async function saveStageGameResult(
    stageId: string,
    gameId: string,
    score: number,
    total: number,
    results: unknown
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('stage_game_history')
        .insert({
            stage_id: stageId,
            game_id: gameId,
            score,
            total,
            percentage: Math.round((score / total) * 100),
            results
        });

    if (error) {
        console.error('Error saving stage game result:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/stages/${stageId}`);
    return { success: true };
}

export async function getStageGameHistory(stageId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('stage_game_history')
        .select('*, games(title, theme)')
        .eq('stage_id', stageId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching stage game history:', error);
        return [];
    }
    return data;
}

// ==========================================
// USER GAME PROGRESS (Legacy - individual card progress)
// ==========================================

export async function submitGameResult(gameCardId: string, result: unknown) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .from('user_game_progress')
        .insert({
            user_id: user.id,
            game_card_id: gameCardId,
            result: result
        });

    if (error) {
        console.error('Error submitting game result:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/session/[id]');
    return { success: true };
}
