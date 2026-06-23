'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteFicheMemo, publierFicheMemo, depublierFicheMemo } from '@/actions/fiche-memo-actions';
import type { FicheMemo } from '@/actions/fiche-memo-actions';
import { THEMATIC_TAG_LABELS, SAISON_LABELS } from './fiche-constants';

interface FicheCardProps {
    fiche: FicheMemo;
    canModerate?: boolean;
    canDelete?: boolean;
}

export default function FicheCard({ fiche, canModerate, canDelete }: FicheCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Supprimer la fiche "${fiche.titre}" ?`)) return;
        startTransition(async () => {
            await deleteFicheMemo(fiche.id);
            router.refresh();
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
        <div className={`group bg-white rounded-2xl border p-6 hover:shadow-xl transition-all relative ${
            fiche.statut === 'brouillon' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-teal-400'
        }`}>
            {fiche.statut === 'brouillon' && (
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full tracking-widest">
                    Brouillon
                </span>
            )}

            <div className={`absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
                <Link
                    href={`/ressources/${fiche.id}/edit`}
                    className="size-8 rounded-lg bg-slate-100 hover:bg-blue-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition"
                    title="Modifier"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                </Link>
                {canModerate && (
                    <button
                        onClick={handleToggleStatut}
                        disabled={isPending}
                        className={`size-8 rounded-lg flex items-center justify-center transition disabled:opacity-50 ${
                            fiche.statut === 'publie'
                                ? 'bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-600'
                                : 'bg-slate-100 hover:bg-green-100 text-slate-500 hover:text-green-600'
                        }`}
                        title={fiche.statut === 'publie' ? 'Dépublier' : 'Publier'}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {fiche.statut === 'publie' ? 'unpublished' : 'publish'}
                        </span>
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="size-8 rounded-lg bg-slate-100 hover:bg-red-100 flex items-center justify-center text-slate-500 hover:text-red-600 transition disabled:opacity-50"
                        title="Supprimer"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                )}
            </div>

            <Link href={`/ressources/${fiche.id}`} className="block mt-2">
                <div className="flex items-start gap-3 mb-3">
                    <div className="size-11 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition shrink-0">
                        <span className="material-symbols-outlined text-xl">article</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug">
                            {fiche.titre}
                        </h3>
                        {fiche.auteur && (
                            <p className="text-xs text-slate-400 mt-0.5">
                                {fiche.auteur.full_name ?? fiche.auteur.email}
                            </p>
                        )}
                    </div>
                </div>

                {fiche.resume && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{fiche.resume}</p>
                )}

                <div className="flex flex-wrap gap-1.5">
                    {fiche.tags_thematiques.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[11px] font-medium rounded-full border border-teal-100">
                            {THEMATIC_TAG_LABELS[tag] ?? tag}
                        </span>
                    ))}
                    {fiche.tags_saisons.map(saison => (
                        <span key={saison} className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[11px] font-medium rounded-full border border-sky-100">
                            {SAISON_LABELS[saison] ?? saison}
                        </span>
                    ))}
                </div>

                <p className="text-xs text-slate-400 mt-3">
                    Mis à jour le {new Date(fiche.updated_at).toLocaleDateString('fr-FR')}
                </p>
            </Link>
        </div>
    );
}
