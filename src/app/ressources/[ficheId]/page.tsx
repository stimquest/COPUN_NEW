import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getFicheMemoById } from '@/actions/fiche-memo-actions';
import { getProfile } from '@/actions/user-actions';
import { THEMATIC_TAG_LABELS, SAISON_LABELS } from '@/components/fiches/fiche-constants';
import FicheActions from '@/components/fiches/FicheActions';
import FicheContent from '@/components/fiches/FicheContent';

export default async function FicheDetailPage({ params }: { params: Promise<{ ficheId: string }> }) {
    const { ficheId } = await params;
    const [fiche, profile] = await Promise.all([
        getFicheMemoById(ficheId),
        getProfile(),
    ]);

    if (!fiche) notFound();

    // Brouillon visible seulement pour l'auteur ou les modérateurs
    const isAuteur = profile?.id === fiche.auteur_id;
    const canModerate = profile?.role === 'admin' || profile?.role === 'instructor';
    if (fiche.statut === 'brouillon' && !isAuteur && !canModerate) notFound();

    const canEdit = isAuteur || canModerate;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
            {/* Breadcrumb */}
            <Link
                href="/ressources"
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-semibold mb-6"
            >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Ressources
            </Link>

            {/* Statut brouillon */}
            {fiche.statut === 'brouillon' && (
                <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">pending</span>
                    Cette fiche est en attente de validation — elle n&apos;est pas encore visible par tous.
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="size-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                        <span className="material-symbols-outlined text-2xl">article</span>
                    </div>
                    {canEdit && (
                        <FicheActions fiche={fiche} canModerate={canModerate} />
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                    {fiche.titre}
                </h1>

                {fiche.resume && (
                    <p className="text-slate-500 font-medium mb-4">{fiche.resume}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {fiche.tags_thematiques.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100">
                            {THEMATIC_TAG_LABELS[tag] ?? tag}
                        </span>
                    ))}
                    {fiche.tags_saisons.map(saison => (
                        <span key={saison} className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">
                            {SAISON_LABELS[saison] ?? saison}
                        </span>
                    ))}
                    {(fiche.tags ?? []).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>

                <p className="text-xs text-slate-400">
                    {fiche.auteur?.full_name ?? fiche.auteur?.email ?? 'Auteur inconnu'}
                    {' · '}
                    Mis à jour le {new Date(fiche.updated_at).toLocaleDateString('fr-FR')}
                </p>
            </div>

            {/* Contenu */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <FicheContent html={fiche.contenu} />
            </div>
        </div>
    );
}
