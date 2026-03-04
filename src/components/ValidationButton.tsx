'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { toggleValidation } from '@/actions/user-actions';

export default function ValidationButton({ contentId, sessionId, initialValidated }: { contentId: string, sessionId: string, initialValidated: boolean }) {
    const [validated, setValidated] = useState(initialValidated);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (loading) return;
        setLoading(true);

        // Optimistic update
        const newState = !validated;
        setValidated(newState);

        const res = await toggleValidation(contentId, sessionId, validated);
        if (!res.success) {
            // Revert on error
            setValidated(!newState);
            console.error(res.error);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={clsx(
                "size-10 rounded-full border flex items-center justify-center transition-all active:scale-95",
                validated
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200"
                    : "bg-slate-50 border-slate-200 text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
            )}
        >
            <span className={clsx("material-symbols-outlined", loading && "animate-spin")}>
                {loading ? 'refresh' : 'thumb_up'}
            </span>
        </button>
    );
}
