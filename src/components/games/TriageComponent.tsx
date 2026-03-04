'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { TriageData } from './types';

type Props = {
    data: TriageData;
    onComplete: (result: { success: boolean }) => void;
};

export default function TriageComponent({ data, onComplete }: Props) {
    const [selected, setSelected] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (choice: boolean) => {
        setSelected(choice);
        setSubmitted(true);
        if (choice === data.isTrue) {
            onComplete({ success: true });
        }
    };

    const isCorrect = submitted && selected === data.isTrue;

    return (
        <div className="space-y-4">
            <p className="font-medium text-slate-800 italic">&quot;{data.statement}&quot;</p>

            <div className="flex gap-4">
                <button
                    onClick={() => !submitted && handleSubmit(true)}
                    disabled={submitted}
                    className={clsx(
                        "flex-1 py-3 rounded-xl border font-bold transition-all",
                        submitted && data.isTrue ? "bg-emerald-100 border-emerald-500 text-emerald-700" :
                            submitted && !data.isTrue && selected === true ? "bg-red-100 border-red-500 text-red-700" :
                                "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    )}
                >
                    VRAI
                </button>
                <button
                    onClick={() => !submitted && handleSubmit(false)}
                    disabled={submitted}
                    className={clsx(
                        "flex-1 py-3 rounded-xl border font-bold transition-all",
                        submitted && !data.isTrue ? "bg-emerald-100 border-emerald-500 text-emerald-700" :
                            submitted && data.isTrue && selected === false ? "bg-red-100 border-red-500 text-red-700" :
                                "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    )}
                >
                    FAUX
                </button>
            </div>

            {submitted && (
                <div className={clsx("p-3 rounded-lg text-sm", isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                    {isCorrect ? "Correct !" : "Incorrect."}
                    {data.explanation && (
                        <p className="mt-1 text-xs opacity-90">{data.explanation}</p>
                    )}
                </div>
            )}
        </div>
    );
}
