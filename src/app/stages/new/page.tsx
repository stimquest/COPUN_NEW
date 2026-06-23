'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createStage } from '@/actions/stage-actions';
import { motion, AnimatePresence } from 'framer-motion';
import SeasonalGuide from '@/components/SeasonalGuide';
import DatePicker from '@/components/DatePicker';
import { ThematicTag } from '@/data/seasonal-context';

export default function NewStagePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [durationDays, setDurationDays] = useState(5);
    const [showGuide, setShowGuide] = useState(false);

    // Fin calculée : début + (durée - 1) jours
    const endDate = (() => {
        if (!startDate) return '';
        const d = new Date(startDate);
        d.setDate(d.getDate() + durationDays - 1);
        return d.toISOString().slice(0, 10);
    })();

    const DURATION_OPTIONS = [
        { days: 3, label: '3 jours' },
        { days: 5, label: '5 jours' },
        { days: 7, label: '1 semaine' },
        { days: 14, label: '2 semaines' },
    ];
    const [suggestedThematics, setSuggestedThematics] = useState<ThematicTag[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        activity: 'Catamaran',
        level: 'Niveau 1'
    });

    const formatDateRange = (start: string, end: string) => {
        if (!start || !end) return '';
        const dStart = new Date(start);
        const dEnd = new Date(end);

        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        const sStr = dStart.toLocaleDateString('fr-FR', options);
        const eStr = dEnd.toLocaleDateString('fr-FR', options);

        return `${sStr} - ${eStr}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate) {
            setShowGuide(true);
        }
    };

    const saveStage = async (thematics: ThematicTag[]) => {
        setIsSaving(true);
        const formattedDates = formatDateRange(startDate, endDate);
        const res = await createStage({
            ...formData,
            dates: formattedDates,
            suggested_thematics: thematics,
        });
        if (res.success) {
            router.push('/stages');
        } else {
            alert('Erreur: ' + res.error);
            setIsSaving(false);
        }
    };

    const handleGuideValidate = (thematics: ThematicTag[]) => {
        saveStage(thematics);
    };

    const handleGuideSkip = () => {
        saveStage([]);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-6 py-6 flex items-center gap-4">
                <Link href="/stages" className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-xl font-black text-slate-900 uppercase italic">Nouveau Stage</h1>
            </header>

            <main className="p-6 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-slate-100"
                >
                    <AnimatePresence mode="wait">
                    {showGuide ? (
                        <motion.div
                            key="guide"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            className="space-y-4"
                        >
                            <div className="space-y-1 mb-6">
                                <p className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Étape 2 — Contexte</p>
                                <h2 className="text-lg font-black text-slate-900">Guidez votre programme</h2>
                                <p className="text-xs text-slate-500">Ces informations vont présélectionner les thématiques les plus pertinentes pour votre semaine.</p>
                            </div>
                            <SeasonalGuide
                                startDate={startDate}
                                onSuggestions={handleGuideValidate}
                                onSkip={handleGuideSkip}
                            />
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nom du Stage</label>
                            <input
                                required
                                type="text"
                                placeholder="ex: Catamaran Perfectionnement"
                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-indigo-500 outline-hidden transition-all"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Support</label>
                                <select
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold text-slate-900 outline-hidden cursor-pointer"
                                    value={formData.activity}
                                    onChange={e => setFormData({ ...formData, activity: e.target.value })}
                                >
                                    <option>Catamaran</option>
                                    <option>Optimist</option>
                                    <option>Planche à voile</option>
                                    <option>Wing Foil</option>
                                    <option>Kayak / Paddle</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Niveau</label>
                                <select
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold text-slate-900 outline-hidden cursor-pointer"
                                    value={formData.level}
                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <option>Niveau 1</option>
                                    <option>Niveau 2</option>
                                    <option>Niveau 3</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Période du Stage</label>

                            {/* Jour de début */}
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 ml-1">JOUR DE DÉBUT</span>
                                <DatePicker
                                    value={startDate}
                                    onChange={setStartDate}
                                    placeholder="Choisir le 1er jour"
                                />
                            </div>

                            {/* Durée */}
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 ml-1">DURÉE</span>
                                <div className="grid grid-cols-4 gap-2">
                                    {DURATION_OPTIONS.map(opt => (
                                        <button
                                            key={opt.days}
                                            type="button"
                                            onClick={() => setDurationDays(opt.days)}
                                            className={`h-14 rounded-2xl border-2 font-black text-xs transition-all active:scale-95 ${
                                                durationDays === opt.days
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {/* Réglage fin : +/- jours pour les durées atypiques */}
                                <div className="flex items-center justify-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setDurationDays(d => Math.max(1, d - 1))}
                                        className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">remove</span>
                                    </button>
                                    <span className="text-xs font-bold text-slate-500 w-24 text-center">
                                        {durationDays} jour{durationDays > 1 ? 's' : ''}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setDurationDays(d => Math.min(60, d + 1))}
                                        className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </button>
                                </div>
                            </div>

                            {/* Récapitulatif */}
                            {startDate && endDate && (
                                <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indigo-500">calendar_month</span>
                                    <div>
                                        <span className="block text-xs font-black text-indigo-600 uppercase italic">
                                            {formatDateRange(startDate, endDate)}
                                        </span>
                                        <span className="block text-[10px] font-semibold text-indigo-400">
                                            {durationDays} jour{durationDays > 1 ? 's' : ''} de stage
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSaving || !startDate || !endDate}
                                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                        SUIVANT
                                    </>
                                )}
                            </button>
                        </div>
                        </motion.form>
                    )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
