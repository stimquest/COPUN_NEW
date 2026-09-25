'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PedagogicalContent } from '@/types';
import type { CardChoice } from '@/lib/card-choice';
import { getWeeksForCard, addCardToWeek } from '@/actions/card-week-actions';
import { setCardSaved } from '@/actions/saved-card-actions';

export default function UseCardWithGroup({ card, choice, variant }: { card: PedagogicalContent; choice: CardChoice; variant?: 'bar' }) {
    const [open, setOpen] = useState(false);
    /* Dans la barre d'actions de la carte : un seul bouton principal, entre les flèches. */
    if (variant === 'bar') return <>
        <button type="button" onClick={() => setOpen(true)}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-[#173d3a] text-[13px] font-bold text-[#fffdf8] transition active:scale-[0.98]">
            Utiliser avec mon groupe
        </button>
        {open && <WeekPicker card={card} choice={choice} onClose={() => setOpen(false)}/>}
    </>;
    return <div className="co-card-use">
        <button type="button" onClick={() => setOpen(true)}>Utiliser avec mon groupe <span aria-hidden>→</span></button>
        <p>L’accroche et l’action affichées seront conservées.</p>
        {open && <WeekPicker card={card} choice={choice} onClose={() => setOpen(false)}/>}
    </div>;
}

function WeekPicker({ card, choice, onClose }: { card: PedagogicalContent; choice: CardChoice; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const lock = useRef(false);
    const router = useRouter();
    const [weeks, setWeeks] = useState<Awaited<ReturnType<typeof getWeeksForCard>>['weeks']>([]);
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState<string | null>(null);
    const [discussed, setDiscussed] = useState(false);
    useEffect(() => {
        dialog.current?.showModal();
        let active = true;
        getWeeksForCard().then(result => {
            if (active) { setWeeks(result.weeks); setError(result.error ?? ''); setLoading(false); }
        }).catch(() => { if (active) { setError('Chargement impossible. Fermez puis réessayez.'); setLoading(false); } });
        return () => { active = false; };
    }, []);

    async function choose(stageId: string) {
        if (lock.current) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await addCardToWeek(stageId, card.id, choice, discussed);
            if (!result.success) { setError(result.error ?? 'Enregistrement impossible.'); return; }
            setDone(stageId);
            router.refresh();
        } catch { setError('Connexion interrompue. Réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }

    async function createWeek() {
        if (lock.current) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await setCardSaved(card.id, true, choice);
            if (!result.success) { setError(result.error ?? 'Enregistrement impossible.'); return; }
            router.push(`/stages/new?selection=${encodeURIComponent(card.id)}${discussed ? '&aborde=1' : ''}`);
        } catch { setError('Connexion interrompue. Réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }

    return <dialog ref={dialog} className="co-choice-dialog" aria-labelledby={`use-title-${card.id}`} onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}>
        <header><h2 id={`use-title-${card.id}`}>{done ? 'Ajouté à votre semaine' : 'Avec quel groupe ?'}</h2><button type="button" disabled={pending} onClick={onClose} aria-label="Fermer">×</button></header>
        {done ? <div className="co-choice-dialog-body"><p>Votre accroche et votre action sont enregistrées{discussed ? '. Le sujet est noté comme abordé' : ''}.</p><Link className="co-choice-primary" href={`/stages/${done}/program`}>Voir ma semaine →</Link><button className="co-choice-secondary" onClick={onClose}>Continuer à explorer</button></div> : <div className="co-choice-dialog-body">
            <p className="co-choice-subject">{card.question}</p>
            <blockquote>« {choice.accroche} »</blockquote>
            {choice.actionId && <p><strong>Avec le groupe</strong><br/>{card.actions?.find(action => action.id === choice.actionId)?.label}</p>}
            <fieldset className="co-choice-timing"><legend>Cette occasion…</legend><label><input type="radio" name={`timing-${card.id}`} checked={!discussed} onChange={() => setDiscussed(false)}/> Je la prévois</label><label><input type="radio" name={`timing-${card.id}`} checked={discussed} onChange={() => setDiscussed(true)}/> Je l’ai déjà saisie</label></fieldset>
            {loading ? <p role="status">Chargement des semaines…</p> : weeks.map(week => {
                const full = (week.selected_content?.length ?? 0) >= 5 && !week.selected_content?.includes(card.id);
                return <button type="button" className="co-choice-week" key={week.id} disabled={pending || full} onClick={() => choose(week.id)}><strong>{week.title}</strong><span>{week.dates}{full ? ' · 5 cartes déjà choisies' : ''}</span></button>;
            })}
            {error && <p role="alert" className="co-choice-error">{error}</p>}
            <button type="button" className="co-choice-secondary" disabled={pending || loading} onClick={createWeek}>Créer une semaine avec cette carte</button>
            {pending && <p role="status">Enregistrement…</p>}
        </div>}
    </dialog>;
}
