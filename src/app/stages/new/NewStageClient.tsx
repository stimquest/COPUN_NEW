'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { createStage } from '@/actions/stage-actions';
import SeasonalGuide from '@/components/SeasonalGuide';
import DatePicker from '@/components/DatePicker';
import { ThematicTag } from '@/data/seasonal-context';

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

export function NewStageClient() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('form');
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [activities, setActivities] = useState<string[]>([]);
    const [level, setLevel] = useState('Niveau 1');

    const toggleActivity = (s: string) =>
        setActivities(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    const [nbStagiaires, setNbStagiaires] = useState('');
    const [startDate, setStartDate] = useState('');
    const [durationDays, setDurationDays] = useState(5);

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

    const saveStage = async (thematics: ThematicTag[]) => {
        if (isSaving) return;
        setIsSaving(true);
        const activityStr = activities.join(', ');
        const res = await createStage({
            title: title.trim(),
            activity: activityStr,
            level,
            dates: formatDateRange(startDate, endDate || startDate),
            nb_stagiaires: nbStagiaires ? Number(nbStagiaires) : undefined,
            suggested_thematics: thematics,
        });
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
                        <p className="text-sm font-bold text-slate-700">Création en cours…</p>
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
                        <Link href="/stages" className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition active:scale-95 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </Link>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {step === 'form' ? 'Étape 1/2' : 'Étape 2/2'}
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                            {step === 'form' ? 'Nouvelle semaine' : 'Contexte saisonnier'}
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

                        {/* Nom */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nom de la semaine</label>
                            <input
                                required
                                type="text"
                                placeholder="ex : PAV Ados Juillet"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition"
                            />
                        </div>

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

                        {/* Dates */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Début du stage</label>
                            <DatePicker value={startDate} onChange={setStartDate} placeholder="Choisir la date de début" />
                        </div>

                        {/* Durée */}
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

                        {/* Récap dates */}
                        {startDate && endDate && (
                            <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl px-4 py-3">
                                <span className="material-symbols-outlined text-white/60">calendar_month</span>
                                <div>
                                    <p className="text-sm font-black">{formatDateRange(startDate, endDate)}</p>
                                    <p className="text-[10px] text-white/50">{durationDays} jour{durationDays > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        )}

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
                                <p className="text-xs text-slate-400">{activities.join(', ')} · {level} · {formatDateRange(startDate, endDate || startDate)}</p>
                            </div>
                            <button onClick={() => setStep('form')} className="text-xs text-slate-400 hover:text-slate-600 transition shrink-0">Modifier</button>
                        </div>

                        <SeasonalGuide
                            startDate={startDate}
                            activities={activities}
                            level={level}
                            onSuggestions={saveStage}
                            onSkip={() => saveStage([])}
                            isSaving={isSaving}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
