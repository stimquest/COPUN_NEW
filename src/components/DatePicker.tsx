'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS = ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'];

function toISO(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface DatePickerProps {
    value: string;                // ISO yyyy-mm-dd
    onChange: (iso: string) => void;
    placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = 'Choisir une date' }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selected = value ? new Date(value + 'T00:00:00') : null;
    const [viewDate, setViewDate] = useState(() => selected ?? new Date());
    const ref = useRef<HTMLDivElement>(null);

    // Ferme au clic extérieur
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const today = new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Construit la grille du mois (lundi = premier jour)
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // 0 = lundi
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    const label = selected
        ? selected.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : placeholder;

    const changeMonth = (delta: number) => setViewDate(new Date(year, month + delta, 1));

    return (
        <div className="relative" ref={ref}>
            {/* Champ déclencheur */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`w-full h-14 bg-slate-50 border-2 rounded-2xl px-5 flex items-center justify-between font-bold transition-all ${
                    open ? 'border-indigo-500' : 'border-slate-100 hover:border-slate-200'
                } ${selected ? 'text-slate-900' : 'text-slate-400'}`}
            >
                <span className="capitalize truncate">{label}</span>
                <span className="material-symbols-outlined text-slate-400 shrink-0">calendar_month</span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full mb-2 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4"
                    >
                        {/* En-tête mois */}
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                onClick={() => changeMonth(-1)}
                                className="size-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <span className="text-sm font-black text-slate-900 capitalize">{MONTHS[month]} {year}</span>
                            <button
                                type="button"
                                onClick={() => changeMonth(1)}
                                className="size-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>

                        {/* Jours de la semaine */}
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS.map(d => (
                                <span key={d} className="text-[10px] font-black uppercase text-slate-300 text-center py-1">{d}</span>
                            ))}
                        </div>

                        {/* Grille des jours */}
                        <div className="grid grid-cols-7 gap-0.5">
                            {cells.map((cell, i) => {
                                if (!cell) return <span key={i} />;
                                const isSelected = selected && sameDay(cell, selected);
                                const isToday = sameDay(cell, today);
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => { onChange(toISO(cell)); setOpen(false); }}
                                        className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all active:scale-90 ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : isToday
                                                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {cell.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pied : aujourd'hui */}
                        <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => { onChange(toISO(today)); setViewDate(today); setOpen(false); }}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                                Aujourd&apos;hui
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
