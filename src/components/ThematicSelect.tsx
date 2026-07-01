'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { THEMATIC_LABELS, ThematicTag } from '@/data/seasonal-context';

const DIM: Record<'C' | 'O' | 'P', { label: string; bg: string; text: string; border: string; lightBg: string }> = {
    C: { label: 'Comprendre', bg: 'bg-amber-500',   text: 'text-amber-700',   border: 'border-amber-200', lightBg: 'bg-amber-50' },
    O: { label: 'Observer',   bg: 'bg-sky-500',     text: 'text-sky-700',     border: 'border-sky-200',   lightBg: 'bg-sky-50' },
    P: { label: 'Protéger',   bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', lightBg: 'bg-emerald-50' },
};

const GROUPED = (['C', 'O', 'P'] as const).map(dim => ({
    dim,
    tags: (Object.entries(THEMATIC_LABELS) as [ThematicTag, typeof THEMATIC_LABELS[ThematicTag]][])
        .filter(([, info]) => info.dimension === dim),
}));

type Props = {
    value: ThematicTag | null;
    onChange: (v: ThematicTag | null) => void;
    placeholder?: string;
};

export function ThematicSelect({ value, onChange, placeholder = '— Aucune thématique —' }: Props) {
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selected = value ? THEMATIC_LABELS[value] : null;
    const selectedDim = selected ? DIM[selected.dimension] : null;

    const handleOpen = () => {
        if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
        setOpen(o => !o);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Recompute position on scroll/resize while open
    useEffect(() => {
        if (!open) return;
        const update = () => {
            if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
        };
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
    }, [open]);

    return (
        <>
            {/* Trigger */}
            <button
                ref={triggerRef}
                type="button"
                onClick={handleOpen}
                className={clsx(
                    'w-full h-11 flex items-center gap-2.5 px-3 rounded-xl border text-sm font-semibold transition-all',
                    selected
                        ? `${selectedDim!.lightBg} ${selectedDim!.border} ${selectedDim!.text}`
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                )}
            >
                {selected ? (
                    <>
                        <span className="material-symbols-outlined text-[16px] shrink-0">{selected.icon}</span>
                        <span className="flex-1 text-left truncate">{selected.label}</span>
                        <span className={clsx('text-[10px] font-black px-1.5 py-0.5 rounded-md text-white shrink-0', selectedDim!.bg)}>
                            {selected.dimension}
                        </span>
                    </>
                ) : (
                    <span className="flex-1 text-left">{placeholder}</span>
                )}
                <span className={clsx(
                    'material-symbols-outlined text-[18px] shrink-0 transition-transform duration-200',
                    open && 'rotate-180',
                    selected ? selectedDim!.text : 'text-slate-400'
                )}>
                    expand_more
                </span>
            </button>

            {/* Dropdown — portal pour échapper aux overflow:hidden parents */}
            {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {open && rect && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                position: 'fixed',
                                top: rect.bottom + 6,
                                left: rect.left,
                                width: rect.width,
                                zIndex: 9999,
                            }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-80 overflow-y-auto"
                        >
                            {/* Option vide */}
                            <button
                                type="button"
                                onClick={() => { onChange(null); setOpen(false); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-400 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[15px]">remove</span>
                                <span className="text-xs font-semibold">{placeholder}</span>
                            </button>

                            {GROUPED.map(({ dim, tags }) => {
                                const d = DIM[dim];
                                return (
                                    <div key={dim}>
                                        <div className={clsx('flex items-center px-4 py-1.5', d.lightBg)}>
                                            <span className={clsx('text-[10px] font-black uppercase tracking-widest', d.text)}>{d.label}</span>
                                        </div>
                                        {tags.map(([tag, info]) => {
                                            const isSelected = value === tag;
                                            return (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => { onChange(tag); setOpen(false); }}
                                                    className={clsx(
                                                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                                        isSelected ? d.lightBg : 'hover:bg-slate-50'
                                                    )}
                                                >
                                                    <span className={clsx('size-7 rounded-lg flex items-center justify-center shrink-0', isSelected ? d.bg : 'bg-slate-100')}>
                                                        <span className={clsx('material-symbols-outlined text-[14px]', isSelected ? 'text-white' : 'text-slate-400')}>
                                                            {info.icon}
                                                        </span>
                                                    </span>
                                                    <span className={clsx('text-sm font-semibold flex-1', isSelected ? d.text : 'text-slate-700')}>
                                                        {info.label}
                                                    </span>
                                                    {isSelected && (
                                                        <span className={clsx('material-symbols-outlined text-base shrink-0', d.text)}>check</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
