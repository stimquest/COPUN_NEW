'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useState } from 'react';

// Mock Data
const CLUBS = [
    { id: 1, name: 'YC Carnac', points: 1450, rank: 1, logo: '⛵' },
    { id: 2, name: 'SNO Nantes', points: 1320, rank: 2, logo: '🌊' },
    { id: 3, name: 'SR Rochelaises', points: 1180, rank: 3, logo: '⚓' },
    { id: 4, name: 'CV Marseillan', points: 950, rank: 4, logo: '🌞' },
    { id: 5, name: 'Pole Nautique Hague', points: 820, rank: 5, logo: '🦀' },
];

const INSTRUCTORS = [
    { id: 1, name: 'Julie M.', club: 'YC Carnac', points: 450, rank: 1, avatar: '👩‍✈️' },
    { id: 2, name: 'Thomas B.', club: 'SNO Nantes', points: 410, rank: 2, avatar: '👨‍✈️' },
    { id: 3, name: 'Sarah L.', club: 'SR Rochelaises', points: 380, rank: 3, avatar: '🦸‍♀️' },
    { id: 4, name: 'Marc D.', club: 'YC Carnac', points: 320, rank: 4, avatar: '🧜‍♂️' },
    { id: 5, name: 'Elise K.', club: 'CV Marseillan', points: 290, rank: 5, avatar: '🏄‍♀️' },
];

export default function StatsPage() {
    const [activeTab, setActiveTab] = useState<'CLUBS' | 'MONITEURS'>('CLUBS');

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <header className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase mb-2">Impact Environnemental</h1>
                    <h2 className="text-4xl font-black uppercase leading-none">Le Podium<br /><span className="text-slate-500">Du Changement</span></h2>
                </div>
            </header>

            {/* Content using negative margin to overlap header */}
            <main className="px-6 -mt-12 relative z-20 space-y-8">

                {/* Switcher */}
                <div className="bg-white p-1.5 rounded-2xl shadow-xl flex border border-slate-100">
                    <button
                        onClick={() => setActiveTab('CLUBS')}
                        className={clsx("flex-1 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all", activeTab === 'CLUBS' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
                    >
                        Clubs
                    </button>
                    <button
                        onClick={() => setActiveTab('MONITEURS')}
                        className={clsx("flex-1 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all", activeTab === 'MONITEURS' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
                    >
                        Moniteurs
                    </button>
                </div>

                {/* Leaderboard List */}
                <div className="space-y-4">
                    {(activeTab === 'CLUBS' ? CLUBS : INSTRUCTORS).map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 relative overflow-hidden group"
                        >
                            {/* Rank Badge */}
                            <div className={clsx(
                                "absolute -left-3 -top-3 size-16 rounded-3xl rotate-12 flex items-end justify-end p-3 text-xl font-black",
                                index === 0 ? "bg-yellow-400 text-yellow-900" :
                                    index === 1 ? "bg-slate-300 text-slate-800" :
                                        index === 2 ? "bg-amber-600 text-amber-100" :
                                            "bg-slate-100 text-slate-400"
                            )}>
                                <span className="-rotate-12">#{item.rank}</span>
                            </div>

                            <div className="ml-8 flex-1">
                                <span className="text-3xl mb-1 block">{'logo' in item ? item.logo : item.avatar}</span>
                                <h3 className="text-lg font-black text-slate-900 uppercase leading-none">{item.name}</h3>
                                {'club' in item && <p className="text-xs font-bold text-slate-400 uppercase mt-1">{item.club}</p>}
                            </div>

                            <div className="text-right">
                                <span className={clsx("text-2xl font-black block leading-none", index < 3 ? "text-indigo-600" : "text-slate-900")}>{item.points}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Points Impact</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action / Info */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <span className="material-symbols-outlined text-4xl mb-4">campaign</span>
                    <h3 className="text-xl font-black uppercase mb-2">Agissez !</h3>
                    <p className="text-sm font-medium opacity-80 mb-6 leading-relaxed">Chaque session validée rapporte des points à votre club. Partagez votre savoir pour grimper au classement.</p>
                    <button className="w-full h-14 bg-white text-indigo-600 rounded-2xl font-black text-xs tracking-widest uppercase">Voir le barème</button>
                </div>
            </main>
        </div>
    );
}
