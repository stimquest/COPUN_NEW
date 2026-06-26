'use client';

import { useState } from 'react';
import { signIn, requestPasswordReset } from '@/actions/auth-actions';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const searchParams = useSearchParams();
    const urlError = searchParams.get('error');

    async function handleLogin(formData: FormData) {
        setLoading(true);
        setMessage(null);
        const result = await signIn(formData);
        if (result?.error) {
            setMessage({ type: 'error', text: 'Email ou mot de passe incorrect.' });
            setLoading(false);
        }
    }

    async function handleForgot(formData: FormData) {
        setLoading(true);
        setMessage(null);
        formData.set('origin', window.location.origin);
        await requestPasswordReset(formData);
        setMessage({ type: 'success', text: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
        setLoading(false);
    }

    return (
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-8 shadow-2xl shadow-black/50">
            {!forgotMode ? (
                <>
                    <div className="text-center mb-6">
                        <h2 className="text-white font-bold tracking-tight">Connexion Pro</h2>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Accès réservé aux moniteurs et clubs</p>
                    </div>

                    {urlError === 'lien_invalide' && (
                        <div className="mb-4 p-4 rounded-xl text-sm font-bold bg-red-500/20 text-red-200 border border-red-500/30">
                            Lien expiré ou invalide. Demandez un nouveau lien.
                        </div>
                    )}

                    <form action={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="moniteur@club.fr"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-1">Mot de passe</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        {message && (
                            <div className={clsx(
                                "p-4 rounded-xl text-sm font-bold",
                                message.type === 'error' ? "bg-red-500/20 text-red-200 border border-red-500/30" : "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                            )}>
                                {message.text}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                                : 'Se connecter'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setForgotMode(true); setMessage(null); }}
                            className="w-full text-center text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-widest transition-colors pt-1"
                        >
                            Mot de passe oublié ?
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <div className="text-center mb-6">
                        <h2 className="text-white font-bold tracking-tight">Mot de passe oublié</h2>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">On vous envoie un lien</p>
                    </div>

                    <form action={handleForgot} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-1">Votre email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="moniteur@club.fr"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        {message && (
                            <div className={clsx(
                                "p-4 rounded-xl text-sm font-bold",
                                message.type === 'error' ? "bg-red-500/20 text-red-200 border border-red-500/30" : "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                            )}>
                                {message.text}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                                : 'Envoyer le lien'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setForgotMode(false); setMessage(null); }}
                            className="w-full text-center text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-widest transition-colors pt-1"
                        >
                            ← Retour à la connexion
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 -left-20 size-80 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-20 size-80 bg-emerald-600/20 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="size-16 bg-white/10 backdrop-blur-xl rounded-2xl mx-auto flex items-center justify-center border border-white/20 mb-6 shadow-2xl">
                        <span className="material-symbols-outlined text-white text-3xl">waves</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Copun</h1>
                    <p className="text-slate-400 font-medium tracking-tight leading-relaxed">
                        L&apos;Accompagnateur des Sentinelles du Littoral
                    </p>
                </div>

                <Suspense fallback={<div className="bg-white/10 rounded-[32px] p-8 h-64 animate-pulse" />}>
                    <LoginForm />
                </Suspense>

                <div className="mt-10 text-center">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-40 italic">
                        &ldquo;Pour un littoral vivant et protégé&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}
