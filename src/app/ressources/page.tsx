import Link from 'next/link';
import { getAllFichesMemo } from '@/actions/fiche-memo-actions';
import { getProfile } from '@/actions/user-actions';
import type { ThematicTag } from '@/data/seasonal-context';
import FicheCard from '@/components/fiches/FicheCard';
import FichesBrowser from '@/components/fiches/FichesBrowser';
import { ALL_THEMATIC_TAGS } from '@/components/fiches/fiche-constants';

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
            {/* Header */}
            <header className="mb-10">
                {retour && (
                    <Link
                        href={retour}
                        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-semibold mb-5"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Retour
                    </Link>
                )}

                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">
                            Ressources
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Fiches mémo collaboratives et jeux pédagogiques
                        </p>
                    </div>
                    <Link
                        href="/ressources/nouvelle"
                        className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-200 shrink-0"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span className="hidden sm:inline">Nouvelle fiche</span>
                    </Link>
                </div>

                {/* Onglets */}
                <div className="flex gap-2">
                    <span className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm">
                        Fiches mémo
                    </span>
                    <Link
                        href="/ressources/jeux"
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:border-indigo-300 hover:text-indigo-600 transition"
                    >
                        Jeux
                    </Link>
                </div>
            </header>

            {/* Brouillons (référents seulement) */}
            {canModerate && fichesBrouillon.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-sm font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
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
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
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
