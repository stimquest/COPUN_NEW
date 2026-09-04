'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createUserAccount, inviteUser } from '@/actions/admin-actions';
import { FichesAdminTab } from './FichesAdminTab';
import { ReportingTab } from './ReportingTab';
import { ActiviteTab } from './ActiviteTab';
import { UserEditModal } from './UserEditModal';
import type { PedagogicalContent } from '@/types';
import type { FicheMemo } from '@/actions/fiche-memo-actions';

type User = {
    id: string;
    email: string;
    full_name?: string;
    role: string;
    created_at: string;
    club_id?: string | null;
    clubs?: { name: string } | null;
    last_sign_in_at?: string | null;
};

function lastSignInLabel(iso: string | null | undefined): string {
    if (!iso) return 'Jamais connecté';
    const diffMs = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diffMs / 86_400_000);
    if (days <= 0) return "Connecté aujourd'hui";
    if (days === 1) return 'Connecté hier';
    if (days < 30) return `Connecté il y a ${days} j`;
    const months = Math.floor(days / 30);
    return `Connecté il y a ${months} mois`;
}

type Club = { id: string; name: string };

type Tab = 'users' | 'create' | 'invite' | 'fiches' | 'reporting' | 'activite';

export function AdminClient({ users: initialUsers, clubs, fiches, fichesMemo, error, userRole }: {
    users: User[];
    clubs: Club[];
    fiches: PedagogicalContent[];
    fichesMemo: FicheMemo[];
    error?: string;
    userRole?: string | null;
}) {
    const [tab, setTab] = useState<Tab>('users');
    const [users, setUsers] = useState(initialUsers);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    async function handleCreate(formData: FormData) {
        setLoading(true);
        setMessage(null);
        const result = await createUserAccount(formData);
        setMessage(result.error
            ? { type: 'error', text: result.error }
            : { type: 'success', text: result.success! }
        );
        setLoading(false);
    }

    async function handleInvite(formData: FormData) {
        setLoading(true);
        setMessage(null);
        const result = await inviteUser(formData);
        setMessage(result.error
            ? { type: 'error', text: result.error }
            : { type: 'success', text: result.success! }
        );
        setLoading(false);
    }

    const roleLabel = (role: string) => ({
        admin: 'Admin général',
        club_admin: 'Admin club',
        moderator: 'Référent mémo',
        instructor: 'Moniteur',
    }[role] ?? role);

    const roleColor = (role: string) => ({
        admin: 'bg-violet-100 text-violet-700',
        club_admin: 'bg-purple-100 text-purple-700',
        moderator: 'bg-teal-100 text-teal-700',
        instructor: 'bg-indigo-100 text-indigo-700',
    }[role] ?? 'bg-slate-100 text-slate-600');

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <Link href="/profil" className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Administration</p>
                    <p className="text-lg font-bold leading-none text-slate-900">
                        {tab === 'fiches' ? 'Fiches pédagogiques' : 'Gestion des accès'}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full border border-violet-200">
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    <span className="text-xs font-black uppercase tracking-widest">Admin</span>
                </div>
            </header>

            {/* Tabs — hors du conteneur max-w pour être pleine largeur */}
            <div className="bg-white border-b border-slate-100 px-6 py-2">
                <div className="flex gap-1 max-w-6xl mx-auto">
                    {([
                        { key: 'users', label: 'Utilisateurs', icon: 'group', count: users.length },
                        { key: 'fiches', label: 'Fiches péda.', icon: 'auto_stories', count: fiches.length },
                        { key: 'reporting', label: 'Reporting', icon: 'analytics', count: null },
                        { key: 'activite', label: 'Activité', icon: 'timeline', count: null },
                        { key: 'create', label: 'Créer un compte', icon: 'person_add', count: null },
                        { key: 'invite', label: 'Invitation', icon: 'mail', count: null },
                    ] as const).map(t => (
                        <button
                            key={t.key}
                            onClick={() => { setTab(t.key); setMessage(null); }}
                            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                tab === t.key
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">{t.icon}</span>
                            <span className="hidden sm:inline">{t.label}</span>
                            {t.count !== null && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${tab === t.key ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Onglet Fiches — pleine largeur, layout split-panel */}
            {tab === 'fiches' && (
                <div className="flex-1 overflow-hidden">
                    <FichesAdminTab initialFiches={fiches} fichesMemo={fichesMemo} />
                </div>
            )}

            {/* Onglet Reporting */}
            {tab === 'reporting' && (
                <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full pb-36">
                    <ReportingTab userRole={userRole} />
                </main>
            )}

            {/* Onglet Activité — qui se sert de l'app, depuis quand et à quel rythme */}
            {tab === 'activite' && (
                <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full pb-36">
                    <ActiviteTab />
                </main>
            )}

            <main className={`flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6 pb-36 ${tab === 'fiches' || tab === 'reporting' || tab === 'activite' ? 'hidden' : ''}`}>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm font-semibold">
                        {error}
                    </div>
                )}

                {/* Message feedback */}
                {message && (
                    <div className={`p-4 rounded-2xl text-sm font-semibold border ${
                        message.type === 'error'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                        <span className="material-symbols-outlined text-base align-middle mr-2">
                            {message.type === 'error' ? 'error' : 'check_circle'}
                        </span>
                        {message.text}
                    </div>
                )}

                {/* Tab: Liste utilisateurs */}
                {tab === 'users' && (
                    <div className="space-y-3">
                        {users.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2 block">group</span>
                                <p className="text-sm font-semibold">Aucun utilisateur trouvé.</p>
                            </div>
                        ) : users.map(u => (
                            <button
                                key={u.id}
                                onClick={() => setEditingUser(u)}
                                className="w-full text-left bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4 active:scale-[0.99] group"
                            >
                                <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0 font-black text-sm">
                                    {(u.full_name ?? u.email)[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-sm truncate">{u.full_name || '—'}</p>
                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${roleColor(u.role)}`}>
                                            {roleLabel(u.role)}
                                        </span>
                                        {u.clubs?.name ? (
                                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-35">
                                                {u.clubs.name}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                Sans club
                                            </span>
                                        )}
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${u.last_sign_in_at ? 'text-slate-400 bg-slate-50' : 'text-rose-500 bg-rose-50'}`}>
                                            {lastSignInLabel(u.last_sign_in_at)}
                                        </span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0">edit</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Tab: Créer un compte */}
                {tab === 'create' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
                        <div>
                            <h3 className="font-black text-slate-900">Créer un compte</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Le compte est créé immédiatement. L'utilisateur reçoit un email pour choisir son mot de passe.
                            </p>
                        </div>

                        <form action={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nom complet</label>
                                <input
                                    name="fullName"
                                    type="text"
                                    placeholder="Marie Dupont"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="marie@club-nautique.fr"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rôle</label>
                                    <select
                                        name="role"
                                        defaultValue="instructor"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 transition-colors"
                                    >
                                        <option value="instructor">Moniteur</option>
                                        <option value="admin">Admin</option>
                                        <option value="student">Stagiaire</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Club</label>
                                    <select
                                        name="clubId"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 transition-colors"
                                    >
                                        <option value="">— Aucun —</option>
                                        {clubs.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                                    : <><span className="material-symbols-outlined text-lg">person_add</span> Créer le compte</>
                                }
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab: Invitation */}
                {tab === 'invite' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
                        <div>
                            <h3 className="font-black text-slate-900">Envoyer une invitation</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                L'utilisateur reçoit un lien magique par email. En cliquant, il est connecté directement et peut choisir son mot de passe.
                            </p>
                        </div>

                        <form action={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email à inviter</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="nouveau@club-nautique.fr"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 transition-colors"
                                />
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                                <span className="material-symbols-outlined text-amber-500 text-lg shrink-0 mt-0.5">info</span>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Le rôle et le club ne sont pas définis à l'invitation. Pensez à les configurer dans la liste des utilisateurs après la première connexion.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                                    : <><span className="material-symbols-outlined text-lg">mail</span> Envoyer l&apos;invitation</>
                                }
                            </button>
                        </form>
                    </div>
                )}

            </main>

            {/* Panneau d'édition de compte */}
            {editingUser && (
                <UserEditModal
                    user={editingUser}
                    clubs={clubs}
                    onClose={() => setEditingUser(null)}
                    onSaved={(updated) => {
                        setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
                        setEditingUser(null);
                        setMessage({ type: 'success', text: 'Compte mis à jour.' });
                    }}
                    onDeleted={(userId) => {
                        setUsers(prev => prev.filter(u => u.id !== userId));
                        setEditingUser(null);
                        setMessage({ type: 'success', text: 'Compte supprimé.' });
                    }}
                />
            )}
        </div>
    );
}
