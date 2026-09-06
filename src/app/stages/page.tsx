import { unstable_noStore as noStore } from 'next/cache';
import { getStages, getPedagogicalPool } from '@/services/data-service';
import { getProfile } from '@/actions/user-actions';
import { getObservationsForStage } from '@/actions/observation-actions';
import { getStageExploits, getClubObservationTargets } from '@/actions/defi-actions';
import { getUserContent } from '@/actions/content-actions';
import { getStageQuiz, getMyTotalPoints } from '@/actions/quiz-actions';
import { getStagePreparations } from '@/actions/preparation-actions';
import { getResumeFormation } from '@/actions/formation-actions';
import { DashboardFormation } from '@/components/DashboardFormation';
import { RailSuggestions } from '@/components/RailSuggestions';
import { getPeriodForMonth } from '@/data/seasonal-context';
import { pickCurrentStage, parseStageDateRange, ymdAParis, heureAParis } from '@/lib/stage-dates';
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
    // Lus dans le fuseau Europe/Paris, pas celui du serveur (UTC sur Vercel) — sinon la
    // salutation et la saison peuvent se tromper de quelques heures selon l'hébergement.
    const month = ymdAParis(now).month + 1;
    const hour = heureAParis(now);
    const period = getPeriodForMonth(month);
    const seasonalThemeByPeriod: Record<string, string> = {
        hiver_marin: 'biodiversite_saisonnalite',
        eveil_littoral: 'cohabitation_vivant',
        printemps_actif: 'cohabitation_vivant',
        haute_saison: 'impact_presence_humaine',
        transition_automnale: 'biodiversite_saisonnalite',
        entree_hiver: 'lecture_paysage',
    };
    const seasonStyle = SEASON_STYLES[period.id] ?? SEASON_STYLES['haute_saison'];
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    const [profile, stages, resumeFormation, copunPool] = await Promise.all([
        getProfile(),
        getStages(),
        getResumeFormation(),
        getPedagogicalPool(),
    ]);

    const firstName = profile?.full_name?.split(' ')[0] ?? 'Moniteur';

    // Semaine active = uniquement celle dont l'intervalle de dates couvre exactement
    // aujourd'hui — jamais la plus proche, pour ne pas afficher une semaine passée ou
    // préparée à l'avance à la place de la semaine en cours.
    const openStages = stages.filter(s => !s.closed_at);
    const activeStage = pickCurrentStage(openStages, now);
    const otherOpenStages = openStages.filter(s => s.id !== activeStage?.id);
    const archivedStages = stages.filter(s => !!s.closed_at);

    // Une semaine ouverte dont la date de fin est déjà passée n'a jamais été clôturée —
    // sans ce tri, elle se noyait parmi les semaines à venir sous "Semaines prévues",
    // sans accès direct au bilan : le moniteur restait bloqué, incapable de la retrouver
    // facilement pour la clore et débloquer la semaine suivante.
    const pastUnclosedStages = otherOpenStages.filter(s => {
        const range = parseStageDateRange(s.dates, now);
        return range ? range.end.getTime() < now.getTime() : false;
    });
    const upcomingStages = otherOpenStages.filter(s => !pastUnclosedStages.includes(s));
    const hasOpenNonActiveStages = otherOpenStages.length > 0;

    // Écran vide — aucun stage
    if (stages.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <header className={`bg-linear-to-br ${seasonStyle.gradient} px-5 pt-12 pb-8 space-y-6`}>
                    <div>
                        <p className="text-white/60 text-sm font-semibold">{greeting},</p>
                        <h1 className="text-4xl font-black text-white italic mt-1">{firstName}.</h1>
                    </div>
                    {/* Carte Formation — avant la carte semaine, même zone colorée que
                        l'accueil avec stage actif. */}
                    <div className="w-full">
                        <DashboardFormation resume={resumeFormation} />
                    </div>
                </header>
                <main className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
                    <RailSuggestions pool={copunPool} suggested={[seasonalThemeByPeriod[period.id]]} />
                    <div className="bg-slate-900 rounded-3xl p-6">
                        <span className="material-symbols-outlined text-4xl text-white/60 block mb-3">sailing</span>
                        <p className="text-white font-bold mb-1">Aucune semaine en cours</p>
                        <p className="text-white/70 text-sm mb-5">Explorez les idées, puis rassemblez vos questions pour la semaine.</p>
                        <Link
                            href="/stages/new"
                            className="w-full h-12 bg-white text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Nouvelle semaine
                        </Link>
                    </div>
                </main>
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
                    <p className="text-white/50 text-sm mt-2 mb-4">
                        {pastUnclosedStages.length > 0
                            ? `${pastUnclosedStages.length} semaine${pastUnclosedStages.length > 1 ? 's' : ''} en attente de bilan.`
                            : hasOpenNonActiveStages
                                ? "Aucune semaine prévue à la date d'aujourd'hui."
                                : 'Toutes vos semaines sont archivées.'}
                    </p>

                    {/* Carte Formation — dans la même zone colorée que la salutation,
                        avant le reste de l'écran. */}
                    <DashboardFormation resume={resumeFormation} />
                </header>
                <main className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
                    <RailSuggestions pool={copunPool} suggested={[seasonalThemeByPeriod[period.id]]} />
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

                    {/* Semaines passées jamais clôturées — priorité sur "Semaines prévues" :
                        c'est ce qui bloque le moniteur, pas ce qui l'attend. */}
                    {pastUnclosedStages.length > 0 && (
                        <section>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 mb-3">Bilan en attente</p>
                            <div className="space-y-2">
                                {pastUnclosedStages.map(s => (
                                    <Link
                                        key={s.id}
                                        href={`/stages/${s.id}/bilan`}
                                        className="flex items-center gap-3 bg-amber-50 rounded-2xl border border-amber-200 px-4 py-3.5 hover:bg-amber-100 transition active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-amber-500 text-xl shrink-0">event_busy</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-amber-950 truncate">{s.title}</p>
                                            <p className="text-xs text-amber-700/70">{s.dates}</p>
                                        </div>
                                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-wide shrink-0">Clôturer</span>
                                        <span className="material-symbols-outlined text-amber-400 text-base shrink-0">chevron_right</span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

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
    const [observations, preparations, assignedExploits, clubObservationTargets, sportFiches, quizData, totalPoints] = await Promise.all([
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
            suggestedThematics={Array.from(new Set([
                seasonalThemeByPeriod[period.id],
                ...(activeStage.suggested_thematics ?? []),
            ].filter(Boolean)))}
            quizDone={!!quizData?.completed_at}
            totalPoints={totalPoints}
            actionsSemaine={activeStage.actions_semaine ?? []}
            archivedStages={archivedStages.map(s => ({ id: s.id, title: s.title, dates: s.dates ?? '' }))}
            upcomingStages={upcomingStages.map(s => ({ id: s.id, title: s.title, dates: s.dates ?? '' }))}
            resumeFormation={resumeFormation}
            discoveryPool={copunPool}
        />
    );
}
