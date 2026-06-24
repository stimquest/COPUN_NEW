'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';

export type MonitorRow = { monitor_id: string; full_name: string; club_name: string | null; total_points: number };
export type ClubRow = { club_id: string; club_name: string; total_points: number };

interface Props {
    monitors: MonitorRow[];
    clubs: ClubRow[];
    currentUserId: string | null;
    myPoints: number;
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function StatsClient({ monitors, clubs, currentUserId, myPoints }: Props) {
    const [activeTab, setActiveTab] = useState<'CLUBS' | 'MONITEURS'>('MONITEURS');

    const rows: { id: string; name: string; sub?: string; points: number; isMe: boolean }[] =
        activeTab === 'CLUBS'
            ? clubs.map(c => ({ id: c.club_id, name: c.club_name, points: c.total_points, isMe: false }))
            : monitors.map(m => ({
                id: m.monitor_id,
                name: m.full_name,
                sub: m.club_name ?? undefined,
                points: m.total_points,
                isMe: m.monitor_id === currentUserId,
            }));

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <header className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                    <h1 className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase mb-2">Impact Environnemental</h1>
                    <h2 className="text-4xl font-black uppercase leading-none">Le Podium<br /><span className="text-slate-500">Du Changement</span></h2>
                </div>
            </header>

            <main className="px-6 -mt-12 relative z-20 space-y-8">

                {/* Switcher */}
                <div className="bg-white p-1.5 rounded-2xl shadow-xl flex border border-slate-100">
                    <button
                        onClick={() => setActiveTab('MONITEURS')}
                        className={clsx("flex-1 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all", activeTab === 'MONITEURS' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
                    >
                        Moniteurs
                    </button>
                    <button
                        onClick={() => setActiveTab('CLUBS')}
                        className={clsx("flex-1 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all", activeTab === 'CLUBS' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
                    >
                        Clubs
                    </button>
                </div>

                {/* Leaderboard */}
                {rows.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-10 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">leaderboard</span>
                        <p className="text-sm font-bold text-slate-400 italic">
                            Pas encore de points enregistrés.<br />Les premiers défis validés feront vivre le classement !
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rows.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className={clsx(
                                    "p-4 sm:p-5 rounded-[2rem] border shadow-sm flex items-center gap-3 relative overflow-hidden",
                                    item.isMe ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-200" : "bg-white border-slate-100"
                                )}
                            >
                                {/* Rang */}
                                <div className={clsx(
                                    "size-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-black",
                                    index === 0 ? "bg-yellow-400 text-yellow-900" :
                                        index === 1 ? "bg-slate-200 text-slate-700" :
                                            index === 2 ? "bg-amber-600 text-amber-100" :
                                                "bg-slate-100 text-slate-400"
                                )}>
                                    {index + 1}
                                </div>

                                {/* Avatar */}
                                <div className={clsx(
                                    "size-11 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm",
                                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                                        index === 1 ? "bg-slate-100 text-slate-600" :
                                            index === 2 ? "bg-amber-100 text-amber-700" :
                                                "bg-indigo-50 text-indigo-500"
                                )}>
                                    {initials(item.name)}
                                </div>

                                {/* Nom + sous-titre — bloc qui rétrécit */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase leading-tight truncate">
                                            {item.name}
                                        </h3>
                                        {item.isMe && <span className="shrink-0 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full tracking-widest">VOUS</span>}
                                    </div>
                                    {item.sub && <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5 truncate">{item.sub}</p>}
                                </div>

                                {/* Points */}
                                <div className="text-right shrink-0 pl-1">
                                    <span className={clsx("text-xl sm:text-2xl font-black block leading-none", index < 3 ? "text-indigo-600" : "text-slate-900")}>{item.points}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Points</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <span className="material-symbols-outlined text-4xl mb-4">campaign</span>
                    <h3 className="text-xl font-black uppercase mb-2">Votre score : {myPoints} pts</h3>
                    <p className="text-sm font-medium opacity-80 mb-6 leading-relaxed">Chaque défi validé et chaque quiz de fin de stage rapportent des points à votre club. Continuez à transmettre !</p>
                    <Link href="/classement" className="block w-full h-14 bg-white text-indigo-600 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center">
                        Voir le barème détaillé
                    </Link>
                </div>
            </main>
        </div>
    );
}
