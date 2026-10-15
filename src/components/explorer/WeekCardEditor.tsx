'use client';

import { useEffect, useRef, useState } from 'react';
import type { PedagogicalContent } from '@/types';
import type { StageObjectiveExecutionStatus } from '@/types';
import { resolveCardChoice, type CardChoice } from '@/lib/card-choice';
import LectureCarte from './LectureCarte';
import WeekSubjectChoice from './WeekSubjectChoice';

export default function WeekCardEditor({ card, initialChoice, initialStatus, label, onSave, onClose, children, afterContent, purpose = 'prepare', selectionOnly = false, futureWeek = false }: {
    card: PedagogicalContent; initialChoice?: CardChoice; label: string;
    onSave: (choice: CardChoice, status?: Extract<StageObjectiveExecutionStatus, 'partial' | 'done'>) => Promise<{ success: boolean; error?: string }>;
    onClose: () => void;
    children?: React.ReactNode;
    afterContent?: React.ReactNode;
    initialStatus?: Extract<StageObjectiveExecutionStatus, 'partial' | 'done'>;
    purpose?: 'prepare' | 'record' | 'continue';
    selectionOnly?: boolean;
    futureWeek?: boolean;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const lock = useRef(false);
    const [choice, setChoice] = useState(() => resolveCardChoice(card, initialChoice));
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<Extract<StageObjectiveExecutionStatus, 'partial' | 'done'> | null>(initialStatus ?? null);
    const [discussed, setDiscussed] = useState(!futureWeek && (purpose !== 'prepare' || !!initialStatus));
    useEffect(() => { ref.current?.showModal(); }, []);
    async function save() {
        if (lock.current || (discussed && !status)) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await onSave(choice, discussed ? status ?? undefined : undefined);
            if (result.success) onClose(); else setError(result.error ?? 'Enregistrement impossible.');
        } catch { setError('Connexion interrompue. Vos choix restent ici : réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }
    return <dialog ref={ref} className={`co-choice-dialog co-choice-editor${selectionOnly ? ' max-w-sm' : ''}`} aria-labelledby="week-card-title" onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
        <header><h2 id="week-card-title">{card.question}</h2><button type="button" disabled={pending} onClick={onClose} aria-label="Fermer la carte">×</button></header>
        <div className="co-choice-dialog-body">
            {!selectionOnly && purpose === 'continue' && <p>Pour continuer à en parler, vous pouvez essayer cette accroche ou proposer l’action lors d’une prochaine séance.</p>}
            {!selectionOnly && children && <fieldset disabled={pending}>{children}</fieldset>}
            {!selectionOnly && <>
                <LectureCarte fiche={card} value={choice} onChange={setChoice} allowUse={false} continuation={purpose !== 'prepare'}/>
                {afterContent}
            </>}
            <WeekSubjectChoice id={card.id} discussed={discussed} status={status} onDiscussedChange={setDiscussed} onStatusChange={setStatus} disabled={pending} futureWeek={futureWeek}/>
        </div>
        <footer>{error && <p role="alert" className="co-choice-error">{error}</p>}<button type="button" className="co-choice-primary" disabled={pending || (discussed && !status)} onClick={save}>{pending ? 'Enregistrement…' : discussed ? 'Noter dans ma semaine' : label}</button></footer>
    </dialog>;
}
