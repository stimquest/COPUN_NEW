'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PedagogicalContent } from '@/types';
import type { CardChoice } from '@/lib/card-choice';
import { addCardToCalendarWeek } from '@/actions/card-week-actions';
import { addCivilDays, calendarWeek } from '@/lib/stage-dates';
import CardDayPicker from './CardDayPicker';

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
    const { start, end, today } = calendarWeek(next);
    const [day, setDay] = useState(today);
    useEffect(() => { dialog.current?.showModal(); }, []);

    function timing(alreadyDone: boolean) {
        setDiscussed(alreadyDone); setNext(false);
        const current = calendarWeek();
        setDay(alreadyDone ? today : addCivilDays(today, 1) <= current.end ? addCivilDays(today, 1) : today);
    }
    async function save() {
        if (lock.current || !day) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await addCardToCalendarWeek(next, card.id, choice, discussed, discussed ? null : day);
            if (!result.success || !('stageId' in result)) { setError(result.error ?? 'Enregistrement impossible.'); return; }
            setDone(result.stageId); router.refresh();
        } catch { setError('Connexion interrompue. Réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }
    return <dialog ref={dialog} className="co-choice-dialog" aria-labelledby={`use-title-${card.id}`} onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
        <header><h2 id={`use-title-${card.id}`}>{done ? 'Ajouté à votre semaine' : 'Une place dans votre semaine'}</h2><button type="button" disabled={pending} onClick={onClose} aria-label="Fermer">×</button></header>
        {done ? <div className="co-choice-dialog-body"><p>{discussed ? 'Ce sujet est noté dans votre semaine. Retrouvez l’accroche et l’action de la carte pour continuer à en parler lors d’une prochaine séance.' : 'Votre idée et le jour prévu sont conservés.'}</p><Link className="co-choice-primary" href={`/stages/${done}/program`}>{discussed ? 'Retrouver la carte pour la suite →' : 'Voir ma semaine →'}</Link><button className="co-choice-secondary" onClick={onClose}>Continuer à explorer</button></div> : <>
            <div className="co-choice-dialog-body">
                <p className="co-choice-subject">{card.question}</p>
                <fieldset className="co-choice-timing" disabled={pending}><legend>Ce sujet…</legend>
                    <label><input type="radio" name={`timing-${card.id}`} checked={discussed} onChange={() => timing(true)}/> Je l’ai abordé avec mon groupe</label>
                    <label><input type="radio" name={`timing-${card.id}`} checked={!discussed} onChange={() => timing(false)}/> Je le prévois</label>
                </fieldset>
                {!discussed && <fieldset className="co-choice-timing" disabled={pending}><legend>Pour quelle semaine ?</legend>
                    <label><input type="radio" name={`week-${card.id}`} checked={!next} onChange={() => { setNext(false); setDay(today); }}/> Cette semaine</label>
                    <label><input type="radio" name={`week-${card.id}`} checked={next} onChange={() => { setNext(true); setDay(calendarWeek(true).start); }}/> La semaine prochaine</label>
                </fieldset>}
                {!discussed && <fieldset disabled={pending}><CardDayPicker day={day} onChange={setDay} discussed={false} start={start} end={end} today={today}/></fieldset>}
                {error && <p role="alert" className="co-choice-error">{error}</p>}
            </div>
            <footer><button type="button" className="co-choice-primary" disabled={pending || !day} onClick={save}>{pending ? 'Enregistrement…' : discussed ? 'Noter ce sujet dans ma semaine' : 'Ajouter cette idée'}</button></footer>
        </>}
    </dialog>;
}
