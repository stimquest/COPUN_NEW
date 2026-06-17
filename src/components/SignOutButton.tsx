'use client';

import { useTransition } from 'react';
import { signOut } from '@/actions/auth-actions';

export default function SignOutButton() {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => signOut())}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 font-bold text-sm"
        >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {isPending ? 'Déconnexion…' : 'Se déconnecter'}
        </button>
    );
}
