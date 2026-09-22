import { createClient, getCachedUser, type AuthenticatedUser } from '@/lib/supabase/server';

type AuthResult =
    | { user: AuthenticatedUser; supabase: Awaited<ReturnType<typeof createClient>> }
    | null;

export async function requireAuth(): Promise<AuthResult> {
    const [supabase, user] = await Promise.all([createClient(), getCachedUser()]);
    if (!user) return null;
    return { user, supabase };
}

export async function requireStageOwner(stageId: string): Promise<AuthResult> {
    if (!/^[0-9a-f-]{36}$/i.test(stageId)) return null;
    const ctx = await requireAuth();
    if (!ctx) return null;
    const { data, error } = await ctx.supabase.from('stages').select('id')
        .eq('id', stageId).eq('owner_id', ctx.user.id).maybeSingle();
    if (error) throw new Error('Vérification du stage impossible', { cause: error });
    return data ? ctx : null;
}
