'use client';

import { useEffect, useRef, useState } from 'react';
import type { PedagogicalContent } from '@/types';
import { resolveCardChoice, type CardChoice } from '@/lib/card-choice';
import LectureCarte from './LectureCarte';

export default function WeekCardEditor({ card, initialChoice, label, onSave, onClose }: {
    card: PedagogicalContent; initialChoice?: CardChoice; label: string;
    onSave: (choice: CardChoice) => Promise<{ success: boolean; error?: string }>;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const lock = useRef(false);
    const [choice, setChoice] = useState(() => resolveCardChoice(card, initialChoice));
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => { ref.current?.showModal(); }, []);
    async function save() {
        if (lock.current) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await onSave(choice);
            if (result.success) onClose(); else setError(result.error ?? 'Enregistrement impossible.');
        } catch { setError('Connexion interrompue. Vos choix restent ici : réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }
    return <dialog ref={ref} className="co-choice-dialog co-choice-editor" aria-labelledby="week-card-title" onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
        <header><h2 id="week-card-title">{card.question}</h2><button type="button" disabled={pending} onClick={onClose} aria-label="Fermer la carte">×</button></header>
        <div className="co-choice-dialog-body"><LectureCarte fiche={card} value={choice} onChange={setChoice} allowUse={false}/></div>
        <footer>{error && <p role="alert" className="co-choice-error">{error}</p>}<button type="button" className="co-choice-primary" disabled={pending} onClick={save}>{pending ? 'Enregistrement…' : label}</button></footer>
    </dialog>;
}
