import { unstable_noStore as noStore } from 'next/cache';
import { getStages, getPedagogicalPool } from '@/services/data-service';
import { getProfile } from '@/actions/user-actions';
import { getObservationsForStage } from '@/actions/observation-actions';
import { getStageExploits, getClubObservationTargets } from '@/actions/defi-actions';
import { getUserContent } from '@/actions/content-actions';
import { getStageQuiz, getMyTotalPoints } from '@/actions/quiz-actions';
import { getStagePreparations } from '@/actions/preparation-actions';
import { getPeriodForMonth } from '@/data/seasonal-context';
import { pickCurrentStage } from '@/lib/stage-dates';
import { WeekDashboardClient } from './WeekDashboardClient';
import { DeleteStageButton } from '@/components/DeleteStageButton';
import Link from 'next/link';
import { PedagogicalContent } from '@/types';

const SEASON_STYLES: Record<string, { gradient: string; icon: string }> = {
    hiver_marin:          { gradient: 'from-slate-700 to-slate-900',    icon: 'storm' },
    eveil_littoral:       { gradient: 'from-emerald-600 to-teal-800',   icon: 'eco' },
    printemps_actif:      { gradient: 'from-green-500 to-emerald-700',  icon: 'local_florist' },
    haute_saison:         { gradient: 'from-amber-500 to-orange-600',   icon: 'wb_sunny' },
    transition_automnale: { gradient: 'from-orange-600 to-red-800',     icon: 'filter_drama' },
    entree_hiver:         { gradient: 'from-blue-700 to-slate-800',     icon: 'water' },
};

