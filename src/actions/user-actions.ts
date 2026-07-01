'use server';

import { requireAuth } from '@/lib/auth';

export async function getProfile() {
    const ctx = await requireAuth();
    if (!ctx) return null;

    const { data: profile, error } = await ctx.supabase
        .from('profiles')
        .select('*, clubs(name)')
        .eq('id', ctx.user.id)
        .single();

    if (error) {
        console.warn('[getProfile] club link may be missing:', error.message);
        return {
            id: ctx.user.id,
            email: ctx.user.email,
            full_name: ctx.user.user_metadata.full_name || ctx.user.email?.split('@')[0],
            role: 'instructor',
        };
    }

    return profile;
}

export async function getUserStats() {
    const ctx = await requireAuth();
    if (!ctx) return null;

    const [{ count: validationsCount }, { count: createdCount }] = await Promise.all([
        ctx.supabase
            .from('user_validations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', ctx.user.id),
        ctx.supabase
            .from('pedagogical_content')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ctx.user.id),
    ]);

    return {
        totalValidations: validationsCount ?? 0,
        createdContent: createdCount ?? 0,
    };
}
