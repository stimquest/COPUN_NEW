'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/profil');
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}

export async function signUp(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    return { success: "Vérifiez votre boîte mail pour confirmer l'inscription !" };
}
