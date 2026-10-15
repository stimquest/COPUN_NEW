'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { weekHref } from '@/lib/week-navigation';
import { useRouter } from 'next/navigation';
import type { PedagogicalContent } from '@/types';
import type { CardChoice } from '@/lib/card-choice';
import { addCardToCalendarWeek } from '@/actions/card-week-actions';
import WeekSubjectChoice, { type SubjectStatus } from './WeekSubjectChoice';

export default function UseCardWithGroup({ card, choice, variant }: { card: PedagogicalContent; choice: CardChoice; variant?: 'bar' }) {
    const [open, setOpen] = useState(false);
    return <>
        {variant === 'bar' ? <button type="button" onClick={() => setOpen(true)} className="flex h-11 flex-1 items-center justify-center rounded-full bg-encre text-corps font-semibold text-carte">Ajouter à ma semaine</button>
            : <div className="co-card-use"><button type="button" onClick={() => setOpen(true)}>Ajouter à ma semaine <span aria-hidden>→</span></button><p>Un sujet déjà abordé ou une idée pour la suite.</p></div>}
        {open && <WeekPicker card={card} choice={choice} onClose={() => setOpen(false)}/>}
    </>;
}

function WeekPicker({ card, choice, onClose }: { card: PedagogicalContent; choice: CardChoice; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const lock = useRef(false);
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState<string | null>(null);
    const [discussed, setDiscussed] = useState(true);
    const [next, setNext] = useState(false);
    const [status, setStatus] = useState<SubjectStatus | null>(null);
    useEffect(() => { dialog.current?.showModal(); }, []);

    function timing(alreadyDone: boolean) {
        setDiscussed(alreadyDone); setNext(false);
    }
    async function save() {
        if (lock.current || (discussed && !status)) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await addCardToCalendarWeek(next, card.id, choice, discussed, null, discussed ? status ?? undefined : undefined);
            if (!result.success || !('stageId' in result)) { setError(result.error ?? 'Enregistrement impossible.'); return; }
            setDone(result.stageId); router.refresh();
        } catch { setError('Connexion interrompue. Réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }
    return <dialog ref={dialog} className="co-choice-dialog" aria-labelledby={`use-title-${card.id}`} onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
        <header><h2 id={`use-title-${card.id}`}>{done ? 'Ajouté à votre semaine' : 'Une place dans votre semaine'}</h2><button type="button" disabled={pending} onClick={onClose} aria-label="Fermer">×</button></header>
        {done ? <div className="co-choice-dialog-body"><p>{discussed ? 'Ce sujet est noté dans votre semaine. Retrouvez l’accroche et l’action de la carte pour continuer à en parler lors d’une prochaine séance.' : 'Votre idée est conservée. Vous indiquerez au bilan si le sujet a été effleuré ou abordé.'}</p><Link className="co-choice-primary" href={weekHref(done)}>{discussed ? 'Retrouver la carte pour la suite →' : 'Voir ma semaine →'}</Link><button className="co-choice-secondary" onClick={onClose}>Continuer à explorer</button></div> : <>
            <div className="co-choice-dialog-body">
                <p className="co-choice-subject">{card.question}</p>
                <WeekSubjectChoice id={card.id} discussed={discussed} status={status} onDiscussedChange={timing} onStatusChange={setStatus} disabled={pending} futureWeek={next}/>
                {!discussed && <fieldset className="co-choice-timing" disabled={pending}><legend>Pour quelle semaine ?</legend>
                    <label><input type="radio" name={`week-${card.id}`} checked={!next} onChange={() => setNext(false)}/> Cette semaine</label>
                    <label><input type="radio" name={`week-${card.id}`} checked={next} onChange={() => setNext(true)}/> La semaine prochaine</label>
                </fieldset>}
                {error && <p role="alert" className="co-choice-error">{error}</p>}
            </div>
            <footer><button type="button" className="co-choice-primary" disabled={pending || (discussed && !status)} onClick={save}>{pending ? 'Enregistrement…' : discussed ? 'Noter dans ma semaine' : 'Ajouter cette idée'}</button></footer>
        </>}
    </dialog>;
}
