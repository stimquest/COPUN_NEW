'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FluxDecouverte from '@/components/explorer/FluxDecouverte';
import { setCardSaved } from '@/actions/saved-card-actions';
import { PedagogicalContent } from '@/types';
import { ThematicTag } from '@/data/seasonal-context';

/**
 * L'espace Decouvrir n'est pas une semaine en attente de creation : il sert a
 * feuilleter librement la methode et les situations de transmission.
 */
export default function DecouvrirClient({ pool, theme, group, initialSavedIds = [], savedError, initialSavedView = false }: {
    pool: PedagogicalContent[]; theme?: ThematicTag; group?: string;
    initialSavedIds?: string[]; savedError?: string; initialSavedView?: boolean;
}) {
    const router = useRouter();
    const [savedIds, setSavedIds] = useState(initialSavedIds);
    const [savedView, setSavedView] = useState(initialSavedView);
    // Le retrait d'un favori pendant sa lecture ne doit pas faire disparaître la carte.
    const [savedSnapshot, setSavedSnapshot] = useState<string[] | null>(initialSavedView ? initialSavedIds : null);
    const [savingId, setSavingId] = useState<string | null>(null);
    const pending = useRef(false);
    const [feedback, setFeedback] = useState('');
    const [saveError, setSaveError] = useState('');
    const savedPool = useMemo(() => pool.filter(card => savedSnapshot?.includes(card.id)), [pool, savedSnapshot]);
    const toggleSaved = async (id: string) => {
        if (pending.current) return;
        pending.current = true;
        const wanted = !savedIds.includes(id);
        setSavingId(id);
        setFeedback('');
        setSaveError('');
        try {
            const result = await setCardSaved(id, wanted);
            if (!result.success) { setSaveError(result.error ?? 'Enregistrement impossible. Réessayez.'); return; }
            setSavedIds(current => wanted ? [...current, id] : current.filter(value => value !== id));
            setFeedback(wanted ? 'Carte mise de côté. Vous pourrez la relire ou la retrouver dans la préparation.' : 'Carte retirée de vos cartes mises de côté.');
        } catch {
            setSaveError('La connexion a été interrompue. Réessayez pour enregistrer votre choix.');
        } finally { pending.current = false; setSavingId(null); }
    };

    return (
        <div className="min-h-screen fond-ciel pb-28">
            <header className="px-4 pt-4 pb-2 max-w-2xl mx-auto">
                <div className="flex min-h-12 items-center gap-2">
                    <Link href="/stages" aria-label="Retour à l’accueil" className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-white/60">
                        <span className="material-symbols-outlined" aria-hidden>arrow_back</span>
                    </Link>
                    <h1 className="min-w-0 flex-1 text-xl font-bold tracking-tight text-slate-900">{savedView ? 'Mises de côté' : 'Découvrir'}</h1>
                    <button onClick={() => { if (!savedView) setSavedSnapshot(savedIds); setSavedView(value => !value); }}
                        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-slate-600 hover:bg-white/60">
                        <span className="material-symbols-outlined text-[20px]" aria-hidden>{savedView ? 'explore' : 'bookmarks'}</span>
                        {savedView ? 'Découvrir' : 'Mises de côté'}{!savedView && savedIds.length ? ` · ${savedIds.length}` : ''}
                    </button>
                </div>
                {savedError && <div role="alert" className="mt-3 text-sm text-amber-800">{savedError} <button className="underline font-bold" onClick={() => router.refresh()}>Réessayer</button></div>}
            </header>
            <main className="max-w-2xl mx-auto px-4">
                <div hidden={savedView}><FluxDecouverte
                    pool={pool}
                    initialTheme={theme}
                    initialGroup={group}
                    mode="lecture"
                    savedIds={savedIds} onToggleSaved={toggleSaved} savingId={savingId} savedUnavailable={!!savedError}
                /></div>
                {savedSnapshot !== null && <div hidden={!savedView}>
                    {savedPool.length ? <FluxDecouverte
                        pool={savedPool} mode="lecture"
                        savedIds={savedIds} onToggleSaved={toggleSaved} savingId={savingId} savedUnavailable={!!savedError}
                    /> : !savedError && <div className="rounded-3xl bg-white px-6 py-10 text-center">
                        <span className="material-symbols-outlined text-3xl text-indigo-400" aria-hidden>bookmark_add</span>
                        <h2 className="mt-3 font-bold text-slate-900">Vos prochaines idées à transmettre</h2>
                        <p className="mt-2 text-sm text-slate-600">Pendant votre lecture, utilisez « Mettre de côté » pour retrouver ici une carte qui vous intéresse.</p>
                        <button onClick={() => setSavedView(false)} className="mt-5 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Découvrir les cartes</button>
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
