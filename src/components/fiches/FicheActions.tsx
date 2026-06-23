'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteFicheMemo, publierFicheMemo, depublierFicheMemo } from '@/actions/fiche-memo-actions';
import type { FicheMemo } from '@/actions/fiche-memo-actions';

interface FicheActionsProps {
    fiche: FicheMemo;
    canModerate: boolean;
}

export default function FicheActions({ fiche, canModerate }: FicheActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Supprimer la fiche "${fiche.titre}" ?`)) return;
        startTransition(async () => {
            await deleteFicheMemo(fiche.id);
            router.push('/ressources');
        });
    };

    const handleToggleStatut = () => {
        startTransition(async () => {
            if (fiche.statut === 'publie') {
                await depublierFicheMemo(fiche.id);
            } else {
                await publierFicheMemo(fiche.id);
            }
            router.refresh();
        });
    };

    return (
        <div className={`flex gap-2 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
            <Link
                href={`/ressources/${fiche.id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg text-sm font-semibold transition"
            >
                <span className="material-symbols-outlined text-base">edit</span>
                Modifier
            </Link>

            {canModerate && (
                <button
                    onClick={handleToggleStatut}
                    disabled={isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                        fiche.statut === 'publie'
                            ? 'bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700'
                            : 'bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border border-green-200'
                    }`}
                >
                    <span className="material-symbols-outlined text-base">
                        {fiche.statut === 'publie' ? 'unpublished' : 'publish'}
                    </span>
                    {fiche.statut === 'publie' ? 'Dépublier' : 'Publier'}
                </button>
            )}

            {canModerate && (
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-base">delete</span>
                </button>
            )}
        </div>
    );
}
