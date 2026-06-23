import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getFicheMemoById } from '@/actions/fiche-memo-actions';
import { getProfile } from '@/actions/user-actions';
import FicheForm from '@/components/fiches/FicheForm';

export default async function EditFichePage({ params }: { params: Promise<{ ficheId: string }> }) {
    const { ficheId } = await params;
    const [fiche, profile] = await Promise.all([
        getFicheMemoById(ficheId),
        getProfile(),
    ]);

    if (!profile) redirect('/login');
    if (!fiche) notFound();

    const isAuteur = profile.id === fiche.auteur_id;
    const canModerate = profile.role === 'admin' || profile.role === 'instructor';
    if (!isAuteur && !canModerate) notFound();

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
            <div className="mb-8">
                <Link
                    href={`/ressources/${ficheId}`}
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-semibold mb-4"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Retour à la fiche
                </Link>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
                    Modifier la fiche
                </h1>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <FicheForm fiche={fiche} />
            </div>
        </div>
    );
}
