'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Dimension, PedagogicalContent } from '@/types';
import { setCardSaved } from '@/actions/saved-card-actions';
import { resolveCardChoice, type CardChoice, type CardChoices } from '@/lib/card-choice';
import ChoisirSujets from '@/components/explorer/ChoisirSujets';
import CardReader from '@/components/explorer/CardReader';
import UseCardWithGroup from '@/components/explorer/UseCardWithGroup';
import { directriceDe } from '@/data/cartes-directrices';
import { prolongementsEssentielle } from '@/data/relations-essentielles';
import ProlongementsEssentiels from '@/components/explorer/ProlongementsEssentiels';

export default function RebondirClient({ details, directors, savedIds: initialSavedIds, initialChoices, savedError }: {
    details: PedagogicalContent[];
    directors: PedagogicalContent[];
    savedIds: string[];
    initialChoices: CardChoices;
    savedError?: string;
}) {
    const [choices, setChoices] = useState(initialChoices);
    const [savedIds, setSavedIds] = useState(initialSavedIds);
    const [editing, setEditing] = useState<PedagogicalContent | null>(null);
    const [activeDirectorId, setActiveDirectorId] = useState<string | null>(null);
    const [activeDirectorPillar, setActiveDirectorPillar] = useState<Dimension | null>(null);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const lock = useRef(false);
    const choiceFor = (card: PedagogicalContent) => resolveCardChoice(card, choices[card.id]);
    const change = (id: string, choice: CardChoice) => setChoices(current => ({ ...current, [id]: choice }));
    async function keep(card: PedagogicalContent, choice: CardChoice) {
        if (lock.current) return { success: false, error: 'Un enregistrement est en cours.' };
        lock.current = true; setPendingId(card.id); setError(''); setFeedback('');
        try {
            const result = await setCardSaved(card.id, true, choice);
            if (result.success) {
                setSavedIds(current => current.includes(card.id) ? current : [...current, card.id]);
                change(card.id, choice);
                setFeedback('Carte et préférences gardées. Retrouvez-les dans vos cartes mises de côté.');
            } else setError(result.error ?? 'Enregistrement impossible.');
            return result;
        } catch { const error = 'Connexion interrompue. Réessayez.'; setError(error); return { success: false, error }; }
        finally { lock.current = false; setPendingId(null); }
    }
    return <main className="co-field-week">
        <header className="mb-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-note font-semibold text-encre">
                <Link href="/stages/semaines" className="inline-flex min-h-11 items-center">← Mes séances</Link>
                <Link href="/stages/decouvrir?saved=1" className="inline-flex min-h-11 items-center gap-1.5" aria-label="Mes cartes mises de côté"><span className="material-symbols-outlined" aria-hidden>bookmark</span>Mises de côté</Link>
            </div>
            <h1 className="text-titre font-semibold leading-snug text-encre">Rebondir sur ma séance</h1>
        </header>
        {(savedError || error) && <p role="alert" className="co-choice-error mb-4">{error || savedError}</p>}
        {feedback && <div role="status" className="fixed above-nav left-4 right-4 z-40 mx-auto flex max-w-lg items-center gap-3 rounded-bloc bg-encre p-4 text-note text-carte shadow-flottant"><p className="flex-1">{feedback}</p><button type="button" onClick={() => setFeedback('')} aria-label="Fermer le message" className="flex size-11 shrink-0 items-center justify-center"><span className="material-symbols-outlined" aria-hidden>close</span></button></div>}
        <ChoisirSujets terrain directors={directors} details={details} selected={[]} entries={{}} record choices={choices} onChoiceChange={change} activeDirectorId={activeDirectorId} activeDirectorPillar={activeDirectorPillar} onDirectorChange={(id, dimension) => { setActiveDirectorId(id); setActiveDirectorPillar(dimension ?? null); }} onOpen={card => { setFeedback(''); setEditing(card); }} cardActions={card => <div className="flex flex-1 flex-wrap gap-2">
            <button type="button" disabled={!!pendingId || !!savedError} onClick={() => void keep(card, choiceFor(card))} className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-encre px-3 text-note font-semibold text-carte disabled:opacity-40">{pendingId === card.id ? 'Enregistrement…' : savedIds.includes(card.id) ? 'Garder mes préférences' : 'Garder pour la suite'}</button>
        </div>}/>
        {editing && <CardReader key={editing.id} card={editing} initialChoice={choiceFor(editing)} onChange={choice => change(editing.id, choice)} label={savedIds.includes(editing.id) ? 'Garder mes préférences' : 'Garder pour la suite'} onSave={choice => keep(editing, choice)} onClose={() => setEditing(null)}>
            {directriceDe(editing.id) && <ProlongementsEssentiels cards={prolongementsEssentielle(editing.id, details)} onSelect={dimension => { setActiveDirectorId(editing.id); setActiveDirectorPillar(dimension); setEditing(null); }}/>}
            <UseCardWithGroup card={editing} choice={choiceFor(editing)}/>
        </CardReader>}
    </main>;
}
