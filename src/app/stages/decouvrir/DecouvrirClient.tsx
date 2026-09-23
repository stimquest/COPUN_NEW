'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FluxDecouverte from '@/components/explorer/FluxDecouverte';
import { setCardSaved } from '@/actions/saved-card-actions';
import { Dimension, PedagogicalContent } from '@/types';
import { ThematicTag } from '@/data/seasonal-context';
import type { CardChoice, CardChoices } from '@/lib/card-choice';
import { resolveCardChoice } from '@/lib/card-choice';

/**
 * L'espace Decouvrir n'est pas une semaine en attente de creation : il sert a
 * feuilleter librement la methode et les situations de transmission.
 */
export default function DecouvrirClient({ pool, theme, group, pillar, entry, initialSavedIds = [], savedError, initialSavedView = false, initialChoices = {} }: {
    pool: PedagogicalContent[]; theme?: ThematicTag; group?: string;
    pillar?: Dimension; entry?: string;
    initialSavedIds?: string[]; savedError?: string; initialSavedView?: boolean;
    initialChoices?: CardChoices;
}) {
    const router = useRouter();
    const [savedIds, setSavedIds] = useState(initialSavedIds);
    const [choices, setChoices] = useState<CardChoices>(initialChoices);
    const [savedChoices, setSavedChoices] = useState<CardChoices>(() => Object.fromEntries(pool.filter(card => initialSavedIds.includes(card.id)).map(card => [card.id, resolveCardChoice(card, initialChoices[card.id])])));
    const changeChoice = (id: string, choice: CardChoice) => setChoices(current => ({ ...current, [id]: choice }));
    const [savedView, setSavedView] = useState(initialSavedView);
    // Le retrait d'un favori pendant sa lecture ne doit pas faire disparaître la carte.
    const [savedSnapshot, setSavedSnapshot] = useState<string[] | null>(initialSavedView ? initialSavedIds : null);
    const [savingId, setSavingId] = useState<string | null>(null);
    const pending = useRef(false);
    const [feedback, setFeedback] = useState('');
    const [saveError, setSaveError] = useState('');
    const savedPool = useMemo(() => pool.filter(card => savedSnapshot?.includes(card.id)), [pool, savedSnapshot]);
    const toggleSaved = async (id: string, choice?: CardChoice) => {
        if (pending.current) return;
        pending.current = true;
        const wanted = !savedIds.includes(id);
        setSavingId(id);
        setFeedback('');
        setSaveError('');
        try {
            const result = await setCardSaved(id, wanted, choice);
            if (!result.success) { setSaveError(result.error ?? 'Enregistrement impossible. Réessayez.'); return; }
            setSavedIds(current => wanted ? [...current, id] : current.filter(value => value !== id));
            setSavedChoices(current => {
                const next = { ...current };
                if (wanted && choice) next[id] = choice; else delete next[id];
                return next;
            });
            setFeedback(wanted ? 'Carte mise de côté. Vous pourrez la relire ou l’ajouter directement à une semaine.' : 'Carte retirée de vos cartes mises de côté.');
        } catch {
            setSaveError('La connexion a été interrompue. Réessayez pour enregistrer votre choix.');
        } finally { pending.current = false; setSavingId(null); }
    };
    const saveChoice = async (id: string, choice: CardChoice) => {
        if (pending.current) { setSaveError('Un enregistrement est en cours. Réessayez dans un instant.'); return; }
        pending.current = true; setSavingId(id); setSaveError('');
        try {
            const result = await setCardSaved(id, true, choice);
            if (!result.success) { setSaveError(result.error ?? 'Enregistrement impossible.'); return; }
            setSavedChoices(current => ({ ...current, [id]: choice }));
            setFeedback('Vos nouveaux choix sont conservés.');
        } catch { setSaveError('Connexion interrompue. Réessayez.'); }
        finally { pending.current = false; setSavingId(null); }
    };

    return (
        <div className="min-h-screen fond-ciel pb-28">
            <header className="px-4 pt-4 pb-2 max-w-2xl mx-auto">
                <div className="flex min-h-12 items-center gap-2">
                    <Link href="/stages" aria-label="Retour à l’accueil" className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-white/60">
                        <span className="material-symbols-outlined" aria-hidden>arrow_back</span>
                    </Link>
                    <h1 className="min-w-0 flex-1 text-[28px] font-semibold tracking-[-.045em] text-[var(--co-ink)]">{savedView ? 'Mises de côté' : 'Explorer'}</h1>
                    <button onClick={() => { if (!savedView) setSavedSnapshot(savedIds); setSavedView(value => !value); }}
                        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-slate-600 hover:bg-white/60">
                        <span className="material-symbols-outlined text-[20px]" aria-hidden>{savedView ? 'explore' : 'bookmarks'}</span>
                        {savedView ? 'Explorer' : 'Mises de côté'}{!savedView && savedIds.length ? ` · ${savedIds.length}` : ''}
                    </button>
                </div>
                {savedError && <div role="alert" className="mt-3 text-sm text-amber-800">{savedError} <button className="underline font-bold" onClick={() => router.refresh()}>Réessayer</button></div>}
            </header>
            <main className="max-w-2xl mx-auto px-4">
                <div hidden={savedView}><FluxDecouverte
                    pool={pool}
                    initialChoices={initialChoices}
                    choices={choices} savedChoices={savedChoices} onChoiceChange={changeChoice} onSaveChoice={saveChoice}
                    initialTheme={theme}
                    initialGroup={group}
                    initialPillar={pillar}
                    initialEntry={entry}
                    mode="lecture"
                    savedIds={savedIds} onToggleSaved={toggleSaved} savingId={savingId} savedUnavailable={!!savedError}
                /></div>
                {savedSnapshot !== null && <div hidden={!savedView}>
                    {savedPool.length ? <FluxDecouverte
                        pool={savedPool} mode="lecture"
                        initialChoices={initialChoices}
                        choices={choices} savedChoices={savedChoices} onChoiceChange={changeChoice} onSaveChoice={saveChoice}
                        savedIds={savedIds} onToggleSaved={toggleSaved} savingId={savingId} savedUnavailable={!!savedError}
                    /> : !savedError && <div className="rounded-3xl bg-white px-6 py-10 text-center">
                        <span className="material-symbols-outlined text-3xl text-indigo-400" aria-hidden>bookmark_add</span>
                        <h2 className="mt-3 font-bold text-slate-900">Vos prochaines idées à transmettre</h2>
                        <p className="mt-2 text-sm text-slate-600">Pendant votre lecture, utilisez « Mettre de côté » pour retrouver ici une carte qui vous intéresse.</p>
                        <button onClick={() => setSavedView(false)} className="mt-5 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Explorer les cartes</button>
                    </div>}
                </div>}
            </main>
            <div role={saveError ? 'alert' : 'status'} aria-live="polite" className={(saveError || feedback) ? 'fixed above-nav left-4 right-4 z-40 mx-auto max-w-lg rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg flex gap-3 items-center' : 'sr-only'}>
                <p className="flex-1">{saveError || feedback}</p>
                {(saveError || feedback) && <button onClick={() => { setSaveError(''); setFeedback(''); }} aria-label="Fermer le message" className="p-2">✕</button>}
            </div>
        </div>
    );
}
