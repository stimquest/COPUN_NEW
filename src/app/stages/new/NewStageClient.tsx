'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { createStage, updateStage } from '@/actions/stage-actions';
import SeasonalGuide from '@/components/SeasonalGuide';
import DatePicker from '@/components/DatePicker';
import { ThematicTag, CoeffType, MeteoType } from '@/data/seasonal-context';
import { ObjectifId } from '@/data/objectifs';
import { extractIntention, extractCoeff, extractMeteo, stripIntention, encodeConditions } from '@/data/objectifs';
import { Stage } from '@/types';

const SUPPORTS = [
    'Catamaran', 'Optimist', 'Planche à voile', 'Wing Foil',
    'Kayak mer', 'SUP / Paddle', 'Dériveur', 'Kite Surf',
];

const NIVEAUX = ['Niveau 1', 'Niveau 2', 'Niveau 3', 'Tous niveaux'];

const DUREES = [
    { days: 3, label: '3 j' },
    { days: 5, label: '5 j' },
    { days: 7, label: '1 sem.' },
    { days: 14, label: '2 sem.' },
];

type Step = 'form' | 'guide';

function formatDateRange(start: string, end: string) {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
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
    return new Date().toISOString().slice(0, 10);
}

type Props = {
    existingStage?: Stage;
};

