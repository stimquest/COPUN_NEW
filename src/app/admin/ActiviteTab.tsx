'use client';

import { useEffect, useState, useTransition } from 'react';
import { getActiviteData, type ActiviteData, type MoniteurActivite } from '@/actions/activite-actions';

/**
 * Qui se sert de l'app, depuis quand, et à quel rythme.
 *
 * Le tableau de bord n'avait jusqu'ici que « dernière connexion » — une date isolée qui
 * ne distingue pas le moniteur venu tous les jours de celui passé une fois. La colonne qui
 * porte l'information est `jours_actifs` : le nombre de journées où le moniteur a
 * réellement produit quelque chose.
 *
 * Ces journées sont reconstituées depuis les écritures horodatées de l'app, ce qui les
 * rend disponibles sur tout l'historique — y compris l'été de test, antérieur à toute
 * instrumentation. Le volet sessions (durées, écrans) ne se remplit qu'à partir de la mise
 * en service du suivi ; l'encart d'en-tête le dit explicitement pour qu'un zéro de juillet
 * ne soit pas lu comme une absence d'usage.
 */

const PERIODES = [
    { cle: 'tout', label: 'Tout', depuis: null },
    { cle: '90j', label: '90 jours', depuis: 90 },
    { cle: '30j', label: '30 jours', depuis: 30 },
] as const;

const GENRE_LABELS: Record<string, string> = {
    stage_cree: 'Semaine créée',
    stage_cloture: 'Semaine clôturée',
    sujet_prepare: 'Sujet préparé',
    sujet_ecrit: 'Capsule rédigée',
    observation: 'Observation notée',
    defi_valide: 'Défi validé',
    objectif_note: 'Objectif évalué',
    fiche_memo: 'Fiche mémo',
};

function isoDepuis(jours: number | null): string | undefined {
    if (jours === null) return undefined;
    const d = new Date();
    d.setDate(d.getDate() - jours);
    return d.toISOString().slice(0, 10);
}

