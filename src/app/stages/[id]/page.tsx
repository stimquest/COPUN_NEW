import { getStageById, getSessionsForStage, getStageCockpitStats } from '@/services/data-service';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteStageButton } from '@/components/DeleteStageButton';

// Statut calculé depuis les dates (mêmes règles que le dashboard)
const MONTHS_FR: Record<string, number> = {
    janvier:1, février:2, mars:3, avril:4, mai:5, juin:6,
    juillet:7, août:8, septembre:9, octobre:10, novembre:11, décembre:12,
};
function getStageStatus(dates: string, hasSessions: boolean): 'prep' | 'cours' | 'termine' {
    if (!hasSessions) return 'prep';
    const lower = dates.toLowerCase();
    const re = new RegExp(`(\\d{1,2})\\s*(${Object.keys(MONTHS_FR).join('|')})`, 'g');
    const matches = [...lower.matchAll(re)];
    if (matches.length === 0) return 'cours';
    const last = matches[matches.length - 1];
    const yearMatch = lower.match(/20\d{2}/g);
    const year = yearMatch ? parseInt(yearMatch[yearMatch.length - 1]) : new Date().getFullYear();
    const end = new Date(year, MONTHS_FR[last[2]] - 1, parseInt(last[1]), 23, 59, 59);
    return end.getTime() < Date.now() ? 'termine' : 'cours';
}

