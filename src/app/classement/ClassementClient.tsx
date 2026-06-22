'use client';

import { useState } from 'react';
import clsx from 'clsx';

type MonitorEntry = {
    monitor_id: string;
    full_name: string;
    club_name?: string | null;
    total_points: number;
};

type ClubEntry = {
    club_id: string;
    club_name: string;
    total_points: number;
};

type Props = {
    monitors: MonitorEntry[];
    clubs: ClubEntry[];
    myPoints: number;
};

const MEDAL_BG = ['bg-amber-50 border-amber-200', 'bg-slate-50 border-slate-200', 'bg-orange-50 border-orange-200'];
const MEDAL_TEXT = ['text-amber-400', 'text-slate-400', 'text-orange-500'];

export default function ClassementClient({ monitors, clubs, myPoints }: Props) {
    const [tab, setTab] = useState<'monitors' | 'clubs'>('monitors');

    return (
        <main className="px-4 -mt-8 relative z-10 space-y-6 max-w-lg mx-auto w-full">

            {/* Mon score */}
            <div className="bg-indigo-600 rounded-2xl p-5 flex items-center gap-4 shadow-xl shadow-indigo-600/20">
                <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-3xl">emoji_events</span>
                </div>
                <div>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Mon score</p>
                    <p className="text-4xl font-black text-white leading-none">{myPoints} <span className="text-lg text-indigo-300">pts</span></p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-200 rounded-2xl gap-1">
                <button
                    onClick={() => setTab('monitors')}
                    className={clsx(
                        'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                        tab === 'monitors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    )}
                >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    Moniteurs
                </button>
                <button
                    onClick={() => setTab('clubs')}
                    className={clsx(
                        'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                        tab === 'clubs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    )}
                >
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                    Clubs
                </button>
            </div>

            {/* Moniteurs */}
            {tab === 'monitors' && (
                <section className="space-y-2">
                    {monitors.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-200 mb-2 block">leaderboard</span>
                            <p className="text-sm text-slate-400">Aucun point encore enregistré.</p>
                            <p className="text-xs text-slate-400 mt-1">Complétez votre premier quiz de fin de stage pour apparaître ici.</p>
                        </div>
                    ) : (
                        monitors.map((entry, i) => (
                            <div key={entry.monitor_id} className={clsx(
                                'bg-white rounded-2xl border-2 p-4 flex items-center gap-4',
                                i < 3 ? MEDAL_BG[i] : 'border-slate-100'
                            )}>
                                <div className={clsx(
                                    'size-10 rounded-full flex items-center justify-center font-black text-base shrink-0',
                                    i < 3 ? `${MEDAL_TEXT[i]} bg-white shadow-sm` : 'bg-slate-100 text-slate-500'
                                )}>
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 truncate">{entry.full_name}</p>
                                    {entry.club_name && (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{entry.club_name}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-2xl font-black text-indigo-600">{entry.total_points}</span>
                                    <span className="text-xs text-slate-400 ml-1">pts</span>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            )}

            {/* Clubs */}
            {tab === 'clubs' && (
                <section className="space-y-2">
                    {clubs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-200 mb-2 block">groups</span>
                            <p className="text-sm text-slate-400">Aucun club au classement pour l&apos;instant.</p>
                        </div>
                    ) : (
                        clubs.map((entry, i) => (
                            <div key={entry.club_id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
                                <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black shrink-0">
                                    {i + 1}
                                </div>
                                <p className="flex-1 font-black text-slate-900 truncate">{entry.club_name}</p>
                                <div className="text-right shrink-0">
                                    <span className="text-2xl font-black text-emerald-600">{entry.total_points}</span>
                                    <span className="text-xs text-slate-400 ml-1">pts</span>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            )}

            {/* Barème */}
            <section className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Barème des points</h3>
                {[
                    { label: 'Quiz de fin de stage', pts: '8 pts', icon: 'quiz' },
                    { label: 'Bonus quiz 70-85%', pts: '+1 pt', icon: 'trending_up' },
                    { label: 'Bonus quiz 85-100%', pts: '+2 pts', icon: 'workspace_premium' },
                    { label: 'Défi complété', pts: '+2 pts', icon: 'flag' },
                    { label: 'Défi GPS spot fixe', pts: '+3 pts', icon: 'location_on' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-300 text-[18px]">{item.icon}</span>
                        <span className="flex-1 text-sm font-medium text-slate-600">{item.label}</span>
                        <span className="text-sm font-black text-indigo-600">{item.pts}</span>
                    </div>
                ))}
            </section>

        </main>
    );
}
