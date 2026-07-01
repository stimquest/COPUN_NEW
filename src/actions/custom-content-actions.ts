'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ContentTodo, PedagogicalContent } from '@/types';
import { requireAuth } from '@/lib/auth';

export type CustomContentInput = {
    question: string;
    objectif: string;
    tip?: string;
    ffv_level?: number | null;
    supports?: string[];
    todos: { text: string; todo_order: number }[];
};

export type CustomContentResult =
    | { success: true; id: string }
    | { success: false; error: string };

export async function createCustomContent(input: CustomContentInput): Promise<CustomContentResult> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('club_id')
        .eq('id', ctx.user.id)
        .single();

    // Generate a unique ID for custom content
    const id = `custom_${ctx.user.id.slice(0, 8)}_${Date.now()}`;

    const { error: insertError } = await ctx.supabase
        .from('pedagogical_content')
        .insert({
            id,
            question: input.question,
            objectif: input.objectif,
            tip: input.tip ?? '',
            niveau: 1,
            dimension: 'COMPRENDRE',
            tags_theme: [],
            tags_filtre: [],
            source: 'custom',
            owner_id: ctx.user.id,
            club_id: profile?.club_id ?? null,
            is_public: false,
            ffv_level: input.ffv_level ?? null,
            supports: input.supports ?? [],
        });

    if (insertError) return { success: false, error: insertError.message };

    if (input.todos.length > 0) {
        const { error: todosError } = await ctx.supabase
            .from('content_todos')
            .insert(input.todos.map(t => ({ content_id: id, text: t.text, todo_order: t.todo_order })));

        if (todosError) return { success: false, error: todosError.message };
    }

    revalidatePath('/fiches');
    return { success: true, id };
}

export async function updateCustomContent(
    contentId: string,
    input: CustomContentInput,
): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error: updateError } = await ctx.supabase
        .from('pedagogical_content')
        .update({
            question: input.question,
            objectif: input.objectif,
            tip: input.tip ?? '',
            ffv_level: input.ffv_level ?? null,
            supports: input.supports ?? [],
        })
        .eq('id', contentId)
        .eq('owner_id', ctx.user.id)
        .eq('source', 'custom');

    if (updateError) return { success: false, error: updateError.message };

    // Replace all todos: delete then re-insert
    await ctx.supabase.from('content_todos').delete().eq('content_id', contentId);

    if (input.todos.length > 0) {
        const { error: todosError } = await ctx.supabase
            .from('content_todos')
            .insert(input.todos.map(t => ({ content_id: contentId, text: t.text, todo_order: t.todo_order })));

        if (todosError) return { success: false, error: todosError.message };
    }

    revalidatePath('/fiches');
    return { success: true };
}

export async function deleteCustomContent(
    contentId: string,
): Promise<{ success: boolean; error?: string }> {
    const ctx = await requireAuth();
    if (!ctx) return { success: false, error: 'Non authentifié' };

    const { error } = await ctx.supabase
        .from('pedagogical_content')
        .delete()
        .eq('id', contentId)
        .eq('owner_id', ctx.user.id)
        .eq('source', 'custom');

    if (error) return { success: false, error: error.message };

    revalidatePath('/fiches');
    return { success: true };
}

export async function getMyCustomContent(): Promise<(PedagogicalContent & { todos: ContentTodo[] })[]> {
    const ctx = await requireAuth();
    if (!ctx) return [];

    const { data } = await ctx.supabase
        .from('pedagogical_content')
        .select('*, content_todos(*)')
        .eq('source', 'custom')
        .eq('owner_id', ctx.user.id)
        .order('created_at', { ascending: false });

    if (!data) return [];

    return data.map(row => ({
        ...row,
        todos: (row.content_todos ?? []).sort(
            (a: ContentTodo, b: ContentTodo) => a.todo_order - b.todo_order
        ),
    }));
}

// Called when a custom card is linked to a session step:
// copies the card's content_todos as step_todos for this specific stage instance
export async function copyContentTodosToStep(
    contentId: string,
    stepId: string,
    stageId: string,
): Promise<void> {
    const supabase = await createClient();

    const { data: contentTodos } = await supabase
        .from('content_todos')
        .select('text, todo_order')
        .eq('content_id', contentId)
        .order('todo_order');

    if (!contentTodos || contentTodos.length === 0) return;

    // Get current max todo_order for this step to append after existing todos
    const { data: existing } = await supabase
        .from('step_todos')
        .select('todo_order')
        .eq('session_step_id', stepId)
        .order('todo_order', { ascending: false })
        .limit(1);

    const baseOrder = existing?.[0]?.todo_order ?? -1;

    await supabase.from('step_todos').insert(
        contentTodos.map((t, i) => ({
            session_step_id: stepId,
            text: t.text,
            todo_order: baseOrder + 1 + i,
            done: false,
        }))
    );
}
