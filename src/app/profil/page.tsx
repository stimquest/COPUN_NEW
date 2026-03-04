import { getProfile, getUserStats } from '@/actions/user-actions';
import { getUserContent } from '@/actions/content-actions';
import { getStages } from '@/services/data-service';
import { Profile, PedagogicalContent, Stage } from '@/types';
import Link from 'next/link';

export default async function ProfilPage() {
    let profile: Profile | null = null;
    let stats = { totalValidations: 0, createdContent: 0 };
    let userContent: PedagogicalContent[] = [];
    let stages: Stage[] = [];

    try {
        const results = await Promise.allSettled([
            getProfile(),
            getUserStats(),
            getUserContent(),
            getStages()
        ]);

        profile = results[0].status === 'fulfilled' ? results[0].value as Profile : null;
        stats = results[1].status === 'fulfilled' ? (results[1].value || stats) : stats;
        userContent = results[2].status === 'fulfilled' ? (results[2].value as PedagogicalContent[] || []) : [];
        stages = results[3].status === 'fulfilled' ? (results[3].value as Stage[] || []) : [];
    } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">account_circle</span>
                <p className="text-slate-500 font-medium mb-4">Vous n&apos;êtes pas connecté.</p>
                <Link href="/login" className="px-6 py-2 bg-primary text-white rounded-xl font-bold">
                    Se connecter
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white p-8 pb-12 rounded-b-[40px] shadow-sm border-b border-slate-200">
                <div className="flex flex-col items-center">
                    <div className="size-24 rounded-full bg-slate-100 border-4 border-white shadow-xl mb-4 overflow-hidden flex items-center justify-center">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                        )}
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-1">{profile.full_name || 'Moniteur'}</h1>
                    <div className="flex items-center gap-2 mb-3">
                        {profile.clubs?.name && (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{profile.clubs.name}</span>
                        )}
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {profile.role === 'admin' ? 'Administrateur' : 'Moniteur'}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-5 -mt-8">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-black text-emerald-500 mb-1">{stats?.totalValidations || 0}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Validations</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-black text-indigo-500 mb-1">{stats?.createdContent || 0}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fiches Créées</span>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="px-5 mt-8 max-w-md mx-auto w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-slate-900">Mes Fiches</h2>
                    <Link href={stages.length > 0 ? `/stages/${stages[0].id}/program` : '/stages/new'} className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                        Créer +
                    </Link>
                </div>

                {userContent.length > 0 ? (
                    <div className="space-y-4">
                        {userContent.map((content) => (
                            <div key={content.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
                                <div className="size-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">edit_note</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">{content.question}</h3>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{content.dimension}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                        <p className="text-sm text-slate-400 mb-3">Vous n&apos;avez pas encore créé de fiche.</p>
                        <Link href={stages.length > 0 ? `/stages/${stages[0].id}/program` : '/stages/new'} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm">add</span>
                            Créer ma première fiche
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
