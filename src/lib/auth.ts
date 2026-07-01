import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

type AuthResult =
    | { user: User; supabase: Awaited<ReturnType<typeof createClient>> }
    | null;

export async function requireAuth(): Promise<AuthResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return { user, supabase };
}
