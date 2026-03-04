'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { validateDefi } from '@/actions/defi-actions';

export type DefiDB = {
    id: string;
    description: string;
    instruction: string;
    type_preuve: 'photo' | 'checkbox' | 'action' | 'quiz';
    icon: string;
    tags_theme: string[];
};

type DefiCardProps = {
    defi: DefiDB;
    isValidated: boolean;
};

export default function DefiCard({ defi, isValidated }: DefiCardProps) {
    const [validating, setValidating] = useState(false);
    const [done, setDone] = useState(isValidated);

    const handleValidate = async () => {
        if (done || validating) return;
        setValidating(true);

        // Simulating validation (mock proof upload for now)
        const res = await validateDefi(defi.id, 'mock-proof-url');

        if (res.success) {
            setDone(true);
        } else {
            console.error(res.error);
        }
        setValidating(false);
    };

    return (
        <div className={clsx(
            "p-4 rounded-xl border shadow-sm transition-all flex flex-col gap-3",
            done ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
        )}>
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                    <div className={clsx(
                        "size-10 rounded-full flex items-center justify-center shrink-0 border",
                        done ? "bg-emerald-100 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                        <span className="material-symbols-outlined text-xl">{defi.icon}</span>
                    </div>
                    <div>
                        <h4 className={clsx("text-sm font-black leading-tight mb-1", done ? "text-emerald-900" : "text-slate-900")}>
                            {defi.description}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{defi.instruction}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-50">
                <button
                    onClick={handleValidate}
                    disabled={done || validating}
                    className={clsx(
                        "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2",
                        done ? "bg-emerald-100 text-emerald-700 cursor-default" :
                            "bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
                    )}
                >
                    {done ? (
                        <>
                            <span className="material-symbols-outlined text-sm">check</span>
                            Validé
                        </>
                    ) : (
                        <>
                            {validating ? 'Validation...' : 'Valider'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
