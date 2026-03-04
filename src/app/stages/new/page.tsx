'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createStage } from '@/actions/stage-actions';
import { motion } from 'framer-motion';

export default function NewStagePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
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
        setIsSaving(true);

        const formattedDates = formatDateRange(startDate, endDate);

        const res = await createStage({
            ...formData,
            dates: formattedDates
        });

        if (res.success) {
            router.push('/stages');
        } else {
            alert('Erreur: ' + res.error);
            setIsSaving(false);
        }
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
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-400 ml-1">DÉBUT</span>
                                    <input
                                        required
                                        type="date"
                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold text-slate-900 focus:border-indigo-500 outline-hidden transition-all"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-400 ml-1">FIN</span>
                                    <input
                                        required
                                        type="date"
                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold text-slate-900 focus:border-indigo-500 outline-hidden transition-all"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            {startDate && endDate && (
                                <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indigo-500">calendar_month</span>
                                    <span className="text-xs font-black text-indigo-600 uppercase italic">
                                        Selection : {formatDateRange(startDate, endDate)}
                                    </span>
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
                                        <span className="material-symbols-outlined">rocket_launch</span>
                                        CRÉER LE STAGE
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
