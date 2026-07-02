'use client';

import { useState, useTransition } from 'react';
import { getReportingData, type ReportingData } from '@/actions/reporting-actions';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between mb-3">
                <span className="material-symbols-outlined text-slate-300 text-2xl">{icon}</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

export function ReportingTab({ userRole }: { userRole?: string | null }) {
    const isGlobalAdmin = userRole === 'admin';
    const currentYear = new Date().getFullYear();
    const [annee, setAnnee] = useState(currentYear);
    const [data, setData] = useState<ReportingData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const load = (year: number) => {
        startTransition(async () => {
            const result = await getReportingData(year);
            if (result.error) setError(result.error);
            else { setData(result.data!); setError(null); }
        });
    };

    const handleYearChange = (y: number) => {
        setAnnee(y);
        load(y);
    };

    const exportCSV = () => {
        if (!data) return;
        const rows = [
            ['Club', 'Semaines', 'Stagiaires', 'Moniteurs', 'Défis validés', 'Score quiz moyen'],
            ...data.par_club.map(c => [
                c.club_name, c.nb_stages, c.nb_stagiaires,
                c.nb_moniteurs, c.nb_defis,
                c.score_quiz_moyen != null ? `${c.score_quiz_moyen}%` : 'N/A',
            ]),
        ];
        const csv = rows.map(r => r.join(';')).join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `copun_reporting_${annee}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Graphique barres mensuel simple
    const maxDefis = data ? Math.max(...data.par_mois.map(m => m.nb_defis), 1) : 1;

    return (
        <div className="space-y-8">
            {/* En-tête + sélecteur année */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-lg font-black text-slate-900">Reporting annuel</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {isGlobalAdmin ? 'Données agrégées — tous les clubs' : 'Données de votre club'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        {[currentYear - 1, currentYear].map(y => (
                            <button
                                key={y}
                                onClick={() => handleYearChange(y)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${annee === y ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                    {!data && (
                        <button
                            onClick={() => load(annee)}
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 active:scale-95 transition"
                        >
                            {isPending
                                ? <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                : <span className="material-symbols-outlined text-[18px]">analytics</span>
                            }
                            Générer
                        </button>
                    )}
                    {data && (
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold active:scale-95 transition"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export CSV
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-medium">{error}</div>
            )}

            {isPending && (
                <div className="flex items-center justify-center py-16 text-slate-400">
                    <span className="animate-spin material-symbols-outlined text-3xl mr-3">progress_activity</span>
                    <span className="text-sm font-semibold">Calcul en cours…</span>
                </div>
            )}

            {data && !isPending && (
                <>
                    {/* KPIs globaux */}
                    <section>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                            {isGlobalAdmin ? `Vue nationale — ${annee}` : `Mon club — ${annee}`}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <StatCard icon="flag" label="Semaines réalisées" value={data.nb_stages} />
                            <StatCard icon="group" label="Stagiaires sensibilisés" value={data.nb_stagiaires_total || '—'} sub={data.nb_stagiaires_total === 0 ? 'Champ à renseigner sur chaque semaine' : undefined} />
                            <StatCard icon="person" label="Moniteurs actifs" value={data.nb_moniteurs_actifs} />
                            {isGlobalAdmin && <StatCard icon="anchor" label="Clubs actifs" value={data.nb_clubs_actifs} />}
                            <StatCard icon="eco" label="Défis validés" value={data.nb_defis_valides} />
                            <StatCard
                                icon="quiz"
                                label="Score transmission moyen"
                                value={data.score_quiz_moyen != null ? `${data.score_quiz_moyen}%` : '—'}
                                sub={`${data.nb_quiz_completes} quiz complétés`}
                            />
                        </div>
                    </section>

                    {/* Graphique mensuel défis */}
                    <section>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Défis validés par mois</p>
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-end gap-1.5 h-28">
                                {data.par_mois.map((m, i) => {
                                    const pct = maxDefis > 0 ? (m.nb_defis / maxDefis) * 100 : 0;
                                    return (
                                        <div key={m.mois} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-[9px] font-bold text-slate-500">{m.nb_defis > 0 ? m.nb_defis : ''}</span>
                                            <div
                                                className="w-full rounded-t-lg bg-indigo-500 transition-all"
                                                style={{ height: `${Math.max(pct, m.nb_defis > 0 ? 8 : 2)}%` }}
                                            />
                                            <span className="text-[9px] text-slate-400">{MOIS_LABELS[i]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Par club — visible uniquement pour l'admin général */}
                    {isGlobalAdmin && <section>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Par club</p>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="text-left px-4 py-3">Club</th>
                                        <th className="text-center px-3 py-3">Semaines</th>
                                        <th className="text-center px-3 py-3">Stagiaires</th>
                                        <th className="text-center px-3 py-3">Défis</th>
                                        <th className="text-center px-3 py-3">Quiz</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.par_club.map((c, i) => (
                                        <tr key={c.club_id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                                            <td className="px-4 py-3 font-semibold text-slate-800">{c.club_name}</td>
                                            <td className="px-3 py-3 text-center font-bold text-slate-700">{c.nb_stages}</td>
                                            <td className="px-3 py-3 text-center text-slate-600">{c.nb_stagiaires || '—'}</td>
                                            <td className="px-3 py-3 text-center text-slate-600">{c.nb_defis}</td>
                                            <td className="px-3 py-3 text-center">
                                                {c.score_quiz_moyen != null
                                                    ? <span className={`font-bold ${c.score_quiz_moyen >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{c.score_quiz_moyen}%</span>
                                                    : <span className="text-slate-300">—</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                    {data.par_club.length === 0 && (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Aucune donnée pour {annee}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>}

                    {/* Thématiques les plus pratiquées */}
                    {data.par_thematique.length > 0 && (
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Défis les plus réalisés</p>
                            <div className="space-y-2">
                                {data.par_thematique.slice(0, 5).map((t, i) => {
                                    const max = data.par_thematique[0].nb_validations;
                                    const pct = Math.round((t.nb_validations / max) * 100);
                                    return (
                                        <div key={t.defi_id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3">
                                            <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-slate-700 truncate">{t.defi_id.replace(/_/g, ' ')}</p>
                                                <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-slate-700 shrink-0">{t.nb_validations}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Note Ministère */}
                    <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-indigo-400 mt-0.5">info</span>
                            <div className="text-sm text-indigo-800 space-y-1">
                                <p className="font-bold">Pour le rapport Ministère</p>
                                <p className="text-indigo-600 text-xs leading-relaxed">
                                    Ce tableau de bord agrège automatiquement les données de tous les clubs. Exportez en CSV pour l'intégrer à votre rapport annuel de conformité environnementale.
                                    Le score quiz représente le taux de transmission des connaissances environnementales aux stagiaires.
                                </p>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
