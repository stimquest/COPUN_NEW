import type { Database } from '@/types/database';
import 'server-only';
import { createClient } from '@supabase/supabase-js';

/** Only call after an explicit ownership check. Never export this client to UI code. */
export function createPrivilegedClient() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('Configuration serveur Supabase manquante');
    return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
