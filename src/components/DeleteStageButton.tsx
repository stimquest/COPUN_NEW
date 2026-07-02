'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { deleteStage } from '@/actions/stage-actions';

export function DeleteStageButton({ stageId, size = 'md', redirectTo }: { stageId: string; size?: 'md' | 'sm'; redirectTo?: string }) {
    const [confirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        const res = await deleteStage(stageId);
        if (res.success) {
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
        } else {
            alert('Erreur : ' + res.error);
            setLoading(false);
            setConfirm(false);
        }
    };

    if (confirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-red-500">Supprimer ?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[11px] font-black hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                    {loading ? '…' : 'Oui'}
                </button>
                <button
                    onClick={() => setConfirm(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-black hover:bg-slate-200 transition-colors"
                >
                    Non
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirm(true)}
            className={clsx(
                "rounded-full bg-red-50 flex items-center justify-center text-red-300 hover:bg-red-100 hover:text-red-500 transition-colors shrink-0",
                size === 'sm' ? 'size-8' : 'size-10'
            )}
            title="Supprimer cette semaine"
        >
            <span className={clsx("material-symbols-outlined", size === 'sm' ? 'text-[16px]' : 'text-[20px]')}>delete</span>
        </button>
    );
}
