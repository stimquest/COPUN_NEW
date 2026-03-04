'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { QuizzData } from './types';

type Props = {
    data: QuizzData;
    onComplete: (result: { success: boolean, attempts: number }) => void;
    isCompleted: boolean;
};

export default function QuizzComponent({ data, onComplete, isCompleted }: Props) {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // Safety check for data
    if (!data || !data.answers) return <div className="text-red-500">Erreur de données pour ce quiz</div>;

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        setSubmitted(true);
        const isCorrect = selectedAnswer === data.correctAnswerIndex;
        if (isCorrect && !isCompleted) {
            onComplete({ success: true, attempts: 1 });
        }
    };

    const isCorrect = submitted && selectedAnswer === data.correctAnswerIndex;

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">{data.question}</h3>

            <div className="space-y-2">
                {data.answers.map((answer, idx) => {
                    let stateClass = "border-slate-200 hover:bg-slate-50";
                    if (submitted) {
                        if (idx === data.correctAnswerIndex) stateClass = "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold";
                        else if (idx === selectedAnswer) stateClass = "bg-red-50 border-red-200 text-red-700";
                        else stateClass = "opacity-50";
                    } else if (selectedAnswer === idx) {
                        stateClass = "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => !submitted && setSelectedAnswer(idx)}
                            disabled={submitted}
                            className={clsx(
                                "w-full text-left p-3 rounded-xl border transition-all text-sm",
                                stateClass
                            )}
                        >
                            {answer}
                        </button>
                    );
                })}
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                >
                    Valider
                </button>
            ) : (
                <div className={clsx("p-3 rounded-lg text-sm", isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                    {isCorrect ? "Bravo ! Bonne réponse." : "Oups, ce n'est pas ça."}
                    {data.explanation && (
                        <p className="mt-1 text-xs opacity-90">{data.explanation}</p>
                    )}
                </div>
            )}
        </div>
    );
}
