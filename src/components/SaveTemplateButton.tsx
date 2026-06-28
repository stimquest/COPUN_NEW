'use client';

import { useState } from 'react';
import { SaveAsTemplateDrawer } from './SaveAsTemplateDrawer';

export function SaveTemplateButton({ stageId, stageTitle }: { stageId: string; stageTitle: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors px-3 py-2 rounded-xl active:scale-95"
            >
                <span className="material-symbols-outlined text-base">bookmark_add</span>
                <span>Modèle</span>
            </button>
            {open && (
                <SaveAsTemplateDrawer
                    stageId={stageId}
                    stageTitle={stageTitle}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
