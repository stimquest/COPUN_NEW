import Link from 'next/link';
import { getAllFichesMemo } from '@/actions/fiche-memo-actions';
import { getProfile } from '@/actions/user-actions';
import type { ThematicTag } from '@/data/seasonal-context';
import FicheCard from '@/components/fiches/FicheCard';
import FichesBrowser from '@/components/fiches/FichesBrowser';
import { ALL_THEMATIC_TAGS } from '@/components/fiches/fiche-constants';
import { PageHeading } from '@/components/design/Coastal';

export default async function RessourcesPage({
    searchParams,
}: {
    searchParams: Promise<{ theme?: string; retour?: string }>;
}) {
    const [fiches, profile, params] = await Promise.all([
        getAllFichesMemo(),
        getProfile(),
        searchParams,
    ]);

    // `?theme=` arrive depuis l'écran de choix des sujets. Validé contre la liste connue :
    // une valeur inventée dans l'URL ne doit pas produire une liste vide inexplicable.
    const themeInitial = (ALL_THEMATIC_TAGS as readonly string[]).includes(params.theme ?? '')
        ? (params.theme as ThematicTag)
        : null;

    // `?retour=` : chemin de retour quand on arrive depuis une autre page de l'app. Sans lui,
    // le seul moyen de revenir est le bouton de l'OS — invisible sur mobile en plein écran.
    // Restreint aux chemins internes : une URL absolue permettrait une redirection ouverte.
    const retour = params.retour?.startsWith('/') && !params.retour.startsWith('//')
        ? params.retour
        : null;

    const isAdmin = profile?.role === 'admin';
    const isModerator = profile?.role === 'admin' || profile?.role === 'instructor';
    const canModerate = isModerator; // pour la section "en attente de validation"
    const currentUserId = profile?.id ?? null;

    const fichesBrouillon = fiches.filter(f => f.statut === 'brouillon');
    const fichesPubliees = fiches.filter(f => f.statut === 'publie');

    return (
        <div className="co-page">
            {/* Header */}
            <div className="co-library-header">
                {retour && (
                    <Link
                        href={retour}
                        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-semibold mb-5"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Retour
                    </Link>
                )}

                <PageHeading eyebrow="Pour approfondir" title="Ressources" description="Des repères à garder sous la main." action={<Link href="/ressources/nouvelle" className="co-icon-button" aria-label="Créer une fiche"><span className="material-symbols-outlined" aria-hidden>add</span></Link>}/>

                {/* Onglets */}
                <div className="co-tabs">
                    <span aria-current="page">
                        Fiches mémo
                    </span>
                    <Link
                        href="/ressources/jeux"
                    >
                        Jeux
                    </Link>
                </div>
            </div>

            {/* Brouillons (référents seulement) */}
            {canModerate && fichesBrouillon.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-sm font-bold text-amber-600 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">pending</span>
                        En attente de validation ({fichesBrouillon.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {fichesBrouillon.map(fiche => (
                            <FicheCard
                                key={fiche.id}
                                fiche={fiche}
                                currentUserId={currentUserId}
                                isAdmin={isAdmin}
                                isModerator={isModerator}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Fiches publiées — avec recherche et filtres */}
            {fichesPubliees.length > 0 ? (
                <section>
                    {canModerate && fichesBrouillon.length > 0 && (
                        <h2 className="text-sm font-bold text-slate-400 mb-4">
                            Publiées ({fichesPubliees.length})
                        </h2>
                    )}
                    <FichesBrowser
                        fiches={fichesPubliees}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        isModerator={isModerator}
                        themeInitial={themeInitial}
                    />
                </section>
            ) : (
                !canModerate || fichesBrouillon.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">article</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune fiche publiée</h2>
                        <p className="text-slate-500 mb-6">Sois le premier à contribuer une fiche mémo !</p>
                        <Link
                            href="/ressources/nouvelle"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Créer une fiche
                        </Link>
                    </div>
                ) : null
            )}
        </div>
    );
}
