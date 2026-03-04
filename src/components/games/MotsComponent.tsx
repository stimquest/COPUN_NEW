'use client';

import { useState } from 'react';
import { MotsData } from './types';

type Props = {
    data: MotsData;
    onComplete: (result: { success: boolean }) => void;
};

export default function MotsComponent({ data, onComplete }: Props) {
    const [input, setInput] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const checkAnswer = () => {
        setSubmitted(true);
        // Normalize strings for comparison (lowercase, remove accents)
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const isCorrect = normalize(input) === normalize(data.answer);

        if (isCorrect) {
            onComplete({ success: true });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Définition</span>
                <p className="font-medium text-slate-800">{data.definition}</p>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={submitted}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    placeholder="Votre réponse..."
                />
                <button
                    onClick={checkAnswer}
                    disabled={submitted || !input}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                >
                    OK
                </button>
            </div>

            {submitted && (
                <div className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                    <span className="font-bold text-slate-500 text-xs uppercase block mb-1">Réponse</span>
                    <p className="font-bold text-indigo-700">{data.answer}</p>
                </div>
            )}
        </div>
    );
}
