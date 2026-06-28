'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };

    revalidatePath('/', 'layout');
    redirect('/stages');
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get('email') as string;
    const origin = formData.get('origin') as string | null;
    const supabase = await createClient();
    const siteUrl = origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
    });

    // Toujours retourner succès pour ne pas révéler si l'email existe
    if (error) console.error('Reset password error:', error.message);
    return { success: true };
}

export async function updatePassword(formData: FormData) {
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };

    revalidatePath('/', 'layout');
    redirect('/stages');
}
