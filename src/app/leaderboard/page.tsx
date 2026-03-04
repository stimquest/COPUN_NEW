import { getLeaderboard } from '@/actions/defi-actions';
import Link from 'next/link';

export default async function LeaderboardPage() {
    const [monitorsData, clubsData] = await Promise.all([
        getLeaderboard('monitors', 20),
        getLeaderboard('clubs', 10)
    ]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <Link href="/stages" className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Classement</h1>
                    <p className="text-lg font-bold leading-none text-slate-900">Leaderboard Défis</p>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 pb-32 max-w-lg mx-auto w-full space-y-8">

                {/* Monitor Leaderboard */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                        Top Moniteurs
                    </h2>

                    {monitorsData.length === 0 ? (
                        <div className="p-6 bg-slate-100 rounded-xl text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">leaderboard</span>
                            <p>Aucun point encore enregistré</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {monitorsData.map((entry, index) => (
                                <div
                                    key={entry.monitor_id}
                                    className={`p-4 rounded-xl flex items-center gap-4 ${index === 0 ? 'bg-amber-50 border-2 border-amber-200' :
                                            index === 1 ? 'bg-slate-100 border-2 border-slate-200' :
                                                index === 2 ? 'bg-orange-50 border-2 border-orange-200' :
                                                    'bg-white border border-slate-100'
                                        }`}
                                >
                                    <div className={`size-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-amber-500 text-white' :
                                            index === 1 ? 'bg-slate-400 text-white' :
                                                index === 2 ? 'bg-orange-400 text-white' :
                                                    'bg-slate-200 text-slate-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 truncate">
                                            Moniteur #{entry.monitor_id.slice(0, 8)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-emerald-600">{entry.total_points}</span>
                                        <span className="text-xs text-slate-500 ml-1">pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Club Leaderboard */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500">groups</span>
                        Classement Clubs
                    </h2>

                    {clubsData.length === 0 ? (
                        <div className="p-6 bg-slate-100 rounded-xl text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">domain</span>
                            <p>Aucun club dans le classement</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {clubsData.map((entry, index) => (
                                <div
                                    key={entry.club_id}
                                    className="p-4 bg-white rounded-xl border border-slate-100 flex items-center gap-4"
                                >
                                    <div className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 truncate">
                                            Club #{entry.club_id.slice(0, 8)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-indigo-600">{entry.total_points}</span>
                                        <span className="text-xs text-slate-500 ml-1">pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
