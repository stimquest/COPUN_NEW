'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';

async function requireAdmin() {
    const ctx = await requireAuth();
    if (!ctx) return null;
    const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('role')
        .eq('id', ctx.user.id)
        .single();
    if (profile?.role !== 'admin') return null;
    return ctx;
}

export async function getGameCardsForContent(contentId?: string) {
    const supabase = await createClient();
    let query = supabase.from('game_cards').select('*');
    if (contentId) query = query.eq('related_objective_id', contentId);
    const { data, error } = await query;
    if (error) { console.error('[getGameCardsForContent]', error.message); return []; }
    return data;
}

export async function getAllGameCards() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('game_cards')
        .select('*')
        .order('theme', { ascending: true })
        .order('type', { ascending: true });
    if (error) { console.error('[getAllGameCards]', error.message); return []; }
    return data;
}

export async function getFilteredGameCards(types: string[], themes: string[]) {
    const supabase = await createClient();
    let query = supabase.from('game_cards').select('*');
    if (types.length > 0) query = query.in('type', types);
    if (themes.length > 0) query = query.in('theme', themes);
    const { data, error } = await query;
    if (error) { console.error('[getFilteredGameCards]', error.message); return []; }
    return data;
}

export async function getGameCardById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('game_cards').select('*').eq('id', id).single();
    if (error) return null;
    return data;
}

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
        .insert({ title, theme, stage_id: stageId, game_data: gameData })
        .select()
        .single();

    if (error) { console.error('[createGame]', error.message); return { success: false, error: error.message }; }

    if (stageId) revalidatePath('/stages');
    revalidatePath('/jeux');
    revalidatePath('/ressources/jeux');
    return { success: true, gameId: data.id };
}

export async function getGameById(gameId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error) { console.error('[getGameById]', error.message); return null; }
    return data;
}

export async function getGamesForStage(stageId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('games').select('*').eq('stage_id', stageId).order('created_at', { ascending: false });
    if (error) { console.error('[getGamesForStage]', error.message); return []; }
    return data;
}

export async function getAllGames() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (error) { console.error('[getAllGames]', error.message); return []; }
    return data;
}

export async function deleteGame(gameId: string) {
    const ctx = await requireAdmin();
    if (!ctx) return { success: false, error: 'Accès refusé.' };
    const { error } = await ctx.supabase.from('games').delete().eq('id', gameId);
    if (error) { console.error('[deleteGame]', error.message); return { success: false, error: error.message }; }
    revalidatePath('/jeux');
    revalidatePath('/ressources/jeux');
    return { success: true };
}

export async function saveQuizAttempt(theme: string, score: number, totalQuestions: number) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };
    const { error } = await ctx.supabase
        .from('quiz_attempts')
        .insert({ user_id: ctx.user.id, theme, score, total_questions: totalQuestions });
    if (error) { console.error('[saveQuizAttempt]', error.message); return { success: false, error: error.message }; }
    return { success: true };
}

export async function getQuizAttemptsForUser() {
    const ctx = await requireAuth();
    if (!ctx) return [];
    const { data, error } = await ctx.supabase
        .from('quiz_attempts').select('*').eq('user_id', ctx.user.id).order('attempted_at', { ascending: false });
    if (error) { console.error('[getQuizAttemptsForUser]', error.message); return []; }
    return data;
}

export async function saveStageGameResult(stageId: string, gameId: string, score: number, total: number, results: unknown) {
    const supabase = await createClient();
    const { error } = await supabase.from('stage_game_history').insert({
        stage_id: stageId, game_id: gameId, score, total,
        percentage: Math.round((score / total) * 100), results,
    });
    if (error) { console.error('[saveStageGameResult]', error.message); return { success: false, error: error.message }; }
    revalidatePath('/stages');
    return { success: true };
}

export async function getStageGameHistory(stageId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('stage_game_history').select('*, games(title, theme)').eq('stage_id', stageId).order('created_at', { ascending: false });
    if (error) { console.error('[getStageGameHistory]', error.message); return []; }
    return data;
}

export async function submitGameResult(gameCardId: string, result: unknown) {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };
    const { error } = await ctx.supabase
        .from('user_game_progress').insert({ user_id: ctx.user.id, game_card_id: gameCardId, result });
    if (error) { console.error('[submitGameResult]', error.message); return { success: false, error: error.message }; }
    return { success: true };
}
