import Link from 'next/link';
import { getDashboardStages } from '@/services/data-service';
import { getProfile, getUserStats } from '@/actions/user-actions';
import StageDashboardCard from '@/components/StageDashboardCard';

export default async function StagesPage() {
    const [stages, profile, stats] = await Promise.all([
        getDashboardStages(),
        getProfile(),
        getUserStats()
    ]);

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : profile?.email?.slice(0, 2).toUpperCase() || '??';

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-36">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <span className="material-symbols-outlined text-indigo-600 text-2xl">sailing</span>
                    </div>
                    <div>
                        <h1 className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none">MONITEUR</h1>
                        <p className="text-lg font-bold leading-none text-slate-900">{profile?.full_name || 'Tableau de Bord'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/profil">
                        <div className="size-10 rounded-full bg-indigo-100 border-2 border-indigo-600 flex items-center justify-center text-indigo-600 font-bold overflow-hidden cursor-pointer hover:bg-indigo-200 transition-colors">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                    </Link>
                </div>
            </header>

            <main className="flex-1 px-5 py-8 space-y-8 max-w-5xl mx-auto w-full">

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mes Stages Actifs</h2>
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{stages.length} {stages.length > 1 ? 'STAGES' : 'STAGE'}</span>
                    </div>

                    {/* STAGE LIST */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {stages.length === 0 && (
                            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-8 text-center">
                                <p className="text-xs font-bold text-slate-400 italic">Aucun stage actif. Commencez par en préparer un.</p>
                            </div>
                        )}
                        {stages.map((stage) => (
                            <StageDashboardCard key={stage.id} stage={stage} />
                        ))}

                        {/* PREPARE FUTURE STAGE */}
                        <Link href="/stages/new" className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group">
                            <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-3xl">add</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Préparer un nouveau stage</h4>
                                <p className="text-xs text-slate-500 font-medium">Anticipez vos sessions et contenus environement.</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* ACTIVITY SUMMARY */}
                <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500 to-indigo-700"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="size-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <span className="material-symbols-outlined text-4xl">analytics</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-base font-black uppercase tracking-tight italic">Mon Impact</h4>
                            <p className="text-xs text-indigo-100">{stats?.totalValidations || 0} défis relevés par vos élèves cette saison.</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