export default async function StageCockpitPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const stage = await getStageById(id);
    const sessions = await getSessionsForStage(id);

    if (!stage) return notFound();

    const stats = await getStageCockpitStats(id);
    const firstSessionId = sessions && sessions.length > 0 ? sessions[0].id : null;

    const status = getStageStatus(stage.dates, (sessions?.length ?? 0) > 0);
    const statusMeta = {
        prep:    { label: 'En préparation', dot: 'bg-amber-500',   cls: 'bg-amber-50 text-amber-600 border-amber-200' },
        cours:   { label: 'En cours',       dot: 'bg-emerald-500', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
        termine: { label: 'Terminé',        dot: 'bg-slate-400',   cls: 'bg-slate-100 text-slate-500 border-slate-200' },
    }[status];

    // ── Données dashboard ──
    const prevu = stats?.contentCount ?? 0;
    const place = stats?.placedCount ?? 0;
    const fait = stats?.validatedCount ?? 0;
    const pct = (n: number) => (prevu > 0 ? Math.round((n / prevu) * 100) : 0);
    const aPlacer = prevu - place;
    const defisTotal = stats?.defisTotal ?? 0;
    const defisDone = stats?.defisDone ?? 0;

    // Couleur de barre : verte si complet, sinon couleur d'étape
    const COMPLETE_BAR = 'bg-emerald-400';

    // ── Les 4 étapes du parcours, chacune = bouton d'action + suivi dashboard ──
    type Metric = { current: number; total: number; barPct?: number; barColor?: string; barOverlayPct?: number };
    const steps: {
        href: string; n: number; title: string; desc: string; icon: string;
        cls: { icon: string; accent: string; hover: string };
        done: boolean;
        metric: Metric;
        metricLabel: string;
        note?: { text: string; tone: 'todo' | 'warn' | 'ok' };
    }[] = [
        {
            href: `/stages/${id}/program`, n: 1, title: 'Les Objectifs',
            desc: 'Choisir les fiches pédago de la semaine',
            icon: 'track_changes',
            cls: { icon: 'bg-sky-100 text-sky-600', accent: 'text-sky-600', hover: 'hover:border-sky-300' },
            // Terminé = des fiches sont choisies (c'est l'unique critère de cette étape)
            done: prevu > 0,
            metric: { current: prevu, total: prevu },
            metricLabel: prevu > 0 ? 'fiches choisies' : 'aucune fiche',
            note: prevu === 0 ? { text: 'À démarrer', tone: 'todo' } : undefined,
        },
        {
            href: `/stages/${id}/sessions`, n: 2, title: 'Le Planning',
            desc: 'Placer les fiches dans les séances, puis les réaliser',
            icon: 'flag',
            cls: { icon: 'bg-amber-100 text-amber-600', accent: 'text-amber-600', hover: 'hover:border-amber-300' },
            // Terminé seulement si tout est placé ET réalisé sur le terrain
            done: prevu > 0 && place >= prevu && fait >= prevu,
            // Barre : placé (fond) + réalisé (avant-plan vert)
            metric: {
                current: fait, total: prevu,
                barPct: pct(place),
                barColor: place >= prevu ? 'bg-emerald-200' : 'bg-amber-300',
                barOverlayPct: pct(fait),
            },
            metricLabel: 'fiches réalisées',
            note: prevu === 0
                ? { text: 'En attente des objectifs', tone: 'todo' }
                : aPlacer > 0
                    ? { text: `${aPlacer} à placer`, tone: 'warn' }
                    : fait < prevu
                        ? { text: `${place} placées · ${fait} faites`, tone: 'ok' }
                        : { text: 'Tout réalisé', tone: 'ok' },
        },
        {
            href: `/stages/${id}/defis`, n: 3, title: 'Les Défis',
            desc: 'Choisir les défis terrain éco',
            icon: 'eco',
            cls: { icon: 'bg-emerald-100 text-emerald-600', accent: 'text-emerald-600', hover: 'hover:border-emerald-300' },
            done: defisTotal > 0 && defisDone >= defisTotal,
            metric: {
                current: defisDone, total: defisTotal,
                barPct: defisTotal > 0 ? Math.round((defisDone / defisTotal) * 100) : 0,
                barColor: defisTotal > 0 && defisDone >= defisTotal ? COMPLETE_BAR : 'bg-emerald-300',
            },
            metricLabel: 'défis validés',
            note: defisTotal === 0
                ? { text: 'Aucun défi choisi', tone: 'todo' }
                : defisDone >= defisTotal
                    ? { text: 'Tous validés', tone: 'ok' }
                    : undefined,
        },
        {
            href: `/stages/${id}/quiz`, n: 4, title: 'Le Quiz',
            desc: 'Valider la transmission, gagner des points',
            icon: 'quiz',
            cls: { icon: 'bg-violet-100 text-violet-600', accent: 'text-violet-600', hover: 'hover:border-violet-300' },
            done: !!stats?.quizDone,
            metric: stats?.quizDone
                ? { current: stats.quizScore ?? 0, total: stats.quizTotal ?? 0 }
                : { current: 0, total: 0 },
            metricLabel: stats?.quizDone ? 'bonnes réponses' : 'pas encore lancé',
            note: stats?.quizDone
                ? { text: `+${stats.quizPoints} pts`, tone: 'ok' }
                : { text: 'À lancer', tone: 'warn' },
        },
    ];

    const noteCls = {
        todo: 'bg-slate-100 text-slate-500',
        warn: 'bg-amber-100 text-amber-700',
        ok:   'bg-emerald-100 text-emerald-700',
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">

            {/* ── Header minimal : navigation seulement ── */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-3 flex items-center gap-3">
                    <Link href="/stages" className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all shrink-0">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <p className="flex-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Pilotage du stage</p>
                    <DeleteStageButton stageId={stage.id} />
                </div>
            </header>

            <main className="flex-1 px-4 sm:px-6 py-6 pb-36 max-w-3xl mx-auto w-full">

                {/* Titre du stage mis en avant + statut */}
                <div className="mb-5">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 italic tracking-tight leading-none min-w-0">{stage.title}</h1>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border shrink-0 ${statusMeta.cls}`}>
                            <span className={`size-1.5 rounded-full ${statusMeta.dot} ${status === 'cours' ? 'animate-pulse' : ''}`} />
                            {statusMeta.label}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-sm font-medium">
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">sailing</span>{stage.activity}</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">calendar_month</span>{stage.dates}</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">school</span>{stage.level}</span>
                    </div>
                </div>

                <Link
                    href={firstSessionId ? `/session/${firstSessionId}` : `/stages/${id}/sessions`}
                    className="flex items-center justify-between bg-[#1f2249] hover:bg-indigo-900 text-white active:scale-[0.99] transition-all px-4 py-3.5 rounded-2xl group mb-8"
                >
                    <div className="flex items-center gap-3">
                        <span className="size-9 rounded-xl bg-indigo-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">play_arrow</span>
                        </span>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300 leading-none mb-0.5">{firstSessionId ? 'En direct' : 'À organiser'}</p>
                            <p className="text-sm font-bold leading-none">{firstSessionId ? 'Lancer la séance du jour' : 'Planifier les séances'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {firstSessionId && <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-400" />}
                        <span className="material-symbols-outlined text-indigo-300 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                </Link>

                {/* Titre section */}
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Le déroulé du stage</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Les 4 étapes : bouton d'action avec suivi dashboard intégré */}
                <div className="space-y-3">
                    {steps.map(step => (
                        <Link
                            key={step.n}
                            href={step.href}
                            className={`group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 ${step.cls.hover} shadow-sm hover:shadow-md transition-all active:scale-[0.99] p-4 sm:p-5`}
                        >
                            {/* Icône d'étape */}
                            <div className="shrink-0 relative">
                                <span className={`size-14 rounded-2xl ${step.cls.icon} flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-[28px]">{step.icon}</span>
                                </span>
                                {step.done && (
                                    <span className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white">
                                        <span className="material-symbols-outlined text-[15px]">check</span>
                                    </span>
                                )}
                            </div>

                            {/* Texte */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Étape {step.n}</p>
                                <h4 className="text-lg font-black text-slate-900 leading-tight">{step.title}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-snug mt-0.5">{step.desc}</p>
                            </div>

                            {/* Bloc dashboard : grand chiffre + barre + note */}
                            <div className="shrink-0 w-28 sm:w-32 text-right">
                                {step.metric.total > 0 || step.metric.current > 0 ? (
                                    <p className="text-2xl font-black text-slate-900 leading-none">
                                        {step.metric.current}
                                        {step.metric.total > 0 && <span className="text-base text-slate-300">/{step.metric.total}</span>}
                                    </p>
                                ) : (
                                    <p className="text-2xl font-black text-slate-200 leading-none">—</p>
                                )}
                                <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">{step.metricLabel}</p>

                                {/* Barre de progression si pertinent (+ couche "réalisé" superposée) */}
                                {step.metric.barPct !== undefined && step.metric.total > 0 && (
                                    <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                        <div className={`absolute inset-y-0 left-0 ${step.metric.barColor} rounded-full transition-all duration-700`} style={{ width: `${step.metric.barPct}%` }} />
                                        {step.metric.barOverlayPct !== undefined && (
                                            <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${step.metric.barOverlayPct}%` }} />
                                        )}
                                    </div>
                                )}

                                {/* Note d'état */}
                                {step.note && (
                                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${noteCls[step.note.tone]}`}>
                                        {step.note.text}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

            </main>
        </div>
    );
}
