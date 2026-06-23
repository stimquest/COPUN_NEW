'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StageDashboardCard from './StageDashboardCard';
import type { DashboardStage } from './StageDashboardCard';
import { getPeriodForMonth } from '@/data/seasonal-context';

const SEASON_STYLES: Record<string, { gradient: string; icon: string; accent: string }> = {
    hiver_marin:         { gradient: 'from-slate-700 to-slate-900', icon: 'storm',        accent: 'text-slate-300' },
    eveil_littoral:      { gradient: 'from-emerald-600 to-teal-800', icon: 'eco',          accent: 'text-emerald-200' },
    printemps_actif:     { gradient: 'from-green-500 to-emerald-700', icon: 'local_florist', accent: 'text-green-200' },
    haute_saison:        { gradient: 'from-amber-500 to-orange-600', icon: 'wb_sunny',     accent: 'text-amber-100' },
    transition_automnale:{ gradient: 'from-orange-600 to-red-800',   icon: 'filter_drama',  accent: 'text-orange-200' },
    entree_hiver:        { gradient: 'from-blue-700 to-slate-800',   icon: 'water',         accent: 'text-blue-200' },
};

interface Props {
    stages: DashboardStage[];
    profile: { full_name?: string; email?: string; avatar_url?: string; role?: string } | null;
    stats: { totalValidations?: number; createdContent?: number } | null;
    initials: string;
}

const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 18 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const MONTHS_FR: Record<string, number> = {
    janvier:1, février:2, mars:3, avril:4, mai:5, juin:6,
    juillet:7, août:8, septembre:9, octobre:10, novembre:11, décembre:12,
};

function isStageArchived(dates: string, now: Date): boolean {
    // Reconstruit la date de fin du stage à partir du texte (ex: "8 juin - 19 juin 2026")
    const lower = dates.toLowerCase();

    // Capture toutes les occurrences "<jour> <mois>" dans l'ordre
    const monthNames = Object.keys(MONTHS_FR).join('|');
    const re = new RegExp(`(\\d{1,2})\\s*(${monthNames})`, 'g');
    const matches = [...lower.matchAll(re)];
    if (matches.length === 0) return false;

    // On prend la dernière occurrence = date de fin
    const last = matches[matches.length - 1];
    const endDay = parseInt(last[1]);
    const endMonth = MONTHS_FR[last[2]];

    // Année : explicite dans le texte, sinon année courante
    const yearMatch = lower.match(/20\d{2}/g);
    const endYear = yearMatch ? parseInt(yearMatch[yearMatch.length - 1]) : now.getFullYear();

    // Date de fin à 23:59 pour que le dernier jour reste "en cours"
    const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);
    return endDate.getTime() < now.getTime();
}

export default function HomeDashboard({ stages, profile, stats, initials }: Props) {
    const router = useRouter();
    const now = new Date();
    const period = getPeriodForMonth(now.getMonth() + 1);
    const seasonStyle = SEASON_STYLES[period.id] ?? SEASON_STYLES['haute_saison'];

    const hour = now.getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const firstName = profile?.full_name?.split(' ')[0] ?? 'Moniteur';

    const activeStages   = stages.filter(s => !isStageArchived(s.dates, now)).length;
    const archivedStages = stages.filter(s => isStageArchived(s.dates, now));
    const currentStages  = stages.filter(s => !isStageArchived(s.dates, now));
    const totalDefis     = stats?.totalValidations ?? 0;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-36">

            {/* ── Hero header saisonnier ── */}
            <header className={`relative bg-linear-to-br ${seasonStyle.gradient} overflow-hidden`}>
                {/* Grain texture overlay */}
                <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

                {/* Top bar */}
                <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-2">
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-xl ${seasonStyle.accent}`}>sailing</span>
                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">COPUN</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/about" className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${seasonStyle.accent} hover:text-white transition-colors`}>
                            <span className="material-symbols-outlined text-sm">auto_stories</span>
                            La méthode
                        </Link>
                        <Link href="/profil">
                            <div className="size-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm overflow-hidden hover:bg-white/30 transition-colors">
                                {profile?.avatar_url
                                    ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    : initials
                                }
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 px-5 pt-4 pb-6"
                >
                    <p className="text-white/60 text-sm font-semibold mb-0.5">{greeting},</p>
                    <h1 className="text-3xl font-black text-white italic tracking-tight leading-tight mb-3">
                        {firstName}.
                    </h1>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${seasonStyle.accent}`}>
                        <span className="material-symbols-outlined text-sm">{seasonStyle.icon}</span>
                        {period.label} — {period.phenomena[0]}
                    </div>
                </motion.div>

                {/* Stats rapides */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="relative z-10 mx-4 mb-0 grid grid-cols-3 gap-2 pb-8"
                >
                    {[
                        { label: 'Stages actifs',   value: activeStages,        icon: 'flag' },
                        { label: 'Défis validés',   value: totalDefis,           icon: 'workspace_premium' },
                        { label: 'Total stages',    value: stages.length,        icon: 'layers' },
                    ].map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, delay: 0.2 + i * 0.07 }}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-3 py-3 flex flex-col items-center text-center"
                        >
                            <span className="material-symbols-outlined text-white/70 text-base mb-1">{s.icon}</span>
                            <span className="text-2xl font-black text-white leading-none">{s.value}</span>
                            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">{s.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Wave bottom */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
                        <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40Z" fill="#f8fafc"/>
                    </svg>
                </div>
            </header>

            {/* ── Main content ── */}
            <main className="flex-1 px-5 pt-4 space-y-8 max-w-5xl mx-auto w-full">

                {/* Stages actifs */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mes Stages</h2>
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                            {currentStages.length} actif{currentStages.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="grid gap-5 md:grid-cols-2"
                    >
                        {currentStages.length === 0 && (
                            <motion.div variants={fadeUp} className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center col-span-full">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">sailing</span>
                                <p className="text-sm font-bold text-slate-400 italic">Aucun stage en cours. Prépare-en un !</p>
                            </motion.div>
                        )}

                        {currentStages.map((stage) => (
                            <motion.div key={stage.id} variants={fadeUp}>
                                <StageDashboardCard stage={stage} />
                            </motion.div>
                        ))}

                        {/* Nouveau stage */}
                        <motion.div variants={fadeUp}>
                            <Link
                                href="/stages/new"
                                className="border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center gap-3 opacity-60 hover:opacity-100 hover:border-indigo-300 transition-all cursor-pointer group h-full min-h-35"
                            >
                                <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-2xl">add</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Nouveau stage</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Prépare sessions et contenus</p>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Archives */}
                {archivedStages.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">archive</span>
                                Archives
                            </h2>
                            <span className="text-[10px] font-black text-slate-400 px-2 py-0.5 rounded-full border border-slate-200">
                                {archivedStages.length}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {archivedStages.map(stage => (
                                <StageDashboardCard key={stage.id} stage={stage} compact />
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Bloc saison contextuel */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`bg-linear-to-br ${seasonStyle.gradient} rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl`}
                >
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-[100px]">{seasonStyle.icon}</span>
                    </div>
                    <div className="relative z-10">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${seasonStyle.accent}`}>Contexte saisonnier</p>
                        <h3 className="text-lg font-black italic mb-1">{period.label}</h3>
                        <p className="text-sm text-white/70 leading-relaxed mb-4 max-w-sm">{period.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {period.phenomena.slice(0, 3).map(p => (
                                <span key={p} className="px-3 py-1 bg-white/15 border border-white/20 rounded-full text-[11px] font-semibold">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.section>

            </main>
        </div>
    );
}