export function NewStageClient({ existingStage }: Props) {
    const router = useRouter();
    const isEditing = !!existingStage;
    // En édition, la date/le titre/le support sont déjà connus : on saute directement
    // à l'étape marée/météo/objectif, la seule chose qu'on vient réellement modifier.
    const [step, setStep] = useState<Step>(isEditing ? 'guide' : 'form');
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState(existingStage?.title ?? '');
    const [titleEditedManually, setTitleEditedManually] = useState(isEditing);
    const [activities, setActivities] = useState<string[]>(
        existingStage?.activity ? existingStage.activity.split(', ').filter(Boolean) : []
    );
    const [level, setLevel] = useState(existingStage?.level ?? 'Niveau 1');

    const toggleActivity = (s: string) =>
        setActivities(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    const [nbStagiaires, setNbStagiaires] = useState(existingStage?.nb_stagiaires ? String(existingStage.nb_stagiaires) : '');
    // En édition, on pré-remplit avec la date du jour pour accéder directement à l'étape saisonnière
    // sans forcer le moniteur à re-choisir une date s'il veut juste ajuster son objectif.
    const [startDate, setStartDate] = useState(isEditing ? todayISO() : '');
    const [dateEditedManually, setDateEditedManually] = useState(false);
    const [durationDays, setDurationDays] = useState(5);

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        setDateEditedManually(true);
        if (!titleEditedManually) setTitle(computeAutoTitle(value));
    };

    const handleTitleChange = (value: string) => {
        setTitle(value);
        setTitleEditedManually(true);
    };

    const endDate = (() => {
        if (!startDate) return '';
        const d = new Date(startDate + 'T12:00:00');
        d.setDate(d.getDate() + durationDays - 1);
        return d.toISOString().slice(0, 10);
    })();

    const canSubmit = title.trim() && startDate;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setStep('guide');
    };

    const saveStage = async (
        thematics: ThematicTag[],
        intentionId: ObjectifId | null = null,
        coeff: CoeffType | null = null,
        meteo: MeteoType | null = null,
    ) => {
        if (isSaving) return;
        setIsSaving(true);
        const activityStr = activities.join(', ');
        const dates = isEditing && !dateEditedManually
            ? existingStage!.dates
            : formatDateRange(startDate, endDate || startDate);

        const payload = {
            title: title.trim(),
            activity: activityStr,
            level,
            dates,
            nb_stagiaires: nbStagiaires ? Number(nbStagiaires) : undefined,
            suggested_thematics: [...thematics, ...encodeConditions(coeff, meteo)] as ThematicTag[],
            intention: intentionId,
        };

        const res = isEditing
            ? await updateStage(existingStage!.id, payload)
            : await createStage(payload);

        if (res.success && res.stageId) {
            router.push(`/stages/${res.stageId}/program`);
        } else {
            alert('Erreur : ' + res.error);
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
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
                    {step === 'guide' ? (
                        <button
                            onClick={() => setStep('form')}
                            className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition active:scale-95 shrink-0"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                    ) : (
                        <Link href={isEditing ? `/stages/${existingStage!.id}/program` : '/stages'} className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition active:scale-95 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </Link>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {step === 'form' ? 'Étape 1/2' : 'Étape 2/2'}
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                            {step === 'form'
                                ? (isEditing ? 'Modifier la semaine' : 'Nouvelle semaine')
                                : 'Contexte saisonnier'}
                        </p>
                    </div>
                    {/* Indicateur étapes */}
                    <div className="flex gap-1.5 shrink-0">
                        <span className="size-2 rounded-full bg-slate-900" />
                        <span className={clsx('size-2 rounded-full transition-colors', step === 'guide' ? 'bg-slate-900' : 'bg-slate-200')} />
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">

                {step === 'form' && (
                    <form onSubmit={handleFormSubmit} className="space-y-5">

                        {/* Dates */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Début de la semaine</label>
                            <DatePicker value={startDate} onChange={handleStartDateChange} placeholder="Choisir la date de début" />
                            {isEditing && !dateEditedManually && (
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    Dates actuelles : {existingStage!.dates}. Choisissez une nouvelle date pour les modifier.
                                </p>
                            )}
                        </div>

                        {/* Durée */}
                        {(!isEditing || dateEditedManually) && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Durée</label>
                                <div className="flex gap-2">
                                    {DUREES.map(d => (
                                        <button
                                            key={d.days}
                                            type="button"
                                            onClick={() => setDurationDays(d.days)}
                                            className={clsx(
                                                'flex-1 py-2.5 rounded-xl border text-xs font-bold transition active:scale-95',
                                                durationDays === d.days
                                                    ? 'bg-slate-900 border-slate-900 text-white'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                            )}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                                {/* Ajustement fin */}
                                <div className="flex items-center justify-center gap-4 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setDurationDays(d => Math.max(1, d - 1))}
                                        className="size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition"
                                    >
                                        <span className="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <span className="text-sm font-bold text-slate-700 w-24 text-center">{durationDays} jour{durationDays > 1 ? 's' : ''}</span>
                                    <button
                                        type="button"
                                        onClick={() => setDurationDays(d => Math.min(60, d + 1))}
                                        className="size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Récap dates */}
                        {startDate && endDate && (!isEditing || dateEditedManually) && (
                            <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl px-4 py-3">
                                <span className="material-symbols-outlined text-white/60">calendar_month</span>
                                <div>
                                    <p className="text-sm font-black">{formatDateRange(startDate, endDate)}</p>
                                    <p className="text-[10px] text-white/50">{durationDays} jour{durationDays > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        )}

                        {/* Nom (auto-généré depuis la date, modifiable) */}
                        {startDate && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                    Nom de la semaine
                                    <span className="font-semibold normal-case tracking-normal text-slate-300 ml-1">— généré automatiquement, modifiable</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition"
                                />
                            </div>
                        )}

                        {/* Support */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                                Support{activities.length > 1 ? 's' : ''}
                                <span className="font-semibold normal-case tracking-normal text-slate-300 ml-1">— plusieurs possibles</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SUPPORTS.map(s => {
                                    const selected = activities.includes(s);
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => toggleActivity(s)}
                                            className={clsx(
                                                'px-3 py-2 rounded-xl border text-xs font-bold transition active:scale-95 flex items-center gap-1.5',
                                                selected
                                                    ? 'bg-slate-900 border-slate-900 text-white'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                            )}
                                        >
                                            {selected && <span className="material-symbols-outlined text-[13px]">check</span>}
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Niveau */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Niveau</label>
                            <div className="flex gap-2">
                                {NIVEAUX.map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setLevel(n)}
                                        className={clsx(
                                            'flex-1 py-2.5 rounded-xl border text-xs font-bold transition active:scale-95',
                                            level === n
                                                ? 'bg-slate-900 border-slate-900 text-white'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                        )}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nb stagiaires */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                Nombre de stagiaires <span className="font-semibold normal-case tracking-normal text-slate-300">— optionnel</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={999}
                                placeholder="ex : 12"
                                value={nbStagiaires}
                                onChange={e => setNbStagiaires(e.target.value)}
                                className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={clsx(
                                'w-full h-12 rounded-xl text-sm font-black transition active:scale-95',
                                canSubmit
                                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            )}
                        >
                            Suivant — contexte saisonnier
                        </button>
                    </form>
                )}

                {step === 'guide' && startDate && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{title}</p>
                                <p className="text-xs text-slate-400">
                                    {activities.join(', ')} · {level} · {(!isEditing || dateEditedManually) ? formatDateRange(startDate, endDate || startDate) : existingStage!.dates}
                                </p>
                            </div>
                            <button onClick={() => setStep('form')} className="text-xs text-slate-400 hover:text-slate-600 transition shrink-0">Modifier</button>
                        </div>

                        <SeasonalGuide
                            startDate={startDate}
                            activities={activities}
                            level={level}
                            initialIntention={isEditing ? extractIntention(existingStage!.suggested_thematics) : null}
                            initialCoeff={isEditing ? extractCoeff(existingStage!.suggested_thematics) : null}
                            initialMeteo={isEditing ? extractMeteo(existingStage!.suggested_thematics) : null}
                            onSuggestions={saveStage}
                            onSkip={(intentionId, coeff, meteo) => saveStage(
                                isEditing ? stripIntention(existingStage!.suggested_thematics) as ThematicTag[] : [],
                                intentionId,
                                coeff,
                                meteo,
                            )}
                            isSaving={isSaving}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