export default async function StagesPage() {
    noStore();
    const now = new Date();
    const month = now.getMonth() + 1;
    const hour = now.getHours();
    const period = getPeriodForMonth(month);
    const seasonStyle = SEASON_STYLES[period.id] ?? SEASON_STYLES['haute_saison'];
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    const [profile, stages] = await Promise.all([
        getProfile(),
        getStages(),
    ]);

    const firstName = profile?.full_name?.split(' ')[0] ?? 'Moniteur';

    // Semaine active = uniquement celle dont l'intervalle de dates couvre exactement
    // aujourd'hui — jamais la plus proche, pour ne pas afficher une semaine passée ou
    // préparée à l'avance à la place de la semaine en cours.
    const openStages = stages.filter(s => !s.closed_at);
    const activeStage = pickCurrentStage(openStages, now);
    const upcomingStages = openStages.filter(s => s.id !== activeStage?.id);
    const archivedStages = stages.filter(s => !!s.closed_at);
    const hasOpenNonActiveStages = upcomingStages.length > 0;

    // Écran vide — aucun stage
    if (stages.length === 0) {
        return (
            <div className={`flex flex-col min-h-screen bg-linear-to-br ${seasonStyle.gradient}`}>
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
                    <div>
                        <p className="text-white/60 text-sm font-semibold">{greeting},</p>
                        <h1 className="text-4xl font-black text-white italic mt-1">{firstName}.</h1>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-xs w-full">
                        <span className="material-symbols-outlined text-4xl text-white/60 block mb-3">sailing</span>
                        <p className="text-white font-bold mb-1">Aucune semaine en cours</p>
                        <p className="text-white/50 text-sm mb-5">Créez votre première semaine pour commencer.</p>
                        <Link
                            href="/stages/new"
                            className="w-full h-12 bg-white text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Nouvelle semaine
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Aucune semaine ne couvre exactement aujourd'hui — afficher l'historique/les semaines
    // à venir + bouton nouvelle semaine, sans faire croire qu'une semaine est en cours.
    if (!activeStage) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <header className={`bg-linear-to-br ${seasonStyle.gradient} px-5 pt-12 pb-8`}>
                    <p className="text-white/60 text-sm font-semibold">{greeting},</p>
                    <h1 className="text-3xl font-black text-white italic mt-0.5">{firstName}.</h1>
                    <p className="text-white/50 text-sm mt-2">
                        {hasOpenNonActiveStages
                            ? "Aucune semaine prévue à la date d'aujourd'hui."
                            : 'Toutes vos semaines sont archivées.'}
                    </p>
                </header>
                <main className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
                    <Link
                        href="/stages/new"
                        className="flex items-center justify-between bg-slate-900 text-white rounded-2xl px-4 py-4 hover:bg-slate-800 transition active:scale-95"
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Nouvelle semaine</p>
                            <p className="text-sm font-bold">Démarrer une nouvelle semaine</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-white/60">add_circle</span>
                    </Link>

                    {upcomingStages.length > 0 && (
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Semaines prévues</p>
                            <div className="space-y-2">
                                {upcomingStages.map(s => {
                                    const objectiveCount = s.selected_content?.length ?? 0;
                                    return (
                                        <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                            <div className="flex items-center gap-3 px-4 py-3">
                                                <Link href={`/stages/${s.id}/program`} className="flex items-center gap-3 flex-1 min-w-0 active:scale-95 transition">
                                                    <span className="material-symbols-outlined text-slate-300 text-xl shrink-0">event</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-700 truncate">{s.title}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {s.dates}
                                                            {objectiveCount > 0 && (
                                                                <span className="text-slate-300"> · {objectiveCount} objectif{objectiveCount > 1 ? 's' : ''} sélectionné{objectiveCount > 1 ? 's' : ''}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </Link>
                                                <DeleteStageButton stageId={s.id} size="sm" />
                                            </div>

                                            {/* Une semaine préparée à l'avance restait inaccessible jusqu'à son
                                                premier jour — or c'est justement avant qu'on prépare son discours. */}
                                            {objectiveCount > 0 && (
                                                <Link
                                                    href={`/stages/${s.id}/preparer`}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 bg-violet-50 border-t border-violet-100 active:scale-[0.98] transition"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] text-violet-600 shrink-0">psychology</span>
                                                    <span className="text-xs font-black text-violet-900 flex-1">Préparer le fil de ma semaine</span>
                                                    <span className="material-symbols-outlined text-violet-300 text-base shrink-0">arrow_forward</span>
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {archivedStages.length > 0 && (
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Semaines archivées</p>
                            <div className="space-y-2">
                                {archivedStages.map(s => (
                                    <Link key={s.id} href={`/stages/${s.id}/bilan`} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition active:scale-95">
                                        <span className="material-symbols-outlined text-slate-300 text-xl shrink-0">archive</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-700 truncate">{s.title}</p>
                                            <p className="text-xs text-slate-400">{s.dates}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 text-base shrink-0">chevron_right</span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        );
    }

    // Stage actif — tableau de bord principal
    const [copunPool, observations, preparations, assignedExploits, clubObservationTargets, sportFiches, quizData, totalPoints] = await Promise.all([
        getPedagogicalPool(),
        getObservationsForStage(activeStage.id),
        getStagePreparations(activeStage.id),
        getStageExploits(activeStage.id),
        getClubObservationTargets(),
        getUserContent(),
        getStageQuiz(activeStage.id),
        getMyTotalPoints(),
    ]);
    const selectedIds: string[] = activeStage.selected_content ?? [];
    const selectedContent = selectedIds
        .map((id: string) => copunPool.find((c: PedagogicalContent) => c.id === id))
        .filter((c): c is PedagogicalContent => Boolean(c));

    // Les fiches créées par le moniteur (sportives/techniques, ex: "Virement de bord") ne sont
    // pas des objectifs environnementaux COP'UN — on les sépare visuellement sur le dashboard.
    const objectives = selectedContent.filter(c => c.source !== 'custom');
    const technicalObjectives = selectedContent.filter(c => c.source === 'custom');

    return (
        <WeekDashboardClient
            stageId={activeStage.id}
            stageName={activeStage.title}
            stageDates={activeStage.dates}
            objectives={objectives}
            technicalObjectives={technicalObjectives}
            sportFiches={sportFiches}
            preparations={preparations}
            initialObservations={observations}
            initialExploits={assignedExploits}
            clubObservationTargets={clubObservationTargets}
            greeting={greeting}
            firstName={firstName}
            seasonGradient={seasonStyle.gradient}
            seasonIcon={seasonStyle.icon}
            contentCount={objectives.length}
            suggestedThematics={activeStage.suggested_thematics ?? []}
            quizDone={!!quizData?.completed_at}
            totalPoints={totalPoints}
            actionsSemaine={activeStage.actions_semaine ?? []}
            archivedStages={archivedStages.map(s => ({ id: s.id, title: s.title, dates: s.dates ?? '' }))}
            upcomingStages={upcomingStages.map(s => ({ id: s.id, title: s.title, dates: s.dates ?? '' }))}
        />
    );
}
