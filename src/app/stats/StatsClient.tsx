'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';
import type { StageObjectiveDashboardStats } from '@/services/data-service';
import type { TopicTracking } from '@/types';

export type MonitorRow = { monitor_id: string; full_name: string; club_name: string | null; total_points: number };
export type ClubRow = { club_id: string; club_name: string; total_points: number };

interface Props {
    monitors: MonitorRow[];
    clubs: ClubRow[];
    currentUserId: string | null;
    myPoints: number;
    objectiveDashboard: StageObjectiveDashboardStats;
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function MetricCard({ label, value, helper, className }: { label: string; value: string; helper: string; className: string }) {
    return (
        <div className={clsx('rounded-3xl p-4 ring-1 ring-black/5', className)}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
            <p className="mt-1 text-3xl font-black leading-none">{value}</p>
            <p className="mt-2 text-xs font-semibold opacity-75">{helper}</p>
        </div>
    );
}

function topicBadge(topic: TopicTracking) {
    const stageLabel = `${topic.occurrences} ${topic.occurrences > 1 ? 'stages' : 'stage'}`;
    if (topic.occurrences === 0) return stageLabel;
    if (topic.category === 'improving') return `${stageLabel} ↑`;
    if (topic.category === 'fragile' || topic.lastScore <= 2) return `${stageLabel} · fragile`;
    if (topic.lastScore >= 4) return `${stageLabel} · bien`;
    return `${stageLabel} · à suivre`;
}

function TopicBlock({ title, color, items }: { title: string; color: string; items: TopicTracking[] }) {
    if (items.length === 0) return null;
    return (
        <div className="rounded-2xl bg-white/80 p-3 border border-white">
            <p className={clsx('text-[10px] font-black uppercase tracking-widest mb-2', color)}>{title}</p>
            <ul className="space-y-1">
                {items.map(t => (
                    <li key={t.tag} className="text-xs font-bold text-slate-700 flex justify-between items-center">
                        <span>{t.tag}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                            {topicBadge(t)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function StatsClient({ monitors, clubs, currentUserId, myPoints, objectiveDashboard }: Props) {
    const [activeTab, setActiveTab] = useState<'CLUBS' | 'MONITEURS'>('MONITEURS');
    const hasObjectiveData = objectiveDashboard.summary.totalObjectives > 0;

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

    const allTopics = Object.values(objectiveDashboard.topicTracking).flat();
    const workedTopics = allTopics
        .filter(topic => topic.occurrences > 0)
        .sort((a, b) => b.occurrences - a.occurrences || b.lastScore - a.lastScore || a.tag.localeCompare(b.tag));
    const topicsToStabilize = objectiveDashboard.topicTracking.dormant
        .filter(topic => topic.occurrences >= 2)
        .sort((a, b) => b.occurrences - a.occurrences || a.lastScore - b.lastScore);

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

                {/* Carnets de stage */}
                <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white via-amber-50 to-sky-50 p-5 shadow-xl shadow-slate-200/70">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Carnets de stage</p>
                            <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Progression pédagogique</h3>
                        </div>
                        <p className="text-xs font-bold text-slate-500">
                            {objectiveDashboard.stagesCount} stage{objectiveDashboard.stagesCount > 1 ? 's' : ''} clôturé{objectiveDashboard.stagesCount > 1 ? 's' : ''}
                        </p>
                    </div>

                    {hasObjectiveData ? (
                        <div className="mt-5 space-y-5">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCard
                                    label="Réalisation"
                                    value={`${objectiveDashboard.summary.completionRate}%`}
                                    helper="Objectifs faits ou partiellement menés"
                                    className="bg-emerald-100 text-emerald-950"
                                />
                                <MetricCard
                                    label="Score pédagogique"
                                    value={`${objectiveDashboard.summary.pedagogicalScore}%`}
                                    helper="Réalisation × effet observé"
                                    className="bg-violet-100 text-violet-950"
                                />
                                <MetricCard
                                    label="Bien transmis"
                                    value={`${objectiveDashboard.summary.wellTransmittedCount}`}
                                    helper="Objectifs faits et bien intégrés par le groupe"
                                    className="bg-sky-100 text-sky-950"
                                />
                                <MetricCard
                                    label="Sujets travaillés"
                                    value={`${workedTopics.length}`}
                                    helper="Sujets abordés au moins une fois"
                                    className="bg-amber-100 text-amber-950"
                                />
                            </div>

                            <div className="rounded-3xl border border-white bg-white/80 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suivi des sujets</p>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <TopicBlock title="Sujets travaillés" color="text-slate-700" items={workedTopics.slice(0, 8)} />
                                    <TopicBlock title="Bien installés" color="text-emerald-500" items={objectiveDashboard.topicTracking.established} />
                                    <TopicBlock title="Bien amorcés" color="text-violet-500" items={objectiveDashboard.topicTracking.emerging} />
                                    <TopicBlock title="Reprises en progrès" color="text-sky-500" items={objectiveDashboard.topicTracking.improving} />
                                    <TopicBlock title="À stabiliser" color="text-orange-500" items={topicsToStabilize.slice(0, 5)} />
                                    <TopicBlock title="À reprendre autrement" color="text-amber-500" items={objectiveDashboard.topicTracking.fragile} />
                                    <TopicBlock title="Angles à ouvrir" color="text-slate-400" items={objectiveDashboard.topicTracking.dormant.filter(t => t.occurrences === 0).slice(0, 5)} />
                                </div>
                            </div>

                            {objectiveDashboard.dimensions.length > 0 && (
                                <div className="rounded-3xl border border-white bg-white/80 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Par dimension</p>
                                    <div className="mt-3 space-y-3">
                                        {objectiveDashboard.dimensions.map(dimension => (
                                            <div key={dimension.label}>
                                                <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
                                                    <span className="truncate">{dimension.label}</span>
                                                    <span>{dimension.summary.pedagogicalScore}%</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${dimension.summary.pedagogicalScore}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {objectiveDashboard.recentStages.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Derniers carnets</p>
                                    {objectiveDashboard.recentStages.map(stage => (
                                        <Link key={stage.id} href={`/stages/${stage.id}/bilan`} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-white transition hover:bg-white">
                                            <span className="min-w-0 truncate">{stage.title}</span>
                                            <span className="shrink-0 text-slate-950">{stage.summary.pedagogicalScore}%</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-3xl border border-dashed border-orange-200 bg-white/70 p-5 text-sm font-semibold text-slate-600">
                            Les premiers carnets clôturés alimenteront ici le suivi stage après stage.
                        </div>
                    )}
                </section>

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
                    <Link href="/classement" className="w-full h-14 bg-white text-indigo-600 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center">
                        Voir le barème détaillé
                    </Link>
                </div>
            </main>
        </div>
    );
}
