'use client';

import { useEffect, useRef, useState } from 'react';
import type { PedagogicalContent } from '@/types';
import { resolveCardChoice, type CardChoice } from '@/lib/card-choice';
import LectureCarte from './LectureCarte';

/** Lire et s'approprier une carte, sans demander de compte rendu ni de date. */
export default function CardReader({ card, initialChoice, onChange, onSave, onClose, label, children }: {
    card: PedagogicalContent;
    initialChoice?: CardChoice;
    onChange?: (choice: CardChoice) => void;
    onSave: (choice: CardChoice) => Promise<{ success: boolean; error?: string }>;
    onClose: () => void;
    label: string;
    children?: React.ReactNode;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const lock = useRef(false);
    const [choice, setChoice] = useState(() => resolveCardChoice(card, initialChoice));
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => { dialog.current?.showModal(); }, []);
    async function save() {
        if (lock.current) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await onSave(choice);
            if (result.success) onClose(); else setError(result.error ?? 'Enregistrement impossible.');
        } catch { setError('Connexion interrompue. Vos choix restent ici : réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }
    return <dialog ref={dialog} className="co-choice-dialog co-choice-editor" aria-labelledby="card-reader-title" onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
        <header><h2 id="card-reader-title">{card.question}</h2><button type="button" disabled={pending} onClick={onClose} aria-label="Fermer la carte">×</button></header>
        <div className="co-choice-dialog-body">
            <LectureCarte fiche={card} value={choice} onChange={next => { setChoice(next); onChange?.(next); }} allowUse={false} continuation/>
            {children}
        </div>
        <footer>{error && <p role="alert" className="co-choice-error">{error}</p>}<button type="button" disabled={pending} onClick={save} className="co-choice-primary">{pending ? 'Enregistrement…' : label}</button></footer>
    </dialog>;
}