function dateCourte(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function duree(min: number | null): string {
    if (min == null || min <= 0) return '—';
    if (min < 60) return `${Math.round(min)} min`;
    return `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, '0')}`;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-3xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

/**
 * Courbe des moniteurs actifs par jour.
 *
 * Un compte de têtes, pas d'actions : un total d'actions peut être gonflé par un seul
 * utilisateur très productif, alors que la question posée est « combien de monde s'en
 * sert ». Barres en SVG plutôt qu'une dépendance de graphes — une seule série, pas
 * d'interaction, le besoin ne le justifie pas.
 */
function CourbeJours({ jours }: { jours: ActiviteData['par_jour'] }) {
    if (jours.length === 0) return null;
    const max = Math.max(...jours.map(j => j.nb_moniteurs), 1);
    const largeur = Math.max(jours.length * 6, 300);

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-baseline justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Moniteurs actifs par jour
                </p>
                <p className="text-[10px] text-slate-400">
                    {dateCourte(jours[0].jour)} → {dateCourte(jours[jours.length - 1].jour)}
                </p>
            </div>
            {/* Défilement horizontal propre : la courbe peut couvrir des mois. */}
            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${largeur} 90`} className="h-24" style={{ width: largeur }} role="img"
                     aria-label={`Activité quotidienne, pic à ${max} moniteurs`}>
                    {jours.map((j, i) => {
                        const h = (j.nb_moniteurs / max) * 72;
                        return (
                            <rect
                                key={j.jour}
                                x={i * 6} y={80 - h} width={4} height={Math.max(h, 1)} rx={1.5}
                                className="fill-indigo-500"
                            >
                                <title>{`${j.jour} — ${j.nb_moniteurs} moniteur(s), ${j.nb_actions} action(s)`}</title>
                            </rect>
                        );
                    })}
                </svg>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Pic : {max} moniteurs le même jour</p>
        </div>
    );
}

function LigneMoniteur({ m, suiviActif }: { m: MoniteurActivite; suiviActif: boolean }) {
    const jamais = m.jours_actifs === 0;
    return (
        <div className={`px-4 py-3 border-b border-slate-100 last:border-0 ${jamais ? 'bg-slate-50/60' : ''}`}>
            <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                        {m.full_name || m.email || 'Sans nom'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className={`text-2xl font-black leading-none ${jamais ? 'text-slate-300' : 'text-slate-900'}`}>
                        {m.jours_actifs}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {m.jours_actifs > 1 ? 'jours' : 'jour'}
                    </p>
                </div>
            </div>

            {jamais ? (
                <p className="text-[11px] text-slate-400 mt-1.5">
                    Compte créé le {dateCourte(m.inscrit_le)} — jamais utilisé
                    {m.last_sign_in_at && `, connecté sans rien produire`}
                </p>
            ) : (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-500">
                    <span>{m.total_actions} actions</span>
                    <span>{dateCourte(m.premier_jour)} → {dateCourte(m.dernier_jour)}</span>
                    {m.regularite_pct != null && <span>{m.regularite_pct}% de régularité</span>}
                    {m.jours_actifs_30j > 0 && (
                        <span className="text-emerald-600 font-bold">{m.jours_actifs_30j} j sur 30</span>
                    )}
                    {suiviActif && m.nb_sessions > 0 && (
                        <span className="text-indigo-600">
                            {m.nb_sessions} sessions · {duree(m.duree_moyenne_min)} en moyenne
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * `userRole` n'est pas lu ici : le périmètre visible (global ou limité au club) est
 * déjà tranché côté serveur dans `getActiviteData`, qui masque les agrégats globaux
 * pour un club_admin. Le composant affiche ce qu'il reçoit.
 */
export function ActiviteTab() {
    const [periode, setPeriode] = useState<(typeof PERIODES)[number]['cle']>('tout');
    const [data, setData] = useState<ActiviteData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const charger = (cle: (typeof PERIODES)[number]['cle']) => {
        const p = PERIODES.find(x => x.cle === cle)!;
        startTransition(async () => {
            const r = await getActiviteData(isoDepuis(p.depuis));
            if (r.error) { setError(r.error); setData(null); }
            else { setData(r.data!); setError(null); }
        });
    };

    // Chargé à l'affichage : l'admin vient ici pour voir les chiffres, pas pour cliquer
    // d'abord sur un bouton.
    useEffect(() => { charger('tout'); }, []);

    const exportCSV = () => {
        if (!data) return;
        const rows = [
            ['Moniteur', 'Email', 'Jours actifs', 'Actions', 'Premier jour', 'Dernier jour',
             'Régularité %', 'Jours sur 30', 'Sessions', 'Durée moyenne (min)'],
            ...data.moniteurs.map(m => [
                m.full_name ?? '', m.email ?? '', m.jours_actifs, m.total_actions,
                m.premier_jour ?? '', m.dernier_jour ?? '',
                m.regularite_pct ?? '', m.jours_actifs_30j,
                m.nb_sessions, m.duree_moyenne_min ?? '',
            ]),
        ];
        const csv = rows.map(r => r.join(';')).join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `copun_activite_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (error) {
        return (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm font-semibold">
                {error}
                <p className="text-xs font-normal mt-2 text-red-500">
                    Les migrations d&apos;activité doivent être appliquées dans le SQL Editor Supabase.
                </p>
            </div>
        );
    }

    if (!data) {
        return <p className="text-sm text-slate-400 py-8 text-center">Chargement des statistiques…</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                    {PERIODES.map(p => (
                        <button
                            key={p.cle}
                            onClick={() => { setPeriode(p.cle); charger(p.cle); }}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                periode === p.cle
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-400 hover:bg-slate-100'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={exportCSV}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 hover:bg-slate-50"
                >
                    Export CSV
                </button>
            </div>

            {/* Ce que les chiffres recouvrent, dit une fois en haut : sans cette phrase un
                zéro de session en juillet se lit comme une absence d'usage. */}
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
                <p className="text-xs text-amber-900 leading-relaxed">
                    L&apos;activité est reconstituée depuis les écritures faites dans l&apos;app
                    {data.depuis && <> (données depuis le <strong>{dateCourte(data.depuis)}</strong>)</>}.
                    {data.suivi_sessions_actif
                        ? ' Les durées de session sont mesurées depuis la mise en service du suivi et ne couvrent pas la période de test.'
                        : ' Les connexions n\'ayant jamais été journalisées, les durées de session ne se rempliront qu\'à partir de maintenant.'}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Comptes" value={data.nb_comptes}
                          sub={`${data.nb_jamais_utilise} jamais utilisés`} />
                <StatCard label="Actifs sur 30 j" value={data.nb_actifs_30j}
                          sub={`sur ${data.nb_comptes} comptes`} />
                <StatCard label="Journées d'usage" value={data.total_jours_actifs}
                          sub="tous moniteurs cumulés" />
                <StatCard
                    label="Usage moyen"
                    value={data.nb_comptes > 0
                        ? (data.total_jours_actifs / Math.max(data.nb_comptes - data.nb_jamais_utilise, 1)).toFixed(1)
                        : '0'}
                    sub="jours par moniteur actif"
                />
            </div>

            {data.par_jour.length > 0 && <CourbeJours jours={data.par_jour} />}

            {data.par_genre.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-4 pt-4 pb-2">
                        Nature de l&apos;usage
                    </p>
                    {data.par_genre.map(g => (
                        <div key={g.genre} className="flex items-center gap-3 px-4 py-2 border-t border-slate-50">
                            <span className="flex-1 text-sm text-slate-700">
                                {GENRE_LABELS[g.genre] ?? g.genre}
                            </span>
                            <span className="text-[11px] text-slate-400">{g.nb_moniteurs} mon.</span>
                            <span className="text-sm font-black text-slate-900 w-10 text-right">{g.nb_actions}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-4 pt-4 pb-2">
                    Par moniteur
                </p>
                {data.moniteurs.map(m => (
                    <LigneMoniteur key={m.user_id} m={m} suiviActif={data.suivi_sessions_actif} />
                ))}
            </div>

            {data.pages.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-4 pt-4 pb-2">
                        Écrans les plus consultés
                    </p>
                    {data.pages.map(p => (
                        <div key={p.chemin} className="flex items-center gap-3 px-4 py-2 border-t border-slate-50">
                            <span className="flex-1 text-xs font-mono text-slate-600 truncate">{p.chemin}</span>
                            <span className="text-[11px] text-slate-400">{p.nb_moniteurs} mon.</span>
                            <span className="text-sm font-black text-slate-900 w-12 text-right">{p.nb_vues}</span>
                        </div>
                    ))}
                </div>
            )}

            {isPending && <p className="text-center text-xs text-slate-400 py-2">Mise à jour…</p>}
        </div>
    );
}
