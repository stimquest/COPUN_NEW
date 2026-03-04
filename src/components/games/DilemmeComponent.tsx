'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { DilemmeData } from './types';

type Props = {
    data: DilemmeData;
    onComplete: (result: { choice: 'A' | 'B' }) => void;
};

export default function DilemmeComponent({ data, onComplete }: Props) {
    const [selected, setSelected] = useState<'A' | 'B' | null>(null);

    const handleSelect = (choice: 'A' | 'B') => {
        setSelected(choice);
        onComplete({ choice });
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-center">Que feriez-vous ?</h3>

            <div className="grid grid-cols-1 gap-3">
                <button
                    onClick={() => !selected && handleSelect('A')}
                    disabled={!!selected}
                    className={clsx(
                        "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                        selected === 'A' ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500" :
                            selected === 'B' ? "opacity-50 bg-slate-50" :
                                "bg-white hover:border-indigo-300 hover:shadow-sm"
                    )}
                >
                    <span className="absolute top-0 left-0 bg-slate-100 text-slate-500 px-2 py-1 text-[10px] font-black">A</span>
                    <p className="mt-2 font-medium text-slate-800">{data.optionA}</p>
                </button>

                <button
                    onClick={() => !selected && handleSelect('B')}
                    disabled={!!selected}
                    className={clsx(
                        "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                        selected === 'B' ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500" :
                            selected === 'A' ? "opacity-50 bg-slate-50" :
                                "bg-white hover:border-indigo-300 hover:shadow-sm"
                    )}
                >
                    <span className="absolute top-0 left-0 bg-slate-100 text-slate-500 px-2 py-1 text-[10px] font-black">B</span>
                    <p className="mt-2 font-medium text-slate-800">{data.optionB}</p>
                </button>
            </div>

            {selected && data.explanation && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-blue-500">info</span>
                        <span className="font-bold text-blue-800 text-xs uppercase">Analyse</span>
                    </div>
                    <p className="text-sm text-blue-900">{data.explanation}</p>
                </div>
            )}
        </div>
    );
}
