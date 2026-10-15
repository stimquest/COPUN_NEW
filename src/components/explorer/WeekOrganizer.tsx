'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Reorder, useDragControls } from 'framer-motion';
import type { PedagogicalContent } from '@/types';
import { updateStagePool } from '@/actions/stage-actions';
import { addCardToWeek } from '@/actions/card-week-actions';
import { resolveCardChoice, type CardChoice, type CardChoices } from '@/lib/card-choice';
import CardReader from './CardReader';

export default function WeekOrganizer({ stageId, cards, choices, statuses }: {
    stageId: string;
    cards: PedagogicalContent[];
    choices: CardChoices;
    statuses: Record<string, 'partial' | 'done' | null>;
}) {
    const router = useRouter();
    const [ordered, setOrdered] = useState(cards);
    const orderedRef = useRef(cards);
    const persistedRef = useRef(cards);
    const [editing, setEditing] = useState<PedagogicalContent | null>(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const lock = useRef(false);

    async function reorder(next: PedagogicalContent[]) {
        if (lock.current) return;
        const previous = persistedRef.current;
        if (next.every((card, index) => card.id === previous[index]?.id) && next.length === previous.length) return;
        lock.current = true; setPending(true); setError('');
        try {
            const result = await updateStagePool(stageId, next.map(card => card.id));
            if (result.success) { setOrdered(next); orderedRef.current = next; persistedRef.current = next; router.refresh(); }
            else { setOrdered(previous); orderedRef.current = previous; setError(result.error ?? 'Modification impossible.'); }
        } catch { setOrdered(previous); orderedRef.current = previous; setError('Connexion interrompue. Réessayez.'); }
        finally { lock.current = false; setPending(false); }
    }
    function move(index: number, offset: number) {
        if (index + offset < 0 || index + offset >= ordered.length) return;
        const next = [...ordered];
        [next[index], next[index + offset]] = [next[index + offset], next[index]];
        void reorder(next);
    }
    async function save(choice: CardChoice) {
        if (!editing || lock.current) return { success: false, error: 'Modification indisponible.' };
        lock.current = true; setPending(true);
        try {
            const savedStatus = statuses[editing.id] ?? undefined;
            const result = await addCardToWeek(stageId, editing.id, choice, !!savedStatus, null, savedStatus);
            if (result.success) router.refresh();
            return result;
        } finally { lock.current = false; setPending(false); }
    }
    return <div className="space-y-4 text-encre">
        {error && <p role="alert" className="co-choice-error">{error}</p>}
        <p id="week-order-instructions" className="text-note text-discret">Faites glisser une poignée pour changer l’ordre des cartes.<span className="sr-only"> Au clavier, utilisez les flèches haut et bas sur la poignée.</span></p>
        {ordered.length ? <Reorder.Group axis="y" values={ordered} onReorder={next => { if (!lock.current) { orderedRef.current = next; setOrdered(next); } }} className="space-y-3">
            {ordered.map((card, index) => <SortableCard key={card.id} card={card} status={statuses[card.id]} pending={pending} onEnd={() => void reorder(orderedRef.current)} onKeyboardMove={offset => move(index, offset)} onRead={() => setEditing(card)} onRemove={() => void reorder(ordered.filter(item => item.id !== card.id))}/>)}
        </Reorder.Group> : <p className="text-corps">Aucune carte dans cette semaine pour le moment.</p>}
        {editing && <CardReader key={editing.id} card={editing} initialChoice={resolveCardChoice(editing, choices[editing.id])} label="Garder mes préférences" onSave={save} onClose={() => setEditing(null)}/>}
    </div>;
}

function SortableCard({ card, status, pending, onEnd, onKeyboardMove, onRead, onRemove }: {
    card: PedagogicalContent; status: 'partial' | 'done' | null; pending: boolean;
    onEnd: () => void; onKeyboardMove: (offset: number) => void; onRead: () => void; onRemove: () => void;
}) {
    const controls = useDragControls();
    return <Reorder.Item value={card} dragListener={false} dragControls={controls} onDragEnd={onEnd} className="relative flex items-start gap-2 rounded-bloc border border-filet bg-carte p-4">
        <button type="button" disabled={pending} aria-label={'Déplacer : ' + card.question} aria-describedby="week-order-instructions" onPointerDown={event => { if (!pending) controls.start(event); }} onKeyDown={event => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); onKeyboardMove(event.key === 'ArrowUp' ? -1 : 1); } }} className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-discret active:cursor-grabbing disabled:opacity-40"><span className="material-symbols-outlined" aria-hidden>drag_indicator</span></button>
        <div className="min-w-0 flex-1">
            <p className="text-note text-discret">{status === 'partial' ? 'Effleuré' : status === 'done' ? 'Abordé' : 'Pour en parler'}</p>
            <h3 className="mt-2 text-intertitre font-semibold leading-snug">{card.question}</h3>
            <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" disabled={pending} onClick={onRead} className="min-h-11 text-note font-semibold underline underline-offset-4 disabled:opacity-40">Relire la carte</button>
                <button type="button" disabled={pending} onClick={onRemove} aria-label={'Retirer : ' + card.question} className="min-h-11 text-note text-discret underline underline-offset-4 disabled:opacity-40">Retirer</button>
            </div>
        </div>
    </Reorder.Item>;
}
