import Link from 'next/link';
import { getProfile } from '@/actions/user-actions';
import { redirect } from 'next/navigation';
import FicheForm from '@/components/fiches/FicheForm';

export default async function NouvelleFichePage() {
    const profile = await getProfile();

    if (!profile) {
        redirect('/login');
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
            <div className="mb-8">
                <Link
                    href="/ressources"
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-semibold mb-4"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Ressources
                </Link>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
                    Nouvelle fiche mémo
                </h1>
                <p className="text-slate-500 mt-1">
                    Ta fiche sera soumise à un référent avant d&apos;être publiée.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <FicheForm />
            </div>
        </div>
    );
}
