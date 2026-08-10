'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteFicheMemo, publierFicheMemo, depublierFicheMemo } from '@/actions/fiche-memo-actions';
import type { FicheMemo } from '@/actions/fiche-memo-actions';
import { THEMATIC_TAG_LABELS, SAISON_LABELS } from './fiche-constants';

interface FicheCardProps {
    fiche: FicheMemo;
    currentUserId?: string | null;
    isAdmin?: boolean;
    isModerator?: boolean; // référent : admin OU instructor
}

export default function FicheCard({ fiche, currentUserId, isAdmin, isModerator }: FicheCardProps) {
    const router = useRouter();
    const params = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Le contexte d'arrivée (thème filtré, page d'origine) suit jusqu'à la fiche, pour que
    // son bouton retour rejoue la liste telle qu'on l'a quittée.
    const contexte = new URLSearchParams();
    const theme = params.get('theme');
    const retour = params.get('retour');
    if (theme) contexte.set('theme', theme);
    if (retour) contexte.set('retour', retour);
    const versFiche = contexte.size
        ? `/ressources/${fiche.id}?${contexte}`
        : `/ressources/${fiche.id}`;

    // Droits alignés sur les policies RLS
    const isAuthor = !!currentUserId && fiche.auteur_id === currentUserId;
    const canEdit = isAuthor || isModerator;        // update : auteur ou référent
    const canDelete = isAuthor || isAdmin;          // delete : auteur ou admin
    const canModerate = isModerator;                // publier/dépublier : référent

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

    const showActions = canEdit || canDelete || (canModerate && fiche.statut === 'publie');

    return (
        <div className={`group flex flex-col bg-white rounded-2xl border p-5 hover:shadow-xl transition-all ${
            fiche.statut === 'brouillon' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-teal-400'
        }`}>
            {/* Zone cliquable → détail */}
            <Link href={versFiche} className="block flex-1">
                {fiche.statut === 'brouillon' && (
                    <span className="inline-block mb-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full tracking-widest">
                        Brouillon
                    </span>
                )}

                <div className="flex items-start gap-3 mb-3">
                    <div className="size-11 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition shrink-0">
                        <span className="material-symbols-outlined text-xl">article</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug">
                            {fiche.titre}
                        </h3>
                        {fiche.auteur && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
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

            {/* Bouton de validation pour les brouillons (référent) */}
            {canModerate && fiche.statut === 'brouillon' && (
                <button
                    onClick={handleToggleStatut}
                    disabled={isPending}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    {isPending ? 'Publication…' : 'Valider et publier'}
                </button>
            )}

            {/* Barre d'actions en pied (séparée du contenu) */}
            {showActions && (
                <div className={`flex items-center justify-end gap-1 mt-4 pt-3 border-t border-slate-100 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                    {canEdit && (
                        <Link
                            href={`/ressources/${fiche.id}/edit`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 text-xs font-bold transition"
                            title="Modifier"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Modifier
                        </Link>
                    )}
                    {canModerate && fiche.statut === 'publie' && (
                        <button
                            onClick={handleToggleStatut}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 text-xs font-bold transition"
                            title="Dépublier"
                        >
                            <span className="material-symbols-outlined text-[18px]">unpublished</span>
                            Dépublier
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Supprimer"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
