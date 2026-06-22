'use server';

import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return null;
    return { user, supabase };
}

// Créer un compte via magic link (OTP) — l'utilisateur clique pour se connecter et définir son mot de passe
export async function createUserAccount(formData: FormData) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: 'Accès refusé.' };

    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const role = (formData.get('role') as string) || 'instructor';
    const clubId = formData.get('clubId') as string | null;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    // Envoyer un OTP (magic link) — crée le compte s'il n'existe pas encore
    const { error } = await ctx.supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
            data: { full_name: fullName },
            shouldCreateUser: true,
        },
    });

    if (error) return { error: error.message };

    // Stocker le profil en attente — sera appliqué automatiquement à la première connexion
    const { error: profileError } = await ctx.supabase.rpc('admin_set_pending_profile', {
        p_email: email,
        p_full_name: fullName,
        p_role: role,
        p_club_id: clubId || null,
    });

    if (profileError) {
        return {
            error: `Invitation envoyée mais profil non configuré : ${profileError.message}`,
        };
    }

    return {
        success: `Invitation envoyée à ${email}. Le profil (${role}) sera appliqué à la première connexion.`,
    };
}

// Envoyer une invitation (magic link) — l'utilisateur clique et est connecté directement
export async function inviteUser(formData: FormData) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: 'Accès refusé.' };

    const email = formData.get('email') as string;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const { error } = await ctx.supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
            shouldCreateUser: true,
        },
    });

    if (error) return { error: error.message };
    return { success: `Invitation envoyée à ${email}.` };
}

// Lister tous les utilisateurs avec leur profil
export async function listUsers() {
    const ctx = await requireAdmin();
    if (!ctx) return { error: 'Accès refusé.', users: [] };

    const { data, error } = await ctx.supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, clubs!club_id(name)')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message, users: [] };
    return { users: data ?? [] };
}

// Changer le rôle d'un utilisateur via RPC SECURITY DEFINER (bypass RLS)
export async function updateUserRole(userId: string, role: string) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: 'Accès refusé.' };

    const { error } = await ctx.supabase.rpc('admin_update_role', {
        p_user_id: userId,
        p_role: role,
    });

    if (error) return { error: error.message };
    return { success: true };
}

// Récupérer la liste des clubs pour le formulaire
export async function getClubs() {
    const supabase = await createClient();
    const { data } = await supabase.from('clubs').select('id, name').order('name');
    return data ?? [];
}
