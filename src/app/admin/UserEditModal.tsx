'use client';

import { useState } from 'react';
import { updateUserProfile, deleteUser } from '@/actions/admin-actions';

export type EditableUser = {
    id: string;
    email: string;
    full_name?: string;
    role: string;
    club_id?: string | null;
    clubs?: { name: string } | null;
};

type Club = { id: string; name: string };

interface Props {
    user: EditableUser;
    clubs: Club[];
    onClose: () => void;
    onSaved: (u: EditableUser) => void;
    onDeleted: (userId: string) => void;
}

export function UserEditModal({ user, clubs, onClose, onSaved, onDeleted }: Props) {
    const [fullName, setFullName] = useState(user.full_name ?? '');
    const [role, setRole] = useState(user.role);
    const [clubId, setClubId] = useState(user.club_id ?? '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setSaving(true);
        setError(null);
        const result = await updateUserProfile(user.id, {
            full_name: fullName.trim(),
            role,
            club_id: clubId || null,
        });
        setSaving(false);
        if (result.error) { setError(result.error); return; }
        const clubName = clubs.find(c => c.id === clubId)?.name;
        onSaved({
            ...user,
            full_name: fullName.trim() || undefined,
            role,
            club_id: clubId || null,
            clubs: clubName ? { name: clubName } : null,
        });
    }

    async function handleDelete() {
        setDeleting(true);
        setError(null);
        const result = await deleteUser(user.id);
        setDeleting(false);
        if (result.error) { setError(result.error); return; }
        onDeleted(user.id);
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black shrink-0">
                        {(user.full_name ?? user.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 leading-tight">Modifier le compte</h3>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Nom complet */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nom complet</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Marie Dupont"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                </div>

                {/* Rôle + Club */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rôle</label>
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 transition-colors"
                        >
                            <option value="instructor">Moniteur</option>
                            <option value="admin">Admin</option>
                            <option value="student">Stagiaire</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Club</label>
                        <select
                            value={clubId}
                            onChange={e => setClubId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 transition-colors"
                        >
                            <option value="">— Sans club —</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Enregistrer */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {saving
                        ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                        : <><span className="material-symbols-outlined text-lg">save</span> Enregistrer</>
                    }
                </button>

                {/* Zone danger */}
                <div className="pt-2 border-t border-slate-100">
                    {!confirmDelete ? (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="w-full py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Supprimer ce compte
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500 text-center">Cette action est irréversible.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting
                                        ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                                        : 'Supprimer définitivement'
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
