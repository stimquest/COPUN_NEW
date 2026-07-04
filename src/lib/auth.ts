import { createClient, getCachedUser } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

type AuthResult =
    | { user: User; supabase: Awaited<ReturnType<typeof createClient>> }
    | null;

export async function requireAuth(): Promise<AuthResult> {
    const [supabase, user] = await Promise.all([createClient(), getCachedUser()]);
    if (!user) return null;
    return { user, supabase };
}
