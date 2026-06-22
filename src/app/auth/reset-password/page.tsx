'use client';

import { useState } from 'react';
import { updatePassword } from '@/actions/auth-actions';

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        const password = formData.get('password') as string;
        const confirm = formData.get('confirm') as string;

        if (password !== confirm) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (password.length < 8) {
            setError('Le mot de passe doit faire au moins 8 caractères.');
            return;
        }

        setLoading(true);
        setError(null);
        const result = await updatePassword(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // Si succès, updatePassword redirige vers /stages
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 -left-20 size-80 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-20 size-80 bg-emerald-600/20 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="size-16 bg-white/10 backdrop-blur-xl rounded-2xl mx-auto flex items-center justify-center border border-white/20 mb-6 shadow-2xl">
                        <span className="material-symbols-outlined text-white text-3xl">lock_reset</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">COPUN</h1>
                    <p className="text-slate-400 font-medium">Choisir un nouveau mot de passe</p>
                </div>

                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-8 shadow-2xl shadow-black/50">
                    <form action={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-1">
                                Nouveau mot de passe
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder="8 caractères minimum"
                                required
                                minLength={8}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-1">
                                Confirmer le mot de passe
                            </label>
                            <input
                                name="confirm"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl text-sm font-bold bg-red-500/20 text-red-200 border border-red-500/30">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                                : 'Enregistrer'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
