'use client';

import { useEffect, useRef, useState } from 'react';
import type { PedagogicalContent } from '@/types';
import type { StageObjectiveExecutionStatus } from '@/types';
import { resolveCardChoice, type CardChoice } from '@/lib/card-choice';
import LectureCarte from './LectureCarte';

export default function WeekCardEditor({ card, initialChoice, label, onSave, onClose, children, purpose = 'prepare' }: {
    card: PedagogicalContent; initialChoice?: CardChoice; label: string;
    onSave: (choice: CardChoice, status?: Extract<StageObjectiveExecutionStatus, 'partial' | 'done'>) => Promise<{ success: boolean; error?: string }>;
    onClose: () => void;
    children?: React.ReactNode;
    purpose?: 'prepare' | 'record' | 'continue';
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const lock = useRef(false);
    const [choice, setChoice] = useState(() => resolveCardChoice(card, initialChoice));
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<Extract<StageObjectiveExecutionStatus, 'partial' | 'done'> | null>(null);
    useEffect(() => { ref.current?.showModal(); }, []);
    async function save() {
        if (lock.current || (purpose === 'record' && !status)) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await onSave(choice, status ?? undefined);
            if (result.success) onClose(); else setError(result.error ?? 'Enregistrement impossible.');
        } catch { setError('Connexion interrompue. Vos choix restent ici : réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }
    return <dialog ref={ref} className="co-choice-dialog co-choice-editor" aria-labelledby="week-card-title" onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
        <header><h2 id="week-card-title">{card.question}</h2><button type="button" disabled={pending} onClick={onClose} aria-label="Fermer la carte">×</button></header>
        <div className="co-choice-dialog-body">
            {purpose === 'record' && <>
                <p>Avec le groupe, ce sujet a été…</p>
                <fieldset className="co-choice-timing" disabled={pending}>
                    <legend>Choisissez ce qui correspond à votre séance</legend>
                    {([['partial', 'Effleuré', 'Le sujet a été évoqué rapidement. La carte peut vous aider à aller plus loin.'], ['done', 'Abordé', 'Vous avez pris le temps de travailler le sujet avec le groupe.']] as const).map(([value, title, detail]) => <label key={value} className={`w-full items-start rounded-bloc border p-4 ${status === value ? 'border-encre bg-sauge' : 'border-filet bg-carte'}`}>
                        <input type="radio" name={`week-status-${card.id}`} checked={status === value} onChange={() => setStatus(value)}/>
                        <span><strong className="block text-encre">{title}</strong><span className="block text-note text-discret">{detail}</span></span>
                    </label>)}
                </fieldset>
                {status && <p className="text-note text-discret">Voici des idées pour continuer à en parler lors d’une prochaine séance.</p>}
            </>}
            {purpose === 'continue' && <p>Pour continuer à en parler, vous pouvez essayer cette accroche ou proposer l’action lors d’une prochaine séance.</p>}
            <fieldset disabled={pending}>{children}</fieldset>
            <LectureCarte fiche={card} value={choice} onChange={setChoice} allowUse={false} continuation={purpose !== 'prepare'}/>
        </div>
        <footer>{error && <p role="alert" className="co-choice-error">{error}</p>}<button type="button" className="co-choice-primary" disabled={pending || (purpose === 'record' && !status)} onClick={save}>{pending ? 'Enregistrement…' : label}</button></footer>
    </dialog>;
}
