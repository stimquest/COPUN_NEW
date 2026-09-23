'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { createStage, updateStage } from '@/actions/stage-actions';
import { ajouterMissionPratique } from '@/actions/parcours-formation-actions';
import { dateISOAParis } from '@/lib/stage-dates';
import { Stage } from '@/types';

function formatDateRange(start: string, end: string) {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${new Date(start + 'T12:00:00').toLocaleDateString('fr-FR', opts)} - ${new Date(end + 'T12:00:00').toLocaleDateString('fr-FR', opts)}`;
}

const MONTH_LABELS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** Numéro de la semaine calendaire (lundi-dimanche) dans le mois de la date donnée. */
function weekOfMonth(date: Date): number {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = lundi
    return Math.ceil((date.getDate() + firstWeekday) / 7);
}

function computeAutoTitle(startDate: string): string {
    if (!startDate) return '';
    const d = new Date(startDate + 'T12:00:00');
    return `${MONTH_LABELS[d.getMonth()]} — Semaine ${weekOfMonth(d)}`;
}

function todayISO() {
    return dateISOAParis(new Date());
}

function addDays(dateISO: string, n: number): string {
    const d = new Date(dateISO + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
}

/**
 * Bornes de la semaine calendaire (lundi → dimanche) contenant la date donnée.
 *
 * La semaine est l'unité de l'app indépendamment de la durée réelle d'un stage : ce
 * qu'elle mesure, c'est « qu'est-ce que j'ai fait cette semaine pour l'environnement »,
 * pas le nombre de jours d'encadrement. Un stage lundi-vendredi et une séance isolée le
 * mercredi doivent donc produire la même fenêtre — sinon "Aujourd'hui" un mardi donnait
 * une semaine mardi→samedi, décalée de la vraie semaine en cours.
 */
function boundsOfCalendarWeek(dateISO: string): { start: string; end: string } {
    const d = new Date(dateISO + 'T12:00:00');
    const dayOfWeek = (d.getDay() + 6) % 7; // 0 = lundi ... 6 = dimanche
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) };
}

type Props = {
    existingStage?: Stage;
    initialSelection?: string[];
    initialTheme?: string;
    initialGroup?: string;
    initialParcours?: string;
    alreadyDiscussed?: boolean;
};

/**
 * Création d'une semaine — réduite à une seule vraie décision : cette semaine, ou la
 * prochaine.
 *
 * Le flux précédent forçait deux écrans et huit champs avant d'arriver au contenu :
 * date (au calendrier libre), durée, titre, support, niveau, effectif, puis coefficient
 * de marée, tendance météo et objectif de la semaine. Cette dernière étape demandait de
 * deviner la météo à l'avance — un moniteur qui prépare une semaine dans dix jours n'en a
 * aucune idée — et plus largement, l'observation de terrain est que construire un stage
 * n'intéresse presque personne : ce que les moniteurs utilisent, ce sont les mémos et le
 * quiz, au fil de l'eau, rarement en planifiant à plus de quelques jours d'avance. Un
 * calendrier libre proposait donc un choix qui ne sert jamais en pratique ; deux boutons
 * suffisent. La création ne doit pas s'alléger pour minimiser un effort qu'on subit, mais
 * ouvrir le plus vite possible sur ce qui a une vraie valeur (Explorer, la préparation du
 * discours).
 *
 * La semaine est toujours la semaine calendaire complète (lundi → dimanche), quelle que
 * soit la durée réelle d'encadrement — voir boundsOfCalendarWeek.
 *
 * Le niveau n'est plus une question posée ici : ce n'est pas un attribut stable d'un
 * groupe (les groupes changent presque chaque semaine) ni une difficulté de contenu
 * (vérifié : la longueur des fiches ne varie pas selon le niveau), mais un repère de
 * public affiché directement sur chaque fiche dans Explorer — voir GroupeBloc. Un
 * phénomène rare (un Fata Morgana observé en début de saison) doit pouvoir intéresser
 * tout le monde, quel que soit le niveau du groupe : le filtrer en amont l'aurait exclu.
 *
 * Coefficient de marée, tendance météo et objectif de la semaine (l'ancienne étape 2,
 * SeasonalGuide) sortent entièrement de la création pour la même raison — cette
 * information n'a de sens qu'au moment de choisir les sujets, avec la météo réelle du
 * jour, pas en la devinant à l'avance.
 *
 * Le nombre de stagiaires n'est plus demandé ici mais à la clôture de semaine (voir
 * StageClosureReview) : c'est un champ obligatoire du bilan, renseigné une fois qu'on le
 * connaît vraiment plutôt qu'estimé avant même que le groupe soit constitué — utile plus
 * tard pour mesurer combien de personnes ont été sensibilisées.
 */
export function NewStageClient({ existingStage, initialSelection = [], initialTheme, initialGroup, initialParcours, alreadyDiscussed = false }: Props) {
    const router = useRouter();
    const isEditing = !!existingStage;
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState(existingStage?.title ?? '');
    // Au fil de l'eau : les moniteurs ne préparent pratiquement jamais à plus de quelques
    // jours d'avance. Un choix entre deux semaines suffit — pas de calendrier à parcourir
    // pour une date lointaine qui ne sera de toute façon pas utilisée.
    const [semaine, setSemaine] = useState<'cette_semaine' | 'semaine_prochaine' | null>(
        existingStage ? null : 'cette_semaine',
    );
    const [dateEditedManually, setDateEditedManually] = useState(false);

    const startDate = semaine === 'cette_semaine'
        ? todayISO()
        : semaine === 'semaine_prochaine'
            ? addDays(todayISO(), 7)
            : '';

    const choisirSemaine = (value: 'cette_semaine' | 'semaine_prochaine') => {
        setSemaine(value);
        setDateEditedManually(true);
        const date = value === 'cette_semaine' ? todayISO() : addDays(todayISO(), 7);
        setTitle(computeAutoTitle(date));
    };

    // La semaine calendaire complète qui contient la date choisie — pas la durée réelle
    // du stage, qui n'a plus voix au chapitre dans les dates de l'app (voir
    // boundsOfCalendarWeek).
    const { start: weekStart, end: weekEnd } = startDate
        ? boundsOfCalendarWeek(startDate)
        : { start: '', end: '' };

    const canSubmit = !!startDate || (isEditing && !dateEditedManually);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit || isSaving) return;
        setIsSaving(true);

        const dates = isEditing && !dateEditedManually
            ? existingStage!.dates
            : formatDateRange(weekStart, weekEnd);

        const payload = {
            title: (title.trim() || computeAutoTitle(startDate)).trim(),
            activity: existingStage?.activity ?? '',
            // Le niveau n'est plus renseigné à la création (voir le repère par fiche dans
            // Explorer) ; en édition, on préserve celui déjà enregistré.
            level: existingStage?.level ?? '',
            dates,
            // Le nombre de stagiaires se renseigne au bilan de fin de semaine, une fois
            // le groupe réellement constitué — voir StageClosureReview.
            nb_stagiaires: existingStage?.nb_stagiaires ?? undefined,
            suggested_thematics: isEditing ? existingStage!.suggested_thematics : [],
            selectedContentIds: isEditing ? existingStage!.selected_content : initialSelection,
            alreadyDiscussed,
        };

        try {
        const res = isEditing
            ? await updateStage(existingStage!.id, payload)
            : await createStage(payload);

        if (res.success && res.stageId) {
            if (!isEditing && initialSelection.length) {
                if (initialParcours) {
                    const mission = await ajouterMissionPratique({ sequenceId: initialParcours, stageId: res.stageId, actionId: 'carte-question', cardIds: initialSelection.slice(0, 3) });
                    if ('error' in mission) alert(mission.error);
                }
                router.push('/stages/semaines');
            }
            else {
                const query = new URLSearchParams();
                if (!isEditing && initialTheme) query.set('theme', initialTheme);
                if (!isEditing && initialGroup) query.set('group', initialGroup);
                const suffix = query.size ? `?${query.toString()}` : '';
                router.push(`/stages/${res.stageId}/program${suffix}`);
            }
        } else {
            alert('Erreur : ' + res.error);
        }
        } catch { alert("Enregistrement impossible. Veuillez réessayer."); } finally {
        setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-indigo-50/60 via-slate-50 to-slate-50 pb-32">
            {isSaving && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3">
                        <span className="animate-spin material-symbols-outlined text-3xl text-slate-700">progress_activity</span>
                        <p className="text-sm font-bold text-slate-700">{isEditing ? 'Mise à jour en cours…' : 'Création en cours…'}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
                    <Link href={isEditing ? `/stages/${existingStage!.id}/program` : '/stages/semaines'} className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition active:scale-95 shrink-0">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <p className="text-sm font-bold text-slate-900">
                        {isEditing ? 'Modifier la semaine' : 'Nouvelle semaine'}
                    </p>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* La seule vraie décision : quelle semaine. Deux choix, pas de
                        calendrier — les moniteurs préparent au fil de l'eau, rarement
                        à plus de quelques jours d'avance. */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                            Quelle semaine ?
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => choisirSemaine('cette_semaine')}
                                className={clsx(
                                    'flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all active:scale-95',
                                    semaine === 'cette_semaine'
                                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200',
                                )}
                            >
                                <span className="material-symbols-outlined text-lg">today</span>
                                <span className="text-sm font-black">Cette semaine</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => choisirSemaine('semaine_prochaine')}
                                className={clsx(
                                    'flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all active:scale-95',
                                    semaine === 'semaine_prochaine'
                                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200',
                                )}
                            >
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                <span className="text-sm font-black">Semaine prochaine</span>
                            </button>
                        </div>

                        {isEditing && !dateEditedManually && (
                            <p className="text-[10px] text-slate-400 mt-2">
                                Dates actuelles : {existingStage!.dates}. Choisissez une semaine ci-dessus pour les modifier.
                            </p>
                        )}
                    </div>

                    {weekStart && weekEnd && (!isEditing || dateEditedManually) && (
                        <div className="flex items-center gap-3 bg-linear-to-br from-indigo-600 to-indigo-700 text-white rounded-xl px-4 py-3">
                            <span className="material-symbols-outlined text-white/70">calendar_month</span>
                            <div>
                                <p className="text-sm font-black">{formatDateRange(weekStart, weekEnd)}</p>
                                <p className="text-[10px] text-white/60">
                                    {semaine === 'cette_semaine' ? 'Cette semaine' : 'La semaine prochaine'}, lundi à dimanche
                                </p>
                            </div>
                        </div>
                    )}

                    {initialSelection.length > 0 && !isEditing && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Cartes déjà choisies</p>
                        <p className="mt-1 text-sm font-bold text-emerald-950">{initialSelection.length} carte{initialSelection.length > 1 ? 's' : ''} du parcours seront ajoutées automatiquement.</p>
                    </div>}

                    {/* Submit — envoie directement sur Explorer, pas d'étape intermédiaire
                        à deviner (météo, coefficient) avant d'avoir vu le vrai contenu. */}
                    <button
                        type="submit"
                        disabled={!canSubmit || isSaving}
                        className={clsx(
                            'w-full h-12 rounded-xl text-sm font-black transition active:scale-95 flex items-center justify-center gap-2',
                            canSubmit && !isSaving
                                ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        )}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                {isEditing ? 'Mise à jour…' : 'Création…'}
                            </>
                        ) : (
                            <>
                                {isEditing ? 'Enregistrer' : initialSelection.length ? 'Créer cette semaine' : 'Choisir mes cartes'}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}
